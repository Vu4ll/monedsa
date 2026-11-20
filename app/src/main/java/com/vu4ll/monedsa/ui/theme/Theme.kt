package com.vu4ll.monedsa.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

// Palette ported from the RN app's src/constants/colors.js
private val Light = lightColorScheme(
    primary = Color(0xFF6200EE),
    onPrimary = Color.White,
    secondary = Color(0xFF388E3C),
    background = Color.White,
    onBackground = Color.Black,
    surface = Color.White,
    onSurface = Color.Black,
    surfaceContainer = Color(0xFFF5F5F5),
    surfaceContainerHigh = Color(0xFFF0F0F0),
    surfaceContainerLow = Color(0xFFF9F9F9),
    onSurfaceVariant = Color(0xFF666666),
    outline = Color(0xFFE0E0E0),
    outlineVariant = Color(0xFFE0E0E0),
    error = Color(0xFFD32F2F),
)

private val Dark = darkColorScheme(
    primary = Color(0xFFBB86FC),
    onPrimary = Color.Black,
    secondary = Color(0xFF81C784),
    background = Color(0xFF121212),
    onBackground = Color.White,
    surface = Color(0xFF121212),
    onSurface = Color.White,
    surfaceContainer = Color(0xFF1E1E1E),
    surfaceContainerHigh = Color(0xFF2A2A2A),
    surfaceContainerLow = Color(0xFF1F1F1F),
    onSurfaceVariant = Color(0xFF888888),
    outline = Color(0xFF444444),
    outlineVariant = Color(0xFF333333),
    error = Color(0xFFF44336),
)

@Immutable
data class MoneyColors(val income: Color, val expense: Color)

val LocalMoneyColors = staticCompositionLocalOf { MoneyColors(Color(0xFF2E7D32), Color(0xFFD32F2F)) }

@Composable
fun MonedsaTheme(dark: Boolean, content: @Composable () -> Unit) {
    val money = if (dark) MoneyColors(Color(0xFF66BB6A), Color(0xFFEF5350))
    else MoneyColors(Color(0xFF2E7D32), Color(0xFFD32F2F))
    CompositionLocalProvider(LocalMoneyColors provides money) {
        MaterialTheme(colorScheme = if (dark) Dark else Light, content = content)
    }
}
