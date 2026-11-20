package com.vu4ll.monedsa.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Surface
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Info
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.window.Dialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

/*
 * One modal language for the whole app: bottom sheets for choosing and editing,
 * a dialog only to confirm something destructive. Same surface, title style,
 * spacing and row style everywhere.
 */

/**
 * Bottom sheet with the app's title style. [content] gets `close`, which plays
 * the hide animation and then calls [onDismiss].
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppSheet(
    title: String,
    onDismiss: () -> Unit,
    subtitle: String? = null,
    /** Optional icon action shown at the right of the title (e.g. "clear"). Gets `close` too. */
    titleAction: (@Composable (close: () -> Unit) -> Unit)? = null,
    content: @Composable ColumnScope.(close: () -> Unit) -> Unit,
) {
    val state = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val scope = rememberCoroutineScope()
    val close: () -> Unit = { scope.launch { state.hide() }.invokeOnCompletion { onDismiss() } }
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = state,
        containerColor = MaterialTheme.colorScheme.surfaceContainerLow,
        tonalElevation = 0.dp,
        // M3's default handle pads 22dp above and below, which leaves a big gap over the title.
        dragHandle = {
            Box(Modifier.fillMaxWidth().padding(top = 10.dp, bottom = 6.dp), contentAlignment = Alignment.Center) {
                Box(
                    Modifier.size(width = 32.dp, height = 4.dp).clip(CircleShape)
                        .background(MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)),
                )
            }
        },
    ) {
        Column(
            Modifier.verticalScroll(rememberScrollState()).padding(start = 24.dp, end = 24.dp, bottom = 24.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(title, style = MaterialTheme.typography.headlineSmall, modifier = Modifier.weight(1f))
                titleAction?.invoke(close)
            }
            if (subtitle != null) Text(
                subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 4.dp),
            )
            Spacer(Modifier.height(12.dp))
            content(close)
        }
    }
}

/** A choice inside a sheet: the selected one gets a brass tint and a check, no radio buttons. */
@Composable
fun OptionRow(
    title: String,
    selected: Boolean,
    onClick: () -> Unit,
    subtitle: String? = null,
    leading: (@Composable () -> Unit)? = null,
) {
    val bg = if (selected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent
    val fg = if (selected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface
    Row(
        Modifier.fillMaxWidth().clip(MaterialTheme.shapes.medium).background(bg)
            .clickable(role = Role.RadioButton, onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (leading != null) {
            leading()
            Spacer(Modifier.width(14.dp))
        }
        Column(Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.bodyLarge, color = fg, maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (subtitle != null) Text(
                subtitle, style = MaterialTheme.typography.bodySmall,
                color = if (selected) fg.copy(alpha = 0.8f) else MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        if (selected) Icon(Icons.Default.Check, null, tint = fg, modifier = Modifier.size(20.dp))
    }
}

/** Round icon badge at the start of an [OptionRow]; filled with brass when selected. */
@Composable
fun OptionIcon(icon: ImageVector, selected: Boolean) {
    val scheme = MaterialTheme.colorScheme
    Box(
        Modifier.size(36.dp).clip(CircleShape)
            .background(if (selected) scheme.primary else scheme.surfaceContainerHighest),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, null, tint = if (selected) scheme.onPrimary else scheme.onSurfaceVariant, modifier = Modifier.size(20.dp))
    }
}

/** Single-choice list in a sheet; picking closes it. */
@Composable
fun <T> ChoiceSheet(
    title: String,
    options: List<T>,
    selected: T,
    label: @Composable (T) -> String,
    onDismiss: () -> Unit,
    subtitle: @Composable (T) -> String? = { null },
    icon: ((T) -> ImageVector)? = null,
    onPick: (T) -> Unit,
) {
    AppSheet(title, onDismiss) { close ->
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            options.forEach { o ->
                val isSelected = o == selected
                OptionRow(
                    label(o), selected = isSelected, subtitle = subtitle(o),
                    leading = icon?.let { { OptionIcon(it(o), isSelected) } },
                    onClick = { onPick(o); close() },
                )
            }
        }
    }
}

/** Secondary + primary button pair at the bottom of a sheet. */
@Composable
fun SheetActions(
    primary: String,
    onPrimary: () -> Unit,
    secondary: String? = null,
    onSecondary: () -> Unit = {},
    primaryEnabled: Boolean = true,
) {
    Row(Modifier.fillMaxWidth().padding(top = 20.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        if (secondary != null) OutlinedButton(onClick = onSecondary, modifier = Modifier.weight(1f).height(48.dp)) { Text(secondary) }
        Button(onClick = onPrimary, enabled = primaryEnabled, modifier = Modifier.weight(1f).height(48.dp)) { Text(primary) }
    }
}

/**
 * Confirmation for actions that can't be undone: an icon that says what kind of
 * action this is, a short explanation, an optional preview of what is affected,
 * and a clearly red confirm button next to a neutral cancel.
 */
@Composable
fun ConfirmDialog(
    title: String,
    text: String,
    confirmLabel: String,
    dismissLabel: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
    destructive: Boolean = true,
    icon: ImageVector = if (destructive) Icons.Outlined.Delete else Icons.Outlined.Info,
    preview: (@Composable () -> Unit)? = null,
) {
    val scheme = MaterialTheme.colorScheme
    Dialog(onDismissRequest = onDismiss) {
        Surface(shape = MaterialTheme.shapes.extraLarge, color = scheme.surfaceContainerLow) {
            Column(
                Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Box(
                    Modifier.size(56.dp).clip(CircleShape)
                        .background(if (destructive) scheme.errorContainer else scheme.primaryContainer),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(icon, null, tint = if (destructive) scheme.error else scheme.onPrimaryContainer, modifier = Modifier.size(28.dp))
                }
                Spacer(Modifier.height(16.dp))
                Text(title, style = MaterialTheme.typography.headlineSmall, textAlign = TextAlign.Center)
                Spacer(Modifier.height(8.dp))
                Text(
                    text, style = MaterialTheme.typography.bodyMedium, color = scheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                )
                if (preview != null) {
                    Spacer(Modifier.height(16.dp))
                    Box(
                        Modifier.fillMaxWidth().clip(MaterialTheme.shapes.medium)
                            .background(scheme.surfaceContainerHighest).padding(12.dp),
                    ) { preview() }
                }
                Spacer(Modifier.height(24.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f).height(48.dp)) { Text(dismissLabel) }
                    Button(
                        onClick = onConfirm,
                        modifier = Modifier.weight(1f).height(48.dp),
                        colors = if (destructive) ButtonDefaults.buttonColors(
                            containerColor = scheme.error, contentColor = scheme.onError,
                        ) else ButtonDefaults.buttonColors(),
                    ) { Text(confirmLabel) }
                }
            }
        }
    }
}
