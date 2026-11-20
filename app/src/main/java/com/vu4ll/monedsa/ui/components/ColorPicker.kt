package com.vu4ll.monedsa.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.material3.MaterialTheme

private fun hsv(h: Float, s: Float, v: Float) = Color.hsv(h.coerceIn(0f, 360f), s.coerceIn(0f, 1f), v.coerceIn(0f, 1f))

/** Hue bar + saturation/brightness square. Drawn with Canvas, no extra library. */
@Composable
fun ColorPicker(color: Color, onChange: (Color) -> Unit, description: String) {
    val start = remember { FloatArray(3).also { android.graphics.Color.colorToHSV(android.graphics.Color.argb(255, (color.red * 255).toInt(), (color.green * 255).toInt(), (color.blue * 255).toInt()), it) } }
    var h by remember { mutableStateOf(start[0]) }
    var s by remember { mutableStateOf(start[1]) }
    var v by remember { mutableStateOf(start[2]) }
    val emit by rememberUpdatedState(onChange)
    val outline = MaterialTheme.colorScheme.onSurface

    Column(Modifier.semantics { contentDescription = description }) {
        Canvas(
            Modifier.fillMaxWidth().height(160.dp).clip(MaterialTheme.shapes.medium)
                .pointerInput(Unit) {
                    fun set(p: Offset) {
                        s = (p.x / size.width).coerceIn(0f, 1f); v = 1f - (p.y / size.height).coerceIn(0f, 1f)
                        emit(hsv(h, s, v))
                    }
                    detectTapGestures { set(it) }
                }
                .pointerInput(Unit) {
                    detectDragGestures { change, _ ->
                        val p = change.position
                        s = (p.x / size.width).coerceIn(0f, 1f); v = 1f - (p.y / size.height).coerceIn(0f, 1f)
                        emit(hsv(h, s, v))
                    }
                },
        ) {
            drawRect(Brush.horizontalGradient(listOf(Color.White, hsv(h, 1f, 1f))))
            drawRect(Brush.verticalGradient(listOf(Color.Transparent, Color.Black)))
            val r = 13.dp.toPx()
            // Keep the ring fully visible at the edges.
            val c = Offset((s * size.width).coerceIn(r, size.width - r), ((1f - v) * size.height).coerceIn(r, size.height - r))
            drawCircle(Color.White, radius = 11.dp.toPx(), center = c, style = Stroke(3.dp.toPx()))
            drawCircle(Color.Black.copy(alpha = 0.4f), radius = 13.dp.toPx(), center = c, style = Stroke(1.dp.toPx()))
        }
        Spacer(Modifier.height(14.dp))
        Canvas(
            Modifier.fillMaxWidth().height(28.dp)
                .pointerInput(Unit) {
                    detectTapGestures { h = (it.x / size.width).coerceIn(0f, 1f) * 360f; emit(hsv(h, s, v)) }
                }
                .pointerInput(Unit) {
                    detectDragGestures { change, _ ->
                        h = (change.position.x / size.width).coerceIn(0f, 1f) * 360f; emit(hsv(h, s, v))
                    }
                },
        ) {
            val stops = (0..6).map { hsv(it * 60f, 1f, 1f) }
            drawRoundRect(Brush.horizontalGradient(stops), cornerRadius = CornerRadius(size.height / 2))
            val x = (h / 360f) * size.width
            drawCircle(hsv(h, 1f, 1f), radius = size.height / 2 - 2.dp.toPx(), center = Offset(x.coerceIn(size.height / 2, size.width - size.height / 2), size.height / 2))
            drawCircle(outline, radius = size.height / 2 - 2.dp.toPx(), center = Offset(x.coerceIn(size.height / 2, size.width - size.height / 2), size.height / 2), style = Stroke(2.dp.toPx()))
        }
    }
}
