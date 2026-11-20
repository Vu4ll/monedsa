package com.vu4ll.monedsa.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Category
import androidx.compose.material.icons.outlined.Payments
import androidx.compose.material.icons.outlined.FilterAltOff
import androidx.compose.material3.IconButton
import androidx.compose.material.icons.outlined.SwapVert
import androidx.compose.ui.Alignment
import androidx.compose.ui.draw.clip
import com.vu4ll.monedsa.ui.components.Segment
import com.vu4ll.monedsa.ui.components.SegmentedPills
import com.vu4ll.monedsa.ui.theme.LocalMoneyColors
import com.vu4ll.monedsa.ui.components.AppSheet
import com.vu4ll.monedsa.ui.components.OptionRow
import com.vu4ll.monedsa.ui.components.SheetActions
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.Button
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DateRangePicker
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import com.vu4ll.monedsa.ui.components.OptionIcon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDateRangePickerState
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.vu4ll.monedsa.R
import com.vu4ll.monedsa.data.CategoryEntity
import com.vu4ll.monedsa.data.SortBy
import com.vu4ll.monedsa.data.TxFilter
import com.vu4ll.monedsa.data.TxType
import java.time.Instant
import java.time.ZoneId
import java.time.ZoneOffset

@Composable
fun SortSheet(current: TxFilter, onDismiss: () -> Unit, onApply: (TxFilter) -> Unit) {
    // Grouped by what is sorted on; the arrow says which end comes first.
    val groups = listOf(
        Triple(SortBy.DATE, Icons.Outlined.CalendarMonth, R.string.date_range) to listOf(
            false to R.string.sort_date_desc, true to R.string.sort_date_asc,
        ),
        Triple(SortBy.AMOUNT, Icons.Outlined.Payments, R.string.amount) to listOf(
            false to R.string.sort_amount_desc, true to R.string.sort_amount_asc,
        ),
    )
    AppSheet(stringResource(R.string.sort_title), onDismiss) { close ->
        groups.forEach { (head, options) ->
            val (by, icon, label) = head
            Row(Modifier.padding(top = 8.dp, bottom = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                Spacer(Modifier.width(10.dp))
                Text(stringResource(label), style = MaterialTheme.typography.titleSmall)
            }
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                options.forEach { (asc, title) ->
                    val selected = current.sortBy == by && current.ascending == asc
                    OptionRow(
                        title = stringResource(title),
                        selected = selected,
                        leading = { ArrowBadge(up = asc, selected = selected) },
                        onClick = { onApply(current.copy(sortBy = by, ascending = asc)); close() },
                    )
                }
            }
            Spacer(Modifier.height(12.dp))
        }
    }
}

@Composable
private fun ArrowBadge(up: Boolean, selected: Boolean) =
    OptionIcon(if (up) Icons.Default.ArrowUpward else Icons.Default.ArrowDownward, selected)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FilterSheet(
    current: TxFilter,
    categories: List<CategoryEntity>,
    usage: Map<Long, Int>,
    currency: String,
    onDismiss: () -> Unit,
    onApply: (TxFilter) -> Unit,
) {
    var type by remember { mutableStateOf(current.type) }
    var categoryId by remember { mutableStateOf(current.categoryId) }
    var min by remember { mutableStateOf(current.minAmountMinor?.let { Format.amountInput(it) } ?: "") }
    var max by remember { mutableStateOf(current.maxAmountMinor?.let { Format.amountInput(it) } ?: "") }
    var from by remember { mutableStateOf(current.from) }
    var until by remember { mutableStateOf(current.until) }
    var pickDates by remember { mutableStateOf(false) }
    var pickCategory by remember { mutableStateOf(false) }
    val money = LocalMoneyColors.current
    val scheme = MaterialTheme.colorScheme
    val symbol = remember(currency) { java.util.Currency.getInstance(currency).getSymbol(java.util.Locale.getDefault()) }
    val chosen = categories.firstOrNull { it.id == categoryId }

    val anySet = type != null || categoryId != null || min.isNotBlank() || max.isNotBlank() || from != null || until != null
    AppSheet(
        title = stringResource(R.string.filter_title),
        onDismiss = onDismiss,
        titleAction = { close ->
            // Clears every filter at once and shows the full list again.
            IconButton(
                enabled = anySet || current.isActive,
                onClick = { onApply(TxFilter(sortBy = current.sortBy, ascending = current.ascending)); close() },
            ) { Icon(Icons.Outlined.FilterAltOff, stringResource(R.string.clear_filters), tint = if (anySet || current.isActive) scheme.error else scheme.outline) }
        },
    ) { close ->
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterLabel(Icons.Outlined.SwapVert, R.string.type)
            SegmentedPills(
                segments = listOf(
                    Segment(stringResource(R.string.all), selectedBg = scheme.primaryContainer, selectedFg = scheme.onPrimaryContainer),
                    // No icons here: three segments need the room for long words ("Inkomsten").
                    Segment(stringResource(R.string.expense), selectedBg = money.expenseContainer, selectedFg = money.onExpenseContainer),
                    Segment(stringResource(R.string.income), selectedBg = money.incomeContainer, selectedFg = money.onIncomeContainer),
                ),
                selected = when (type) { null -> 0; TxType.EXPENSE -> 1; TxType.INCOME -> 2 },
                onSelect = { i ->
                    val t = when (i) { 1 -> TxType.EXPENSE; 2 -> TxType.INCOME; else -> null }
                    if (t != type) {
                        type = t
                        // A category of the other type would match nothing.
                        if (t != null && chosen != null && chosen.type != t) categoryId = null
                    }
                },
            )

            FilterLabel(Icons.Outlined.Category, R.string.category)
            SelectField(
                text = chosen?.name,
                placeholder = stringResource(R.string.all_categories),
                onClick = { pickCategory = true },
                leading = chosen?.let { { CategoryBadge(it.icon, Format.color(it.colorHex), 32.dp) } },
                onClear = { categoryId = null },
            )

            FilterLabel(Icons.Outlined.Payments, R.string.amount)
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    min, { min = it }, Modifier.weight(1f),
                    label = { Text(stringResource(R.string.min)) }, prefix = { Text("$symbol ") },
                    singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                )
                OutlinedTextField(
                    max, { max = it }, Modifier.weight(1f),
                    label = { Text(stringResource(R.string.max)) }, prefix = { Text("$symbol ") },
                    singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                )
            }

            FilterLabel(Icons.Outlined.CalendarMonth, R.string.date_range)
            SelectField(
                text = if (from == null && until == null) null
                else "${from?.let { Format.shortDate(it) } ?: "…"} – ${until?.let { Format.shortDate(it - 1) } ?: "…"}",
                placeholder = stringResource(R.string.any_date),
                onClick = { pickDates = true },
                onClear = { from = null; until = null },
            )

            SheetActions(
                primary = stringResource(R.string.apply),
                onPrimary = {
                    onApply(
                        current.copy(
                            type = type, categoryId = categoryId,
                            minAmountMinor = Format.parseAmount(min), maxAmountMinor = Format.parseAmount(max),
                            from = from, until = until,
                        ),
                    )
                    close()
                },
            )
        }
    }

    if (pickCategory) {
        CategoryPickerSheet(
            categories = categories.filter { type == null || it.type == type },
            usage = usage,
            selectedId = categoryId,
            onDismiss = { pickCategory = false },
            allLabel = stringResource(R.string.all_categories),
            onPickAll = { categoryId = null },
        ) { categoryId = it.id }
    }

    if (pickDates) {
        // The picker works in UTC midnights; convert to local day bounds.
        val state = rememberDateRangePickerState(
            initialSelectedStartDateMillis = from?.let(::localToUtcDay),
            initialSelectedEndDateMillis = until?.let { localToUtcDay(it - 1) },
        )
        DatePickerDialog(
            onDismissRequest = { pickDates = false },
            confirmButton = {
                TextButton(onClick = {
                    from = state.selectedStartDateMillis?.let { utcDayToLocalStart(it) }
                    until = (state.selectedEndDateMillis ?: state.selectedStartDateMillis)
                        ?.let { utcDayToLocalStart(it, plusDays = 1) }
                    pickDates = false
                }) { Text(stringResource(R.string.ok)) }
            },
            dismissButton = {
                TextButton(onClick = { from = null; until = null; pickDates = false }) { Text(stringResource(R.string.clear)) }
            },
        ) {
            DateRangePicker(state, Modifier.weight(1f))
        }
    }
}

internal fun utcDayToLocalStart(utcMillis: Long, plusDays: Long = 0): Long =
    Instant.ofEpochMilli(utcMillis).atZone(ZoneOffset.UTC).toLocalDate().plusDays(plusDays)
        .atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()

internal fun localToUtcDay(localMillis: Long): Long =
    Instant.ofEpochMilli(localMillis).atZone(ZoneId.systemDefault()).toLocalDate()
        .atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli()


@Composable
private fun FilterLabel(icon: androidx.compose.ui.graphics.vector.ImageVector, label: Int) {
    Row(Modifier.padding(top = 12.dp, bottom = 2.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
        Spacer(Modifier.width(10.dp))
        Text(stringResource(label), style = MaterialTheme.typography.titleSmall)
    }
}
