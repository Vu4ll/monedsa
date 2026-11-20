package com.vu4ll.monedsa.ui

import androidx.compose.ui.graphics.Color
import java.math.BigDecimal
import java.math.RoundingMode
import java.text.NumberFormat
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Currency
import java.util.Locale

object Format {
    fun money(minor: Long, currency: String, locale: Locale = Locale.getDefault()): String =
        NumberFormat.getCurrencyInstance(locale).apply {
            this.currency = Currency.getInstance(currency)
        }.format(BigDecimal.valueOf(minor, 2))

    fun date(epochMillis: Long, locale: Locale = Locale.getDefault()): String =
        DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM).withLocale(locale)
            .format(Instant.ofEpochMilli(epochMillis).atZone(ZoneId.systemDefault()))

    /** Plain number for an input field, e.g. 1250 -> "12.50" (no grouping). */
    fun amountInput(minor: Long): String = BigDecimal.valueOf(minor, 2).toPlainString()

    /** Accepts "12", "12.5", "12,50". Returns null for invalid or > 2 decimals rounding. */
    fun parseAmount(text: String): Long? {
        val t = text.trim().replace(" ", "").replace(',', '.')
        if (t.isEmpty() || t.count { it == '.' } > 1) return null
        return runCatching {
            BigDecimal(t).setScale(2, RoundingMode.HALF_UP).unscaledValue().longValueExact()
        }.getOrNull()
    }

    fun color(hex: String): Color = runCatching {
        Color(android.graphics.Color.parseColor(hex))
    }.getOrDefault(Color.Gray)
}
