package com.vu4ll.monedsa.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingDown
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.vu4ll.monedsa.R
import com.vu4ll.monedsa.data.TxType
import com.vu4ll.monedsa.ui.theme.LocalMoneyColors

/** One option in [SegmentedPills]; [selectedBg]/[selectedFg] colour it when chosen. */
data class Segment(
    val label: String,
    val icon: ImageVector? = null,
    val selectedBg: Color,
    val selectedFg: Color,
)

/** A rounded track with one filled pill per selected option. */
@Composable
fun SegmentedPills(segments: List<Segment>, selected: Int, onSelect: (Int) -> Unit, modifier: Modifier = Modifier) {
    val scheme = MaterialTheme.colorScheme
    Row(
        modifier.fillMaxWidth().height(52.dp).clip(CircleShape)
            .border(1.dp, scheme.outline, CircleShape).padding(4.dp).selectableGroup(),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        segments.forEachIndexed { i, seg ->
            val on = i == selected
            val bg by animateColorAsState(if (on) seg.selectedBg else Color.Transparent, label = "bg$i")
            val fg by animateColorAsState(if (on) seg.selectedFg else scheme.onSurfaceVariant, label = "fg$i")
            Box(
                Modifier.weight(1f).fillMaxHeight().clip(CircleShape).background(bg)
                    .selectable(selected = on, role = Role.RadioButton, onClick = { onSelect(i) }),
                contentAlignment = Alignment.Center,
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(horizontal = 8.dp)) {
                    if (seg.icon != null) {
                        Icon(seg.icon, null, tint = fg, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(6.dp))
                    }
                    Text(seg.label, color = fg, style = MaterialTheme.typography.labelLarge, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }
        }
    }
}

/** Expense / income switch: red when expense is chosen, green for income. */
@Composable
fun TypeToggle(type: TxType, onChange: (TxType) -> Unit, modifier: Modifier = Modifier) {
    val m = LocalMoneyColors.current
    SegmentedPills(
        segments = listOf(
            Segment(stringResource(R.string.expense), Icons.AutoMirrored.Filled.TrendingDown, m.expenseContainer, m.onExpenseContainer),
            Segment(stringResource(R.string.income), Icons.AutoMirrored.Filled.TrendingUp, m.incomeContainer, m.onIncomeContainer),
        ),
        selected = if (type == TxType.EXPENSE) 0 else 1,
        onSelect = { onChange(if (it == 0) TxType.EXPENSE else TxType.INCOME) },
        modifier = modifier,
    )
}
