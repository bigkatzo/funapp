/**
 * FUN App - Unified Watch Screen
 * Supports Discover, Binge, and Series modes
 */

package com.fun.app.ui.screens.watch

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.fun.app.data.models.PlaylistMode
import com.fun.app.ui.components.overlays.ContinuePrompt
import com.fun.app.ui.components.overlays.EpisodeTransition
import com.fun.app.ui.components.overlays.SwipeMenu

@Composable
fun WatchScreen(
    episodeId: String,
    mode: PlaylistMode,
    seriesId: String?,
    navController: NavController,
    modifier: Modifier = Modifier
) {
    val viewModel: WatchViewModel = viewModel(
        factory = WatchViewModelFactory(episodeId, mode, seriesId)
    )
    
    val playlistContext by viewModel.playlistContext.collectAsState()
    val series by viewModel.series.collectAsState()
    val showContinuePrompt by viewModel.showContinuePrompt.collectAsState()
    val showSwipeMenu by viewModel.showSwipeMenu.collectAsState()
    val showTransition by viewModel.showTransition.collectAsState()
    val transitionFrom by viewModel.transitionFrom.collectAsState()
    val transitionTo by viewModel.transitionTo.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadData()
    }
    
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // Video Player
        playlistContext?.let { context ->
            // TODO: Add enhanced video player component
            // EnhancedVerticalVideoPlayer(
            //     context = context,
            //     series = series,
            //     onVideoEnd = viewModel::handleVideoEnd,
            //     onSwipeDown = viewModel::handleSwipeDown,
            //     onSeriesTitleTap = { /* Navigate to series */ },
            //     onBackClick = { navController.navigateUp() },
            //     onNextEpisode = if (context.hasNext) viewModel::handleNextEpisode else null,
            //     onPrevEpisode = if (context.hasPrevious) viewModel::handlePrevEpisode else null
            // )
            
            // Placeholder
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Color.White)
            }
        }
        
        // Continue Prompt
        if (showContinuePrompt && series != null && viewModel.nextEpisode != null) {
            ContinuePrompt(
                series = series!!,
                nextEpisode = viewModel.nextEpisode!!,
                onContinue = {
                    viewModel.hidePrompt()
                    viewModel.switchToBingeMode()
                    viewModel.handleNextEpisode()
                },
                onSkip = {
                    viewModel.hidePrompt()
                    navController.navigateUp()
                }
            )
        }
        
        // Swipe Menu
        if (showSwipeMenu) {
            SwipeMenu(
                hasPrevious = viewModel.hasPrevious(),
                mode = mode,
                onPreviousEpisode = if (viewModel.hasPrevious()) viewModel::handlePrevEpisode else null,
                onBackToDiscover = if (mode == PlaylistMode.BINGE) {
                    { navController.navigate("discover") }
                } else null,
                onBackToSeries = if (mode == PlaylistMode.SERIES && seriesId != null) {
                    { navController.navigate("series/$seriesId") }
                } else null,
                onClose = viewModel::hideSwipeMenu
            )
        }
        
        // Episode Transition
        if (showTransition && transitionFrom != null && transitionTo != null) {
            EpisodeTransition(
                fromEpisode = transitionFrom!!,
                toEpisode = transitionTo!!,
                onComplete = viewModel::handleTransitionComplete
            )
        }
        
        // Mode Badge
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFF9C27B0).copy(alpha = 0.8f)
            ) {
                Text(
                    text = "${mode.name.lowercase().replaceFirstChar { it.uppercase() }} Mode",
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White
                )
            }
        }
    }
}
