package com.vu4ll.monedsa.ui

import android.database.sqlite.SQLiteConstraintException
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.PrimaryTabRow
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.vu4ll.monedsa.AppContainer
import com.vu4ll.monedsa.R
import com.vu4ll.monedsa.data.CategoryEntity
import com.vu4ll.monedsa.data.TxType
import kotlinx.coroutines.launch

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
    var tab by rememberSaveable { mutableStateOf(TxType.EXPENSE) }
    var editing by remember { mutableStateOf<CategoryEntity?>(null) }
    val snackbar = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val ctx = LocalContext.current

    Scaffold(
        topBar = { CenterAlignedTopAppBar(title = { Text(stringResource(R.string.nav_categories)) }) },
        floatingActionButton = {
            FloatingActionButton(onClick = { editing = CategoryEntity(name = "", colorHex = PALETTE.first(), type = tab) }) {
                Icon(Icons.Default.Add, stringResource(R.string.add_category))
            }
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { pad ->
        Column(Modifier.fillMaxSize().padding(pad)) {
            PrimaryTabRow(selectedTabIndex = tab.ordinal) {
                Tab(tab == TxType.EXPENSE, { tab = TxType.EXPENSE }, text = { Text(stringResource(R.string.expense)) })
                Tab(tab == TxType.INCOME, { tab = TxType.INCOME }, text = { Text(stringResource(R.string.income)) })
            }
            val list = all.filter { it.type == tab }
            if (list.isEmpty()) {
                Text(stringResource(R.string.empty_categories), Modifier.padding(24.dp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            LazyColumn(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 88.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(list, key = { it.id }) { c ->
                    Card(
                        onClick = { editing = c },
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
                    ) {
                        ListItem(
                            headlineContent = { Text(c.name) },
                            leadingContent = { ColorDot(Format.color(c.colorHex), 20.dp) },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        )
                    }
                }
            }
        }
    }

    editing?.let { cat ->
        CategoryDialog(
            initial = cat,
            onDismiss = { editing = null },
            onSave = { updated ->
                scope.launch {
                    try {
                        if (updated.id == 0L) dao.insert(updated) else dao.update(updated)
                        editing = null
                    } catch (e: SQLiteConstraintException) {
                        snackbar.showSnackbar(ctx.getString(R.string.error_category_exists))
                    }
                }
            },
            onDelete = if (cat.id == 0L) null else {
                {
                    scope.launch {
                        val used = dao.usageCount(cat.id)
                        if (used > 0) {
                            snackbar.showSnackbar(ctx.resources.getQuantityString(R.plurals.error_category_in_use, used, used))
                        } else {
                            dao.delete(cat)
                            editing = null
                        }
                    }
                }
            },
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun CategoryDialog(
    initial: CategoryEntity,
    onDismiss: () -> Unit,
    onSave: (CategoryEntity) -> Unit,
    onDelete: (() -> Unit)?,
) {
    var name by remember { mutableStateOf(initial.name) }
    var color by remember { mutableStateOf(initial.colorHex.uppercase()) }
    var hex by remember { mutableStateOf(initial.colorHex.uppercase()) }
    val nameValid = name.trim().length in 1..50

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(if (initial.id == 0L) R.string.add_category else R.string.edit_category)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                OutlinedTextField(
                    value = name, onValueChange = { if (it.length <= 50) name = it },
                    label = { Text(stringResource(R.string.name)) }, singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    PALETTE.forEach { p ->
                        val selected = p.equals(color, ignoreCase = true)
                        Box(
                            Modifier.size(32.dp)
                                .border(if (selected) 2.dp else 0.dp, MaterialTheme.colorScheme.onSurface, CircleShape)
                                .padding(3.dp)
                                .clickable { color = p; hex = p },
                            contentAlignment = Alignment.Center,
                        ) {
                            ColorDot(Format.color(p), 26.dp)
                            if (selected) Icon(Icons.Default.Check, null, tint = Color.White, modifier = Modifier.size(16.dp))
                        }
                    }
                }
                OutlinedTextField(
                    value = hex,
                    onValueChange = { v ->
                        hex = v.uppercase().take(7)
                        if (Regex("^#[0-9A-F]{6}$").matches(hex)) color = hex
                    },
                    label = { Text(stringResource(R.string.color_hex)) },
                    leadingIcon = { ColorDot(Format.color(color), 20.dp) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
        confirmButton = {
            TextButton(enabled = nameValid, onClick = { onSave(initial.copy(name = name.trim(), colorHex = color)) }) {
                Text(stringResource(R.string.save))
            }
        },
        dismissButton = {
            if (onDelete != null) TextButton(onClick = onDelete) {
                Text(stringResource(R.string.delete), color = MaterialTheme.colorScheme.error)
            } else TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) }
        },
    )
}
