package com.vu4ll.monedsa.ui

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.key
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.snapshotFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.filled.Sort
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FilterAlt
import androidx.compose.material.icons.outlined.FilterAlt
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
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
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
import com.vu4ll.monedsa.data.CategoryTotal
import com.vu4ll.monedsa.data.SortBy
import com.vu4ll.monedsa.data.Stats
import com.vu4ll.monedsa.data.TransactionWithCategory
import com.vu4ll.monedsa.data.TxFilter
import com.vu4ll.monedsa.data.TxType
import com.vu4ll.monedsa.ui.theme.Display
import com.vu4ll.monedsa.ui.theme.LocalMoneyColors
import com.vu4ll.monedsa.ui.theme.Tabular
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import java.time.LocalDate
import java.time.YearMonth

class HomeViewModel(c: AppContainer) : ViewModel() {
    /** User filters from the filter/sort sheets. A date range here replaces the month pages. */
    val filter = MutableStateFlow(TxFilter())
    val month = MutableStateFlow(YearMonth.now())

    /** Earliest month that has data; months before it can't be browsed. */
    val firstMonth = c.db.transactions().observeOldestDate()
        .map { d -> d?.let { YearMonth.from(Format.localDate(it)) }?.coerceAtMost(YearMonth.now()) ?: YearMonth.now() }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    val categories = c.db.categories().observeAll()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
}

private sealed interface ListRow {
    /** net is null when the day has a single transaction: its row already shows the amount. */
    data class Day(val date: LocalDate, val net: Long?) : ListRow
    data class Tx(val t: TransactionWithCategory, val showDate: Boolean) : ListRow
}

@Composable
fun HomeScreen(container: AppContainer, currency: String, onOpen: (Long) -> Unit) {
    val vm: HomeViewModel = viewModel { HomeViewModel(container) }
    val filter by vm.filter.collectAsStateWithLifecycle()
    val selected by vm.month.collectAsStateWithLifecycle()
    val first by vm.firstMonth.collectAsStateWithLifecycle()
    val categories by vm.categories.collectAsStateWithLifecycle()
    var showSort by remember { mutableStateOf(false) }
    var showFilter by remember { mutableStateOf(false) }
    val customRange = filter.from != null || filter.until != null
    val otherFilters = filter.copy(from = null, until = null).isActive
    val space = LocalBottomBarSpace.current
    val scope = rememberCoroutineScope()

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        floatingActionButton = {
            FloatingActionButton(
                onClick = { onOpen(0) },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary,
                modifier = Modifier.padding(bottom = space - 8.dp),
            ) { Icon(Icons.Default.Add, stringResource(R.string.add_transaction)) }
        },
    ) { pad ->
        val firstMonth = first ?: return@Scaffold
        val now = YearMonth.now()
        val count = (firstMonth.until(now, java.time.temporal.ChronoUnit.MONTHS) + 1).toInt()
        // Re-create the pager when the first month moves so page indexes stay correct.
        val pager = key(firstMonth) {
            rememberPagerState(
                initialPage = firstMonth.until(selected.coerceIn(firstMonth, now), java.time.temporal.ChronoUnit.MONTHS).toInt(),
            ) { count }
        }
        LaunchedEffect(pager, firstMonth) {
            snapshotFlow { pager.currentPage }.collect { vm.month.value = firstMonth.plusMonths(it.toLong()) }
        }
        val shown = firstMonth.plusMonths(pager.currentPage.toLong())

        Column(Modifier.fillMaxSize().padding(pad).statusBarsPadding()) {
            PeriodBar(
                title = if (customRange) rangeLabel(filter) else Format.month(shown),
                customRange = customRange,
                canGoBack = pager.currentPage > 0,
                canGoForward = pager.currentPage < count - 1,
                filtersActive = otherFilters,
                onPrev = { scope.launch { pager.animateScrollToPage(pager.currentPage - 1) } },
                onNext = { scope.launch { pager.animateScrollToPage(pager.currentPage + 1) } },
                onClearRange = { vm.filter.value = filter.copy(from = null, until = null) },
                onSort = { showSort = true },
                onFilter = { showFilter = true },
            )
            if (customRange) {
                PeriodPage(container, filter, filter.from, filter.until, currency, otherFilters, space, onOpen)
            } else {
                HorizontalPager(pager, modifier = Modifier.fillMaxSize(), key = { firstMonth.plusMonths(it.toLong()).toString() }) { page ->
                    val (from, until) = Format.monthBounds(firstMonth.plusMonths(page.toLong()))
                    PeriodPage(container, filter, from, until, currency, otherFilters, space, onOpen)
                }
            }
        }
    }

    if (showSort) SortSheet(filter, onDismiss = { showSort = false }) { vm.filter.value = it }
    if (showFilter) FilterSheet(filter, categories, currency, onDismiss = { showFilter = false }) { vm.filter.value = it }
}

/** Summary + transactions for one period. Each page observes its own slice of the database. */
@Composable
private fun PeriodPage(
    container: AppContainer,
    filter: TxFilter,
    from: Long?,
    until: Long?,
    currency: String,
    otherFilters: Boolean,
    bottomSpace: androidx.compose.ui.unit.Dp,
    onOpen: (Long) -> Unit,
) {
    val dao = container.db.transactions()
    val f = remember(filter, from, until) { filter.copy(from = from, until = until) }
    val txs by remember(f) { dao.observe(f) }.collectAsStateWithLifecycle(null)
    val stats by remember(from, until) { dao.observeStatsBetween(from, until) }.collectAsStateWithLifecycle(null)
    val spending by remember(from, until) { dao.observeCategoryTotals(TxType.EXPENSE, from, until) }.collectAsStateWithLifecycle(emptyList())

    // Group by day only when the list is in date order; amount order is a flat ranking.
    val rows = remember(txs, filter.sortBy) {
        val list = txs.orEmpty()
        if (filter.sortBy != SortBy.DATE) list.map { ListRow.Tx(it, showDate = true) }
        else buildList<ListRow> {
            list.groupBy { Format.localDate(it.tx.date) }.forEach { (day, items) ->
                val net = items.sumOf { if (it.tx.type == TxType.INCOME) it.tx.amountMinor else -it.tx.amountMinor }
                add(ListRow.Day(day, net.takeIf { items.size > 1 }))
                items.forEach { add(ListRow.Tx(it, showDate = false)) }
            }
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = bottomSpace + 72.dp),
    ) {
        stats?.let { s -> item { Summary(s, spending, currency) } }
        when {
            txs == null -> Unit
            rows.isEmpty() -> item {
                Text(
                    stringResource(if (otherFilters) R.string.empty_filtered else R.string.empty_month),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 32.dp),
                )
            }
            else -> items(rows, key = { r ->
                when (r) { is ListRow.Day -> "d" + r.date; is ListRow.Tx -> r.t.tx.id }
            }) { r ->
                when (r) {
                    is ListRow.Day -> DayHeader(r, currency)
                    is ListRow.Tx -> TransactionRow(r.t, currency, r.showDate) { onOpen(r.t.tx.id) }
                }
            }
        }
    }
}

@Composable
private fun rangeLabel(f: TxFilter): String =
    "${f.from?.let(Format::date) ?: "…"} – ${f.until?.let { Format.date(it - 1) } ?: "…"}"

@Composable
private fun PeriodBar(
    title: String,
    customRange: Boolean,
    canGoBack: Boolean,
    canGoForward: Boolean,
    filtersActive: Boolean,
    onPrev: () -> Unit,
    onNext: () -> Unit,
    onClearRange: () -> Unit,
    onSort: () -> Unit,
    onFilter: () -> Unit,
) {
    Row(
        Modifier.fillMaxWidth().padding(start = 4.dp, end = 4.dp, top = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (customRange) {
            IconButton(onClick = onClearRange) { Icon(Icons.Default.Close, stringResource(R.string.clear)) }
        } else {
            IconButton(onClick = onPrev, enabled = canGoBack) {
                Icon(Icons.AutoMirrored.Filled.KeyboardArrowLeft, stringResource(R.string.previous_month))
            }
        }
        AnimatedContent(
            targetState = title,
            transitionSpec = { fadeIn() togetherWith fadeOut() },
            label = "period",
        ) {
            Text(it, style = MaterialTheme.typography.headlineSmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        if (!customRange) {
            IconButton(onClick = onNext, enabled = canGoForward) {
                Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, stringResource(R.string.next_month))
            }
        }
        Spacer(Modifier.weight(1f))
        IconButton(onClick = onSort) { Icon(Icons.AutoMirrored.Filled.Sort, stringResource(R.string.sort_title)) }
        IconButton(onClick = onFilter) {
            BadgedBox(badge = { if (filtersActive) Badge(containerColor = MaterialTheme.colorScheme.primary) }) {
                Icon(if (filtersActive) Icons.Filled.FilterAlt else Icons.Outlined.FilterAlt, stringResource(R.string.filter_title))
            }
        }
    }
}

@Composable
private fun Summary(s: Stats, spending: List<CategoryTotal>, currency: String) {
    val money = LocalMoneyColors.current
    var showBreakdown by rememberSaveable { mutableStateOf(false) }
    Column(Modifier.padding(horizontal = 20.dp).padding(top = 12.dp, bottom = 20.dp)) {
        Text(
            Format.balance(s.balance, currency),
            style = MaterialTheme.typography.displayLarge.merge(Tabular),
            color = if (s.balance < 0) money.negative else MaterialTheme.colorScheme.onSurface,
            maxLines = 1,
        )
        Spacer(Modifier.height(16.dp))
        SpendingStrip(spending, Modifier.clickable(enabled = spending.isNotEmpty()) { showBreakdown = !showBreakdown })
        AnimatedVisibility(showBreakdown && spending.isNotEmpty(), enter = expandVertically() + fadeIn(), exit = shrinkVertically() + fadeOut()) {
            Breakdown(spending, s.totalExpense, currency)
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(24.dp)) {
            Figure(stringResource(R.string.income), Format.money(s.totalIncome, currency), money.income)
            Figure(stringResource(R.string.expense), Format.money(s.totalExpense, currency), MaterialTheme.colorScheme.onSurface)
        }
    }
}

@Composable
private fun Figure(label: String, value: String, color: androidx.compose.ui.graphics.Color) {
    Column {
        Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.titleMedium.merge(Tabular), color = color, fontWeight = FontWeight.SemiBold)
    }
}

/** This period's spending as one bar, split by category colour. */
@Composable
private fun SpendingStrip(spending: List<CategoryTotal>, modifier: Modifier) {
    val total = spending.sumOf { it.total }.coerceAtLeast(1)
    val description = stringResource(R.string.spending_breakdown)
    Row(
        modifier.fillMaxWidth().height(12.dp).clip(RoundedCornerShape(6.dp))
            .background(MaterialTheme.colorScheme.surfaceContainerHighest),
        horizontalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        spending.forEach { c ->
            val w by animateFloatAsState(c.total.toFloat() / total, label = "w${c.categoryId}")
            if (w > 0f) Box(Modifier.weight(w).height(12.dp).background(Format.color(c.colorHex)))
        }
    }
    if (spending.isNotEmpty()) Text(
        description,
        style = MaterialTheme.typography.labelSmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(top = 6.dp),
    )
}

@Composable
private fun Breakdown(spending: List<CategoryTotal>, totalExpense: Long, currency: String) {
    Column(Modifier.padding(top = 8.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
        spending.forEach { c ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                CategoryBadge(c.icon, Format.color(c.colorHex), 24.dp)
                Spacer(Modifier.width(12.dp))
                Text(c.name, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f),
                    maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(
                    (c.total * 100 / totalExpense.coerceAtLeast(1)).let { if (it == 0L) "<1%" else "$it%" },
                    style = MaterialTheme.typography.bodySmall.merge(Tabular),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(end = 12.dp),
                )
                Text(Format.money(c.total, currency), style = MaterialTheme.typography.bodyMedium.merge(Tabular))
            }
        }
    }
}

@Composable
private fun DayHeader(d: ListRow.Day, currency: String) {
    val today = LocalDate.now()
    val label = when (d.date) {
        today -> stringResource(R.string.today)
        today.minusDays(1) -> stringResource(R.string.yesterday)
        else -> Format.day(d.date)
    }
    Row(
        Modifier.fillMaxWidth().padding(start = 20.dp, end = 20.dp, top = 16.dp, bottom = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, style = MaterialTheme.typography.titleSmall, modifier = Modifier.weight(1f))
        if (d.net != null) Text(
            Format.signed(d.net, currency, positive = d.net >= 0),
            style = MaterialTheme.typography.labelLarge.merge(Tabular),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun TransactionRow(t: TransactionWithCategory, currency: String, showDate: Boolean, onClick: () -> Unit) {
    val money = LocalMoneyColors.current
    val income = t.tx.type == TxType.INCOME
    Row(
        Modifier.fillMaxWidth().clickable(onClick = onClick).padding(horizontal = 20.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        CategoryBadge(t.categoryIcon, Format.color(t.categoryColor))
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f)) {
            Text(t.categoryName, style = MaterialTheme.typography.bodyLarge, maxLines = 1, overflow = TextOverflow.Ellipsis)
            val sub = listOf(t.tx.description, if (showDate) Format.date(t.tx.date) else "")
                .filter { it.isNotBlank() }.joinToString(", ")
            if (sub.isNotEmpty()) Text(
                sub, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1, overflow = TextOverflow.Ellipsis,
            )
        }
        Spacer(Modifier.width(12.dp))
        Text(
            Format.signed(t.tx.amountMinor, currency, positive = income),
            style = MaterialTheme.typography.bodyLarge.merge(Tabular),
            color = if (income) money.income else MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.Medium,
        )
    }
}

