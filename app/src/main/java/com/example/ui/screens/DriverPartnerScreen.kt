package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.PowerSettingsNew
import androidx.compose.material.icons.filled.Radar
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.DriverShiftState
import com.example.data.LiveTelemetryState
import com.example.data.RideEntity
import com.example.data.TripStatus
import com.example.ui.components.InteractiveLiveMap
import com.example.ui.theme.CoralAlert
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.EmeraldOnline
import com.example.ui.theme.GlacierWhite
import com.example.ui.theme.NeonAmber
import com.example.ui.theme.ObsidianBackground
import com.example.ui.theme.SlateCard
import com.example.ui.theme.SlateSurface
import com.example.ui.theme.SteelGray
import com.example.ui.theme.SubtleBorder
import java.util.Locale

@Composable
fun DriverPartnerScreen(
    shiftState: DriverShiftState,
    activeRide: RideEntity?,
    telemetry: LiveTelemetryState,
    onToggleOnline: () -> Unit,
    onSimulateIncomingRequest: () -> Unit,
    onAcceptRequest: () -> Unit,
    onDeclineOrCancelRide: () -> Unit,
    onAdvanceRideStage: () -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("driver_partner_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // 1. Driver Online/Offline Status & Shift Metrics Header
        item(key = "driver_shift_header") {
            DriverShiftHeaderCard(
                shiftState = shiftState,
                onToggleOnline = onToggleOnline
            )
        }

        // 2. Incoming Real-Time Ride Request Alert Card (when status == REQUESTED)
        if (activeRide != null && activeRide.tripStatus == TripStatus.REQUESTED) {
            item(key = "incoming_request_radar_card") {
                IncomingDispatchAlertCard(
                    ride = activeRide,
                    countdownSec = shiftState.incomingCountdownSec,
                    onAccept = onAcceptRequest,
                    onDecline = onDeclineOrCancelRide
                )
            }
        }

        // 3. Active Driver Turn-by-Turn Navigation Console (when ACCEPTED, ARRIVED_AT_PICKUP, or IN_TRANSIT)
        if (activeRide != null && activeRide.tripStatus != TripStatus.REQUESTED) {
            item(key = "active_driver_trip_console") {
                ActiveDriverNavigationCard(
                    ride = activeRide,
                    telemetry = telemetry,
                    onAdvanceStage = onAdvanceRideStage,
                    onCancel = onDeclineOrCancelRide
                )
            }
        }

        // 4. Live Driver GPS & Demand Radar Map
        item(key = "driver_live_map") {
            InteractiveLiveMap(
                activeRide = activeRide,
                telemetry = telemetry,
                isDriverOnline = shiftState.isOnline,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(275.dp)
            )
        }

        // 5. Simulate Incoming Request Card (when idle so driver can test Uber-style incoming requests anytime)
        if (activeRide == null) {
            item(key = "driver_dispatch_simulator") {
                Card(
                    colors = CardDefaults.cardColors(containerColor = SlateSurface),
                    shape = RoundedCornerShape(22.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, SubtleBorder, RoundedCornerShape(22.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Radar,
                                contentDescription = null,
                                tint = NeonAmber,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "Real-Time Dispatch Radar",
                                    style = MaterialTheme.typography.titleLarge,
                                    color = GlacierWhite,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Test receiving an instant Uber-style passenger request with countdown timer & route.",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = SteelGray
                                )
                            }
                        }

                        Button(
                            onClick = onSimulateIncomingRequest,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                                .testTag("simulate_incoming_request_button"),
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = NeonAmber,
                                contentColor = ObsidianBackground
                            )
                        ) {
                            Icon(imageVector = Icons.Default.NotificationsActive, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Simulate Incoming Ride Request Now",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DriverShiftHeaderCard(
    shiftState: DriverShiftState,
    onToggleOnline: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(22.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(
                width = 1.dp,
                color = if (shiftState.isOnline) EmeraldOnline.copy(alpha = 0.6f) else SubtleBorder,
                shape = RoundedCornerShape(22.dp)
            )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(
                                if (shiftState.isOnline) EmeraldOnline.copy(alpha = 0.2f)
                                else CoralAlert.copy(alpha = 0.2f)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.PowerSettingsNew,
                            contentDescription = null,
                            tint = if (shiftState.isOnline) EmeraldOnline else CoralAlert
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = if (shiftState.isOnline) "ONLINE • RECEIVING DISPATCHES" else "OFFLINE • PAUSED",
                            style = MaterialTheme.typography.labelLarge,
                            color = if (shiftState.isOnline) EmeraldOnline else CoralAlert
                        )
                        Text(
                            text = "${shiftState.driverName} • ${shiftState.vehicleAssigned}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = SteelGray
                        )
                    }
                }

                Switch(
                    checked = shiftState.isOnline,
                    onCheckedChange = { onToggleOnline() },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = ObsidianBackground,
                        checkedTrackColor = EmeraldOnline
                    ),
                    modifier = Modifier.testTag("driver_online_switch")
                )
            }

            // Earnings & Shift Metrics Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(SlateCard)
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                MetricColumn(
                    label = "TODAY EARNINGS",
                    value = "$${String.format(Locale.US, "%.2f", shiftState.todayEarnings)}",
                    valueColor = EmeraldOnline
                )
                MetricColumn(
                    label = "COMPLETED",
                    value = "${shiftState.todayTripsCount} Trips",
                    valueColor = GlacierWhite
                )
                MetricColumn(
                    label = "ACCEPTANCE",
                    value = "${shiftState.acceptanceRate}%",
                    valueColor = ElectricCyan
                )
                MetricColumn(
                    label = "RATING",
                    value = "${shiftState.driverRating} ★",
                    valueColor = NeonAmber
                )
            }
        }
    }
}

@Composable
private fun MetricColumn(
    label: String,
    value: String,
    valueColor: androidx.compose.ui.graphics.Color
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = label, style = MaterialTheme.typography.labelMedium, color = SteelGray)
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            color = valueColor,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun IncomingDispatchAlertCard(
    ride: RideEntity,
    countdownSec: Int,
    onAccept: () -> Unit,
    onDecline: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SlateCard),
        shape = RoundedCornerShape(24.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(2.dp, NeonAmber, RoundedCornerShape(24.dp))
            .testTag("incoming_dispatch_card")
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = NeonAmber,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = "NEW RIDE REQUEST",
                            style = MaterialTheme.typography.labelLarge,
                            color = ObsidianBackground,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = ride.riderName,
                        style = MaterialTheme.typography.titleMedium,
                        color = GlacierWhite,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Radial Countdown Timer
                Box(contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(
                        progress = { (countdownSec / 15f).coerceIn(0f, 1f) },
                        modifier = Modifier.size(44.dp),
                        color = NeonAmber,
                        trackColor = SlateSurface,
                        strokeWidth = 4.dp
                    )
                    Text(
                        text = "${countdownSec}s",
                        style = MaterialTheme.typography.labelLarge,
                        color = NeonAmber
                    )
                }
            }

            // Payout & Distance Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(ObsidianBackground)
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("ESTIMATED DRIVER PAYOUT", style = MaterialTheme.typography.labelMedium, color = SteelGray)
                    Text(
                        text = "$${String.format(Locale.US, "%.2f", ride.totalFare)}",
                        style = MaterialTheme.typography.displayLarge,
                        color = EmeraldOnline,
                        fontWeight = FontWeight.Bold
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("TRIP DISTANCE", style = MaterialTheme.typography.labelMedium, color = SteelGray)
                    Text(
                        text = "${ride.distanceKm} km (~${ride.durationMinutes} min)",
                        style = MaterialTheme.typography.titleMedium,
                        color = ElectricCyan,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Pickup & Dropoff Details
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.MyLocation,
                        contentDescription = null,
                        tint = EmeraldOnline,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("PICKUP (1.2 km away)", style = MaterialTheme.typography.labelMedium, color = EmeraldOnline)
                        Text(
                            text = "${ride.pickupName} • ${ride.pickupAddress}",
                            style = MaterialTheme.typography.bodyLarge,
                            color = GlacierWhite,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Flag,
                        contentDescription = null,
                        tint = NeonAmber,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("DROPOFF DESTINATION", style = MaterialTheme.typography.labelMedium, color = NeonAmber)
                        Text(
                            text = "${ride.dropoffName} • ${ride.dropoffAddress}",
                            style = MaterialTheme.typography.bodyLarge,
                            color = GlacierWhite,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            // Accept & Decline Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = onDecline,
                    modifier = Modifier
                        .weight(0.38f)
                        .height(52.dp)
                        .testTag("decline_dispatch_button"),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = null, tint = CoralAlert)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Decline", color = CoralAlert, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = onAccept,
                    modifier = Modifier
                        .weight(0.62f)
                        .height(52.dp)
                        .testTag("accept_dispatch_button"),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = EmeraldOnline,
                        contentColor = ObsidianBackground
                    )
                ) {
                    Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Accept Dispatch",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
private fun ActiveDriverNavigationCard(
    ride: RideEntity,
    telemetry: LiveTelemetryState,
    onAdvanceStage: () -> Unit,
    onCancel: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(22.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.5.dp, ElectricCyan, RoundedCornerShape(22.dp))
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "ACTIVE DRIVER DISPATCH • ${ride.tripStatus.displayLabel.uppercase()}",
                        style = MaterialTheme.typography.labelMedium,
                        color = ElectricCyan
                    )
                    Text(
                        text = "Passenger: ${ride.riderName}",
                        style = MaterialTheme.typography.headlineMedium,
                        color = GlacierWhite,
                        fontWeight = FontWeight.Bold
                    )
                }
                Surface(
                    color = EmeraldOnline.copy(alpha = 0.16f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "$${String.format(Locale.US, "%.2f", ride.totalFare)}",
                        style = MaterialTheme.typography.titleLarge,
                        color = EmeraldOnline,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }
            }

            Text(
                text = telemetry.statusMessage,
                style = MaterialTheme.typography.bodyLarge,
                color = NeonAmber
            )

            HorizontalDivider(color = SubtleBorder)

            val actionLabel = when (ride.tripStatus) {
                TripStatus.ACCEPTED -> "Confirm Arrived at Pickup (${ride.pickupName})"
                TripStatus.ARRIVED_AT_PICKUP -> "Start Trip to ${ride.dropoffName}"
                TripStatus.IN_TRANSIT -> "Complete Ride & Collect $${String.format(Locale.US, "%.2f", ride.totalFare)}"
                else -> "Advance Trip Stage"
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onAdvanceStage,
                    modifier = Modifier
                        .weight(1f)
                        .height(52.dp)
                        .testTag("driver_stage_action_button"),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = ElectricCyan,
                        contentColor = ObsidianBackground
                    )
                ) {
                    Icon(imageVector = Icons.Default.PlayArrow, contentDescription = null)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = actionLabel,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }

                OutlinedButton(
                    onClick = onCancel,
                    modifier = Modifier.height(52.dp),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Text("Abort", color = CoralAlert)
                }
            }
        }
    }
}
