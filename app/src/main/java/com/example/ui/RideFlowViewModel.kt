package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.AppRole
import com.example.data.DriverShiftState
import com.example.data.LiveTelemetryState
import com.example.data.PresetLocation
import com.example.data.RideEntity
import com.example.data.RideFlowDatabase
import com.example.data.RideFlowRepository
import com.example.data.SeedCatalog
import com.example.data.SortOption
import com.example.data.SupabaseSyncState
import com.example.data.TripStatus
import com.example.data.VehicleCategory
import com.example.data.VehicleEntity
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt

data class FilterState(
    val searchQuery: String = "",
    val category: VehicleCategory = VehicleCategory.ALL,
    val minSeats: Int = 0,
    val transmission: String = "ALL",
    val maxPricePerKm: Float = 4.5f,
    val sortOption: SortOption = SortOption.RECOMMENDED
) {
    val activeFilterCount: Int
        get() {
            var count = 0
            if (searchQuery.isNotBlank()) count++
            if (category != VehicleCategory.ALL) count++
            if (minSeats > 0) count++
            if (transmission != "ALL") count++
            if (maxPricePerKm < 4.4f) count++
            if (sortOption != SortOption.RECOMMENDED) count++
            return count
        }
}

data class BookingDraftState(
    val selectedVehicle: VehicleEntity? = null,
    val pickupLocation: PresetLocation = SeedCatalog.presetLocations[0],
    val dropoffLocation: PresetLocation = SeedCatalog.presetLocations[2],
    val customDestinationNote: String = "",
    val passengerName: String = "Alex Rivera",
    val paymentMethod: String = "Supabase Pay •••• 4242"
) {
    val distanceKm: Double
        get() = computeDistanceKm(
            pickupLocation.lat,
            pickupLocation.lng,
            dropoffLocation.lat,
            dropoffLocation.lng
        ).coerceAtLeast(1.8)

    val estimatedMinutes: Int
        get() = (distanceKm * 2.4).roundToInt().coerceAtLeast(5)

    val baseFare: Double
        get() = selectedVehicle?.baseFare ?: 5.0

    val distanceFare: Double
        get() = distanceKm * (selectedVehicle?.pricePerKm ?: 2.0)

    val serviceFee: Double
        get() = ((baseFare + distanceFare) * 0.10)

    val totalFare: Double
        get() = baseFare + distanceFare + serviceFee
}

class RideFlowViewModel(application: Application) : AndroidViewModel(application) {
    private val database = RideFlowDatabase.getInstance(application)
    private val repository = RideFlowRepository(database)

    private val _currentRole = MutableStateFlow(AppRole.RIDER)
    val currentRole: StateFlow<AppRole> = _currentRole.asStateFlow()

    private val _selectedBottomTab = MutableStateFlow(0)
    val selectedBottomTab: StateFlow<Int> = _selectedBottomTab.asStateFlow()

    private val _filterState = MutableStateFlow(FilterState())
    val filterState: StateFlow<FilterState> = _filterState.asStateFlow()

    private val _bookingDraft = MutableStateFlow(BookingDraftState())
    val bookingDraft: StateFlow<BookingDraftState> = _bookingDraft.asStateFlow()

    private val _driverShift = MutableStateFlow(DriverShiftState())
    val driverShift: StateFlow<DriverShiftState> = _driverShift.asStateFlow()

    private val _telemetry = MutableStateFlow(LiveTelemetryState())
    val telemetry: StateFlow<LiveTelemetryState> = _telemetry.asStateFlow()

    private val _supabaseSyncState = MutableStateFlow<SupabaseSyncState>(SupabaseSyncState.Syncing)
    val supabaseSyncState: StateFlow<SupabaseSyncState> = _supabaseSyncState.asStateFlow()

    private val _statusBannerMessage = MutableStateFlow<String?>(null)
    val statusBannerMessage: StateFlow<String?> = _statusBannerMessage.asStateFlow()

    val allVehicles: StateFlow<List<VehicleEntity>> = repository.vehiclesFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), SeedCatalog.initialVehicles)

    val filteredVehicles: StateFlow<List<VehicleEntity>> = combine(
        allVehicles,
        _filterState
    ) { vehicles, filter ->
        vehicles.filter { v ->
            val matchesQuery = filter.searchQuery.isBlank() ||
                v.name.contains(filter.searchQuery, ignoreCase = true) ||
                v.brand.contains(filter.searchQuery, ignoreCase = true) ||
                v.featuresCsv.contains(filter.searchQuery, ignoreCase = true) ||
                v.driverName.contains(filter.searchQuery, ignoreCase = true)
            val matchesCategory = filter.category == VehicleCategory.ALL ||
                v.category.equals(filter.category.name, ignoreCase = true)
            val matchesSeats = v.seats >= filter.minSeats
            val matchesTrans = filter.transmission == "ALL" ||
                v.transmission.equals(filter.transmission, ignoreCase = true)
            val matchesPrice = v.pricePerKm <= filter.maxPricePerKm.toDouble() + 0.05

            matchesQuery && matchesCategory && matchesSeats && matchesTrans && matchesPrice
        }.let { list ->
            when (filter.sortOption) {
                SortOption.RECOMMENDED -> list.sortedByDescending { it.rating * 10 - it.etaMinutes }
                SortOption.PRICE_LOW_TO_HIGH -> list.sortedBy { it.pricePerKm }
                SortOption.HIGHEST_RATED -> list.sortedByDescending { it.rating }
                SortOption.FASTEST_ETA -> list.sortedBy { it.etaMinutes }
            }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), SeedCatalog.initialVehicles)

    val activeRide: StateFlow<RideEntity?> = repository.activeRideFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val rideHistory: StateFlow<List<RideEntity>> = repository.allRidesFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private var simulationJob: Job? = null
    private var countdownJob: Job? = null

    init {
        viewModelScope.launch {
            _supabaseSyncState.value = repository.ensureSeedDataAndSync()
        }
        viewModelScope.launch {
            activeRide.collect { ride ->
                if (ride != null) {
                    startTelemetryLoopForRide(ride)
                } else {
                    simulationJob?.cancel()
                    countdownJob?.cancel()
                    _telemetry.value = LiveTelemetryState(
                        statusMessage = if (_driverShift.value.isOnline) {
                            "GPS Radar Active • Scanning for nearby ride requests"
                        } else {
                            "Driver Offline • Switch online to receive dispatches"
                        }
                    )
                }
            }
        }
    }

    fun setRole(role: AppRole) {
        _currentRole.value = role
        _selectedBottomTab.value = if (role == AppRole.RIDER) 0 else 0
    }

    fun toggleRole() {
        val next = if (_currentRole.value == AppRole.RIDER) AppRole.DRIVER else AppRole.RIDER
        setRole(next)
    }

    fun selectBottomTab(index: Int) {
        _selectedBottomTab.value = index
    }

    fun clearBanner() {
        _statusBannerMessage.value = null
    }

    // Filter Actions
    fun updateSearchQuery(query: String) {
        _filterState.update { it.copy(searchQuery = query) }
    }

    fun selectCategory(category: VehicleCategory) {
        _filterState.update { it.copy(category = category) }
    }

    fun updateMinSeats(seats: Int) {
        _filterState.update { it.copy(minSeats = seats) }
    }

    fun updateTransmission(transmission: String) {
        _filterState.update { it.copy(transmission = transmission) }
    }

    fun updateMaxPrice(price: Float) {
        _filterState.update { it.copy(maxPricePerKm = price) }
    }

    fun updateSortOption(option: SortOption) {
        _filterState.update { it.copy(sortOption = option) }
    }

    fun resetFilters() {
        _filterState.value = FilterState()
    }

    // Booking Draft Actions
    fun openBookingForVehicle(vehicle: VehicleEntity) {
        _bookingDraft.update { it.copy(selectedVehicle = vehicle) }
    }

    fun dismissBookingSheet() {
        _bookingDraft.update { it.copy(selectedVehicle = null) }
    }

    fun selectPickupLocation(location: PresetLocation) {
        _bookingDraft.update { draft ->
            val adjustedDropoff = if (draft.dropoffLocation.id == location.id) {
                SeedCatalog.presetLocations.first { it.id != location.id }
            } else {
                draft.dropoffLocation
            }
            draft.copy(pickupLocation = location, dropoffLocation = adjustedDropoff)
        }
    }

    fun selectDropoffLocation(location: PresetLocation) {
        _bookingDraft.update { draft ->
            val adjustedPickup = if (draft.pickupLocation.id == location.id) {
                SeedCatalog.presetLocations.first { it.id != location.id }
            } else {
                draft.pickupLocation
            }
            draft.copy(pickupLocation = adjustedPickup, dropoffLocation = location)
        }
    }

    fun swapLocations() {
        _bookingDraft.update { draft ->
            draft.copy(
                pickupLocation = draft.dropoffLocation,
                dropoffLocation = draft.pickupLocation
            )
        }
    }

    fun updateCustomDestinationNote(note: String) {
        _bookingDraft.update { it.copy(customDestinationNote = note) }
    }

    fun confirmAndDispatchRide(switchToDriverMode: Boolean = false) {
        val draft = _bookingDraft.value
        val vehicle = draft.selectedVehicle ?: allVehicles.value.firstOrNull() ?: return

        val dropoffTitle = if (draft.customDestinationNote.isNotBlank()) {
            "${draft.dropoffLocation.name} (${draft.customDestinationNote.trim()})"
        } else {
            draft.dropoffLocation.name
        }

        val newRide = RideEntity(
            id = "ride_${System.currentTimeMillis()}",
            vehicleId = vehicle.id,
            vehicleName = "${vehicle.brand} ${vehicle.name}",
            vehicleCategory = vehicle.category,
            licensePlate = vehicle.licensePlate,
            driverName = vehicle.driverName,
            driverRating = vehicle.driverRating,
            driverPhone = vehicle.driverPhone,
            riderName = draft.passengerName,
            riderPhone = "+1 (555) 019-2834",
            pickupName = draft.pickupLocation.name,
            pickupAddress = draft.pickupLocation.address,
            pickupLat = draft.pickupLocation.lat,
            pickupLng = draft.pickupLocation.lng,
            dropoffName = dropoffTitle,
            dropoffAddress = draft.dropoffLocation.address,
            dropoffLat = draft.dropoffLocation.lat,
            dropoffLng = draft.dropoffLocation.lng,
            distanceKm = (draft.distanceKm * 10.0).roundToInt() / 10.0,
            durationMinutes = draft.estimatedMinutes,
            baseFare = (draft.baseFare * 100.0).roundToInt() / 100.0,
            distanceFare = (draft.distanceFare * 100.0).roundToInt() / 100.0,
            serviceFee = (draft.serviceFee * 100.0).roundToInt() / 100.0,
            totalFare = (draft.totalFare * 100.0).roundToInt() / 100.0,
            status = TripStatus.REQUESTED.name,
            paymentMethod = draft.paymentMethod,
            userRating = 0,
            createdAt = System.currentTimeMillis()
        )

        viewModelScope.launch {
            repository.createRideRequest(newRide)
            _bookingDraft.update { it.copy(selectedVehicle = null, customDestinationNote = "") }
            if (switchToDriverMode) {
                _currentRole.value = AppRole.DRIVER
                _selectedBottomTab.value = 0
                _statusBannerMessage.value = "Incoming Ride Request! Accept dispatch in Driver Console."
            } else {
                _currentRole.value = AppRole.RIDER
                _selectedBottomTab.value = 1 // Live Trip tab
                _statusBannerMessage.value = "Ride requested! Waiting for ${vehicle.driverName} or switch to Driver Mode to accept."
            }
        }
    }

    // Driver Partner Mode Actions
    fun toggleDriverOnlineStatus() {
        _driverShift.update { shift ->
            val nextOnline = !shift.isOnline
            _statusBannerMessage.value = if (nextOnline) {
                "You are now ONLINE and visible to riders."
            } else {
                "You are now OFFLINE."
            }
            shift.copy(isOnline = nextOnline)
        }
    }

    fun simulateIncomingRequestForDriver() {
        val vehicles = allVehicles.value.ifEmpty { SeedCatalog.initialVehicles }
        val chosenVehicle = vehicles.first()
        val locations = SeedCatalog.presetLocations.shuffled()
        val pickup = locations[0]
        val dropoff = locations[1]
        val passengerNames = listOf("Sophia Martinez", "Liam Chen", "Emma Thompson", "Noah Patel", "Chloe Dubois")
        val dist = computeDistanceKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng).coerceAtLeast(2.4)
        val dur = (dist * 2.3).roundToInt().coerceAtLeast(6)
        val base = chosenVehicle.baseFare
        val distFare = dist * chosenVehicle.pricePerKm
        val fee = (base + distFare) * 0.10
        val total = base + distFare + fee

        val simulatedRide = RideEntity(
            id = "ride_${System.currentTimeMillis()}",
            vehicleId = chosenVehicle.id,
            vehicleName = "${chosenVehicle.brand} ${chosenVehicle.name}",
            vehicleCategory = chosenVehicle.category,
            licensePlate = chosenVehicle.licensePlate,
            driverName = chosenVehicle.driverName,
            driverRating = chosenVehicle.driverRating,
            driverPhone = chosenVehicle.driverPhone,
            riderName = passengerNames.random(),
            riderPhone = "+1 (555) 839-4410",
            pickupName = pickup.name,
            pickupAddress = pickup.address,
            pickupLat = pickup.lat,
            pickupLng = pickup.lng,
            dropoffName = dropoff.name,
            dropoffAddress = dropoff.address,
            dropoffLat = dropoff.lat,
            dropoffLng = dropoff.lng,
            distanceKm = (dist * 10.0).roundToInt() / 10.0,
            durationMinutes = dur,
            baseFare = (base * 100.0).roundToInt() / 100.0,
            distanceFare = (distFare * 100.0).roundToInt() / 100.0,
            serviceFee = (fee * 100.0).roundToInt() / 100.0,
            totalFare = (total * 100.0).roundToInt() / 100.0,
            status = TripStatus.REQUESTED.name,
            paymentMethod = "Supabase Instant Pay",
            userRating = 0,
            createdAt = System.currentTimeMillis()
        )

        viewModelScope.launch {
            _driverShift.update { it.copy(isOnline = true, incomingCountdownSec = 15) }
            repository.createRideRequest(simulatedRide)
            _statusBannerMessage.value = "New live ride request from ${simulatedRide.riderName}!"
        }
    }

    fun acceptActiveRideRequest() {
        val ride = activeRide.value ?: return
        countdownJob?.cancel()
        viewModelScope.launch {
            repository.updateRideStatus(ride.id, TripStatus.ACCEPTED)
            _statusBannerMessage.value = "Dispatch Accepted! Navigating to ${ride.pickupName}."
        }
    }

    fun advanceRideStage() {
        val ride = activeRide.value ?: return
        val nextStatus = when (ride.tripStatus) {
            TripStatus.REQUESTED -> TripStatus.ACCEPTED
            TripStatus.ACCEPTED -> TripStatus.ARRIVED_AT_PICKUP
            TripStatus.ARRIVED_AT_PICKUP -> TripStatus.IN_TRANSIT
            TripStatus.IN_TRANSIT -> TripStatus.COMPLETED
            else -> return
        }

        viewModelScope.launch {
            repository.updateRideStatus(ride.id, nextStatus)
            if (nextStatus == TripStatus.COMPLETED) {
                _driverShift.update { shift ->
                    shift.copy(
                        todayEarnings = ((shift.todayEarnings + ride.totalFare) * 100.0).roundToInt() / 100.0,
                        todayTripsCount = shift.todayTripsCount + 1
                    )
                }
                _statusBannerMessage.value = "Trip Completed! +$${String.format(java.util.Locale.US, "%.2f", ride.totalFare)} added to earnings."
            } else {
                _statusBannerMessage.value = nextStatus.displayLabel
            }
        }
    }

    fun cancelActiveRide() {
        val ride = activeRide.value ?: return
        simulationJob?.cancel()
        countdownJob?.cancel()
        viewModelScope.launch {
            repository.updateRideStatus(ride.id, TripStatus.CANCELLED)
            _statusBannerMessage.value = "Ride request cancelled."
        }
    }

    fun rateRide(rideId: String, stars: Int) {
        viewModelScope.launch {
            repository.rateCompletedRide(rideId, stars)
            _statusBannerMessage.value = "Thank you for rating your ride $stars ★!"
        }
    }

    fun triggerManualSupabaseSync() {
        viewModelScope.launch {
            _supabaseSyncState.value = SupabaseSyncState.Syncing
            val result = repository.syncWithSupabase()
            _supabaseSyncState.value = result
            _statusBannerMessage.value = when (result) {
                is SupabaseSyncState.Connected -> "Synced with Supabase (${result.projectHost})"
                is SupabaseSyncState.LocalFallback -> "Local Room Database synced & verified"
                else -> null
            }
        }
    }

    private fun startTelemetryLoopForRide(ride: RideEntity) {
        simulationJob?.cancel()
        countdownJob?.cancel()

        when (ride.tripStatus) {
            TripStatus.REQUESTED -> {
                _driverShift.update { it.copy(incomingCountdownSec = 15) }
                _telemetry.value = LiveTelemetryState(
                    driverLat = ride.pickupLat - 0.008,
                    driverLng = ride.pickupLng - 0.008,
                    bearingDegrees = 42f,
                    speedKmh = 0,
                    progressFraction = 0f,
                    remainingKm = ride.distanceKm,
                    remainingMinutes = ride.durationMinutes,
                    statusMessage = "Broadcasting request to nearby drivers..."
                )
                countdownJob = viewModelScope.launch {
                    for (sec in 15 downTo 1) {
                        _driverShift.update { it.copy(incomingCountdownSec = sec) }
                        delay(1000L)
                    }
                    // Auto-accept after countdown if user is in Rider Mode so rider flow never gets stuck
                    if (_currentRole.value == AppRole.RIDER && activeRide.value?.id == ride.id) {
                        repository.updateRideStatus(ride.id, TripStatus.ACCEPTED)
                    }
                }
            }

            TripStatus.ACCEPTED -> {
                simulationJob = viewModelScope.launch {
                    val steps = 36
                    val startLat = ride.pickupLat - 0.009
                    val startLng = ride.pickupLng - 0.009
                    for (i in 0..steps) {
                        val t = i.toFloat() / steps
                        val curLat = startLat + (ride.pickupLat - startLat) * t
                        val curLng = startLng + (ride.pickupLng - startLng) * t
                        _telemetry.value = LiveTelemetryState(
                            driverLat = curLat,
                            driverLng = curLng,
                            bearingDegrees = 38f,
                            speedKmh = if (i < steps) 44 + (i % 7) else 0,
                            progressFraction = t,
                            remainingKm = ((1f - t) * 1.6 * 10.0).roundToInt() / 10.0,
                            remainingMinutes = ((1f - t) * 3).roundToInt().coerceAtLeast(1),
                            statusMessage = "${ride.driverName} is en route to pickup (${((1f - t) * 100).toInt()}%)"
                        )
                        delay(350L)
                    }
                    repository.updateRideStatus(ride.id, TripStatus.ARRIVED_AT_PICKUP)
                }
            }

            TripStatus.ARRIVED_AT_PICKUP -> {
                _telemetry.value = LiveTelemetryState(
                    driverLat = ride.pickupLat,
                    driverLng = ride.pickupLng,
                    bearingDegrees = 48f,
                    speedKmh = 0,
                    progressFraction = 1f,
                    remainingKm = ride.distanceKm,
                    remainingMinutes = ride.durationMinutes,
                    statusMessage = "Driver waiting at ${ride.pickupName} • Ready to board"
                )
            }

            TripStatus.IN_TRANSIT -> {
                simulationJob = viewModelScope.launch {
                    val steps = 60
                    for (i in 0..steps) {
                        val t = i.toFloat() / steps
                        val curLat = ride.pickupLat + (ride.dropoffLat - ride.pickupLat) * t
                        val curLng = ride.pickupLng + (ride.dropoffLng - ride.pickupLng) * t
                        val remKm = (ride.distanceKm * (1f - t) * 10.0).roundToInt() / 10.0
                        val remMin = (ride.durationMinutes * (1f - t)).roundToInt().coerceAtLeast(1)
                        _telemetry.value = LiveTelemetryState(
                            driverLat = curLat,
                            driverLng = curLng,
                            bearingDegrees = 45f + sin(t * 6.28f) * 14f,
                            speedKmh = if (i < steps) 56 + (i % 9) else 0,
                            progressFraction = t,
                            remainingKm = remKm,
                            remainingMinutes = remMin,
                            statusMessage = "En route to ${ride.dropoffName} (${(t * 100).toInt()}%)"
                        )
                        delay(350L)
                    }
                    repository.updateRideStatus(ride.id, TripStatus.COMPLETED)
                    _driverShift.update { shift ->
                        shift.copy(
                            todayEarnings = ((shift.todayEarnings + ride.totalFare) * 100.0).roundToInt() / 100.0,
                            todayTripsCount = shift.todayTripsCount + 1
                        )
                    }
                }
            }

            TripStatus.COMPLETED, TripStatus.CANCELLED -> {
                _telemetry.value = LiveTelemetryState(
                    driverLat = ride.dropoffLat,
                    driverLng = ride.dropoffLng,
                    bearingDegrees = 0f,
                    speedKmh = 0,
                    progressFraction = 1f,
                    remainingKm = 0.0,
                    remainingMinutes = 0,
                    statusMessage = ride.tripStatus.displayLabel
                )
            }
        }
    }
}

private fun computeDistanceKm(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
    val r = 6371.0
    val dLat = Math.toRadians(lat2 - lat1)
    val dLon = Math.toRadians(lon2 - lon1)
    val a = sin(dLat / 2) * sin(dLat / 2) +
        cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
        sin(dLon / 2) * sin(dLon / 2)
    val c = 2 * atan2(sqrt(a), sqrt(1 - a))
    // Multiply by 1.32 urban road tortuosity factor
    return r * c * 1.32
}
