package com.vu4ll.monedsa.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Close
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Composable
fun ColorDot(color: Color, size: Dp = 12.dp) {
    Box(Modifier.size(size).background(color, CircleShape))
}

/** The category's own colour with its icon; the glyph switches dark/light for contrast. */
@Composable
fun CategoryBadge(icon: String, color: Color, size: Dp = 40.dp) {
    Box(Modifier.size(size).background(color, CircleShape), contentAlignment = Alignment.Center) {
        Icon(
            CategoryIcons.get(icon), null,
            tint = if (color.luminance() > 0.45f) Color(0xFF1B2220) else Color.White,
            modifier = Modifier.size(size * 0.55f),
        )
    }
}

/** Grid that always fills the row: cells share the width evenly, no ragged right edge. */
@Composable
fun <T> EvenGrid(
    items: List<T>,
    columns: Int,
    gap: Dp = 8.dp,
    cell: @Composable (item: T, size: Dp) -> Unit,
) {
    androidx.compose.foundation.layout.BoxWithConstraints {
        val size = (maxWidth - gap * (columns - 1)) / columns
        androidx.compose.foundation.layout.Column(verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(gap)) {
            items.chunked(columns).forEach { row ->
                androidx.compose.foundation.layout.Row(horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(gap)) {
                    row.forEach { cell(it, size) }
                }
            }
        }
    }
}

/**
 * The one category order used everywhere: alphabetical by the device language's
 * rules, so "Ç", "İ" or "é" sort where a reader expects, not after "z".
 */
fun List<com.vu4ll.monedsa.data.CategoryEntity>.sortedForDisplay(): List<com.vu4ll.monedsa.data.CategoryEntity> {
    val collator = java.text.Collator.getInstance(java.util.Locale.getDefault()).apply { strength = java.text.Collator.SECONDARY }
    return sortedWith { a, b -> collator.compare(a.name.trim(), b.name.trim()) }
}

/**
 * Looks like a text field, opens a picker. Used for category and date choices so
 * every "tap to choose" control in the app looks the same.
 */
@Composable
fun SelectField(
    text: String?,
    placeholder: String,
    onClick: () -> Unit,
    leading: (@Composable () -> Unit)? = null,
    isError: Boolean = false,
    onClear: (() -> Unit)? = null,
) {
    val scheme = androidx.compose.material3.MaterialTheme.colorScheme
    androidx.compose.foundation.layout.Row(
        Modifier.fillMaxWidth().clip(androidx.compose.material3.MaterialTheme.shapes.small)
            .border(1.dp, if (isError) scheme.error else scheme.outline, androidx.compose.material3.MaterialTheme.shapes.small)
            .clickable(onClick = onClick)
            .padding(start = 14.dp, end = 6.dp, top = 6.dp, bottom = 6.dp)
            .height(44.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (leading != null) {
            leading()
            Spacer(Modifier.width(12.dp))
        }
        androidx.compose.material3.Text(
            text ?: placeholder,
            style = androidx.compose.material3.MaterialTheme.typography.bodyLarge,
            color = if (text == null) scheme.onSurfaceVariant else scheme.onSurface,
            maxLines = 1,
            overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f),
        )
        if (onClear != null && text != null) {
            androidx.compose.material3.IconButton(onClick = onClear) {
                Icon(androidx.compose.material.icons.Icons.Default.Close, null, tint = scheme.onSurfaceVariant)
            }
        } else {
            Icon(
                androidx.compose.material.icons.Icons.Default.ArrowDropDown, null,
                tint = scheme.onSurfaceVariant, modifier = Modifier.padding(end = 8.dp),
            )
        }
    }
}
