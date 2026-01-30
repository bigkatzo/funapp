/**
 * FUN App - Vertical Video Player (Android)
 * TikTok-style vertical paging with ExoPlayer
 */

package com.fun.app.ui.components.player

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.VerticalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.fun.app.data.models.FeedEpisode
import com.fun.app.ui.theme.Background
import kotlinx.coroutines.delay

@Composable
fun VerticalVideoPlayer(
    episodes: List<FeedEpisode>,
    modifier: Modifier = Modifier
) {
    val pagerState = rememberPagerState(pageCount = { episodes.size })
    
    Box(modifier = modifier.fillMaxSize().background(Background)) {
        VerticalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize()
        ) { page ->
            val episode = episodes[page]
            val isActive = pagerState.currentPage == page
            
            VideoPlayerView(
                episode = episode,
                isActive = isActive
            )
        }
    }
    
    // Preload next episode
    LaunchedEffect(pagerState.currentPage) {
        if (pagerState.currentPage < episodes.size - 2) {
            // Trigger preload for next episode
        }
    }
}

@Composable
fun VideoPlayerView(
    episode: FeedEpisode,
    isActive: Boolean,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var showControls by remember { mutableStateOf(true) }
    var showLikeAnimation by remember { mutableStateOf(false) }
    var showUnlockSheet by remember { mutableStateOf(false) }
    
    val playerManager = remember {
        VideoPlayerManager(context)
    }
    
    DisposableEffect(Unit) {
        onDispose {
            playerManager.release()
        }
    }
    
    LaunchedEffect(isActive) {
        if (isActive && episode.episode.videoUrl != null && episode.episode.isUnlocked == true) {
            playerManager.setupPlayer(episode.episode.videoUrl!!)
            playerManager.play()
            
            // Set completion callback
            playerManager.onEpisodeCompleted = {
                // Trigger interstitial ad logic
                // This would be passed down from parent
            }
        } else {
            playerManager.pause()
        }
    }
    
    Box(modifier = modifier.fillMaxSize()) {
        // Video Player or Locked State
        if (episode.episode.isUnlocked == true && episode.episode.videoUrl != null) {
            // ExoPlayer View
            AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        player = playerManager.player
                        useController = false
                        setShutterBackgroundColor(android.graphics.Color.BLACK)
                    }
                },
                modifier = Modifier
                    .fillMaxSize()
                    .pointerInput(Unit) {
                        detectTapGestures(
                            onTap = {
                                showControls = !showControls
                            },
                            onDoubleTap = { offset ->
                                handleDoubleTap(
                                    offset = offset,
                                    size = size,
                                    playerManager = playerManager,
                                    onLike = { showLikeAnimation = true }
                                )
                            }
                        )
                    }
            )
        } else {
            // Locked Episode View
            LockedEpisodeView(
                episode = episode.episode,
                onUnlockClick = { showUnlockSheet = true }
            )
        }
        
        // Like Animation
        if (showLikeAnimation) {
            LikeAnimation()
            
            LaunchedEffect(Unit) {
                delay(1000)
                showLikeAnimation = false
            }
        }
        
        // Player Overlay
        if (showControls) {
            PlayerOverlay(
                episode = episode,
                playerManager = playerManager,
                onLike = { /* Handle like */ },
                onComment = { /* Show comments */ },
                onShare = { /* Show share */ }
            )
        }
        
        // Loading Indicator
        if (playerManager.isBuffering.value) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    modifier = Modifier.size(48.dp),
                    color = Color.White
                )
            }
        }
        
        // Play/Pause Button
        if (showControls && !playerManager.isPlaying.value) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                IconButton(
                    onClick = { playerManager.play() },
                    modifier = Modifier.size(70.dp)
                ) {
                    Icon(
                        imageVector = androidx.compose.material.icons.Icons.Default.PlayArrow,
                        contentDescription = "Play",
                        tint = Color.White.copy(alpha = 0.8f),
                        modifier = Modifier.size(70.dp)
                    )
                }
            }
        }
    }
    
    // Unlock Sheet
    if (showUnlockSheet) {
        UnlockSheet(
            episode = episode.episode,
            seriesId = episode.series.id,
            onDismiss = { showUnlockSheet = false }
        )
    }
}

private fun handleDoubleTap(
    offset: androidx.compose.ui.geometry.Offset,
    size: androidx.compose.ui.unit.IntSize,
    playerManager: VideoPlayerManager,
    onLike: () -> Unit
) {
    val screenWidth = size.width.toFloat()
    
    when {
        offset.x < screenWidth / 3 -> {
            // Left side - rewind 10s
            playerManager.seekBy(-10000)
        }
        offset.x > screenWidth * 2 / 3 -> {
            // Right side - forward 10s
            playerManager.seekBy(10000)
        }
        else -> {
            // Center - like
            onLike()
        }
    }
}
