package com.example.data

import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit

class RideFlowRepository(
    private val database: RideFlowDatabase
) {
    private val vehicleDao = database.vehicleDao()
    private val rideDao = database.rideDao()

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(8, TimeUnit.SECONDS)
        .readTimeout(8, TimeUnit.SECONDS)
        .build()

    val vehiclesFlow: Flow<List<VehicleEntity>> = vehicleDao.getAllVehicles()
    val allRidesFlow: Flow<List<RideEntity>> = rideDao.getAllRides()
    val activeRideFlow: Flow<RideEntity?> = rideDao.getActiveRide()

    fun isSupabaseConfigured(): Boolean {
        val url = BuildConfig.SUPABASE_URL.trim()
        val key = BuildConfig.SUPABASE_ANON_KEY.trim()
        return url.startsWith("https://") &&
            url.contains(".supabase.co") &&
            key.isNotEmpty() &&
            key != "YOUR_SUPABASE_ANON_KEY"
    }

    fun getConfiguredHost(): String {
        val url = BuildConfig.SUPABASE_URL.trim()
        return if (isSupabaseConfigured()) {
            url.removePrefix("https://").substringBefore("/")
        } else {
            "Local Room SQLite (Offline-Ready)"
        }
    }

    suspend fun ensureSeedDataAndSync(): SupabaseSyncState = withContext(Dispatchers.IO) {
        if (vehicleDao.getCount() == 0) {
            vehicleDao.insertAll(SeedCatalog.initialVehicles)
        }
        if (rideDao.getRideCount() == 0) {
            rideDao.insertRide(SeedCatalog.sampleCompletedRide)
        }
        syncWithSupabase()
    }

    suspend fun syncWithSupabase(): SupabaseSyncState = withContext(Dispatchers.IO) {
        val vCount = vehicleDao.getCount()
        val rCount = rideDao.getRideCount()
        if (!isSupabaseConfigured()) {
            return@withContext SupabaseSyncState.LocalFallback(
                reason = "Using on-device Room cache. Set SUPABASE_URL and SUPABASE_ANON_KEY in the AI Studio Secrets panel for live cloud sync.",
                localVehicles = vCount,
                localRides = rCount
            )
        }

        val baseUrl = BuildConfig.SUPABASE_URL.trim().trimEnd('/')
        val anonKey = BuildConfig.SUPABASE_ANON_KEY.trim()

        try {
            // 1. Fetch vehicles from Supabase PostgREST
            val vehiclesReq = Request.Builder()
                .url("$baseUrl/rest/v1/vehicles?select=*")
                .addHeader("apikey", anonKey)
                .addHeader("Authorization", "Bearer $anonKey")
                .get()
                .build()

            var syncedVehicleCount = vCount
            httpClient.newCall(vehiclesReq).execute().use { response ->
                if (response.isSuccessful) {
                    val bodyStr = response.body?.string().orEmpty()
                    val remoteVehicles = parseVehiclesJson(bodyStr)
                    if (remoteVehicles.isNotEmpty()) {
                        vehicleDao.insertAll(remoteVehicles)
                        syncedVehicleCount = remoteVehicles.size
                    }
                }
            }

            // 2. Fetch rides from Supabase PostgREST
            val ridesReq = Request.Builder()
                .url("$baseUrl/rest/v1/rides?select=*&order=created_at.desc&limit=50")
                .addHeader("apikey", anonKey)
                .addHeader("Authorization", "Bearer $anonKey")
                .get()
                .build()

            var syncedRideCount = rCount
            httpClient.newCall(ridesReq).execute().use { response ->
                if (response.isSuccessful) {
                    val bodyStr = response.body?.string().orEmpty()
                    val remoteRides = parseRidesJson(bodyStr)
                    if (remoteRides.isNotEmpty()) {
                        rideDao.insertAllRides(remoteRides)
                        syncedRideCount = remoteRides.size
                    }
                }
            }

            val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.US).format(Date())
            SupabaseSyncState.Connected(
                projectHost = getConfiguredHost(),
                syncedVehicles = syncedVehicleCount,
                syncedRides = syncedRideCount,
                lastSyncTime = timeFormat
            )
        } catch (e: Exception) {
            SupabaseSyncState.LocalFallback(
                reason = "Supabase unreachable (${e.localizedMessage ?: "Network offline"}) — seamlessly running on local Room DB.",
                localVehicles = vehicleDao.getCount(),
                localRides = rideDao.getRideCount()
            )
        }
    }

    suspend fun createRideRequest(ride: RideEntity) = withContext(Dispatchers.IO) {
        rideDao.insertRide(ride)
        pushRideToSupabase(ride, isInsert = true)
    }

    suspend fun updateRideStatus(rideId: String, newStatus: TripStatus) = withContext(Dispatchers.IO) {
        rideDao.updateRideStatus(rideId, newStatus.name)
        val updated = rideDao.getRideById(rideId)
        if (updated != null) {
            pushRideToSupabase(updated, isInsert = false)
        }
    }

    suspend fun rateCompletedRide(rideId: String, rating: Int) = withContext(Dispatchers.IO) {
        rideDao.updateRideRating(rideId, rating)
        val updated = rideDao.getRideById(rideId)
        if (updated != null) {
            pushRideToSupabase(updated, isInsert = false)
        }
    }

    private fun pushRideToSupabase(ride: RideEntity, isInsert: Boolean) {
        if (!isSupabaseConfigured()) return
        val baseUrl = BuildConfig.SUPABASE_URL.trim().trimEnd('/')
        val anonKey = BuildConfig.SUPABASE_ANON_KEY.trim()

        runCatching {
            val json = JSONObject().apply {
                put("id", ride.id)
                put("vehicle_id", ride.vehicleId)
                put("vehicle_name", ride.vehicleName)
                put("vehicle_category", ride.vehicleCategory)
                put("license_plate", ride.licensePlate)
                put("driver_name", ride.driverName)
                put("driver_rating", ride.driverRating)
                put("driver_phone", ride.driverPhone)
                put("rider_name", ride.riderName)
                put("rider_phone", ride.riderPhone)
                put("pickup_name", ride.pickupName)
                put("pickup_address", ride.pickupAddress)
                put("pickup_lat", ride.pickupLat)
                put("pickup_lng", ride.pickupLng)
                put("dropoff_name", ride.dropoffName)
                put("dropoff_address", ride.dropoffAddress)
                put("dropoff_lat", ride.dropoffLat)
                put("dropoff_lng", ride.dropoffLng)
                put("distance_km", ride.distanceKm)
                put("duration_minutes", ride.durationMinutes)
                put("base_fare", ride.baseFare)
                put("distance_fare", ride.distanceFare)
                put("service_fee", ride.serviceFee)
                put("total_fare", ride.totalFare)
                put("status", ride.status)
                put("payment_method", ride.paymentMethod)
                put("user_rating", ride.userRating)
                put("created_at", ride.createdAt)
            }

            val mediaType = "application/json; charset=utf-8".toMediaType()
            val body = json.toString().toRequestBody(mediaType)

            val request = if (isInsert) {
                Request.Builder()
                    .url("$baseUrl/rest/v1/rides")
                    .addHeader("apikey", anonKey)
                    .addHeader("Authorization", "Bearer $anonKey")
                    .addHeader("Prefer", "resolution=merge-duplicates")
                    .post(body)
                    .build()
            } else {
                Request.Builder()
                    .url("$baseUrl/rest/v1/rides?id=eq.${ride.id}")
                    .addHeader("apikey", anonKey)
                    .addHeader("Authorization", "Bearer $anonKey")
                    .patch(body)
                    .build()
            }
            httpClient.newCall(request).execute().close()
        }
    }

    private fun parseVehiclesJson(jsonStr: String): List<VehicleEntity> = runCatching {
        val arr = JSONArray(jsonStr)
        val list = mutableListOf<VehicleEntity>()
        for (i in 0 until arr.length()) {
            val obj = arr.getJSONObject(i)
            list.add(
                VehicleEntity(
                    id = obj.optString("id", "veh_$i"),
                    name = obj.optString("name", "Fleet Vehicle"),
                    brand = obj.optString("brand", "RideFlow"),
                    category = obj.optString("category", VehicleCategory.SEDAN.name),
                    pricePerKm = obj.optDouble("price_per_km", 2.0),
                    baseFare = obj.optDouble("base_fare", 5.0),
                    seats = obj.optInt("seats", 4),
                    luggage = obj.optInt("luggage", 2),
                    rating = obj.optDouble("rating", 4.9),
                    tripsCount = obj.optInt("trips_count", 100),
                    transmission = obj.optString("transmission", "Automatic"),
                    rangeOrFuel = obj.optString("range_or_fuel", "450 km Range"),
                    licensePlate = obj.optString("license_plate", "RF-100$i"),
                    driverName = obj.optString("driver_name", "Partner Driver"),
                    driverRating = obj.optDouble("driver_rating", 4.9),
                    driverPhone = obj.optString("driver_phone", "+1 (555) 100-2000"),
                    isAvailable = obj.optBoolean("is_available", true),
                    etaMinutes = obj.optInt("eta_minutes", 3),
                    accentHex = obj.optLong("accent_hex", 0xFF00D2FF),
                    featuresCsv = obj.optString("features_csv", "Air Conditioning,Fast Charger,GPS Tracking")
                )
            )
        }
        list
    }.getOrDefault(emptyList())

    private fun parseRidesJson(jsonStr: String): List<RideEntity> = runCatching {
        val arr = JSONArray(jsonStr)
        val list = mutableListOf<RideEntity>()
        for (i in 0 until arr.length()) {
            val obj = arr.getJSONObject(i)
            list.add(
                RideEntity(
                    id = obj.optString("id"),
                    vehicleId = obj.optString("vehicle_id", "veh_01"),
                    vehicleName = obj.optString("vehicle_name", "RideFlow Sedan"),
                    vehicleCategory = obj.optString("vehicle_category", "SEDAN"),
                    licensePlate = obj.optString("license_plate", "EV-904X"),
                    driverName = obj.optString("driver_name", "Marcus Vance"),
                    driverRating = obj.optDouble("driver_rating", 4.95),
                    driverPhone = obj.optString("driver_phone", "+1 (555) 234-8910"),
                    riderName = obj.optString("rider_name", "Passenger"),
                    riderPhone = obj.optString("rider_phone", "+1 (555) 019-2834"),
                    pickupName = obj.optString("pickup_name", "Downtown"),
                    pickupAddress = obj.optString("pickup_address", "100 Market St"),
                    pickupLat = obj.optDouble("pickup_lat", 37.7936),
                    pickupLng = obj.optDouble("pickup_lng", -122.3958),
                    dropoffName = obj.optString("dropoff_name", "Airport"),
                    dropoffAddress = obj.optString("dropoff_address", "Terminal 2"),
                    dropoffLat = obj.optDouble("dropoff_lat", 37.6213),
                    dropoffLng = obj.optDouble("dropoff_lng", -122.3790),
                    distanceKm = obj.optDouble("distance_km", 5.0),
                    durationMinutes = obj.optInt("duration_minutes", 14),
                    baseFare = obj.optDouble("base_fare", 6.50),
                    distanceFare = obj.optDouble("distance_fare", 12.00),
                    serviceFee = obj.optDouble("service_fee", 2.00),
                    totalFare = obj.optDouble("total_fare", 20.50),
                    status = obj.optString("status", TripStatus.COMPLETED.name),
                    paymentMethod = obj.optString("payment_method", "Supabase Pay"),
                    userRating = obj.optInt("user_rating", 5),
                    createdAt = obj.optLong("created_at", System.currentTimeMillis())
                )
            )
        }
        list
    }.getOrDefault(emptyList())

    companion object {
        val SUPABASE_SQL_SCHEMA = """
            -- Run in your Supabase SQL Editor:
            create table if not exists public.vehicles (
              id text primary key,
              name text not null,
              brand text not null,
              category text not null,
              price_per_km double precision default 2.0,
              base_fare double precision default 5.0,
              seats int default 4,
              luggage int default 2,
              rating double precision default 4.9,
              trips_count int default 100,
              transmission text default 'Automatic',
              range_or_fuel text default '500 km Range',
              license_plate text not null,
              driver_name text not null,
              driver_rating double precision default 4.95,
              driver_phone text default '+1 555-234-8910',
              is_available boolean default true,
              eta_minutes int default 3,
              accent_hex bigint default 4278244095,
              features_csv text default 'AC,Wi-Fi,Fast Charge'
            );

            create table if not exists public.rides (
              id text primary key,
              vehicle_id text not null,
              vehicle_name text not null,
              vehicle_category text not null,
              license_plate text not null,
              driver_name text not null,
              driver_rating double precision default 4.95,
              driver_phone text not null,
              rider_name text not null,
              rider_phone text not null,
              pickup_name text not null,
              pickup_address text not null,
              pickup_lat double precision not null,
              pickup_lng double precision not null,
              dropoff_name text not null,
              dropoff_address text not null,
              dropoff_lat double precision not null,
              dropoff_lng double precision not null,
              distance_km double precision not null,
              duration_minutes int not null,
              base_fare double precision not null,
              distance_fare double precision not null,
              service_fee double precision not null,
              total_fare double precision not null,
              status text not null,
              payment_method text default 'Card',
              user_rating int default 0,
              created_at bigint not null
            );
        """.trimIndent()
    }
}
