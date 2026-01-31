/**
 * FUN App - Episode Transition Animation
 * Smooth animation between episodes
 */

package com.fun.app.ui.components.overlays

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.fun.app.data.models.Episode
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun EpisodeTransition(
    fromEpisode: Episode,
    toEpisode: Episode,
    onComplete: () -> Unit,
    modifier: Modifier = Modifier
) {
    var phase by remember { mutableStateOf(TransitionPhase.START) }
    var progress by remember { mutableFloatStateOf(0f) }
    val scope = rememberCoroutineScope()
    
    LaunchedEffect(Unit) {
        scope.launch {
            // Phase 1: Show from episode
            delay(200)
            phase = TransitionPhase.SHOWING
            
            // Animate progress
            while (progress < 1f) {
                delay(10)
                progress += 0.02f
            }
            
            // Phase 2: Complete
            delay(300)
            phase = TransitionPhase.COMPLETE
            onComplete()
        }
    }
    
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(32.dp),
            modifier = Modifier.padding(24.dp)
        ) {
            // From Episode (fading out)
            AnimatedVisibility(
                visible = phase == TransitionPhase.START,
                enter = fadeIn() + slideInVertically(),
                exit = fadeOut() + slideOutVertically()
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Now leaving",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White.copy(alpha = 0.6f)
                    )
                    Text(
                        text = fromEpisode.title,
                        style = MaterialTheme.typography.bodyLarge,
                        color = Color.White.copy(alpha = 0.8f),
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            
            // Arrow indicator
            Icon(
                imageVector = Icons.Default.ArrowDownward,
                contentDescription = null,
                modifier = Modifier.size(48.dp),
                tint = Color(0xFF9C27B0) // Purple
            )
            
            // To Episode (fading in)
            AnimatedVisibility(
                visible = phase == TransitionPhase.SHOWING,
                enter = fadeIn() + slideInVertically(),
                exit = fadeOut()
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Up next",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White.copy(alpha = 0.6f)
                    )
                    Text(
                        text = toEpisode.title,
                        style = MaterialTheme.typography.headlineSmall,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "S${toEpisode.seasonNumber}E${toEpisode.episodeNumber}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF9C27B0) // Purple
                    )
                }
            }
            
            // Loading bar
            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier.width(200.dp),
                color = Color(0xFF9C27B0), // Purple
                trackColor = Color.White.copy(alpha = 0.2f)
            )
        }
    }
}

private enum class TransitionPhase {
    START, SHOWING, COMPLETE
}
