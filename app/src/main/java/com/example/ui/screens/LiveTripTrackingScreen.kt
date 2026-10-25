package com.example.ui.screens

import android.content.Intent
import android.net.Uri
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
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.FastForward
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.PersonPinCircle
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
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
fun LiveTripTrackingScreen(
    activeRide: RideEntity?,
    latestCompletedRide: RideEntity?,
    telemetry: LiveTelemetryState,
    onAdvanceStage: () -> Unit,
    onCancelRide: () -> Unit,
    onSwitchToDriverMode: () -> Unit,
    onBrowseFleet: () -> Unit,
    onRateRide: (String, Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val displayRide = activeRide ?: latestCompletedRide

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("live_trip_tracking_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // 1. Interactive Live Map Canvas
        item(key = "live_map") {
            InteractiveLiveMap(
                activeRide = activeRide,
                telemetry = telemetry,
                isDriverOnline = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(290.dp)
            )
        }

        if (activeRide != null) {
            // 2. Step-by-Step Live Trip Progress Bar
            item(key = "trip_stepper") {
                TripStageStepperCard(
                    currentStatus = activeRide.tripStatus,
                    progressFraction = telemetry.progressFraction
                )
            }

            // 3. Assigned Driver & Vehicle Live Telemetry Card
            item(key = "driver_telemetry_card") {
                Card(
                    colors = CardDefaults.cardColors(containerColor = SlateSurface),
                    shape = RoundedCornerShape(22.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, SubtleBorder, RoundedCornerShape(22.dp))
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
                                Box(
                                    modifier = Modifier
                                        .size(50.dp)
                                        .clip(CircleShape)
                                        .background(ElectricCyan.copy(alpha = 0.2f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.PersonPinCircle,
                                        contentDescription = null,
                                        tint = ElectricCyan,
                                        modifier = Modifier.size(30.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(
                                        text = activeRide.driverName,
                                        style = MaterialTheme.typography.titleLarge,
                                        color = GlacierWhite,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.Default.Star,
                                            contentDescription = null,
                                            tint = NeonAmber,
                                            modifier = Modifier.size(15.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "${activeRide.driverRating} Pro Partner • ${activeRide.vehicleName}",
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = SteelGray
                                        )
                                    }
                                }
                            }

                            // Call Driver Action
                            Surface(
                                color = EmeraldOnline.copy(alpha = 0.18f),
                                shape = CircleShape
                            ) {
                                IconButton(
                                    onClick = {
                                        runCatching {
                                            val dialIntent = Intent(
                                                Intent.ACTION_DIAL,
                                                Uri.parse("tel:${activeRide.driverPhone}")
                                            )
                                            context.startActivity(dialIntent)
                                        }
                                    },
                                    modifier = Modifier.testTag("call_driver_button")
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Call,
                                        contentDescription = "Call driver",
                                        tint = EmeraldOnline
                                    )
                                }
                            }
                        }

                        // License Plate & Fare Pill Row
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(SlateCard)
                                .padding(horizontal = 14.dp, vertical = 10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("LICENSE PLATE", style = MaterialTheme.typography.labelMedium, color = SteelGray)
                                Text(
                                    text = activeRide.licensePlate,
                                    style = MaterialTheme.typography.titleMedium,
                                    color = ElectricCyan,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("LOCKED FARE", style = MaterialTheme.typography.labelMedium, color = SteelGray)
                                Text(
                                    text = "$${String.format(Locale.US, "%.2f", activeRide.totalFare)}",
                                    style = MaterialTheme.typography.titleLarge,
                                    color = EmeraldOnline,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        // Route Summary
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
                                    Text("Pickup", style = MaterialTheme.typography.labelMedium, color = SteelGray)
                                    Text(
                                        text = "${activeRide.pickupName} (${activeRide.pickupAddress})",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = GlacierWhite
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
                                    Text("Destination", style = MaterialTheme.typography.labelMedium, color = SteelGray)
                                    Text(
                                        text = "${activeRide.dropoffName} (${activeRide.dropoffAddress})",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = GlacierWhite
                                    )
                                }
                            }
                        }

                        HorizontalDivider(color = SubtleBorder)

                        // Interactive Controls for Demo / Stage Progression
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Button(
                                onClick = onAdvanceStage,
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp)
                                    .testTag("advance_ride_stage_button"),
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ElectricCyan,
                                    contentColor = ObsidianBackground
                                )
                            ) {
                                Icon(imageVector = Icons.Default.FastForward, contentDescription = null)
                                Spacer(modifier = Modifier.width(6.dp))
                                val nextText = when (activeRide.tripStatus) {
                                    TripStatus.REQUESTED -> "Dispatch Driver Now"
                                    TripStatus.ACCEPTED -> "Arrive at Pickup"
                                    TripStatus.ARRIVED_AT_PICKUP -> "Start Ride"
                                    TripStatus.IN_TRANSIT -> "Complete Trip"
                                    else -> "Next Stage"
                                }
                                Text(nextText, fontWeight = FontWeight.Bold)
                            }

                            OutlinedButton(
                                onClick = onCancelRide,
                                modifier = Modifier
                                    .height(48.dp)
                                    .testTag("cancel_ride_button"),
                                shape = RoundedCornerShape(14.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Cancel,
                                    contentDescription = "Cancel ride",
                                    tint = CoralAlert
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Cancel", color = CoralAlert)
                            }
                        }

                        OutlinedButton(
                            onClick = onSwitchToDriverMode,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                                .testTag("switch_to_driver_console_button"),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.SwapHoriz,
                                contentDescription = null,
                                tint = NeonAmber
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "View This Trip in Driver Partner Console",
                                color = NeonAmber,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        } else {
            // No Active Ride State -> Show Latest Completed Ride Rating or Empty Prompt
            if (displayRide != null && displayRide.tripStatus == TripStatus.COMPLETED) {
                item(key = "completed_ride_summary") {
                    CompletedRideRatingCard(
                        ride = displayRide,
                        onRate = { stars -> onRateRide(displayRide.id, stars) },
                        onBookAnother = onBrowseFleet
                    )
                }
            } else {
                item(key = "no_active_trip_card") {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = SlateSurface),
                        shape = RoundedCornerShape(22.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(26.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.DirectionsCar,
                                contentDescription = null,
                                tint = ElectricCyan,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = "No Active Trip in Progress",
                                style = MaterialTheme.typography.titleLarge,
                                color = GlacierWhite,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Choose a vehicle from the fleet catalog to book your destination and watch real-time GPS tracking here.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = SteelGray
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = onBrowseFleet,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ElectricCyan,
                                    contentColor = ObsidianBackground
                                ),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .height(48.dp)
                                    .testTag("browse_fleet_from_live_button")
                            ) {
                                Text("Explore Fleet & Book a Ride", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TripStageStepperCard(
    currentStatus: TripStatus,
    progressFraction: Float
) {
    val stages = listOf(
        TripStatus.REQUESTED to "Requested",
        TripStatus.ACCEPTED to "En Route",
        TripStatus.ARRIVED_AT_PICKUP to "Pickup",
        TripStatus.IN_TRANSIT to "In Transit",
        TripStatus.COMPLETED to "Arrived"
    )

    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(20.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, SubtleBorder, RoundedCornerShape(20.dp))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = currentStatus.displayLabel.uppercase(),
                    style = MaterialTheme.typography.labelLarge,
                    color = ElectricCyan
                )
                Text(
                    text = "${(progressFraction * 100).toInt()}%",
                    style = MaterialTheme.typography.labelMedium,
                    color = NeonAmber
                )
            }

            LinearProgressIndicator(
                progress = { progressFraction.coerceIn(0.05f, 1f) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = ElectricCyan,
                trackColor = SlateCard
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                stages.forEach { (stage, label) ->
                    val reached = currentStatus.stepIndex >= stage.stepIndex
                    Text(
                        text = label,
                        style = MaterialTheme.typography.labelMedium,
                        color = if (reached) EmeraldOnline else SteelGray,
                        fontWeight = if (currentStatus == stage) FontWeight.Bold else FontWeight.Normal
                    )
                }
            }
        }
    }
}

@Composable
private fun CompletedRideRatingCard(
    ride: RideEntity,
    onRate: (Int) -> Unit,
    onBookAnother: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(22.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, EmeraldOnline.copy(alpha = 0.6f), RoundedCornerShape(22.dp))
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(
                imageVector = Icons.Default.CheckCircle,
                contentDescription = null,
                tint = EmeraldOnline,
                modifier = Modifier.size(44.dp)
            )
            Text(
                text = "You Arrived at ${ride.dropoffName}!",
                style = MaterialTheme.typography.headlineMedium,
                color = GlacierWhite,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "${ride.vehicleName} • Driver ${ride.driverName} • Total Paid $${String.format(Locale.US, "%.2f", ride.totalFare)}",
                style = MaterialTheme.typography.bodyMedium,
                color = SteelGray
            )

            Text(
                text = "Rate Your Experience",
                style = MaterialTheme.typography.labelLarge,
                color = NeonAmber
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                for (star in 1..5) {
                    val selected = ride.userRating >= star
                    IconButton(
                        onClick = { onRate(star) },
                        modifier = Modifier.testTag("rate_star_$star")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = "Rate $star stars",
                            tint = if (selected) NeonAmber else SteelGray,
                            modifier = Modifier.size(32.dp)
                        )
                    }
                }
            }

            Button(
                onClick = onBookAnother,
                colors = ButtonDefaults.buttonColors(
                    containerColor = ElectricCyan,
                    contentColor = ObsidianBackground
                ),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                Text("Book Another Vehicle", fontWeight = FontWeight.Bold)
            }
        }
    }
}
