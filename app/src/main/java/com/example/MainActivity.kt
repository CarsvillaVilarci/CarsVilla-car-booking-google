package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.LocalTaxi
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Radar
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.outlined.DirectionsCar
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Radar
import androidx.compose.material.icons.outlined.Storage
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.AppRole
import com.example.data.SupabaseSyncState
import com.example.data.TripStatus
import com.example.ui.RideFlowViewModel
import com.example.ui.screens.DriverPartnerScreen
import com.example.ui.screens.LiveTripTrackingScreen
import com.example.ui.screens.RiderFleetScreen
import com.example.ui.screens.TripHistoryAndDbScreen
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.EmeraldOnline
import com.example.ui.theme.GlacierWhite
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.NeonAmber
import com.example.ui.theme.ObsidianBackground
import com.example.ui.theme.SlateCard
import com.example.ui.theme.SlateSurface
import com.example.ui.theme.SteelGray
import com.example.ui.theme.SubtleBorder

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                RideFlowApp()
            }
        }
    }
}

@Composable
fun RideFlowApp(
    viewModel: RideFlowViewModel = viewModel()
) {
    val currentRole by viewModel.currentRole.collectAsStateWithLifecycle()
    val selectedTab by viewModel.selectedBottomTab.collectAsStateWithLifecycle()
    val filteredVehicles by viewModel.filteredVehicles.collectAsStateWithLifecycle()
    val filterState by viewModel.filterState.collectAsStateWithLifecycle()
    val bookingDraft by viewModel.bookingDraft.collectAsStateWithLifecycle()
    val activeRide by viewModel.activeRide.collectAsStateWithLifecycle()
    val rideHistory by viewModel.rideHistory.collectAsStateWithLifecycle()
    val driverShift by viewModel.driverShift.collectAsStateWithLifecycle()
    val telemetry by viewModel.telemetry.collectAsStateWithLifecycle()
    val supabaseSyncState by viewModel.supabaseSyncState.collectAsStateWithLifecycle()
    val bannerMessage by viewModel.statusBannerMessage.collectAsStateWithLifecycle()

    // Handle system Back navigation from secondary tabs or Driver mode back to Rider Fleet home
    BackHandler(enabled = currentRole != AppRole.RIDER || selectedTab != 0) {
        if (selectedTab != 0) {
            viewModel.selectBottomTab(0)
        } else {
            viewModel.setRole(AppRole.RIDER)
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = ObsidianBackground,
        contentWindowInsets = WindowInsets.safeDrawing,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SlateSurface)
                    .statusBarsPadding()
            ) {
                RideFlowTopBar(
                    currentRole = currentRole,
                    hasIncomingRequest = activeRide?.tripStatus == TripStatus.REQUESTED,
                    onSelectRole = { viewModel.setRole(it) }
                )

                AnimatedVisibility(visible = bannerMessage != null) {
                    bannerMessage?.let { msg ->
                        Surface(
                            color = ElectricCyan.copy(alpha = 0.16f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 16.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.NotificationsActive,
                                        contentDescription = null,
                                        tint = ElectricCyan,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = msg,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = GlacierWhite
                                    )
                                }
                                IconButton(
                                    onClick = { viewModel.clearBanner() },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = "Dismiss notification",
                                        tint = SteelGray,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        },
        bottomBar = {
            RideFlowBottomNavigation(
                currentRole = currentRole,
                selectedTab = selectedTab,
                hasActiveRide = activeRide != null,
                onSelectTab = { viewModel.selectBottomTab(it) }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            if (currentRole == AppRole.RIDER) {
                when (selectedTab) {
                    0 -> RiderFleetScreen(
                        vehicles = filteredVehicles,
                        filterState = filterState,
                        bookingDraft = bookingDraft,
                        activeRide = activeRide,
                        isSupabaseConnected = supabaseSyncState is SupabaseSyncState.Connected,
                        onSearchQueryChange = viewModel::updateSearchQuery,
                        onSelectCategory = viewModel::selectCategory,
                        onSelectMinSeats = viewModel::updateMinSeats,
                        onSelectTransmission = viewModel::updateTransmission,
                        onUpdateMaxPrice = viewModel::updateMaxPrice,
                        onSelectSort = viewModel::updateSortOption,
                        onResetFilters = viewModel::resetFilters,
                        onOpenBookingSheet = viewModel::openBookingForVehicle,
                        onDismissBookingSheet = viewModel::dismissBookingSheet,
                        onSelectPickup = viewModel::selectPickupLocation,
                        onSelectDropoff = viewModel::selectDropoffLocation,
                        onSwapLocations = viewModel::swapLocations,
                        onUpdateDestinationNote = viewModel::updateCustomDestinationNote,
                        onConfirmBooking = viewModel::confirmAndDispatchRide,
                        onNavigateToLiveTrip = { viewModel.selectBottomTab(1) }
                    )

                    1 -> LiveTripTrackingScreen(
                        activeRide = activeRide,
                        latestCompletedRide = rideHistory.firstOrNull { it.tripStatus == TripStatus.COMPLETED },
                        telemetry = telemetry,
                        onAdvanceStage = viewModel::advanceRideStage,
                        onCancelRide = viewModel::cancelActiveRide,
                        onSwitchToDriverMode = {
                            viewModel.setRole(AppRole.DRIVER)
                        },
                        onBrowseFleet = { viewModel.selectBottomTab(0) },
                        onRateRide = viewModel::rateRide
                    )

                    else -> TripHistoryAndDbScreen(
                        rides = rideHistory,
                        supabaseSyncState = supabaseSyncState,
                        onSyncNow = viewModel::triggerManualSupabaseSync
                    )
                }
            } else {
                // Driver Partner Mode
                when (selectedTab) {
                    0 -> DriverPartnerScreen(
                        shiftState = driverShift,
                        activeRide = activeRide,
                        telemetry = telemetry,
                        onToggleOnline = viewModel::toggleDriverOnlineStatus,
                        onSimulateIncomingRequest = viewModel::simulateIncomingRequestForDriver,
                        onAcceptRequest = viewModel::acceptActiveRideRequest,
                        onDeclineOrCancelRide = viewModel::cancelActiveRide,
                        onAdvanceRideStage = viewModel::advanceRideStage
                    )

                    else -> TripHistoryAndDbScreen(
                        rides = rideHistory,
                        supabaseSyncState = supabaseSyncState,
                        onSyncNow = viewModel::triggerManualSupabaseSync
                    )
                }
            }
        }
    }
}

@Composable
private fun RideFlowTopBar(
    currentRole: AppRole,
    hasIncomingRequest: Boolean,
    onSelectRole: (AppRole) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Brand Identity
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(ElectricCyan.copy(alpha = 0.18f))
                    .border(1.dp, ElectricCyan, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.LocalTaxi,
                    contentDescription = null,
                    tint = ElectricCyan,
                    modifier = Modifier.size(22.dp)
                )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(
                    text = "RideFlow",
                    style = MaterialTheme.typography.titleLarge,
                    color = GlacierWhite,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = if (currentRole == AppRole.RIDER) "Fleet & Destination Booking" else "Uber-Style Driver Dispatch",
                    style = MaterialTheme.typography.labelMedium,
                    color = if (currentRole == AppRole.RIDER) ElectricCyan else NeonAmber
                )
            }
        }

        // Seamless Role Switcher Pill (Rider Mode <-> Driver Mode)
        Row(
            modifier = Modifier
                .clip(RoundedCornerShape(50))
                .background(SlateCard)
                .border(1.dp, SubtleBorder, RoundedCornerShape(50))
                .padding(3.dp)
                .testTag("role_toggle_pill"),
            verticalAlignment = Alignment.CenterVertically
        ) {
            val isRider = currentRole == AppRole.RIDER
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(50))
                    .background(if (isRider) ElectricCyan else SlateCard)
                    .clickable { onSelectRole(AppRole.RIDER) }
                    .padding(horizontal = 12.dp, vertical = 7.dp)
                    .testTag("switch_to_rider_button")
            ) {
                Text(
                    text = "Rider",
                    style = MaterialTheme.typography.labelLarge,
                    color = if (isRider) ObsidianBackground else SteelGray
                )
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(50))
                    .background(if (!isRider) NeonAmber else SlateCard)
                    .clickable { onSelectRole(AppRole.DRIVER) }
                    .padding(horizontal = 12.dp, vertical = 7.dp)
                    .testTag("switch_to_driver_button")
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "Driver",
                        style = MaterialTheme.typography.labelLarge,
                        color = if (!isRider) ObsidianBackground else SteelGray
                    )
                    if (hasIncomingRequest && isRider) {
                        Spacer(modifier = Modifier.width(5.dp))
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(NeonAmber)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun RideFlowBottomNavigation(
    currentRole: AppRole,
    selectedTab: Int,
    hasActiveRide: Boolean,
    onSelectTab: (Int) -> Unit
) {
    NavigationBar(
        containerColor = SlateSurface,
        contentColor = GlacierWhite
    ) {
        if (currentRole == AppRole.RIDER) {
            NavigationBarItem(
                selected = selectedTab == 0,
                onClick = { onSelectTab(0) },
                icon = {
                    Icon(
                        imageVector = if (selectedTab == 0) Icons.Filled.DirectionsCar else Icons.Outlined.DirectionsCar,
                        contentDescription = "Vehicles"
                    )
                },
                label = { Text("Vehicles") },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = ObsidianBackground,
                    selectedTextColor = ElectricCyan,
                    indicatorColor = ElectricCyan,
                    unselectedIconColor = SteelGray,
                    unselectedTextColor = SteelGray
                ),
                modifier = Modifier.testTag("nav_tab_vehicles")
            )

            NavigationBarItem(
                selected = selectedTab == 1,
                onClick = { onSelectTab(1) },
                icon = {
                    BadgedBox(
                        badge = {
                            if (hasActiveRide) {
                                Badge(containerColor = EmeraldOnline)
                            }
                        }
                    ) {
                        Icon(
                            imageVector = if (selectedTab == 1) Icons.Filled.Explore else Icons.Outlined.Explore,
                            contentDescription = "Live Trip"
                        )
                    }
                },
                label = { Text("Live Trip") },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = ObsidianBackground,
                    selectedTextColor = ElectricCyan,
                    indicatorColor = ElectricCyan,
                    unselectedIconColor = SteelGray,
                    unselectedTextColor = SteelGray
                ),
                modifier = Modifier.testTag("nav_tab_live_trip")
            )

            NavigationBarItem(
                selected = selectedTab == 2,
                onClick = { onSelectTab(2) },
                icon = {
                    Icon(
                        imageVector = if (selectedTab == 2) Icons.Filled.Storage else Icons.Outlined.Storage,
                        contentDescription = "Trips & Supabase"
                    )
                },
                label = { Text("Trips & DB") },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = ObsidianBackground,
                    selectedTextColor = ElectricCyan,
                    indicatorColor = ElectricCyan,
                    unselectedIconColor = SteelGray,
                    unselectedTextColor = SteelGray
                ),
                modifier = Modifier.testTag("nav_tab_history_db")
            )
        } else {
            NavigationBarItem(
                selected = selectedTab == 0,
                onClick = { onSelectTab(0) },
                icon = {
                    BadgedBox(
                        badge = {
                            if (hasActiveRide) {
                                Badge(containerColor = NeonAmber)
                            }
                        }
                    ) {
                        Icon(
                            imageVector = if (selectedTab == 0) Icons.Filled.Radar else Icons.Outlined.Radar,
                            contentDescription = "Driver Dispatch"
                        )
                    }
                },
                label = { Text("Driver Console") },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = ObsidianBackground,
                    selectedTextColor = NeonAmber,
                    indicatorColor = NeonAmber,
                    unselectedIconColor = SteelGray,
                    unselectedTextColor = SteelGray
                ),
                modifier = Modifier.testTag("nav_tab_driver_console")
            )

            NavigationBarItem(
                selected = selectedTab == 1,
                onClick = { onSelectTab(1) },
                icon = {
                    Icon(
                        imageVector = if (selectedTab == 1) Icons.Filled.Storage else Icons.Outlined.Storage,
                        contentDescription = "Trips & Supabase"
                    )
                },
                label = { Text("Earnings & DB") },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = ObsidianBackground,
                    selectedTextColor = NeonAmber,
                    indicatorColor = NeonAmber,
                    unselectedIconColor = SteelGray,
                    unselectedTextColor = SteelGray
                ),
                modifier = Modifier.testTag("nav_tab_driver_db")
            )
        }
    }
}
