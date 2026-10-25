package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val RideFlowColorScheme = darkColorScheme(
    primary = ElectricCyan,
    onPrimary = Color(0xFF001F29),
    primaryContainer = ElectricCyanDim,
    onPrimaryContainer = GlacierWhite,
    secondary = NeonAmber,
    onSecondary = Color(0xFF261900),
    secondaryContainer = NeonAmberDim,
    onSecondaryContainer = NeonAmber,
    tertiary = EmeraldOnline,
    onTertiary = Color(0xFF002914),
    tertiaryContainer = EmeraldDim,
    onTertiaryContainer = EmeraldOnline,
    background = ObsidianBackground,
    onBackground = GlacierWhite,
    surface = SlateSurface,
    onSurface = GlacierWhite,
    surfaceVariant = SlateCard,
    onSurfaceVariant = SteelGray,
    outline = SubtleBorder,
    error = CoralAlert,
    onError = Color.White
)

@Composable
fun MyApplicationTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = RideFlowColorScheme,
        typography = Typography,
        content = content
    )
}
