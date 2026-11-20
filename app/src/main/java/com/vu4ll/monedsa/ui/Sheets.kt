package com.vu4ll.monedsa.ui

import androidx.compose.foundation.clickable
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SortSheet(current: TxFilter, onDismiss: () -> Unit, onApply: (TxFilter) -> Unit) {
    val options = listOf(
        Triple(SortBy.DATE, false, R.string.sort_date_desc),
        Triple(SortBy.DATE, true, R.string.sort_date_asc),
        Triple(SortBy.AMOUNT, false, R.string.sort_amount_desc),
        Triple(SortBy.AMOUNT, true, R.string.sort_amount_asc),
    )
    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(Modifier.navigationBarsPadding().padding(bottom = 16.dp)) {
            Text(stringResource(R.string.sort_title), style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp))
            options.forEach { (by, asc, label) ->
                val selected = current.sortBy == by && current.ascending == asc
                ListItem(
                    headlineContent = { Text(stringResource(label)) },
                    leadingContent = { RadioButton(selected = selected, onClick = null) },
                    modifier = Modifier.clickable {
                        onApply(current.copy(sortBy = by, ascending = asc)); onDismiss()
                    },
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun FilterSheet(
    current: TxFilter,
    categories: List<CategoryEntity>,
    currency: String,
    onDismiss: () -> Unit,
    onApply: (TxFilter) -> Unit,
) {
    var type by remember { mutableStateOf(current.type) }
    var categoryId by remember { mutableStateOf(current.categoryId) }
    var min by remember { mutableStateOf(current.minAmountMinor?.let(Format::amountInput) ?: "") }
    var max by remember { mutableStateOf(current.maxAmountMinor?.let(Format::amountInput) ?: "") }
    var from by remember { mutableStateOf(current.from) }
    var until by remember { mutableStateOf(current.until) }
    var pickDates by remember { mutableStateOf(false) }

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)) {
        Column(
            Modifier.navigationBarsPadding().verticalScroll(rememberScrollState()).padding(horizontal = 24.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(stringResource(R.string.filter_title), style = MaterialTheme.typography.titleLarge)

            Text(stringResource(R.string.type), style = MaterialTheme.typography.labelLarge)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(type == null, { type = null; categoryId = null }, { Text(stringResource(R.string.all)) })
                FilterChip(type == TxType.EXPENSE, { type = TxType.EXPENSE; categoryId = null }, { Text(stringResource(R.string.expense)) })
                FilterChip(type == TxType.INCOME, { type = TxType.INCOME; categoryId = null }, { Text(stringResource(R.string.income)) })
            }

            Text(stringResource(R.string.category), style = MaterialTheme.typography.labelLarge)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(categoryId == null, { categoryId = null }, { Text(stringResource(R.string.all)) })
                categories.filter { type == null || it.type == type }.forEach { c ->
                    FilterChip(categoryId == c.id, { categoryId = c.id }, { Text(c.name) })
                }
            }

            Text(stringResource(R.string.amount_range, currency), style = MaterialTheme.typography.labelLarge)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(min, { min = it }, Modifier.weight(1f), label = { Text(stringResource(R.string.min)) },
                    singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
                OutlinedTextField(max, { max = it }, Modifier.weight(1f), label = { Text(stringResource(R.string.max)) },
                    singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
            }

            Text(stringResource(R.string.date_range), style = MaterialTheme.typography.labelLarge)
            OutlinedButton(onClick = { pickDates = true }, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Default.DateRange, null)
                Text(
                    if (from == null && until == null) stringResource(R.string.any_date)
                    else "${from?.let(Format::date) ?: "…"} – ${until?.let { Format.date(it - 1) } ?: "…"}",
                    Modifier.padding(start = 8.dp),
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(bottom = 16.dp)) {
                OutlinedButton(
                    onClick = { onApply(TxFilter(sortBy = current.sortBy, ascending = current.ascending)); onDismiss() },
                    modifier = Modifier.weight(1f),
                ) { Text(stringResource(R.string.clear)) }
                Button(
                    onClick = {
                        onApply(
                            current.copy(
                                type = type, categoryId = categoryId,
                                minAmountMinor = Format.parseAmount(min), maxAmountMinor = Format.parseAmount(max),
                                from = from, until = until,
                            ),
                        )
                        onDismiss()
                    },
                    modifier = Modifier.weight(1f),
                ) { Text(stringResource(R.string.apply)) }
            }
        }
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

