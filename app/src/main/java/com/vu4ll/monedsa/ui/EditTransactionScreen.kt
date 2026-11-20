package com.vu4ll.monedsa.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.filled.Search
import androidx.compose.ui.draw.clip
import com.vu4ll.monedsa.data.CategoryEntity
import com.vu4ll.monedsa.ui.components.AppSheet
import com.vu4ll.monedsa.ui.components.ConfirmDialog
import com.vu4ll.monedsa.ui.components.OptionRow
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.AssistChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.ui.Alignment
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.SolidColor
import com.vu4ll.monedsa.ui.theme.LocalMoneyColors
import com.vu4ll.monedsa.ui.theme.Tabular
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DatePickerDefaults
import com.vu4ll.monedsa.ui.components.Segment
import com.vu4ll.monedsa.ui.components.SegmentedPills
import com.vu4ll.monedsa.ui.components.TypeToggle
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.vu4ll.monedsa.AppContainer
import com.vu4ll.monedsa.R
import com.vu4ll.monedsa.data.TransactionEntity
import com.vu4ll.monedsa.data.TxType
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZoneOffset

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun EditTransactionScreen(container: AppContainer, id: Long, currency: String, onDone: () -> Unit) {
    val dao = container.db.transactions()
    val categories by container.db.categories().observeAll().collectAsStateWithLifecycle(emptyList())
    val scope = rememberCoroutineScope()
    val isNew = id == 0L

    var loaded by rememberSaveable { mutableStateOf(isNew) }
    var type by rememberSaveable { mutableStateOf(TxType.EXPENSE) }
    var amount by rememberSaveable { mutableStateOf("") }
    var categoryId by rememberSaveable { mutableStateOf<Long?>(null) }
    var description by rememberSaveable { mutableStateOf("") }
    var date by rememberSaveable { mutableLongStateOf(System.currentTimeMillis()) }
    var amountError by remember { mutableStateOf(false) }
    var categoryError by remember { mutableStateOf(false) }
    var pickDate by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }
    var pickCategory by remember { mutableStateOf(false) }
    val usage by container.db.categories().observeUsage().collectAsStateWithLifecycle(emptyList())
    val usageCounts = remember(usage) { usage.associate { it.categoryId to it.count } }

    LaunchedEffect(id) {
        if (!loaded) {
            dao.get(id)?.let {
                type = it.type; amount = Format.amountInput(it.amountMinor)
                categoryId = it.categoryId; description = it.description; date = it.date
            }
            loaded = true
        }
    }

    fun save() {
        val minor = Format.parseAmount(amount)?.takeIf { it > 0 }
        amountError = minor == null
        categoryError = categoryId == null
        if (minor == null || categoryId == null) return
        val tx = TransactionEntity(
            id = id, amountMinor = minor, description = description.trim().take(500),
            categoryId = categoryId!!, type = type, date = date,
        )
        scope.launch {
            if (isNew) dao.insert(tx) else dao.update(tx)
            onDone()
        }
    }

    val focus = remember { FocusRequester() }
    LaunchedEffect(loaded) { if (loaded && isNew) runCatching { focus.requestFocus() } }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(if (isNew) R.string.new_transaction else R.string.edit_transaction)) },
                navigationIcon = {
                    IconButton(onClick = onDone) { Icon(Icons.Default.Close, stringResource(R.string.close)) }
                },
                actions = {
                    if (!isNew) IconButton(onClick = { confirmDelete = true }) {
                        Icon(Icons.Outlined.Delete, stringResource(R.string.delete), tint = MaterialTheme.colorScheme.error)
                    }
                },
            )
        },
        bottomBar = {
            Button(
                onClick = ::save,
                modifier = Modifier.fillMaxWidth().navigationBarsPadding().imePadding()
                    .padding(horizontal = 20.dp, vertical = 12.dp).height(52.dp),
            ) { Text(stringResource(if (isNew) R.string.save else R.string.update), style = MaterialTheme.typography.titleMedium) }
        },
    ) { pad ->
        if (!loaded) return@Scaffold
        Column(
            Modifier.fillMaxSize().padding(pad).verticalScroll(rememberScrollState()).padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            TypeToggle(type, onChange = { if (type != it) { type = it; categoryId = null } })

            // The amount is the point of this screen: big, first, keyboard already open.
            Column {
                val symbol = remember(currency) { java.util.Currency.getInstance(currency).getSymbol(java.util.Locale.getDefault()) }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        symbol,
                        style = MaterialTheme.typography.displayMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(end = 8.dp),
                    )
                    BasicTextField(
                        value = amount,
                        onValueChange = { v -> if (v.length <= 12 && v.all { it.isDigit() || it == ',' || it == '.' }) { amount = v; amountError = false } },
                        textStyle = MaterialTheme.typography.displayMedium.merge(Tabular).copy(
                            color = if (type == TxType.INCOME) LocalMoneyColors.current.income else MaterialTheme.colorScheme.onSurface,
                        ),
                        cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f).focusRequester(focus),
                        decorationBox = { inner ->
                            Box {
                                if (amount.isEmpty()) Text(
                                    "0", style = MaterialTheme.typography.displayMedium,
                                    color = MaterialTheme.colorScheme.outline,
                                )
                                inner()
                            }
                        },
                    )
                }
                HorizontalDivider(color = if (amountError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.outline)
                if (amountError) Text(stringResource(R.string.error_amount), color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 4.dp))
            }

            // A field that opens a searchable list: stays usable with 5 or 50 categories.
            val chosen = categories.firstOrNull { it.id == categoryId }
            Column {
                Row(
                    Modifier.fillMaxWidth().clip(MaterialTheme.shapes.small)
                        .border(
                            1.dp,
                            if (categoryError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.outline,
                            MaterialTheme.shapes.small,
                        )
                        .clickable { pickCategory = true }
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    if (chosen != null) {
                        CategoryBadge(chosen.icon, Format.color(chosen.colorHex), 32.dp)
                        Spacer(Modifier.width(12.dp))
                        Text(chosen.name, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
                    } else {
                        Text(
                            stringResource(R.string.choose_category), style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f).padding(vertical = 4.dp),
                        )
                    }
                    Icon(Icons.Default.ArrowDropDown, null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                if (categoryError) Text(stringResource(R.string.error_category), color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 4.dp, start = 4.dp))
            }

            OutlinedTextField(
                value = description,
                onValueChange = { if (it.length <= 500) description = it },
                label = { Text(stringResource(R.string.description)) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )

            // Most transactions are from today or yesterday: one tap. The calendar is for the rest.
            val day = Format.localDate(date)
            val today = java.time.LocalDate.now()
            val dateIndex = when (day) { today -> 0; today.minusDays(1) -> 1; else -> 2 }
            val brass = MaterialTheme.colorScheme.primaryContainer
            val onBrass = MaterialTheme.colorScheme.onPrimaryContainer
            SegmentedPills(
                segments = listOf(
                    Segment(stringResource(R.string.today), selectedBg = brass, selectedFg = onBrass),
                    Segment(stringResource(R.string.yesterday), selectedBg = brass, selectedFg = onBrass),
                    Segment(
                        if (dateIndex == 2) Format.shortDate(date) else stringResource(R.string.pick_date),
                        icon = Icons.Default.CalendarToday, selectedBg = brass, selectedFg = onBrass,
                    ),
                ),
                selected = dateIndex,
                onSelect = { i ->
                    when (i) {
                        0 -> date = Format.onDay(date, today)
                        1 -> date = Format.onDay(date, today.minusDays(1))
                        else -> pickDate = true
                    }
                },
            )
            Spacer(Modifier.height(8.dp))
        }
    }

    if (pickDate) {
        val state = rememberDatePickerState(initialSelectedDateMillis = localToUtcDay(date))
        DatePickerDialog(
            colors = DatePickerDefaults.colors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
            onDismissRequest = { pickDate = false },
            confirmButton = {
                TextButton(onClick = {
                    state.selectedDateMillis?.let { utc ->
                        // Keep the original time of day so ordering within a day stays stable.
                        val zone = ZoneId.systemDefault()
                        val time = Instant.ofEpochMilli(date).atZone(zone).toLocalTime() ?: LocalTime.NOON
                        date = Instant.ofEpochMilli(utc).atZone(ZoneOffset.UTC).toLocalDate()
                            .atTime(time).atZone(zone).toInstant().toEpochMilli()
                    }
                    pickDate = false
                }) { Text(stringResource(R.string.ok)) }
            },
            dismissButton = { TextButton(onClick = { pickDate = false }) { Text(stringResource(R.string.cancel)) } },
        ) {
            DatePicker(
                state,
                colors = DatePickerDefaults.colors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
            )
        }
    }

    if (confirmDelete) {
        ConfirmDialog(
            title = stringResource(R.string.delete_transaction_title),
            text = stringResource(R.string.delete_transaction_text),
            confirmLabel = stringResource(R.string.delete),
            dismissLabel = stringResource(R.string.cancel),
            onConfirm = { scope.launch { dao.delete(id); onDone() } },
            onDismiss = { confirmDelete = false },
            preview = {
                val cat = categories.firstOrNull { it.id == categoryId }
                val minor = Format.parseAmount(amount) ?: 0L
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (cat != null) {
                        CategoryBadge(cat.icon, Format.color(cat.colorHex), 36.dp)
                        Spacer(Modifier.width(12.dp))
                    }
                    Column(Modifier.weight(1f)) {
                        Text(cat?.name.orEmpty(), style = MaterialTheme.typography.bodyLarge)
                        Text(
                            listOf(description.trim(), Format.date(date)).filter { it.isNotEmpty() }.joinToString(", "),
                            style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1,
                        )
                    }
                    Text(
                        Format.signed(minor, currency, positive = type == TxType.INCOME),
                        style = MaterialTheme.typography.bodyLarge.merge(Tabular),
                        color = if (type == TxType.INCOME) LocalMoneyColors.current.income else MaterialTheme.colorScheme.onSurface,
                    )
                }
            },
        )
    }

    if (pickCategory) {
        CategoryPickerSheet(
            categories = categories.filter { it.type == type },
            usage = usageCounts,
            selectedId = categoryId,
            onDismiss = { pickCategory = false },
        ) { categoryId = it.id; categoryError = false }
    }
}

/**
 * Category list in a fixed order: the few you use most on top, then all of them
 * alphabetically. A search field appears once the list gets long.
 */
@Composable
fun CategoryPickerSheet(
    categories: List<CategoryEntity>,
    usage: Map<Long, Int>,
    selectedId: Long?,
    onDismiss: () -> Unit,
    onPick: (CategoryEntity) -> Unit,
) {
    var query by remember { mutableStateOf("") }
    val sorted = remember(categories) { categories.sortedForDisplay() }
    val frequent = remember(sorted, usage) {
        if (sorted.size <= 6) emptyList()
        else sorted.filter { (usage[it.id] ?: 0) > 0 }.sortedByDescending { usage[it.id] ?: 0 }.take(4)
    }
    AppSheet(stringResource(R.string.choose_category), onDismiss) { close ->
        if (sorted.size > 8) {
            OutlinedTextField(
                value = query, onValueChange = { query = it },
                placeholder = { Text(stringResource(R.string.search)) },
                leadingIcon = { Icon(Icons.Default.Search, null) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
            )
        }
        @Composable
        fun rowFor(c: CategoryEntity) = OptionRow(
            title = c.name,
            selected = c.id == selectedId,
            leading = { CategoryBadge(c.icon, Format.color(c.colorHex), 36.dp) },
            onClick = { onPick(c); close() },
        )
        val searching = query.isNotBlank()
        val shown = sorted.filter { it.name.contains(query.trim(), ignoreCase = true) }
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            if (!searching && frequent.isNotEmpty()) {
                PickerLabel(R.string.most_used)
                frequent.forEach { rowFor(it) }
                PickerLabel(R.string.all_categories)
            }
            shown.forEach { rowFor(it) }
            if (shown.isEmpty()) Text(
                stringResource(R.string.no_results), color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(vertical = 16.dp),
            )
        }
    }
}

@Composable
private fun PickerLabel(id: Int) {
    Text(
        stringResource(id), style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(start = 14.dp, top = 12.dp, bottom = 4.dp),
    )
}
