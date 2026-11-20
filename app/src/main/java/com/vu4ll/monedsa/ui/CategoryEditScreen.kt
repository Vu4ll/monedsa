package com.vu4ll.monedsa.ui

import android.database.sqlite.SQLiteConstraintException
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
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
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.vu4ll.monedsa.AppContainer
import com.vu4ll.monedsa.R
import com.vu4ll.monedsa.data.CategoryEntity
import com.vu4ll.monedsa.data.DefaultCategories
import com.vu4ll.monedsa.data.TxType
import com.vu4ll.monedsa.ui.components.AppSheet
import com.vu4ll.monedsa.ui.components.ColorPicker
import com.vu4ll.monedsa.ui.components.ConfirmDialog
import com.vu4ll.monedsa.ui.components.TypeToggle
import kotlinx.coroutines.launch

val CATEGORY_PALETTE = listOf(
    "#FF6B6B", "#EE5253", "#FF9F43", "#FFB347", "#FECA57", "#F8A5C2", "#FF9FF3", "#7D5FFF",
    "#5F27CD", "#54A0FF", "#45B7D1", "#4ECDC4", "#00B894", "#39BE56", "#96CEB4", "#3C6382",
    "#576574", "#636E72",
)

/** Icons shown before "show all": two rows of seven. */
private const val COLLAPSED_ICONS = 14

/** Full-screen editor for one category. id = 0 creates a new one of [newType]. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoryEditScreen(container: AppContainer, id: Long, newType: TxType, onDone: () -> Unit) {
    val dao = container.db.categories()
    val isNew = id == 0L
    val usage by dao.observeUsage().collectAsStateWithLifecycle(emptyList())
    val usedBy = usage.firstOrNull { it.categoryId == id }?.count ?: 0
    val scope = rememberCoroutineScope()

    var original by remember { mutableStateOf<CategoryEntity?>(null) }
    var loaded by rememberSaveable { mutableStateOf(isNew) }
    var name by rememberSaveable { mutableStateOf("") }
    var type by rememberSaveable { mutableStateOf(newType) }
    var color by rememberSaveable { mutableStateOf(CATEGORY_PALETTE.first()) }
    var icon by rememberSaveable { mutableStateOf(DefaultCategories.FALLBACK_ICON) }
    var nameError by remember { mutableStateOf<Int?>(null) }
    var allIcons by rememberSaveable { mutableStateOf(false) }
    var pickColor by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }

    LaunchedEffect(id) {
        if (!isNew) dao.all().firstOrNull { it.id == id }?.let {
            original = it
            if (!loaded) { name = it.name; type = it.type; color = it.colorHex.uppercase(); icon = it.icon; loaded = true }
        }
    }

    fun save() {
        if (name.trim().isEmpty()) { nameError = R.string.error_name_required; return }
        scope.launch {
            val c = (original ?: CategoryEntity(name = "", colorHex = color, type = type))
                .copy(name = name.trim(), colorHex = color, icon = icon, type = type)
            try {
                if (isNew) dao.insert(c) else dao.update(c)
                onDone()
            } catch (e: SQLiteConstraintException) {
                nameError = R.string.error_category_exists
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(if (isNew) R.string.new_category else R.string.edit_category)) },
                navigationIcon = { IconButton(onClick = onDone) { Icon(Icons.Default.Close, stringResource(R.string.close)) } },
                actions = {
                    if (!isNew && usedBy == 0) IconButton(onClick = { confirmDelete = true }) {
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
            ) { Text(stringResource(R.string.save), style = MaterialTheme.typography.titleMedium) }
        },
    ) { pad ->
        if (!loaded) return@Scaffold
        Column(
            Modifier.fillMaxSize().padding(pad).verticalScroll(rememberScrollState()).padding(horizontal = 20.dp),
        ) {
            // Live preview next to the name: what the category will look like in lists.
            Row(Modifier.padding(top = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                CategoryBadge(icon, Format.color(color), 56.dp)
                Spacer(Modifier.width(16.dp))
                OutlinedTextField(
                    value = name,
                    onValueChange = { if (it.length <= 50) { name = it; nameError = null } },
                    label = { Text(stringResource(R.string.name)) },
                    isError = nameError != null,
                    supportingText = nameError?.let { { Text(stringResource(it)) } },
                    singleLine = true,
                    modifier = Modifier.weight(1f),
                )
            }

            // Type can only change while nothing uses the category.
            if (isNew || usedBy == 0) {
                Spacer(Modifier.height(16.dp))
                TypeToggle(type, onChange = { type = it })
            }

            Label(R.string.icon)
            val shownIcons = remember(allIcons, icon) {
                if (allIcons) CategoryIcons.all
                else CategoryIcons.all.take(COLLAPSED_ICONS).let { first ->
                    // Keep the chosen icon visible even when it's further down the list.
                    if (first.any { it.first == icon }) first
                    else first.take(COLLAPSED_ICONS - 1) + CategoryIcons.all.first { it.first == icon }
                }
            }
            Column(Modifier.animateContentSize()) {
                EvenGrid(shownIcons, columns = 7) { (key, vector), size ->
                    IconCell(vector, key, selected = key == icon, color = Format.color(color), size = size) { icon = key }
                }
            }
            TextButton(onClick = { allIcons = !allIcons }, modifier = Modifier.padding(top = 4.dp)) {
                Text(
                    if (allIcons) stringResource(R.string.fewer_icons)
                    else stringResource(R.string.more_icons, CategoryIcons.all.size),
                )
                Spacer(Modifier.width(4.dp))
                Icon(if (allIcons) Icons.Default.ExpandLess else Icons.Default.ExpandMore, null, Modifier.size(18.dp))
            }

            Label(R.string.color)
            Row(
                Modifier.fillMaxWidth().clip(MaterialTheme.shapes.small)
                    .border(1.dp, MaterialTheme.colorScheme.outline, MaterialTheme.shapes.small)
                    .clickable { pickColor = true }
                    .padding(horizontal = 14.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                ColorDot(Format.color(color), 28.dp)
                Spacer(Modifier.width(14.dp))
                Text(color, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
                Text(stringResource(R.string.change), color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.labelLarge)
            }

            if (!isNew && usedBy > 0) {
                Row(Modifier.padding(top = 24.dp), verticalAlignment = Alignment.Top) {
                    Icon(Icons.Default.Info, null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(
                        pluralStringResource(R.plurals.category_in_use_info, usedBy, usedBy),
                        style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
            Spacer(Modifier.height(24.dp))
        }
    }

    if (pickColor) ColorSheet(initial = color, onDismiss = { pickColor = false }) { color = it }

    if (confirmDelete) {
        val o = original
        ConfirmDialog(
            title = stringResource(R.string.delete_category_title),
            text = stringResource(R.string.delete_category_text),
            confirmLabel = stringResource(R.string.delete),
            dismissLabel = stringResource(R.string.cancel),
            onDismiss = { confirmDelete = false },
            onConfirm = { if (o != null) scope.launch { dao.delete(o); onDone() } },
            preview = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    CategoryBadge(icon, Format.color(color), 36.dp)
                    Spacer(Modifier.width(12.dp))
                    Text(name, style = MaterialTheme.typography.bodyLarge)
                }
            },
        )
    }
}

@Composable
private fun Label(id: Int) {
    Text(stringResource(id), style = MaterialTheme.typography.titleSmall, modifier = Modifier.padding(top = 24.dp, bottom = 10.dp))
}

@Composable
private fun IconCell(
    vector: androidx.compose.ui.graphics.vector.ImageVector,
    key: String,
    selected: Boolean,
    color: Color,
    size: Dp,
    onClick: () -> Unit,
) {
    val bg = if (selected) color else MaterialTheme.colorScheme.surfaceContainerHighest
    Box(
        Modifier.size(size).clip(CircleShape).background(bg).clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            vector, key,
            tint = if (selected) (if (bg.luminance() > 0.45f) Color(0xFF1B2220) else Color.White)
            else MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(size * 0.5f),
        )
    }
}

/** Presets on top, a free picker below; nothing changes until "Use colour". */
@Composable
fun ColorSheet(initial: String, onDismiss: () -> Unit, onPick: (String) -> Unit) {
    var color by remember { mutableStateOf(initial.uppercase()) }
    var hex by remember { mutableStateOf(initial.uppercase()) }
    var seed by remember { mutableStateOf(0) }
    AppSheet(stringResource(R.string.color), onDismiss) { close ->
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(bottom = 16.dp)) {
            ColorDot(Format.color(color), 40.dp)
            Spacer(Modifier.width(14.dp))
            Text(color, style = MaterialTheme.typography.titleMedium)
        }
        EvenGrid(CATEGORY_PALETTE, columns = 6) { p, size ->
            val selected = p.equals(color, ignoreCase = true)
            Box(
                Modifier.size(size).clip(CircleShape).background(Format.color(p))
                    .border(if (selected) 3.dp else 0.dp, MaterialTheme.colorScheme.onSurface, CircleShape)
                    .clickable { color = p; hex = p; seed++ },
                contentAlignment = Alignment.Center,
            ) {
                if (selected) Icon(
                    Icons.Default.Check, null, modifier = Modifier.size(size * 0.45f),
                    tint = if (Format.color(p).luminance() > 0.45f) Color(0xFF1B2220) else Color.White,
                )
            }
        }
        Row(Modifier.padding(top = 24.dp, bottom = 10.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier.size(20.dp).clip(CircleShape)
                    .background(Brush.sweepGradient((0..6).map { Color.hsv(it * 60f, 0.75f, 0.95f) })),
            )
            Spacer(Modifier.width(8.dp))
            Text(stringResource(R.string.custom_color), style = MaterialTheme.typography.titleSmall)
        }
        androidx.compose.runtime.key(seed) {
            ColorPicker(
                color = Format.color(color),
                description = stringResource(R.string.custom_color),
                onChange = { c -> val h = c.toHexString(); color = h; hex = h },
            )
        }
        OutlinedTextField(
            value = hex,
            onValueChange = { v ->
                hex = v.uppercase().take(7)
                if (Regex("^#[0-9A-F]{6}$").matches(hex)) { color = hex; seed++ }
            },
            label = { Text(stringResource(R.string.color_hex)) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
        )
        Button(
            onClick = { onPick(color); close() },
            modifier = Modifier.fillMaxWidth().padding(top = 20.dp).height(48.dp),
        ) {
            Icon(Icons.Default.Palette, null, Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text(stringResource(R.string.use_color))
        }
    }
}

private fun Color.toHexString(): String =
    "#%02X%02X%02X".format((red * 255).toInt(), (green * 255).toInt(), (blue * 255).toInt())
