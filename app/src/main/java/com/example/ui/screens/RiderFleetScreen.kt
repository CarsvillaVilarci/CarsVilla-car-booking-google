package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AirlineSeatReclineExtra
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.ElectricCar
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.Luggage
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.RestartAlt
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.SwapVert
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ui.BookingDraftState
import com.example.data.PresetLocation
import com.example.data.RideEntity
import com.example.data.SeedCatalog
import com.example.data.SortOption
import com.example.data.VehicleCategory
import com.example.data.VehicleEntity
import com.example.ui.FilterState
import com.example.ui.components.HeroMobilityBanner
import com.example.ui.components.VehicleIllustrationCanvas
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.EmeraldOnline
import com.example.ui.theme.GlacierWhite
import com.example.ui.theme.NeonAmber
import com.example.ui.theme.ObsidianBackground
import com.example.ui.theme.SlateCard
import com.example.ui.theme.SlateElevated
import com.example.ui.theme.SlateSurface
import com.example.ui.theme.SteelGray
import com.example.ui.theme.SubtleBorder
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun RiderFleetScreen(
    vehicles: List<VehicleEntity>,
    filterState: FilterState,
    bookingDraft: BookingDraftState,
    activeRide: RideEntity?,
    isSupabaseConnected: Boolean,
    onSearchQueryChange: (String) -> Unit,
    onSelectCategory: (VehicleCategory) -> Unit,
    onSelectMinSeats: (Int) -> Unit,
    onSelectTransmission: (String) -> Unit,
    onUpdateMaxPrice: (Float) -> Unit,
    onSelectSort: (SortOption) -> Unit,
    onResetFilters: () -> Unit,
    onOpenBookingSheet: (VehicleEntity) -> Unit,
    onDismissBookingSheet: () -> Unit,
    onSelectPickup: (PresetLocation) -> Unit,
    onSelectDropoff: (PresetLocation) -> Unit,
    onSwapLocations: () -> Unit,
    onUpdateDestinationNote: (String) -> Unit,
    onConfirmBooking: (Boolean) -> Unit,
    onNavigateToLiveTrip: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showAdvancedFilters by remember { mutableStateOf(false) }

    Box(modifier = modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .testTag("vehicle_fleet_list"),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Active Ride Live Banner if a ride is in progress
            if (activeRide != null) {
                item(key = "active_ride_banner") {
                    ActiveRideQuickBanner(
                        ride = activeRide,
                        onClick = onNavigateToLiveTrip
                    )
                }
            }

            // Hero Mobility Banner
            item(key = "hero_banner") {
                HeroMobilityBanner(
                    activeFleetCount = vehicles.size,
                    isSupabaseConnected = isSupabaseConnected
                )
            }

            // Search & Filter Controls
            item(key = "search_and_filters") {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = filterState.searchQuery,
                            onValueChange = onSearchQueryChange,
                            modifier = Modifier
                                .weight(1f)
                                .testTag("search_vehicle_input"),
                            placeholder = {
                                Text(
                                    text = "Search model, brand, EV, 7 seats...",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = SteelGray
                                )
                            },
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Search,
                                    contentDescription = "Search vehicles",
                                    tint = ElectricCyan
                                )
                            },
                            trailingIcon = {
                                if (filterState.searchQuery.isNotEmpty()) {
                                    IconButton(onClick = { onSearchQueryChange("") }) {
                                        Icon(
                                            imageVector = Icons.Default.Clear,
                                            contentDescription = "Clear search",
                                            tint = SteelGray
                                        )
                                    }
                                }
                            },
                            singleLine = true,
                            shape = RoundedCornerShape(16.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ElectricCyan,
                                unfocusedBorderColor = SubtleBorder,
                                focusedContainerColor = SlateSurface,
                                unfocusedContainerColor = SlateSurface
                            )
                        )

                        // Filter Drawer Toggle Button
                        Surface(
                            color = if (showAdvancedFilters || filterState.activeFilterCount > 0) {
                                ElectricCyan.copy(alpha = 0.2f)
                            } else {
                                SlateSurface
                            },
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier
                                .border(
                                    width = 1.dp,
                                    color = if (filterState.activeFilterCount > 0) ElectricCyan else SubtleBorder,
                                    shape = RoundedCornerShape(16.dp)
                                )
                                .clickable { showAdvancedFilters = !showAdvancedFilters }
                                .padding(horizontal = 14.dp, vertical = 14.dp)
                                .testTag("toggle_filters_button")
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.FilterList,
                                    contentDescription = "Toggle advanced filters",
                                    tint = ElectricCyan,
                                    modifier = Modifier.size(22.dp)
                                )
                                if (filterState.activeFilterCount > 0) {
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "${filterState.activeFilterCount}",
                                        style = MaterialTheme.typography.labelLarge,
                                        color = ElectricCyan
                                    )
                                }
                            }
                        }
                    }

                    // Horizontal Vehicle Category Filter Chips
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        VehicleCategory.entries.forEach { category ->
                            val selected = filterState.category == category
                            FilterChip(
                                selected = selected,
                                onClick = { onSelectCategory(category) },
                                label = {
                                    Text(
                                        text = category.displayName,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                                    )
                                },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = ElectricCyan,
                                    selectedLabelColor = ObsidianBackground,
                                    containerColor = SlateSurface,
                                    labelColor = GlacierWhite
                                ),
                                border = FilterChipDefaults.filterChipBorder(
                                    enabled = true,
                                    selected = selected,
                                    borderColor = SubtleBorder,
                                    selectedBorderColor = ElectricCyan
                                ),
                                modifier = Modifier.testTag("category_chip_${category.name}")
                            )
                        }
                    }

                    // Expandable Advanced Filters Panel (Seats, Transmission, Price Slider, Sort)
                    AnimatedVisibility(visible = showAdvancedFilters) {
                        AdvancedFilterCard(
                            filterState = filterState,
                            onSelectMinSeats = onSelectMinSeats,
                            onSelectTransmission = onSelectTransmission,
                            onUpdateMaxPrice = onUpdateMaxPrice,
                            onSelectSort = onSelectSort,
                            onResetFilters = onResetFilters
                        )
                    }

                    // Fleet Result Count & Active Sort Summary
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Showing ${vehicles.size} available vehicles",
                            style = MaterialTheme.typography.bodyMedium,
                            color = SteelGray
                        )
                        if (filterState.activeFilterCount > 0) {
                            TextButton(
                                onClick = onResetFilters,
                                modifier = Modifier.testTag("clear_all_filters_button")
                            ) {
                                Icon(
                                    imageVector = Icons.Default.RestartAlt,
                                    contentDescription = null,
                                    tint = NeonAmber,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "Reset Filters",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = NeonAmber
                                )
                            }
                        }
                    }
                }
            }

            // Empty State if filters exclude all vehicles
            if (vehicles.isEmpty()) {
                item(key = "empty_fleet_state") {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = SlateSurface),
                        shape = RoundedCornerShape(20.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(28.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.DirectionsCar,
                                contentDescription = null,
                                tint = ElectricCyan,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "No matching vehicles found",
                                style = MaterialTheme.typography.titleLarge,
                                color = GlacierWhite
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Try adjusting your seat capacity, price range, or category filters.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = SteelGray
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = onResetFilters,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ElectricCyan,
                                    contentColor = ObsidianBackground
                                )
                            ) {
                                Text("Reset All Filters", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            } else {
                // Vehicle Fleet Cards
                items(items = vehicles, key = { it.id }) { vehicle ->
                    VehicleFleetCard(
                        vehicle = vehicle,
                        onBookClick = { onOpenBookingSheet(vehicle) }
                    )
                }
            }

            item { Spacer(modifier = Modifier.height(24.dp)) }
        }

        // Destination & Fare Booking Bottom Sheet
        if (bookingDraft.selectedVehicle != null) {
            val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
            ModalBottomSheet(
                onDismissRequest = onDismissBookingSheet,
                sheetState = sheetState,
                containerColor = SlateSurface,
                contentColor = GlacierWhite
            ) {
                BookingConfirmationBottomSheet(
                    draft = bookingDraft,
                    onSelectPickup = onSelectPickup,
                    onSelectDropoff = onSelectDropoff,
                    onSwapLocations = onSwapLocations,
                    onUpdateDestinationNote = onUpdateDestinationNote,
                    onConfirmRider = { onConfirmBooking(false) },
                    onConfirmAndSwitchToDriver = { onConfirmBooking(true) }
                )
            }
        }
    }
}

@Composable
private fun ActiveRideQuickBanner(
    ride: RideEntity,
    onClick: () -> Unit
) {
    Surface(
        color = ElectricCyan.copy(alpha = 0.16f),
        shape = RoundedCornerShape(18.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, ElectricCyan, RoundedCornerShape(18.dp))
            .clickable(onClick = onClick)
            .testTag("active_ride_quick_banner")
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(ElectricCyan),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.DirectionsCar,
                        contentDescription = null,
                        tint = ObsidianBackground
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "ACTIVE RIDE • ${ride.tripStatus.displayLabel.uppercase()}",
                        style = MaterialTheme.typography.labelMedium,
                        color = ElectricCyan
                    )
                    Text(
                        text = "${ride.vehicleName} → ${ride.dropoffName}",
                        style = MaterialTheme.typography.titleMedium,
                        color = GlacierWhite,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = "Open live tracking",
                tint = ElectricCyan
            )
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun AdvancedFilterCard(
    filterState: FilterState,
    onSelectMinSeats: (Int) -> Unit,
    onSelectTransmission: (String) -> Unit,
    onUpdateMaxPrice: (Float) -> Unit,
    onSelectSort: (SortOption) -> Unit,
    onResetFilters: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SlateCard),
        shape = RoundedCornerShape(20.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, SubtleBorder, RoundedCornerShape(20.dp))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Fleet Filters & Sorting",
                    style = MaterialTheme.typography.titleMedium,
                    color = GlacierWhite,
                    fontWeight = FontWeight.Bold
                )
                TextButton(onClick = onResetFilters) {
                    Text("Reset", color = ElectricCyan)
                }
            }

            // Sort Options
            Text("Sort By", style = MaterialTheme.typography.labelMedium, color = SteelGray)
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                SortOption.entries.forEach { sort ->
                    val selected = filterState.sortOption == sort
                    FilterChip(
                        selected = selected,
                        onClick = { onSelectSort(sort) },
                        label = { Text(sort.label, style = MaterialTheme.typography.bodyMedium) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = NeonAmber,
                            selectedLabelColor = ObsidianBackground
                        )
                    )
                }
            }

            // Minimum Seating Capacity
            Text("Minimum Seats", style = MaterialTheme.typography.labelMedium, color = SteelGray)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(0 to "Any", 4 to "4+ Seats", 5 to "5+ Seats", 7 to "7 XL Seats").forEach { (seats, label) ->
                    val selected = filterState.minSeats == seats
                    FilterChip(
                        selected = selected,
                        onClick = { onSelectMinSeats(seats) },
                        label = { Text(label, style = MaterialTheme.typography.bodyMedium) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = ElectricCyan,
                            selectedLabelColor = ObsidianBackground
                        )
                    )
                }
            }

            // Drive / Transmission Type
            Text("Drivetrain", style = MaterialTheme.typography.labelMedium, color = SteelGray)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("ALL" to "All Drives", "EV Direct" to "100% Electric", "Automatic" to "Hybrid / Auto").forEach { (trans, label) ->
                    val selected = filterState.transmission == trans
                    FilterChip(
                        selected = selected,
                        onClick = { onSelectTransmission(trans) },
                        label = { Text(label, style = MaterialTheme.typography.bodyMedium) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = EmeraldOnline,
                            selectedLabelColor = ObsidianBackground
                        )
                    )
                }
            }

            // Max Price Per Km Slider
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Max Rate per Km", style = MaterialTheme.typography.labelMedium, color = SteelGray)
                Text(
                    text = "$${String.format(Locale.US, "%.2f", filterState.maxPricePerKm)} / km",
                    style = MaterialTheme.typography.labelLarge,
                    color = ElectricCyan
                )
            }
            Slider(
                value = filterState.maxPricePerKm,
                onValueChange = onUpdateMaxPrice,
                valueRange = 1.25f..4.50f,
                colors = SliderDefaults.colors(
                    thumbColor = ElectricCyan,
                    activeTrackColor = ElectricCyan
                )
            )
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun VehicleFleetCard(
    vehicle: VehicleEntity,
    onBookClick: () -> Unit
) {
    val accentColor = Color(vehicle.accentHex)
    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(22.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, SubtleBorder, RoundedCornerShape(22.dp))
            .clickable(onClick = onBookClick)
            .testTag("vehicle_card_${vehicle.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Custom Vector Car Illustration
                VehicleIllustrationCanvas(
                    category = vehicle.category,
                    accentHex = vehicle.accentHex,
                    modifier = Modifier
                        .width(126.dp)
                        .height(86.dp)
                )

                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            color = accentColor.copy(alpha = 0.16f),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = vehicle.category,
                                style = MaterialTheme.typography.labelMedium,
                                color = accentColor,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Schedule,
                                contentDescription = null,
                                tint = EmeraldOnline,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(3.dp))
                            Text(
                                text = "${vehicle.etaMinutes} min away",
                                style = MaterialTheme.typography.labelMedium,
                                color = EmeraldOnline
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "${vehicle.brand} ${vehicle.name}",
                        style = MaterialTheme.typography.titleLarge,
                        color = GlacierWhite,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(2.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = NeonAmber,
                            modifier = Modifier.size(15.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = "${vehicle.rating} (${vehicle.tripsCount} rides) • ${vehicle.driverName}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = SteelGray
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Specs Row (Seats, Luggage, Range/Fuel, Plate)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(SlateCard)
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                SpecItem(
                    icon = Icons.Default.AirlineSeatReclineExtra,
                    text = "${vehicle.seats} Seats"
                )
                SpecItem(
                    icon = Icons.Default.Luggage,
                    text = "${vehicle.luggage} Bags"
                )
                SpecItem(
                    icon = Icons.Default.ElectricCar,
                    text = vehicle.rangeOrFuel
                )
                Text(
                    text = vehicle.licensePlate,
                    style = MaterialTheme.typography.labelMedium,
                    color = ElectricCyan
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Feature tags
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                vehicle.featureList.take(3).forEach { feature ->
                    Surface(
                        color = SlateElevated,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = feature,
                            style = MaterialTheme.typography.bodyMedium,
                            color = SteelGray,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))
            HorizontalDivider(color = SubtleBorder.copy(alpha = 0.6f))
            Spacer(modifier = Modifier.height(12.dp))

            // Pricing & Book CTA Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(
                            text = "$${String.format(Locale.US, "%.2f", vehicle.pricePerKm)}",
                            style = MaterialTheme.typography.headlineMedium,
                            color = GlacierWhite,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = " / km",
                            style = MaterialTheme.typography.bodyMedium,
                            color = SteelGray,
                            modifier = Modifier.padding(bottom = 3.dp)
                        )
                    }
                    Text(
                        text = "+ $${String.format(Locale.US, "%.2f", vehicle.baseFare)} base dispatch fare",
                        style = MaterialTheme.typography.labelMedium,
                        color = SteelGray
                    )
                }

                Button(
                    onClick = onBookClick,
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = ElectricCyan,
                        contentColor = ObsidianBackground
                    ),
                    modifier = Modifier
                        .height(48.dp)
                        .testTag("book_vehicle_${vehicle.id}")
                ) {
                    Text(
                        text = "Select & Book",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun SpecItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    text: String
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = SteelGray,
            modifier = Modifier.size(15.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium,
            color = GlacierWhite
        )
    }
}

@Composable
private fun BookingConfirmationBottomSheet(
    draft: BookingDraftState,
    onSelectPickup: (PresetLocation) -> Unit,
    onSelectDropoff: (PresetLocation) -> Unit,
    onSwapLocations: () -> Unit,
    onUpdateDestinationNote: (String) -> Unit,
    onConfirmRider: () -> Unit,
    onConfirmAndSwitchToDriver: () -> Unit
) {
    val vehicle = draft.selectedVehicle ?: return

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .padding(bottom = 28.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Vehicle Header Summary
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "CONFIGURE DESTINATION & DISPATCH",
                    style = MaterialTheme.typography.labelMedium,
                    color = ElectricCyan
                )
                Text(
                    text = "${vehicle.brand} ${vehicle.name}",
                    style = MaterialTheme.typography.headlineMedium,
                    color = GlacierWhite,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Driver: ${vehicle.driverName} (${vehicle.driverRating} ★) • Plate ${vehicle.licensePlate}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = SteelGray
                )
            }
            Surface(
                color = EmeraldOnline.copy(alpha = 0.16f),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "ETA ${vehicle.etaMinutes} min",
                    style = MaterialTheme.typography.labelLarge,
                    color = EmeraldOnline,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                )
            }
        }

        // Pickup Selector
        Card(
            colors = CardDefaults.cardColors(containerColor = SlateCard),
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.MyLocation,
                            contentDescription = null,
                            tint = EmeraldOnline,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text("PICKUP POINT", style = MaterialTheme.typography.labelMedium, color = EmeraldOnline)
                            Text(
                                text = draft.pickupLocation.name,
                                style = MaterialTheme.typography.titleMedium,
                                color = GlacierWhite,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    IconButton(
                        onClick = onSwapLocations,
                        modifier = Modifier.testTag("swap_locations_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.SwapVert,
                            contentDescription = "Swap pickup and destination",
                            tint = ElectricCyan
                        )
                    }
                }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    SeedCatalog.presetLocations.forEach { loc ->
                        val isPickup = draft.pickupLocation.id == loc.id
                        FilterChip(
                            selected = isPickup,
                            onClick = { onSelectPickup(loc) },
                            label = { Text(loc.zone, style = MaterialTheme.typography.bodyMedium) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = EmeraldOnline,
                                selectedLabelColor = ObsidianBackground
                            )
                        )
                    }
                }

                HorizontalDivider(color = SubtleBorder)

                // Dropoff Destination Selector
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Flag,
                        contentDescription = null,
                        tint = NeonAmber,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("DESTINATION", style = MaterialTheme.typography.labelMedium, color = NeonAmber)
                        Text(
                            text = draft.dropoffLocation.name,
                            style = MaterialTheme.typography.titleMedium,
                            color = GlacierWhite,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    SeedCatalog.presetLocations.forEach { loc ->
                        val isDropoff = draft.dropoffLocation.id == loc.id
                        FilterChip(
                            selected = isDropoff,
                            onClick = { onSelectDropoff(loc) },
                            label = { Text(loc.zone, style = MaterialTheme.typography.bodyMedium) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = NeonAmber,
                                selectedLabelColor = ObsidianBackground
                            )
                        )
                    }
                }

                OutlinedTextField(
                    value = draft.customDestinationNote,
                    onValueChange = onUpdateDestinationNote,
                    placeholder = {
                        Text(
                            "Optional building, gate, or landmark note...",
                            style = MaterialTheme.typography.bodyMedium,
                            color = SteelGray
                        )
                    },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("destination_note_input"),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ElectricCyan,
                        unfocusedBorderColor = SubtleBorder
                    )
                )
            }
        }

        // Transparent Fare Breakdown Card
        Card(
            colors = CardDefaults.cardColors(containerColor = SlateCard),
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Est. Distance (${String.format(Locale.US, "%.1f", draft.distanceKm)} km • ~${draft.estimatedMinutes} min)",
                        style = MaterialTheme.typography.bodyMedium,
                        color = SteelGray
                    )
                    Text(
                        text = "$${String.format(Locale.US, "%.2f", draft.distanceFare)}",
                        style = MaterialTheme.typography.labelLarge,
                        color = GlacierWhite
                    )
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Base Dispatch + Service Fee", style = MaterialTheme.typography.bodyMedium, color = SteelGray)
                    Text(
                        text = "$${String.format(Locale.US, "%.2f", draft.baseFare + draft.serviceFee)}",
                        style = MaterialTheme.typography.labelLarge,
                        color = GlacierWhite
                    )
                }
                HorizontalDivider(color = SubtleBorder, modifier = Modifier.padding(vertical = 4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Total Estimated Fare",
                        style = MaterialTheme.typography.titleMedium,
                        color = GlacierWhite,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "$${String.format(Locale.US, "%.2f", draft.totalFare)}",
                        style = MaterialTheme.typography.headlineMedium,
                        color = ElectricCyan,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Primary Dispatch Buttons
        Button(
            onClick = onConfirmRider,
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp)
                .testTag("confirm_ride_request_button"),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = ElectricCyan,
                contentColor = ObsidianBackground
            )
        ) {
            Icon(imageVector = Icons.Default.Speed, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Request Ride & Track Live ($${String.format(Locale.US, "%.2f", draft.totalFare)})",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        }

        OutlinedButton(
            onClick = onConfirmAndSwitchToDriver,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .testTag("confirm_and_switch_driver_button"),
            shape = RoundedCornerShape(14.dp)
        ) {
            Text(
                text = "Request & Open Driver Mode to Accept It Yourself",
                style = MaterialTheme.typography.bodyMedium,
                color = NeonAmber,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
