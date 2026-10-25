package com.example.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Radar
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.VehicleCategory
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.EmeraldOnline
import com.example.ui.theme.GlacierWhite
import com.example.ui.theme.NeonAmber
import com.example.ui.theme.ObsidianBackground
import com.example.ui.theme.SlateCard
import com.example.ui.theme.SteelGray

@Composable
fun HeroMobilityBanner(
    activeFleetCount: Int,
    isSupabaseConnected: Boolean,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "hero_pulse")
    val trailOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 3200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "trail_offset"
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(158.dp)
            .clip(RoundedCornerShape(22.dp))
            .background(
                Brush.linearGradient(
                    colors = listOf(
                        Color(0xFF0B1528),
                        Color(0xFF0F2537),
                        Color(0xFF171E2E)
                    )
                )
            )
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height

            // Perspective horizon grid lines
            val horizonY = h * 0.45f
            for (i in 0..8) {
                val xTop = w * (0.1f + i * 0.1f)
                val xBottom = w * (-0.3f + i * 0.2f)
                drawLine(
                    color = ElectricCyan.copy(alpha = 0.08f),
                    start = Offset(xTop, horizonY),
                    end = Offset(xBottom, h),
                    strokeWidth = 1.5f
                )
            }

            // Glowing animated road light stream
            val streamX = w * (0.25f + 0.65f * trailOffset)
            drawLine(
                brush = Brush.horizontalGradient(
                    colors = listOf(Color.Transparent, ElectricCyan.copy(alpha = 0.6f), NeonAmber.copy(alpha = 0.8f))
                ),
                start = Offset(streamX - 180f, h * 0.82f),
                end = Offset(streamX, h * 0.82f),
                strokeWidth = 5f,
                cap = StrokeCap.Round
            )

            // Decorative radar rings on right side
            val radarCenter = Offset(w * 0.82f, h * 0.48f)
            drawCircle(
                color = ElectricCyan.copy(alpha = 0.14f),
                radius = h * 0.42f,
                center = radarCenter,
                style = Stroke(width = 2f)
            )
            drawCircle(
                color = NeonAmber.copy(alpha = 0.20f),
                radius = h * 0.26f,
                center = radarCenter,
                style = Stroke(width = 2f)
            )

            // Stylized futuristic car silhouette on right
            val carBaseX = w * 0.63f
            val carBaseY = h * 0.68f
            val carW = w * 0.31f
            val carH = h * 0.24f

            val bodyPath = Path().apply {
                moveTo(carBaseX, carBaseY)
                lineTo(carBaseX + carW * 0.14f, carBaseY - carH * 0.55f)
                lineTo(carBaseX + carW * 0.38f, carBaseY - carH * 0.95f)
                lineTo(carBaseX + carW * 0.72f, carBaseY - carH * 0.92f)
                lineTo(carBaseX + carW * 0.94f, carBaseY - carH * 0.40f)
                lineTo(carBaseX + carW, carBaseY)
                close()
            }
            drawPath(
                path = bodyPath,
                brush = Brush.horizontalGradient(
                    colors = listOf(ElectricCyan.copy(alpha = 0.35f), Color(0xFF007799).copy(alpha = 0.65f))
                )
            )
            drawPath(
                path = bodyPath,
                color = ElectricCyan,
                style = Stroke(width = 3f)
            )

            // Wheels
            drawCircle(
                color = ObsidianBackground,
                radius = carH * 0.32f,
                center = Offset(carBaseX + carW * 0.22f, carBaseY)
            )
            drawCircle(
                color = NeonAmber,
                radius = carH * 0.22f,
                center = Offset(carBaseX + carW * 0.22f, carBaseY),
                style = Stroke(width = 3f)
            )
            drawCircle(
                color = ObsidianBackground,
                radius = carH * 0.32f,
                center = Offset(carBaseX + carW * 0.78f, carBaseY)
            )
            drawCircle(
                color = NeonAmber,
                radius = carH * 0.22f,
                center = Offset(carBaseX + carW * 0.78f, carBaseY),
                style = Stroke(width = 3f)
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(18.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    color = ElectricCyan.copy(alpha = 0.16f),
                    shape = RoundedCornerShape(50)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Radar,
                            contentDescription = null,
                            tint = ElectricCyan,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(5.dp))
                        Text(
                            text = "$activeFleetCount ACTIVE VEHICLES NEARBY",
                            style = MaterialTheme.typography.labelMedium,
                            color = ElectricCyan
                        )
                    }
                }
                Spacer(modifier = Modifier.width(8.dp))
                Surface(
                    color = if (isSupabaseConnected) EmeraldOnline.copy(alpha = 0.18f) else NeonAmber.copy(alpha = 0.16f),
                    shape = RoundedCornerShape(50)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Bolt,
                            contentDescription = null,
                            tint = if (isSupabaseConnected) EmeraldOnline else NeonAmber,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = if (isSupabaseConnected) "SUPABASE LIVE" else "INSTANT DISPATCH",
                            style = MaterialTheme.typography.labelMedium,
                            color = if (isSupabaseConnected) EmeraldOnline else NeonAmber
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Text(
                text = "On-Demand Fleet & Live Cab Dispatch",
                style = MaterialTheme.typography.headlineMedium,
                color = GlacierWhite,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Filter vehicles, book your destination, or switch to Driver Mode to accept live rides.",
                style = MaterialTheme.typography.bodyMedium,
                color = SteelGray,
                modifier = Modifier.fillMaxWidth(0.75f)
            )
        }
    }
}

@Composable
fun VehicleIllustrationCanvas(
    category: String,
    accentHex: Long,
    modifier: Modifier = Modifier
) {
    val accentColor = Color(accentHex)
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                         Color(0xFF111927),
                        SlateCard
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize().padding(10.dp)) {
            val w = size.width
            val h = size.height
            val groundY = h * 0.78f

            // Subtle underglow
            drawRoundRect(
                brush = Brush.horizontalGradient(
                    colors = listOf(Color.Transparent, accentColor.copy(alpha = 0.45f), Color.Transparent)
                ),
                topLeft = Offset(w * 0.12f, groundY + 2f),
                size = Size(w * 0.76f, 6f),
                cornerRadius = CornerRadius(4f, 4f)
            )

            val isSuv = category == VehicleCategory.SUV.name
            val isLuxury = category == VehicleCategory.LUXURY.name
            val roofHeightFactor = when {
                isSuv -> 0.56f
                isLuxury -> 0.48f
                else -> 0.44f
            }

            val carLeft = w * 0.10f
            val carRight = w * 0.90f
            val carWidth = carRight - carLeft
            val roofTopY = groundY - h * roofHeightFactor
            val beltlineY = groundY - h * (if (isSuv) 0.30f else 0.24f)

            val bodyPath = Path().apply {
                moveTo(carLeft, groundY - 4f)
                lineTo(carLeft + carWidth * 0.04f, beltlineY)
                lineTo(carLeft + carWidth * 0.24f, beltlineY - 2f)
                lineTo(carLeft + carWidth * 0.38f, roofTopY)
                lineTo(carLeft + carWidth * (if (isSuv) 0.84f else 0.74f), roofTopY)
                lineTo(carLeft + carWidth * 0.94f, beltlineY)
                lineTo(carRight, groundY - 4f)
                close()
            }

            drawPath(
                path = bodyPath,
                brush = Brush.linearGradient(
                    colors = listOf(
                        accentColor.copy(alpha = 0.38f),
                        Color(0xFF28374E),
                        accentColor.copy(alpha = 0.22f)
                    )
                )
            )
            drawPath(
                path = bodyPath,
                color = accentColor.copy(alpha = 0.85f),
                style = Stroke(width = 2.6f)
            )

            // Cabin window glass
            val windowPath = Path().apply {
                moveTo(carLeft + carWidth * 0.28f, beltlineY - 2f)
                lineTo(carLeft + carWidth * 0.40f, roofTopY + 5f)
                lineTo(carLeft + carWidth * (if (isSuv) 0.80f else 0.70f), roofTopY + 5f)
                lineTo(carLeft + carWidth * 0.86f, beltlineY - 2f)
                close()
            }
            drawPath(
                path = windowPath,
                color = Color(0xFF0A111D).copy(alpha = 0.85f)
            )

            // LED Headlight beam
            drawLine(
                color = GlacierWhite,
                start = Offset(carLeft + 2f, beltlineY + 5f),
                end = Offset(carLeft + carWidth * 0.10f, beltlineY + 5f),
                strokeWidth = 4f,
                cap = StrokeCap.Round
            )

            // Taillight
            drawLine(
                color = Color(0xFFFF5252),
                start = Offset(carRight - carWidth * 0.06f, beltlineY + 4f),
                end = Offset(carRight - 1f, beltlineY + 4f),
                strokeWidth = 4f,
                cap = StrokeCap.Round
            )

            // Front and Rear Wheels
            val wheelRadius = h * (if (isSuv) 0.16f else 0.14f)
            val frontWheelCenter = Offset(carLeft + carWidth * 0.22f, groundY - 2f)
            val rearWheelCenter = Offset(carLeft + carWidth * 0.78f, groundY - 2f)

            listOf(frontWheelCenter, rearWheelCenter).forEach { center ->
                drawCircle(color = ObsidianBackground, radius = wheelRadius, center = center)
                drawCircle(
                    color = accentColor,
                    radius = wheelRadius * 0.72f,
                    center = center,
                    style = Stroke(width = 2.5f)
                )
                drawCircle(color = GlacierWhite, radius = wheelRadius * 0.25f, center = center)
            }
        }
    }
}
