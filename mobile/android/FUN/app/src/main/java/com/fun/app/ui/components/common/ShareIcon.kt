package com.fun.app.ui.components.common

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

/**
 * Modern share icon with curved arrow (matches web design)
 * TikTok-style minimalist share button
 */
@Composable
fun ShareIcon(
    onClick: () -> Unit,
    count: Int? = null,
    modifier: Modifier = Modifier
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp),
        modifier = modifier.clickable { onClick() }
    ) {
        Canvas(modifier = Modifier.size(32.dp)) {
            val scale = size.width / 24f
            val path = Path().apply {
                // Box outline
                moveTo(4f * scale, 12f * scale)
                lineTo(4f * scale, 20f * scale)
                cubicTo(
                    4f * scale, 21.1f * scale,
                    4.9f * scale, 22f * scale,
                    6f * scale, 22f * scale
                )
                lineTo(18f * scale, 22f * scale)
                cubicTo(
                    19.1f * scale, 22f * scale,
                    20f * scale, 21.1f * scale,
                    20f * scale, 20f * scale
                )
                lineTo(20f * scale, 12f * scale)
                
                // Arrow polyline
                moveTo(16f * scale, 6f * scale)
                lineTo(12f * scale, 2f * scale)
                lineTo(8f * scale, 6f * scale)
                
                // Vertical line
                moveTo(12f * scale, 2f * scale)
                lineTo(12f * scale, 15f * scale)
            }
            
            drawPath(
                path = path,
                color = Color.White,
                style = Stroke(
                    width = 1.5.dp.toPx(),
                    cap = StrokeCap.Round,
                    join = StrokeJoin.Round
                )
            )
        }
        
        if (count != null && count > 0) {
            Text(
                text = formatCount(count),
                style = MaterialTheme.typography.labelSmall,
                color = Color.White,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

private fun formatCount(count: Int): String {
    return when {
        count >= 1_000_000 -> String.format("%.1fM", count / 1_000_000.0)
        count >= 1_000 -> String.format("%.1fK", count / 1_000.0)
        else -> count.toString()
    }
}
