package com.example.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.LiveTelemetryState
import com.example.data.RideEntity
import com.example.data.TripStatus
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.EmeraldOnline
import com.example.ui.theme.GlacierWhite
import com.example.ui.theme.NeonAmber
import com.example.ui.theme.ObsidianBackground
import com.example.ui.theme.SlateCard
import com.example.ui.theme.SlateSurface
import com.example.ui.theme.SteelGray
import java.util.Locale

@Composable
fun InteractiveLiveMap(
    activeRide: RideEntity?,
    telemetry: LiveTelemetryState,
    isDriverOnline: Boolean,
    modifier: Modifier = Modifier
) {
    var zoomFactor by remember { mutableFloatStateOf(1f) }
    val infiniteTransition = rememberInfiniteTransition(label = "map_radar")
    val pulseRadius by infiniteTransition.animateFloat(
        initialValue = 0.15f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "pulse_radius"
    )
    val dashPhase by infiniteTransition.animateFloat(
        initialValue = 40f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "dash_phase"
    )

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .background(Color(0xFF0A101A))
            .testTag("interactive_live_map")
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height

            // 1. Bay waterfront channel on top-right
            val waterPath = Path().apply {
                moveTo(w * 0.72f, 0f)
                cubicTo(w * 0.78f, h * 0.35f, w * 0.85f, h * 0.55f, w, h * 0.72f)
                lineTo(w, 0f)
                close()
            }
            drawPath(
                path = waterPath,
                brush = Brush.linearGradient(
                    colors = listOf(Color(0xFF071D2E), Color(0xFF0C2A40))
                )
            )

            // 2. Urban street blocks & avenues
            val gridSteps = (8 * zoomFactor).toInt().coerceIn(5, 14)
            for (i in 1 until gridSteps) {
                val x = (w / gridSteps) * i
                val y = (h / gridSteps) * i
                drawLine(
                    color = Color(0xFF182436),
                    start = Offset(x, 0f),
                    end = Offset(x, h),
                    strokeWidth = if (i % 3 == 0) 4.5f else 2f
                )
                drawLine(
                    color = Color(0xFF182436),
                    start = Offset(0f, y),
                    end = Offset(w, y),
                    strokeWidth = if (i % 3 == 0) 4.5f else 2f
                )
            }

            // Diagonal Market / Transit arterial highway
            drawLine(
                color = Color(0xFF21314A),
                start = Offset(0f, h * 0.85f),
                end = Offset(w * 0.88f, h * 0.12f),
                strokeWidth = 9f
            )

            // Building footprints for spatial depth
            val blockPositions = listOf(
                Offset(w * 0.12f, h * 0.18f) to Size(w * 0.14f, h * 0.11f),
                Offset(w * 0.34f, h * 0.15f) to Size(w * 0.18f, h * 0.10f),
                Offset(w * 0.14f, h * 0.54f) to Size(w * 0.16f, h * 0.14f),
                Offset(w * 0.58f, h * 0.58f) to Size(w * 0.18f, h * 0.12f),
                Offset(w * 0.42f, h * 0.74f) to Size(w * 0.22f, h * 0.11f)
            )
            blockPositions.forEach { (pos, blockSize) ->
                drawRoundRect(
                    color = Color(0xFF121B2A),
                    topLeft = pos,
                    size = blockSize,
                    cornerRadius = CornerRadius(8f, 8f)
                )
            }

            // 3. Coordinates for Pickup, Waypoints, and Dropoff
            val pickupPt = Offset(w * 0.22f, h * 0.72f)
            val midPt1 = Offset(w * 0.38f, h * 0.56f)
            val midPt2 = Offset(w * 0.56f, h * 0.42f)
            val dropoffPt = Offset(w * 0.76f, h * 0.24f)
            val initialDriverPt = Offset(w * 0.12f, h * 0.86f)

            if (activeRide != null && activeRide.tripStatus != TripStatus.CANCELLED) {
                // Route Polyline (Pickup -> Dropoff)
                val routePath = Path().apply {
                    moveTo(pickupPt.x, pickupPt.y)
                    lineTo(midPt1.x, midPt1.y)
                    lineTo(midPt2.x, midPt2.y)
                    lineTo(dropoffPt.x, dropoffPt.y)
                }

                // Outer glow of route
                drawPath(
                    path = routePath,
                    color = ElectricCyan.copy(alpha = 0.24f),
                    style = Stroke(width = 18f, cap = StrokeCap.Round)
                )

                // Animated dashed route line
                drawPath(
                    path = routePath,
                    color = ElectricCyan,
                    style = Stroke(
                        width = 7f,
                        cap = StrokeCap.Round,
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(22f, 14f), dashPhase)
                    )
                )

                // Approach path from initial driver spawn to pickup when ACCEPTED
                if (activeRide.tripStatus == TripStatus.ACCEPTED || activeRide.tripStatus == TripStatus.REQUESTED) {
                    drawLine(
                        color = EmeraldOnline.copy(alpha = 0.75f),
                        start = initialDriverPt,
                        end = pickupPt,
                        strokeWidth = 5f,
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(14f, 10f), dashPhase)
                    )
                }

                // Pickup Beacon Pin (Emerald Green)
                drawCircle(
                    color = EmeraldOnline.copy(alpha = (1f - pulseRadius) * 0.45f),
                    radius = 48f * pulseRadius,
                    center = pickupPt
                )
                drawCircle(color = ObsidianBackground, radius = 15f, center = pickupPt)
                drawCircle(color = EmeraldOnline, radius = 11f, center = pickupPt)
                drawCircle(color = GlacierWhite, radius = 4.5f, center = pickupPt)

                // Dropoff Destination Beacon Pin (Neon Amber)
                drawCircle(
                    color = NeonAmber.copy(alpha = (1f - pulseRadius) * 0.45f),
                    radius = 48f * pulseRadius,
                    center = dropoffPt
                )
                drawCircle(color = ObsidianBackground, radius = 15f, center = dropoffPt)
                drawCircle(color = NeonAmber, radius = 11f, center = dropoffPt)
                drawCircle(color = ObsidianBackground, radius = 4.5f, center = dropoffPt)

                // Compute live vehicle position on canvas based on trip status & progressFraction
                val p = telemetry.progressFraction.coerceIn(0f, 1f)
                val carCanvasPos = when (activeRide.tripStatus) {
                    TripStatus.REQUESTED -> initialDriverPt
                    TripStatus.ACCEPTED -> Offset(
                        x = initialDriverPt.x + (pickupPt.x - initialDriverPt.x) * p,
                        y = initialDriverPt.y + (pickupPt.y - initialDriverPt.y) * p
                    )
                    TripStatus.ARRIVED_AT_PICKUP -> pickupPt
                    TripStatus.IN_TRANSIT -> interpolateMultiSegment(
                        points = listOf(pickupPt, midPt1, midPt2, dropoffPt),
                        fraction = p
                    )
                    TripStatus.COMPLETED -> dropoffPt
                    TripStatus.CANCELLED -> pickupPt
                }

                // Draw Animated Driver Vehicle Marker
                drawCircle(
                    color = ElectricCyan.copy(alpha = 0.28f),
                    radius = 30f,
                    center = carCanvasPos
                )
                rotate(degrees = telemetry.bearingDegrees, pivot = carCanvasPos) {
                    // Car body capsule
                    drawRoundRect(
                        color = GlacierWhite,
                        topLeft = Offset(carCanvasPos.x - 12f, carCanvasPos.y - 20f),
                        size = Size(24f, 40f),
                        cornerRadius = CornerRadius(10f, 10f)
                    )
                    // Windshield & roof
                    drawRoundRect(
                        color = ObsidianBackground,
                        topLeft = Offset(carCanvasPos.x - 9f, carCanvasPos.y - 10f),
                        size = Size(18f, 20f),
                        cornerRadius = CornerRadius(5f, 5f)
                    )
                    // Cyan roof beacon
                    drawCircle(
                        color = ElectricCyan,
                        radius = 4f,
                        center = Offset(carCanvasPos.x, carCanvasPos.y)
                    )
                }
            } else {
                // Idle Driver Radar / Demand Heat Zones when no active ride
                val centerPt = Offset(w * 0.50f, h * 0.52f)
                if (isDriverOnline) {
                    drawCircle(
                        color = ElectricCyan.copy(alpha = (1f - pulseRadius) * 0.35f),
                        radius = w * 0.36f * pulseRadius,
                        center = centerPt
                    )
                    drawCircle(
                        color = ElectricCyan.copy(alpha = 0.25f),
                        radius = w * 0.18f,
                        center = centerPt,
                        style = Stroke(width = 2f)
                    )
                }
                // Standby vehicle marker in center
                drawCircle(color = ElectricCyan.copy(alpha = 0.3f), radius = 26f, center = centerPt)
                drawCircle(color = GlacierWhite, radius = 11f, center = centerPt)
                drawCircle(color = ElectricCyan, radius = 6f, center = centerPt)
            }
        }

        // Top Telemetry HUD Overlay
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Surface(
                color = ObsidianBackground.copy(alpha = 0.86f),
                shape = RoundedCornerShape(14.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Speed,
                        contentDescription = "Live vehicle speed",
                        tint = ElectricCyan,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Column {
                        Text(
                            text = "${telemetry.speedKmh} km/h • ${
                                String.format(
                                    Locale.US,
                                    "%.4f, %.4f",
                                    telemetry.driverLat,
                                    telemetry.driverLng
                                )
                            }",
                            style = MaterialTheme.typography.labelMedium,
                            color = GlacierWhite
                        )
                        Text(
                            text = telemetry.statusMessage,
                            style = MaterialTheme.typography.bodyMedium,
                            color = if (activeRide != null) ElectricCyan else SteelGray,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            // Zoom / Recenter control button
            Surface(
                color = SlateSurface.copy(alpha = 0.90f),
                shape = CircleShape
            ) {
                IconButton(
                    onClick = {
                        zoomFactor = if (zoomFactor >= 1.4f) 0.85f else zoomFactor + 0.25f
                    },
                    modifier = Modifier
                        .size(48.dp)
                        .testTag("map_zoom_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.MyLocation,
                        contentDescription = "Adjust map zoom",
                        tint = ElectricCyan
                    )
                }
            }
        }

        // Bottom Pin Legend / Route ETA Bar
        if (activeRide != null) {
            Surface(
                color = SlateCard.copy(alpha = 0.94f),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Navigation,
                            contentDescription = null,
                            tint = EmeraldOnline,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "${activeRide.pickupName} → ${activeRide.dropoffName}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = GlacierWhite,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1
                            )
                            Text(
                                text = "${
                                    String.format(
                                        Locale.US,
                                        "%.1f",
                                        telemetry.remainingKm
                                    )
                                } km remaining • ETA ${telemetry.remainingMinutes} min",
                                style = MaterialTheme.typography.labelMedium,
                                color = NeonAmber
                            )
                        }
                    }
                }
            }
        }
    }
}

private fun interpolateMultiSegment(points: List<Offset>, fraction: Float): Offset {
    if (points.size < 2) return points.firstOrNull() ?: Offset.Zero
    val totalSegments = points.size - 1
    val scaled = (fraction * totalSegments).coerceIn(0f, totalSegments.toFloat())
    val segIndex = scaled.toInt().coerceAtMost(totalSegments - 1)
    val localT = scaled - segIndex
    val start = points[segIndex]
    val end = points[segIndex + 1]
    return Offset(
        x = start.x + (end.x - start.x) * localT,
        y = start.y + (end.y - start.y) * localT
    )
}
