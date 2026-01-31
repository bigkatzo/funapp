/**
 * FUN App - Swipe Menu
 * Navigation menu shown on swipe down in Binge/Series modes
 */

package com.fun.app.ui.components.overlays

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.fun.app.data.models.PlaylistMode

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SwipeMenu(
    hasPrevious: Boolean,
    mode: PlaylistMode,
    onPreviousEpisode: (() -> Unit)?,
    onBackToDiscover: (() -> Unit)?,
    onBackToSeries: (() -> Unit)?,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.6f)),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 32.dp),
            shape = RoundedCornerShape(20.dp),
            color = Color.White.copy(alpha = 0.1f)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Where would you like to go?",
                    style = MaterialTheme.typography.titleLarge,
                    color = Color.White
                )
                
                // Previous Episode
                if (hasPrevious && onPreviousEpisode != null) {
                    Button(
                        onClick = {
                            onPreviousEpisode()
                            onClose()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color.White.copy(alpha = 0.2f)
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.KeyboardArrowUp, contentDescription = null)
                            Text("Previous Episode", style = MaterialTheme.typography.titleMedium)
                        }
                    }
                }
                
                // Back to Discover
                if (mode == PlaylistMode.BINGE && onBackToDiscover != null) {
                    OutlinedButton(
                        onClick = {
                            onBackToDiscover()
                            onClose()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Color.White,
                            containerColor = Color.White.copy(alpha = 0.1f)
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.3f)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Home, contentDescription = null)
                            Text("Back to Discover", style = MaterialTheme.typography.titleMedium)
                        }
                    }
                }
                
                // Back to Series
                if (mode == PlaylistMode.SERIES && onBackToSeries != null) {
                    OutlinedButton(
                        onClick = {
                            onBackToSeries()
                            onClose()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Color.White,
                            containerColor = Color.White.copy(alpha = 0.1f)
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.3f)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.ArrowBack, contentDescription = null)
                            Text("Back to Series", style = MaterialTheme.typography.titleMedium)
                        }
                    }
                }
                
                // Cancel
                TextButton(
                    onClick = onClose,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        "Cancel",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                }
            }
        }
    }
}
