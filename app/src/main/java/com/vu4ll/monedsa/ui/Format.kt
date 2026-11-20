package com.vu4ll.monedsa.ui

import androidx.compose.ui.graphics.Color
import java.math.BigDecimal
import java.math.RoundingMode
import java.text.NumberFormat
import java.time.Instant
import java.time.LocalDate
import java.time.YearMonth
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

    /** "+€ 12,50" / "−€ 12,50" with a real minus sign; the locale's own minus placement is avoided. */
    fun signed(minor: Long, currency: String, positive: Boolean, locale: Locale = Locale.getDefault()): String =
        (if (positive) "+" else "\u2212") + money(kotlin.math.abs(minor), currency, locale)

    /** Balance: minus sign only when negative. */
    fun balance(minor: Long, currency: String, locale: Locale = Locale.getDefault()): String =
        if (minor < 0) "\u2212" + money(-minor, currency, locale) else money(minor, currency, locale)

    fun month(m: YearMonth, locale: Locale = Locale.getDefault()): String {
        val pattern = if (m.year == YearMonth.now().year) "LLLL" else "LLLL yyyy"
        return DateTimeFormatter.ofPattern(pattern, locale).format(m)
            .replaceFirstChar { it.titlecase(locale) }
    }

    /** "Saturday 15 November", year added when it isn't the current one. */
    fun day(d: LocalDate, locale: Locale = Locale.getDefault()): String {
        val pattern = if (d.year == LocalDate.now().year) "EEEE d MMMM" else "EEEE d MMMM yyyy"
        return DateTimeFormatter.ofPattern(pattern, locale).format(d).replaceFirstChar { it.titlecase(locale) }
    }

    fun localDate(epochMillis: Long): LocalDate =
        Instant.ofEpochMilli(epochMillis).atZone(ZoneId.systemDefault()).toLocalDate()

    fun monthBounds(m: YearMonth): Pair<Long, Long> {
        val zone = ZoneId.systemDefault()
        return m.atDay(1).atStartOfDay(zone).toInstant().toEpochMilli() to
            m.plusMonths(1).atDay(1).atStartOfDay(zone).toInstant().toEpochMilli()
    }

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
