package com.vu4ll.monedsa.ui

import android.database.sqlite.SQLiteConstraintException
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.PrimaryTabRow
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.vu4ll.monedsa.AppContainer
import com.vu4ll.monedsa.R
import com.vu4ll.monedsa.data.CategoryDao
import com.vu4ll.monedsa.data.CategoryEntity
import com.vu4ll.monedsa.data.DefaultCategories
import com.vu4ll.monedsa.data.TxType
import com.vu4ll.monedsa.ui.components.AppSheet
import com.vu4ll.monedsa.ui.components.ColorPicker
import com.vu4ll.monedsa.ui.components.SheetActions
import kotlinx.coroutines.launch


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoriesScreen(container: AppContainer, onOpen: (id: Long, type: TxType) -> Unit) {
    val dao = container.db.categories()
    val all by dao.observeAll().collectAsStateWithLifecycle(emptyList())
    val usage by dao.observeUsage().collectAsStateWithLifecycle(emptyList())
    val counts = remember(usage) { usage.associate { it.categoryId to it.count } }
    val pager = rememberPagerState { 2 }
    val scope = rememberCoroutineScope()
    val type = if (pager.currentPage == 0) TxType.EXPENSE else TxType.INCOME
    val space = LocalBottomBarSpace.current

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = { TopAppBar(title = { Text(stringResource(R.string.nav_categories)) }) },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { onOpen(0, type) },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary,
                modifier = Modifier.padding(bottom = space - 8.dp),
            ) { Icon(Icons.Default.Add, stringResource(R.string.add_category)) }
        },
    ) { pad ->
        Column(Modifier.fillMaxSize().padding(pad)) {
            val muted = MaterialTheme.colorScheme.onSurfaceVariant
            PrimaryTabRow(selectedTabIndex = pager.currentPage, containerColor = Color.Transparent) {
                listOf(R.string.expense, R.string.income).forEachIndexed { i, label ->
                    Tab(
                        selected = pager.currentPage == i,
                        onClick = { scope.launch { pager.animateScrollToPage(i) } },
                        text = { Text(stringResource(label)) },
                        unselectedContentColor = muted,
                    )
                }
            }
            HorizontalPager(pager, Modifier.fillMaxSize()) { page ->
                val pageType = if (page == 0) TxType.EXPENSE else TxType.INCOME
                val list = remember(all, pageType) { all.filter { it.type == pageType }.sortedForDisplay() }
                if (list.isEmpty()) {
                    Text(stringResource(R.string.empty_categories), Modifier.padding(24.dp), color = muted)
                }
                LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(top = 8.dp, bottom = space + 72.dp)) {
                    items(list, key = { it.id }) { c ->
                        val n = counts[c.id] ?: 0
                        ListItem(
                            headlineContent = { Text(c.name) },
                            supportingContent = {
                                Text(
                                    if (n == 0) stringResource(R.string.unused) else pluralStringResource(R.plurals.n_transactions, n, n),
                                    color = muted,
                                )
                            },
                            leadingContent = { CategoryBadge(c.icon, Format.color(c.colorHex)) },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                            modifier = Modifier.clickable { onOpen(c.id, c.type) }.padding(horizontal = 4.dp),
                        )
                    }
                }
            }
        }
    }

}
