package com.vu4ll.monedsa.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(if (isNew) R.string.add_transaction else R.string.edit_transaction)) },
                navigationIcon = {
                    IconButton(onClick = onDone) { Icon(Icons.AutoMirrored.Filled.ArrowBack, stringResource(R.string.back)) }
                },
                actions = {
                    if (!isNew) IconButton(onClick = { confirmDelete = true }) {
                        Icon(Icons.Default.Delete, stringResource(R.string.delete))
                    }
                },
            )
        },
    ) { pad ->
        if (!loaded) return@Scaffold
        Column(
            Modifier.fillMaxSize().padding(pad).imePadding().verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
                listOf(TxType.EXPENSE to R.string.expense, TxType.INCOME to R.string.income).forEachIndexed { i, (t, label) ->
                    SegmentedButton(
                        selected = type == t,
                        onClick = {
                            if (type != t) { type = t; categoryId = null }
                        },
                        shape = SegmentedButtonDefaults.itemShape(i, 2),
                    ) { Text(stringResource(label)) }
                }
            }

            OutlinedTextField(
                value = amount,
                onValueChange = { amount = it; amountError = false },
                label = { Text(stringResource(R.string.amount_in, currency)) },
                isError = amountError,
                supportingText = { if (amountError) Text(stringResource(R.string.error_amount)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                modifier = Modifier.fillMaxWidth(),
            )

            Column {
                Text(stringResource(R.string.category), style = MaterialTheme.typography.labelLarge,
                    color = if (categoryError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface)
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    categories.filter { it.type == type }.forEach { c ->
                        FilterChip(
                            selected = categoryId == c.id,
                            onClick = { categoryId = c.id; categoryError = false },
                            label = { Text(c.name) },
                            leadingIcon = { ColorDot(Format.color(c.colorHex)) },
                            colors = FilterChipDefaults.filterChipColors(),
                        )
                    }
                }
                if (categoryError) Text(stringResource(R.string.error_category), color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall)
            }

            OutlinedTextField(
                value = description,
                onValueChange = { if (it.length <= 500) description = it },
                label = { Text(stringResource(R.string.description)) },
                minLines = 2,
                modifier = Modifier.fillMaxWidth(),
            )

            OutlinedButton(onClick = { pickDate = true }, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Default.CalendarToday, null)
                Text(Format.date(date), Modifier.padding(start = 8.dp))
            }

            Button(onClick = ::save, modifier = Modifier.fillMaxWidth()) {
                Text(stringResource(if (isNew) R.string.save else R.string.update))
            }
        }
    }

    if (pickDate) {
        val state = rememberDatePickerState(initialSelectedDateMillis = localToUtcDay(date))
        DatePickerDialog(
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
        ) { DatePicker(state) }
    }

    if (confirmDelete) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text(stringResource(R.string.delete_transaction_title)) },
            text = { Text(stringResource(R.string.delete_transaction_text)) },
            confirmButton = {
                TextButton(onClick = { scope.launch { dao.delete(id); onDone() } }) {
                    Text(stringResource(R.string.delete), color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text(stringResource(R.string.cancel)) } },
        )
    }
}
