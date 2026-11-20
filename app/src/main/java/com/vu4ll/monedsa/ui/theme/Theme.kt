package com.vu4ll.monedsa.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vu4ll.monedsa.R

/*
 * Palette: coin metals and banknote ink. Brass is the one brand colour; money
 * colours carry meaning only (income, a negative balance). Everyday expenses
 * stay in the normal text colour on purpose.
 */
private object Light {
    val nickel = Color(0xFFEEF0EE)
    val raised = Color(0xFFF7F8F7)
    val sunk = Color(0xFFE2E6E3)
    val text = Color(0xFF1B2220)
    val muted = Color(0xFF59625F)
    val line = Color(0xFFCCD2CE)
    val brass = Color(0xFF7D6230)
    val brassSoft = Color(0xFFE6DCC4)
    val onBrassSoft = Color(0xFF3A2E12)
}

private object Dark {
    val ink = Color(0xFF1E2A28)
    val raised = Color(0xFF26332F)
    val sunk = Color(0xFF31403C)
    val text = Color(0xFFE8ECEA)
    val muted = Color(0xFFA3ADA9)
    val line = Color(0xFF3C4A46)
    val brass = Color(0xFFCDAA62)
    val brassSoft = Color(0xFF4A3F25)
    val onBrassSoft = Color(0xFFF0E2BF)
}

private val LightScheme = lightColorScheme(
    primary = Light.brass,
    onPrimary = Color.White,
    primaryContainer = Light.brassSoft,
    onPrimaryContainer = Light.onBrassSoft,
    secondary = Light.brass,
    onSecondary = Color.White,
    secondaryContainer = Light.brassSoft,
    onSecondaryContainer = Light.onBrassSoft,
    background = Light.nickel,
    onBackground = Light.text,
    surface = Light.nickel,
    onSurface = Light.text,
    surfaceVariant = Light.sunk,
    onSurfaceVariant = Light.muted,
    surfaceContainerLowest = Color.White,
    surfaceContainerLow = Light.raised,
    surfaceContainer = Light.raised,
    surfaceContainerHigh = Color(0xFFF2F4F2),
    surfaceContainerHighest = Light.sunk,
    surfaceTint = Color.Transparent,
    outline = Light.line,
    outlineVariant = Light.line,
    error = Color(0xFFB3261E),
)

private val DarkScheme = darkColorScheme(
    primary = Dark.brass,
    onPrimary = Dark.ink,
    primaryContainer = Dark.brassSoft,
    onPrimaryContainer = Dark.onBrassSoft,
    secondary = Dark.brass,
    onSecondary = Dark.ink,
    secondaryContainer = Dark.brassSoft,
    onSecondaryContainer = Dark.onBrassSoft,
    background = Dark.ink,
    onBackground = Dark.text,
    surface = Dark.ink,
    onSurface = Dark.text,
    surfaceVariant = Dark.sunk,
    onSurfaceVariant = Dark.muted,
    surfaceContainerLowest = Color(0xFF18221F),
    surfaceContainerLow = Dark.raised,
    surfaceContainer = Dark.raised,
    surfaceContainerHigh = Color(0xFF2A3833),
    surfaceContainerHighest = Dark.sunk,
    surfaceTint = Color.Transparent,
    outline = Dark.line,
    outlineVariant = Dark.line,
    error = Color(0xFFF2B8B5),
)

@Immutable
data class MoneyColors(val income: Color, val negative: Color)

val LocalMoneyColors = staticCompositionLocalOf { MoneyColors(Color(0xFF2F7A4C), Color(0xFFB8443A)) }

/** Bricolage Grotesque, cut at its display optical size: only for amounts and screen titles. */
val Display = FontFamily(
    Font(R.font.bricolage_semibold, FontWeight.SemiBold),
    Font(R.font.bricolage_bold, FontWeight.Bold),
)

/** Tabular figures so amounts line up in lists. */
val Tabular = TextStyle(fontFeatureSettings = "tnum")

private val base = Typography()
private val MonedsaType = base.copy(
    displayLarge = base.displayLarge.copy(fontFamily = Display, fontWeight = FontWeight.Bold, fontSize = 48.sp, lineHeight = 52.sp, letterSpacing = (-1).sp),
    displayMedium = base.displayMedium.copy(fontFamily = Display, fontWeight = FontWeight.Bold, fontSize = 40.sp, lineHeight = 44.sp, letterSpacing = (-0.5).sp),
    headlineMedium = base.headlineMedium.copy(fontFamily = Display, fontWeight = FontWeight.SemiBold, fontSize = 26.sp, lineHeight = 32.sp),
    headlineSmall = base.headlineSmall.copy(fontFamily = Display, fontWeight = FontWeight.SemiBold, fontSize = 22.sp, lineHeight = 28.sp),
    titleLarge = base.titleLarge.copy(fontFamily = Display, fontWeight = FontWeight.SemiBold, fontSize = 22.sp),
)

private val MonedsaShapes = Shapes(
    extraSmall = RoundedCornerShape(6.dp),
    small = RoundedCornerShape(10.dp),
    medium = RoundedCornerShape(14.dp),
    large = RoundedCornerShape(20.dp),
    extraLarge = RoundedCornerShape(28.dp),
)

@Composable
fun MonedsaTheme(dark: Boolean, content: @Composable () -> Unit) {
    val money = if (dark) MoneyColors(income = Color(0xFF7CC497), negative = Color(0xFFE88A80))
    else MoneyColors(income = Color(0xFF2F7A4C), negative = Color(0xFFB8443A))
    CompositionLocalProvider(LocalMoneyColors provides money) {
        MaterialTheme(
            colorScheme = if (dark) DarkScheme else LightScheme,
            typography = MonedsaType,
            shapes = MonedsaShapes,
            content = content,
        )
    }
}
