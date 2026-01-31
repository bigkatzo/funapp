/**
 * FUN App - Season Selector Component
 * Dropdown for selecting seasons
 */

package com.fun.app.ui.components.common

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.fun.app.data.models.Season

@Composable
fun SeasonSelector(
    seasons: List<Season>,
    currentSeason: Int,
    onSeasonChange: (Int) -> Unit,
    completedSeasons: List<Int> = emptyList(),
    modifier: Modifier = Modifier
) {
    if (seasons.size <= 1) return
    
    var isExpanded by remember { mutableStateOf(false) }
    
    Column(modifier = modifier) {
        // Selected Season Button
        OutlinedButton(
            onClick = { isExpanded = !isExpanded },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.outlinedButtonColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = seasonTitle(seasons, currentSeason),
                    style = MaterialTheme.typography.titleMedium
                )
                
                Icon(
                    imageVector = if (isExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                    contentDescription = if (isExpanded) "Collapse" else "Expand"
                )
            }
        }
        
        // Dropdown Menu
        AnimatedVisibility(
            visible = isExpanded,
            enter = fadeIn() + expandVertically(),
            exit = fadeOut() + shrinkVertically()
        ) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp)
                    .shadow(8.dp, RoundedCornerShape(12.dp)),
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.surface
            ) {
                Column {
                    seasons.forEachIndexed { index, season ->
                        val isSelected = currentSeason == season.seasonNumber
                        val isCompleted = completedSeasons.contains(season.seasonNumber)
                        
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    onSeasonChange(season.seasonNumber)
                                    isExpanded = false
                                }
                                .background(
                                    if (isSelected) Color(0xFF9C27B0).copy(alpha = 0.1f)
                                    else Color.Transparent
                                )
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = seasonTitle(seasons, season.seasonNumber),
                                    style = MaterialTheme.typography.bodyLarge,
                                    color = if (isSelected) Color(0xFF9C27B0) 
                                           else MaterialTheme.colorScheme.onSurface
                                )
                                
                                Text(
                                    text = "${season.episodes.size} episodes",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                if (isCompleted) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = "Completed",
                                        tint = Color(0xFF4CAF50)
                                    )
                                }
                                
                                if (isSelected) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Selected",
                                        tint = Color(0xFF9C27B0)
                                    )
                                }
                            }
                        }
                        
                        if (index < seasons.size - 1) {
                            HorizontalDivider()
                        }
                    }
                }
            }
        }
    }
}

private fun seasonTitle(seasons: List<Season>, seasonNumber: Int): String {
    val season = seasons.find { it.seasonNumber == seasonNumber }
    return season?.title?.takeIf { it.isNotBlank() } ?: "Season $seasonNumber"
}
