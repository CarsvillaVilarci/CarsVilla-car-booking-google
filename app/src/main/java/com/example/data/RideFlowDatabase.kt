package com.example.data

import android.content.Context
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface VehicleDao {
    @Query("SELECT * FROM vehicles ORDER BY rating DESC")
    fun getAllVehicles(): Flow<List<VehicleEntity>>

    @Query("SELECT COUNT(*) FROM vehicles")
    suspend fun getCount(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(vehicles: List<VehicleEntity>)

    @Query("UPDATE vehicles SET isAvailable = :available WHERE id = :vehicleId")
    suspend fun updateAvailability(vehicleId: String, available: Boolean)
}

@Dao
interface RideDao {
    @Query("SELECT * FROM rides ORDER BY createdAt DESC")
    fun getAllRides(): Flow<List<RideEntity>>

    @Query("SELECT * FROM rides WHERE status IN ('REQUESTED', 'ACCEPTED', 'ARRIVED_AT_PICKUP', 'IN_TRANSIT') ORDER BY createdAt DESC LIMIT 1")
    fun getActiveRide(): Flow<RideEntity?>

    @Query("SELECT * FROM rides WHERE id = :rideId LIMIT 1")
    suspend fun getRideById(rideId: String): RideEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRide(ride: RideEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllRides(rides: List<RideEntity>)

    @Update
    suspend fun updateRide(ride: RideEntity)

    @Query("UPDATE rides SET status = :newStatus WHERE id = :rideId")
    suspend fun updateRideStatus(rideId: String, newStatus: String)

    @Query("UPDATE rides SET userRating = :rating WHERE id = :rideId")
    suspend fun updateRideRating(rideId: String, rating: Int)

    @Query("SELECT COUNT(*) FROM rides")
    suspend fun getRideCount(): Int
}

@Database(
    entities = [VehicleEntity::class, RideEntity::class],
    version = 1,
    exportSchema = false
)
abstract class RideFlowDatabase : RoomDatabase() {
    abstract fun vehicleDao(): VehicleDao
    abstract fun rideDao(): RideDao

    companion object {
        @Volatile
        private var INSTANCE: RideFlowDatabase? = null

        fun getInstance(context: Context): RideFlowDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    RideFlowDatabase::class.java,
                    "rideflow_mobility.db"
                ).fallbackToDestructiveMigration(dropAllTables = true).build()
                INSTANCE = instance
                instance
            }
        }
    }
}

object SeedCatalog {
    val presetLocations = listOf(
        PresetLocation("loc_downtown", "Metropolis Grand Central", "100 Market St, Financial District", "Downtown Core", 37.7936, -122.3958),
        PresetLocation("loc_airport", "International Terminal T2", "Airport Access Rd, Gate B4", "Airport Zone", 37.6213, -122.3790),
        PresetLocation("loc_tech_park", "Silicon Harbor Innovation Hub", "450 Mission Bay Blvd", "Tech District", 37.7705, -122.3892),
        PresetLocation("loc_marina", "Bayfront Marina & Pier 39", "2100 Embarcadero Promenade", "Waterfront", 37.8087, -122.4098),
        PresetLocation("loc_medical", "Parnassus Medical Center", "505 Parnassus Ave, Heights", "West Medical", 37.7631, -122.4586),
        PresetLocation("loc_stadium", "Apex Arena & Convention Plaza", "700 Warriors Way", "South Bay", 37.7680, -122.3877),
        PresetLocation("loc_university", "Civic Center Arts & Library", "355 McAllister St", "Midtown", 37.7793, -122.4193)
    )

    val initialVehicles = listOf(
        VehicleEntity(
            id = "veh_01",
            name = "Model S Plaid",
            brand = "Tesla",
            category = VehicleCategory.ELECTRIC.name,
            pricePerKm = 2.40,
            baseFare = 6.50,
            seats = 4,
            luggage = 3,
            rating = 4.97,
            tripsCount = 412,
            transmission = "EV Direct",
            rangeOrFuel = "637 km Range",
            licensePlate = "EV-904X",
            driverName = "Marcus Vance",
            driverRating = 4.96,
            driverPhone = "+1 (555) 234-8910",
            isAvailable = true,
            etaMinutes = 2,
            accentHex = 0xFF00D2FF,
            featuresCsv = "Autopilot Glass Roof,Ultra-Fast Wi-Fi,Heated Seats,Quiet Cabin"
        ),
        VehicleEntity(
            id = "veh_02",
            name = "Escalade IQ Executive",
            brand = "Cadillac",
            category = VehicleCategory.SUV.name,
            pricePerKm = 3.20,
            baseFare = 9.00,
            seats = 7,
            luggage = 6,
            rating = 4.94,
            tripsCount = 289,
            transmission = "Automatic",
            rangeOrFuel = "720 km EV",
            licensePlate = "SUV-771K",
            driverName = "Elena Rostova",
            driverRating = 4.93,
            driverPhone = "+1 (555) 390-1122",
            isAvailable = true,
            etaMinutes = 4,
            accentHex = 0xFFFFB300,
            featuresCsv = "7 Captain Seats,XXL Cargo Hold,Rear Climate Zone,AKG Studio Audio"
        ),
        VehicleEntity(
            id = "veh_03",
            name = "EQS 580 Pinnacle",
            brand = "Mercedes-Benz",
            category = VehicleCategory.LUXURY.name,
            pricePerKm = 3.85,
            baseFare = 12.00,
            seats = 4,
            luggage = 3,
            rating = 4.99,
            tripsCount = 198,
            transmission = "EV Direct",
            rangeOrFuel = "560 km Range",
            licensePlate = "VIP-001M",
            driverName = "Julian Sterling",
            driverRating = 4.99,
            driverPhone = "+1 (555) 881-4401",
            isAvailable = true,
            etaMinutes = 5,
            accentHex = 0xFFB388FF,
            featuresCsv = "Executive Rear Lounge,Massage Seats,Champagne Cooler,Chauffeur Attire"
        ),
        VehicleEntity(
            id = "veh_04",
            name = "Camry Hybrid XSE",
            brand = "Toyota",
            category = VehicleCategory.SEDAN.name,
            pricePerKm = 1.65,
            baseFare = 4.00,
            seats = 4,
            luggage = 2,
            rating = 4.89,
            tripsCount = 845,
            transmission = "Automatic",
            rangeOrFuel = "22 km/L Hybrid",
            licensePlate = "CAB-408T",
            driverName = "David Chen",
            driverRating = 4.91,
            driverPhone = "+1 (555) 612-7734",
            isAvailable = true,
            etaMinutes = 1,
            accentHex = 0xFF00E676,
            featuresCsv = "USB-C Fast Charge,Fuel Saver,Spacious Legroom,Verified Pro Driver"
        ),
        VehicleEntity(
            id = "veh_05",
            name = "IONIQ 5 N-Line",
            brand = "Hyundai",
            category = VehicleCategory.ELECTRIC.name,
            pricePerKm = 2.05,
            baseFare = 5.00,
            seats = 5,
            luggage = 3,
            rating = 4.92,
            tripsCount = 360,
            transmission = "EV Direct",
            rangeOrFuel = "488 km Range",
            licensePlate = "EV-512H",
            driverName = "Sophia Patel",
            driverRating = 4.95,
            driverPhone = "+1 (555) 901-3345",
            isAvailable = true,
            etaMinutes = 3,
            accentHex = 0xFF00D2FF,
            featuresCsv = "V2L Power Outlet,Reclining Lounge Seats,Panoramic Sky,Zero Emissions"
        ),
        VehicleEntity(
            id = "veh_06",
            name = "Prius Prime Eco",
            brand = "Toyota",
            category = VehicleCategory.ECONOMY.name,
            pricePerKm = 1.25,
            baseFare = 3.00,
            seats = 4,
            luggage = 2,
            rating = 4.86,
            tripsCount = 1120,
            transmission = "Automatic",
            rangeOrFuel = "26 km/L PHEV",
            licensePlate = "ECO-209P",
            driverName = "Mateo Silva",
            driverRating = 4.88,
            driverPhone = "+1 (555) 443-9087",
            isAvailable = true,
            etaMinutes = 2,
            accentHex = 0xFF00E676,
            featuresCsv = "Budget Friendly,Commuter Express,Phone Mount,Clean Interior"
        ),
        VehicleEntity(
            id = "veh_07",
            name = "R1S Quad-Motor",
            brand = "Rivian",
            category = VehicleCategory.SUV.name,
            pricePerKm = 2.95,
            baseFare = 8.00,
            seats = 7,
            luggage = 5,
            rating = 4.96,
            tripsCount = 215,
            transmission = "EV Direct",
            rangeOrFuel = "516 km Range",
            licensePlate = "ADV-882R",
            driverName = "Liam O'Connor",
            driverRating = 4.94,
            driverPhone = "+1 (555) 774-1920",
            isAvailable = true,
            etaMinutes = 4,
            accentHex = 0xFFFFB300,
            featuresCsv = "All-Weather AWD,7 Passenger Seating,Front Trunk Storage,Camp Speaker"
        ),
        VehicleEntity(
            id = "veh_08",
            name = "530e M-Sport",
            brand = "BMW",
            category = VehicleCategory.SEDAN.name,
            pricePerKm = 2.60,
            baseFare = 7.00,
            seats = 4,
            luggage = 3,
            rating = 4.93,
            tripsCount = 310,
            transmission = "Automatic",
            rangeOrFuel = "Plug-in Hybrid",
            licensePlate = "M-530B",
            driverName = "Aria Montgomery",
            driverRating = 4.92,
            driverPhone = "+1 (555) 319-5560",
            isAvailable = true,
            etaMinutes = 3,
            accentHex = 0xFF00D2FF,
            featuresCsv = "Sport Leather Cabin,Harman Kardon Sound,Business Class,Adaptive Suspension"
        ),
        VehicleEntity(
            id = "veh_09",
            name = "7 Series i7 Executive",
            brand = "BMW",
            category = VehicleCategory.LUXURY.name,
            pricePerKm = 4.10,
            baseFare = 14.00,
            seats = 4,
            luggage = 3,
            rating = 4.98,
            tripsCount = 142,
            transmission = "EV Direct",
            rangeOrFuel = "512 km Range",
            licensePlate = "LUX-700B",
            driverName = "Arthur Pendelton",
            driverRating = 4.99,
            driverPhone = "+1 (555) 990-0011",
            isAvailable = true,
            etaMinutes = 6,
            accentHex = 0xFFB388FF,
            featuresCsv = "31-inch 8K Theater Screen,Cashmere Trim,Automatic Doors,VIP Privacy Shades"
        ),
        VehicleEntity(
            id = "veh_10",
            name = "Civic Hatchback Sport",
            brand = "Honda",
            category = VehicleCategory.ECONOMY.name,
            pricePerKm = 1.35,
            baseFare = 3.25,
            seats = 4,
            luggage = 2,
            rating = 4.87,
            tripsCount = 930,
            transmission = "Automatic",
            rangeOrFuel = "18 km/L Eco",
            licensePlate = "CTY-114H",
            driverName = "Noah Kim",
            driverRating = 4.90,
            driverPhone = "+1 (555) 502-6612",
            isAvailable = true,
            etaMinutes = 2,
            accentHex = 0xFF00E676,
            featuresCsv = "Quick City Hop,Apple CarPlay,Fold-Flat Trunk,Low Fare Guarantee"
        )
    )

    val sampleCompletedRide = RideEntity(
        id = "ride_seed_101",
        vehicleId = "veh_01",
        vehicleName = "Tesla Model S Plaid",
        vehicleCategory = VehicleCategory.ELECTRIC.name,
        licensePlate = "EV-904X",
        driverName = "Marcus Vance",
        driverRating = 4.96,
        driverPhone = "+1 (555) 234-8910",
        riderName = "Alex Rivera",
        riderPhone = "+1 (555) 019-2834",
        pickupName = "Silicon Harbor Innovation Hub",
        pickupAddress = "450 Mission Bay Blvd",
        pickupLat = 37.7705,
        pickupLng = -122.3892,
        dropoffName = "Metropolis Grand Central",
        dropoffAddress = "100 Market St, Financial District",
        dropoffLat = 37.7936,
        dropoffLng = -122.3958,
        distanceKm = 4.8,
        durationMinutes = 12,
        baseFare = 6.50,
        distanceFare = 11.52,
        serviceFee = 1.98,
        totalFare = 20.00,
        status = TripStatus.COMPLETED.name,
        paymentMethod = "Supabase Pay •••• 4242",
        userRating = 5,
        createdAt = System.currentTimeMillis() - 3600_000L * 3
    )
}
