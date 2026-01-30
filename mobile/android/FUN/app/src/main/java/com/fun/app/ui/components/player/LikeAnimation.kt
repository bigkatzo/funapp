/**
 * FUN App - Like Animation
 * Heart animation on double-tap
 */

package com.fun.app.ui.components.player

import androidx.compose.animation.core.*
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp

@Composable
fun LikeAnimation() {
    var scale by remember { mutableStateOf(0.5f) }
    var alpha by remember { mutableStateOf(0f) }
    
    LaunchedEffect(Unit) {
        // Scale up and fade in
        animate(
            initialValue = 0.5f,
            targetValue = 1.2f,
            animationSpec = spring(
                dampingRatio = 0.6f,
                stiffness = Spring.StiffnessLow
            )
        ) { value, _ ->
            scale = value
        }
        
        animate(
            initialValue = 0f,
            targetValue = 1f,
            animationSpec = tween(300)
        ) { value, _ ->
            alpha = value
        }
        
        // Wait a bit
        kotlinx.coroutines.delay(500)
        
        // Scale up more and fade out
        animate(
            initialValue = 1.2f,
            targetValue = 1.5f,
            animationSpec = tween(300)
        ) { value, _ ->
            scale = value
        }
        
        animate(
            initialValue = 1f,
            targetValue = 0f,
            animationSpec = tween(300)
        ) { value, _ ->
            alpha = value
        }
    }
    
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = Icons.Default.Favorite,
            contentDescription = null,
            tint = Color.Red,
            modifier = Modifier
                .size(100.dp)
                .scale(scale)
                .graphicsLayer(alpha = alpha)
        )
    }
}
