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

private const val CUSTOM = "custom"

private val PALETTE = listOf(
    "#FF6B6B", "#EE5253", "#FF9F43", "#FFB347", "#FECA57", "#F8A5C2", "#FF9FF3", "#7D5FFF",
    "#5F27CD", "#54A0FF", "#45B7D1", "#4ECDC4", "#00B894", "#39BE56", "#96CEB4", "#3C6382",
    "#576574", "#636E72",
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoriesScreen(container: AppContainer) {
    val dao = container.db.categories()
    val all by dao.observeAll().collectAsStateWithLifecycle(emptyList())
    val usage by dao.observeUsage().collectAsStateWithLifecycle(emptyList())
    val counts = remember(usage) { usage.associate { it.categoryId to it.count } }
    val pager = rememberPagerState { 2 }
    val scope = rememberCoroutineScope()
    val type = if (pager.currentPage == 0) TxType.EXPENSE else TxType.INCOME
    var editing by remember { mutableStateOf<CategoryEntity?>(null) }
    val space = LocalBottomBarSpace.current

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = { TopAppBar(title = { Text(stringResource(R.string.nav_categories)) }) },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { editing = CategoryEntity(name = "", colorHex = PALETTE.first(), type = type) },
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
                val list = all.filter { it.type == pageType }
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
                            modifier = Modifier.clickable { editing = c }.padding(horizontal = 4.dp),
                        )
                    }
                }
            }
        }
    }

    editing?.let { cat ->
        CategoryEditor(
            initial = cat,
            dao = dao,
            usedBy = counts[cat.id] ?: 0,
            onDismiss = { editing = null },
        )
    }
}

/**
 * Create/edit a category in a sheet. Errors (duplicate name, category in use) are
 * shown inside the sheet, where the user is looking, not in a snackbar behind it.
 */
@Composable
private fun CategoryEditor(initial: CategoryEntity, dao: CategoryDao, usedBy: Int, onDismiss: () -> Unit) {
    var name by remember { mutableStateOf(initial.name) }
    var color by remember { mutableStateOf(initial.colorHex.uppercase()) }
    var hex by remember { mutableStateOf(initial.colorHex.uppercase()) }
    var icon by remember {
        mutableStateOf(
            if (initial.id == 0L) DefaultCategories.FALLBACK_ICON else initial.icon,
        )
    }
    var nameError by remember { mutableStateOf(false) }
    var customOpen by remember { mutableStateOf(initial.colorHex.uppercase() !in PALETTE) }
    var pickerSeed by remember { mutableIntStateOf(0) }
    val scope = rememberCoroutineScope()
    val nameValid = name.trim().length in 1..50
    val muted = MaterialTheme.colorScheme.onSurfaceVariant

    AppSheet(
        title = stringResource(if (initial.id == 0L) R.string.add_category else R.string.edit_category),
        onDismiss = onDismiss,
    ) { close ->
        Row(verticalAlignment = Alignment.CenterVertically) {
            CategoryBadge(icon, Format.color(color), 56.dp)
            Spacer(Modifier.width(16.dp))
            OutlinedTextField(
                value = name,
                onValueChange = { if (it.length <= 50) { name = it; nameError = false } },
                label = { Text(stringResource(R.string.name)) },
                isError = nameError,
                supportingText = { if (nameError) Text(stringResource(R.string.error_category_exists)) },
                singleLine = true,
                modifier = Modifier.weight(1f),
            )
        }

        SectionLabel(R.string.icon)
        EvenGrid(CategoryIcons.all, columns = 7) { (key, vector), size ->
            val selected = key == icon
            val bg = if (selected) Format.color(color) else MaterialTheme.colorScheme.surfaceContainerHighest
            Box(
                Modifier.size(size).clip(CircleShape).background(bg).clickable { icon = key },
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    vector, key,
                    tint = if (selected) (if (bg.luminance() > 0.45f) Color(0xFF1B2220) else Color.White) else muted,
                    modifier = Modifier.size(size * 0.5f),
                )
            }
        }

        SectionLabel(R.string.color)
        // Presets, then a last swatch that opens the custom picker.
        EvenGrid(PALETTE + CUSTOM, columns = 7) { p, size ->
            if (p == CUSTOM) Box(
                Modifier.size(size).clip(CircleShape)
                    .background(Brush.sweepGradient((0..6).map { Color.hsv(it * 60f, 0.75f, 0.95f) }))
                    .border(if (customOpen) 3.dp else 0.dp, MaterialTheme.colorScheme.onSurface, CircleShape)
                    .clickable { customOpen = !customOpen; pickerSeed++ },
                contentAlignment = Alignment.Center,
            ) { Icon(Icons.Default.Palette, stringResource(R.string.custom_color), tint = Color.White, modifier = Modifier.size(size * 0.45f)) }
            else Swatch(Format.color(p), size, selected = p.equals(color, ignoreCase = true) && !customOpen) {
                color = p; hex = p; customOpen = false
            }
        }
        AnimatedVisibility(customOpen) {
            Column(Modifier.padding(top = 16.dp)) {
                androidx.compose.runtime.key(pickerSeed) {
                    ColorPicker(
                        color = Format.color(color),
                        description = stringResource(R.string.custom_color),
                        onChange = { c -> val h = c.toHex(); color = h; hex = h },
                    )
                }
                OutlinedTextField(
                    value = hex,
                    onValueChange = { v ->
                        hex = v.uppercase().take(7)
                        if (Regex("^#[0-9A-F]{6}$").matches(hex)) { color = hex; pickerSeed++ }
                    },
                    label = { Text(stringResource(R.string.color_hex)) },
                    leadingIcon = { ColorDot(Format.color(color), 20.dp) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                )
            }
        }

        if (initial.id != 0L && usedBy > 0) {
            Row(Modifier.padding(top = 20.dp), verticalAlignment = Alignment.Top) {
                Icon(Icons.Default.Info, null, tint = muted, modifier = Modifier.size(18.dp).padding(top = 2.dp))
                Spacer(Modifier.width(8.dp))
                Text(
                    pluralStringResource(R.plurals.category_in_use_info, usedBy, usedBy),
                    style = MaterialTheme.typography.bodySmall, color = muted,
                )
            }
        }

        SheetActions(
            primary = stringResource(R.string.save),
            primaryEnabled = nameValid,
            onPrimary = {
                scope.launch {
                    val updated = initial.copy(name = name.trim(), colorHex = color, icon = icon)
                    try {
                        if (updated.id == 0L) dao.insert(updated) else dao.update(updated)
                        close()
                    } catch (e: SQLiteConstraintException) {
                        nameError = true
                    }
                }
            },
            secondary = if (initial.id != 0L && usedBy == 0) stringResource(R.string.delete) else null,
            onSecondary = { scope.launch { dao.delete(initial); close() } },
        )
    }
}

@Composable
private fun SectionLabel(id: Int) {
    Text(
        stringResource(id), style = MaterialTheme.typography.titleSmall,
        modifier = Modifier.padding(top = 24.dp, bottom = 10.dp),
    )
}

@Composable
private fun Swatch(color: Color, size: androidx.compose.ui.unit.Dp, selected: Boolean, onClick: () -> Unit) {
    Box(
        Modifier.size(size).clip(CircleShape).background(color)
            .border(if (selected) 3.dp else 0.dp, MaterialTheme.colorScheme.onSurface, CircleShape)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        if (selected) Icon(
            Icons.Default.Check, null, modifier = Modifier.size(18.dp),
            tint = if (color.luminance() > 0.45f) Color(0xFF1B2220) else Color.White,
        )
    }
}

private fun Color.toHex(): String =
    "#%02X%02X%02X".format((red * 255).toInt(), (green * 255).toInt(), (blue * 255).toInt())
