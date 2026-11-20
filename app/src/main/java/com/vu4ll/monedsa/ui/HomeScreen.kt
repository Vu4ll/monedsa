package com.vu4ll.monedsa.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Sort
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.FilterAlt
import androidx.compose.material.icons.outlined.FilterAlt
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Badge
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.vu4ll.monedsa.AppContainer
import com.vu4ll.monedsa.R
import com.vu4ll.monedsa.data.Stats
import com.vu4ll.monedsa.data.TransactionWithCategory
import com.vu4ll.monedsa.data.TxFilter
import com.vu4ll.monedsa.data.TxType
import com.vu4ll.monedsa.ui.theme.LocalMoneyColors
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn

class HomeViewModel(c: AppContainer) : ViewModel() {
    val filter = MutableStateFlow(TxFilter())

    @OptIn(ExperimentalCoroutinesApi::class)
    val transactions = filter.flatMapLatest { c.db.transactions().observe(it) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    val stats = c.db.transactions().observeStats()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    val categories = c.db.categories().observeAll()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(container: AppContainer, currency: String, onOpen: (Long) -> Unit) {
    val vm: HomeViewModel = viewModel { HomeViewModel(container) }
    val filter by vm.filter.collectAsStateWithLifecycle()
    val txs by vm.transactions.collectAsStateWithLifecycle()
    val stats by vm.stats.collectAsStateWithLifecycle()
    val categories by vm.categories.collectAsStateWithLifecycle()
    var showSort by remember { mutableStateOf(false) }
    var showFilter by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(stringResource(R.string.app_name), fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { showSort = true }) {
                        Icon(Icons.AutoMirrored.Filled.Sort, stringResource(R.string.sort_title))
                    }
                },
                actions = {
                    IconButton(onClick = { showFilter = true }) {
                        BadgedBox(badge = { if (filter.isActive) Badge() }) {
                            Icon(
                                if (filter.isActive) Icons.Filled.FilterAlt else Icons.Outlined.FilterAlt,
                                stringResource(R.string.filter_title),
                            )
                        }
                    }
                },
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { onOpen(0) }) {
                Icon(Icons.Default.Add, stringResource(R.string.add_transaction))
            }
        },
    ) { pad ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(pad),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 88.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            stats?.let { item { SummaryCard(it, currency) } }
            val list = txs
            when {
                list == null -> Unit
                list.isEmpty() -> item { EmptyState(filtered = filter.isActive) }
                else -> items(list, key = { it.tx.id }) { TransactionRow(it, currency) { onOpen(it.tx.id) } }
            }
        }
    }

    if (showSort) SortSheet(filter, onDismiss = { showSort = false }) { vm.filter.value = it }
    if (showFilter) FilterSheet(filter, categories, currency, onDismiss = { showFilter = false }) { vm.filter.value = it }
}

@Composable
private fun SummaryCard(s: Stats, currency: String) {
    val money = LocalMoneyColors.current
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(stringResource(R.string.balance), style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(
                Format.money(s.balance, currency),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = if (s.balance < 0) money.expense else MaterialTheme.colorScheme.onSurface,
            )
            Spacer(Modifier.height(12.dp))
            Row {
                SummaryItem(stringResource(R.string.income), Format.money(s.totalIncome, currency),
                    pluralStringResource(R.plurals.n_transactions, s.incomeCount, s.incomeCount), money.income, Modifier.weight(1f))
                SummaryItem(stringResource(R.string.expense), Format.money(s.totalExpense, currency),
                    pluralStringResource(R.plurals.n_transactions, s.expenseCount, s.expenseCount), money.expense, Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun SummaryItem(label: String, value: String, sub: String, color: androidx.compose.ui.graphics.Color, modifier: Modifier) {
    Column(modifier) {
        Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.titleMedium, color = color, fontWeight = FontWeight.SemiBold)
        Text(sub, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun TransactionRow(t: TransactionWithCategory, currency: String, onClick: () -> Unit) {
    val money = LocalMoneyColors.current
    val income = t.tx.type == TxType.INCOME
    Card(
        onClick = onClick,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(Modifier.padding(horizontal = 16.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(12.dp).background(Format.color(t.categoryColor), CircleShape))
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(t.categoryName, style = MaterialTheme.typography.titleSmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
                val sub = listOf(t.tx.description, Format.date(t.tx.date)).filter { it.isNotBlank() }.joinToString(" · ")
                Text(sub, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Text(
                (if (income) "+" else "−") + Format.money(t.tx.amountMinor, currency),
                color = if (income) money.income else money.expense,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}

@Composable
private fun EmptyState(filtered: Boolean) {
    Column(Modifier.fillMaxWidth().padding(top = 64.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(Icons.AutoMirrored.Outlined.ReceiptLong, null, Modifier.size(56.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(12.dp))
        Text(
            stringResource(if (filtered) R.string.empty_filtered else R.string.empty_transactions),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
