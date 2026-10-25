package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class AppRole(val label: String) {
    RIDER("Rider Mode"),
    DRIVER("Driver Partner")
}

enum class VehicleCategory(val displayName: String, val tag: String) {
    ALL("All Fleet", "ALL"),
    SEDAN("Sedan", "SEDAN"),
    SUV("SUV", "SUV"),
    ELECTRIC("Electric", "EV"),
    LUXURY("Luxury", "LUXURY"),
    ECONOMY("Economy", "ECO")
}

enum class SortOption(val label: String) {
    RECOMMENDED("Recommended"),
    PRICE_LOW_TO_HIGH("Lowest Price"),
    HIGHEST_RATED("Top Rated"),
    FASTEST_ETA("Fastest Arrival")
}

enum class TripStatus(val displayLabel: String, val stepIndex: Int) {
    REQUESTED("Searching / Dispatching Driver", 0),
    ACCEPTED("Driver En Route to Pickup", 1),
    ARRIVED_AT_PICKUP("Driver Arrived at Pickup", 2),
    IN_TRANSIT("In Transit to Destination", 3),
    COMPLETED("Trip Completed", 4),
    CANCELLED("Trip Cancelled", -1)
}

data class PresetLocation(
    val id: String,
    val name: String,
    val address: String,
    val zone: String,
    val lat: Double,
    val lng: Double
)

@Entity(tableName = "vehicles")
data class VehicleEntity(
    @PrimaryKey val id: String,
    val name: String,
    val brand: String,
    val category: String, // SEDAN, SUV, ELECTRIC, LUXURY, ECONOMY
    val pricePerKm: Double,
    val baseFare: Double,
    val seats: Int,
    val luggage: Int,
    val rating: Double,
    val tripsCount: Int,
    val transmission: String,
    val rangeOrFuel: String,
    val licensePlate: String,
    val driverName: String,
    val driverRating: Double,
    val driverPhone: String,
    val isAvailable: Boolean,
    val etaMinutes: Int,
    val accentHex: Long,
    val featuresCsv: String
) {
    val featureList: List<String>
        get() = featuresCsv.split(",").map { it.trim() }.filter { it.isNotEmpty() }
}

@Entity(tableName = "rides")
data class RideEntity(
    @PrimaryKey val id: String,
    val vehicleId: String,
    val vehicleName: String,
    val vehicleCategory: String,
    val licensePlate: String,
    val driverName: String,
    val driverRating: Double,
    val driverPhone: String,
    val riderName: String,
    val riderPhone: String,
    val pickupName: String,
    val pickupAddress: String,
    val pickupLat: Double,
    val pickupLng: Double,
    val dropoffName: String,
    val dropoffAddress: String,
    val dropoffLat: Double,
    val dropoffLng: Double,
    val distanceKm: Double,
    val durationMinutes: Int,
    val baseFare: Double,
    val distanceFare: Double,
    val serviceFee: Double,
    val totalFare: Double,
    val status: String, // Matches TripStatus.name
    val paymentMethod: String,
    val userRating: Int,
    val createdAt: Long
) {
    val tripStatus: TripStatus
        get() = runCatching { TripStatus.valueOf(status) }.getOrDefault(TripStatus.REQUESTED)
}

data class LiveTelemetryState(
    val driverLat: Double = 37.7810,
    val driverLng: Double = -122.4110,
    val bearingDegrees: Float = 45f,
    val speedKmh: Int = 0,
    val progressFraction: Float = 0f,
    val remainingKm: Double = 0.0,
    val remainingMinutes: Int = 0,
    val statusMessage: String = "Ready for dispatch"
)

data class DriverShiftState(
    val isOnline: Boolean = true,
    val driverName: String = "Marcus Vance",
    val vehicleAssigned: String = "Tesla Model S Plaid • EV-904X",
    val todayEarnings: Double = 184.50,
    val todayTripsCount: Int = 7,
    val acceptanceRate: Int = 96,
    val driverRating: Double = 4.95,
    val onlineHours: Double = 5.4,
    val incomingCountdownSec: Int = 15
)

sealed interface SupabaseSyncState {
    data class LocalFallback(val reason: String, val localVehicles: Int, val localRides: Int) : SupabaseSyncState
    data object Syncing : SupabaseSyncState
    data class Connected(val projectHost: String, val syncedVehicles: Int, val syncedRides: Int, val lastSyncTime: String) : SupabaseSyncState
    data class Error(val message: String) : SupabaseSyncState
}
