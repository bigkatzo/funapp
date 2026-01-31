/**
 * FUN App - Enhanced Vertical Video Player for Watch Screen
 * TikTok-style player with Discover/Binge/Series modes and gesture controls
 */

package com.fun.app.ui.components.video

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import coil.compose.AsyncImage
import com.fun.app.data.models.Episode
import com.fun.app.data.models.PlaylistContext
import com.fun.app.data.models.Series
import com.fun.app.ui.components.common.ShareIcon
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

enum class SeekDirection {
    FORWARD, BACKWARD
}

@Composable
fun EnhancedVerticalVideoPlayer(
    context: PlaylistContext,
    series: Series?,
    onVideoEnd: () -> Unit,
    onSwipeDown: () -> Unit,
    onSeriesTitleTap: () -> Unit,
    onBackClick: () -> Unit,
    onNextEpisode: (() -> Unit)?,
    onPrevEpisode: (() -> Unit)?,
    modifier: Modifier = Modifier
) {
    val currentEpisode = context.currentEpisode ?: return
    
    // Setup ExoPlayer
    val exoPlayer = rememberExoPlayer(currentEpisode.videoUrl)
    val playerState = rememberExoPlayerState(exoPlayer)
    
    // UI state
    var showControls by remember { mutableStateOf(true) }
    var showSeekAnimation by remember { mutableStateOf<SeekDirection?>(null) }
    var isLongPressing by remember { mutableStateOf(false) }
    var speedLocked by remember { mutableStateOf(false) }
    var isUnlocking by remember { mutableStateOf(false) }
    var isMuted by remember { mutableStateOf(false) }
    var isSeeking by remember { mutableStateOf(false) }
    var seekTime by remember { mutableStateOf(0L) }
    val coroutineScope = rememberCoroutineScope()
    var longPressJob: kotlinx.coroutines.Job? by remember { mutableStateOf(null) }
    var lockJob: kotlinx.coroutines.Job? by remember { mutableStateOf(null) }
    var unlockJob: kotlinx.coroutines.Job? by remember { mutableStateOf(null) }
    
    // Auto-hide controls
    LaunchedEffect(showControls, playerState.isPlaying) {
        if (showControls && playerState.isPlaying) {
            delay(3000)
            showControls = false
        }
    }
    
    // Handle video end
    LaunchedEffect(playerState.isPlaying, playerState.currentPosition, playerState.duration) {
        if (playerState.duration > 0 && 
            playerState.currentPosition >= playerState.duration - 500) {
            onVideoEnd()
        }
    }
    
    Box(modifier = modifier.fillMaxSize().background(Color.Black)) {
        // ExoPlayer View
        if (currentEpisode.isUnlocked == true && currentEpisode.videoUrl != null) {
            AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        player = exoPlayer
                        useController = false
                        setShutterBackgroundColor(android.graphics.Color.BLACK)
                    }
                },
                modifier = Modifier.fillMaxSize()
            )
            
            // Gesture capture overlay
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .pointerInput(Unit) {
                        detectTapGestures(
                            onTap = { offset ->
                                // Single tap now toggles play/pause
                                if (playerState.isPlaying) {
                                    exoPlayer.pause()
                                } else {
                                    exoPlayer.play()
                                }
                                // Also show controls briefly
                                showControls = true
                            },
                            onDoubleTap = { offset ->
                                // Double tap for seek (5 seconds)
                                val screenWidth = size.width.toFloat()
                                
                                when {
                                    offset.x < screenWidth / 3 -> {
                                        // Left third - rewind 5s
                                        exoPlayer.seekTo(
                                            (exoPlayer.currentPosition - 5000)
                                                .coerceAtLeast(0)
                                        )
                                        showSeekAnimation = SeekDirection.BACKWARD
                                        coroutineScope.launch {
                                            delay(500)
                                            showSeekAnimation = null
                                        }
                                    }
                                    offset.x > screenWidth * 2 / 3 -> {
                                        // Right third - forward 5s
                                        exoPlayer.seekTo(
                                            (exoPlayer.currentPosition + 5000)
                                                .coerceAtMost(exoPlayer.duration)
                                        )
                                        showSeekAnimation = SeekDirection.FORWARD
                                        coroutineScope.launch {
                                            delay(500)
                                            showSeekAnimation = null
                                        }
                                    }
                                }
                            },
                            onLongPress = {
                                if (speedLocked) {
                                    // Start unlock process (2 seconds)
                                    isUnlocking = true
                                    unlockJob = coroutineScope.launch {
                                        delay(2000)
                                        speedLocked = false
                                        isLongPressing = false
                                        isUnlocking = false
                                        exoPlayer.setPlaybackSpeed(1.0f)
                                    }
                                } else {
                                    // Start 2x speed and begin lock timer
                                    isLongPressing = true
                                    exoPlayer.setPlaybackSpeed(2.0f)
                                    
                                    // Lock after 3 seconds
                                    lockJob = coroutineScope.launch {
                                        delay(3000)
                                        speedLocked = true
                                    }
                                }
                            },
                            onPress = {
                                tryAwaitRelease()
                                // Cancel all timers
                                longPressJob?.cancel()
                                lockJob?.cancel()
                                unlockJob?.cancel()
                                
                                // If was unlocking, cancel it
                                if (isUnlocking) {
                                    isUnlocking = false
                                    return@detectTapGestures
                                }
                                
                                // If not locked and was pressing, return to normal
                                if (isLongPressing && !speedLocked) {
                                    isLongPressing = false
                                    exoPlayer.setPlaybackSpeed(1.0f)
                                }
                            }
                        )
                    }
            )
        } else {
            // Locked episode placeholder
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Lock,
                        contentDescription = "Locked",
                        tint = Color.White,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Episode Locked",
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.White
                    )
                }
            }
        }
        
        // Seek animations
        if (showSeekAnimation == SeekDirection.BACKWARD) {
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(0.33f)
                    .align(Alignment.CenterStart),
                contentAlignment = Alignment.Center
            ) {
                Surface(
                    shape = RoundedCornerShape(50),
                    color = Color.Black.copy(alpha = 0.6f),
                    modifier = Modifier.size(80.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.FastRewind,
                        contentDescription = "Rewind",
                        tint = Color.White,
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(20.dp)
                    )
                }
            }
        }
        
        if (showSeekAnimation == SeekDirection.FORWARD) {
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(0.33f)
                    .align(Alignment.CenterEnd),
                contentAlignment = Alignment.Center
            ) {
                Surface(
                    shape = RoundedCornerShape(50),
                    color = Color.Black.copy(alpha = 0.6f),
                    modifier = Modifier.size(80.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.FastForward,
                        contentDescription = "Forward",
                        tint = Color.White,
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(20.dp)
                    )
                }
            }
        }
        
        // Speed indicator
        if (isLongPressing || speedLocked || isUnlocking) {
            Box(
                modifier = Modifier
                    .align(Alignment.Center),
                contentAlignment = Alignment.Center
            ) {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color.Black.copy(alpha = 0.7f)
                ) {
                    Text(
                        text = when {
                            isUnlocking -> "Unlocking..."
                            speedLocked -> "2x Speed (Locked)"
                            else -> "2x Speed"
                        },
                        modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp),
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
        
        // Interactive Seek Bar at Bottom - Only when controls shown
        if (showControls) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.BottomCenter)
                    .padding(16.dp)
                    .padding(bottom = 100.dp)
            ) {
                // Episode info - 2 lines (moved above seek bar, clickable)
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSeriesTitleTap() }
                        .padding(bottom = 12.dp)
                ) {
                    Text(
                        text = currentEpisode.title,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                    
                    Text(
                        text = "${series?.title ?: ""} • S${currentEpisode.seasonNumber}E${currentEpisode.episodeNumber}",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White.copy(alpha = 0.8f),
                        maxLines = 1
                    )
                }
                
                // Seek slider with time bubble
                Box(modifier = Modifier.fillMaxWidth()) {
                    // Time bubble (shows while seeking)
                    if (isSeeking) {
                        Text(
                            text = formatTime(seekTime),
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.Black,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier
                                .offset(
                                    x = (300 * playerState.progress).dp,
                                    y = (-40).dp
                                )
                                .background(Color.White, RoundedCornerShape(8.dp))
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                                .shadow(4.dp, RoundedCornerShape(8.dp))
                        )
                    }
                    
                    Slider(
                        value = playerState.progress,
                        onValueChange = { newProgress ->
                            isSeeking = true
                            val newPosition = (playerState.duration * newProgress).toLong()
                            seekTime = newPosition
                            // Real-time scrubbing
                            exoPlayer.seekTo(newPosition)
                        },
                        onValueChangeFinished = {
                            isSeeking = false
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(40.dp), // Larger touch target
                        colors = SliderDefaults.colors(
                            thumbColor = Color.White,
                            activeTrackColor = Color.White,
                            inactiveTrackColor = Color.White.copy(alpha = 0.3f)
                        )
                    )
                }
            }
        }
        
        // Social Actions & Navigation - Always Visible
        Column(
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .padding(end = 16.dp, bottom = 120.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Profile Bubble (TikTok-style)
            series?.let {
                Box(
                    modifier = Modifier.size(48.dp),
                    contentAlignment = Alignment.BottomCenter
                ) {
                    AsyncImage(
                        model = it.thumbnailUrl,
                        contentDescription = "Series",
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .clickable { onSeriesTitleTap() }
                    )
                    
                    // White border
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .then(Modifier.background(Color.Transparent))
                    )
                    
                    // Plus icon overlay
                    Box(
                        modifier = Modifier
                            .size(20.dp)
                            .offset(y = 8.dp)
                            .background(Color.Red, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Follow",
                            tint = Color.White,
                            modifier = Modifier.size(12.dp)
                        )
                    }
                }
            }
            
            // Like - Minimalist (NO background)
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.clickable { /* TODO: Like */ }
            ) {
                Icon(
                    imageVector = if (currentEpisode.isLiked == true) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                    contentDescription = "Like",
                    tint = if (currentEpisode.isLiked == true) Color.Red else Color.White,
                    modifier = Modifier
                        .size(32.dp)
                        .shadow(2.dp)
                )
                
                Text(
                    text = formatCount(currentEpisode.stats?.likes ?: 0),
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
            }
            
            // Comment - Minimalist (NO background)
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.clickable { /* TODO: Comment */ }
            ) {
                Icon(
                    imageVector = Icons.Default.Comment,
                    contentDescription = "Comment",
                    tint = Color.White,
                    modifier = Modifier
                        .size(32.dp)
                        .shadow(2.dp)
                )
                
                Text(
                    text = formatCount(currentEpisode.stats?.comments ?: 0),
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
            }
            
            // Share - Modern curved arrow
            ShareIcon(
                onClick = { /* TODO: Share */ },
                modifier = Modifier
            )
            
            // Navigation arrows - Minimalist
            if (context.hasPrevious && onPrevEpisode != null) {
                Divider(
                    modifier = Modifier
                        .width(28.dp)
                        .padding(vertical = 8.dp),
                    color = Color.White.copy(alpha = 0.3f)
                )
                
                Icon(
                    imageVector = Icons.Default.KeyboardArrowUp,
                    contentDescription = "Previous",
                    tint = Color.White,
                    modifier = Modifier
                        .size(32.dp)
                        .shadow(2.dp)
                        .clickable { onPrevEpisode() }
                )
            }
            
            if (context.hasNext && onNextEpisode != null) {
                if (!context.hasPrevious) {
                    Divider(
                        modifier = Modifier
                            .width(28.dp)
                            .padding(vertical = 8.dp),
                        color = Color.White.copy(alpha = 0.3f)
                    )
                }
                
                Icon(
                    imageVector = Icons.Default.KeyboardArrowDown,
                    contentDescription = "Next",
                    tint = Color.White,
                    modifier = Modifier
                        .size(32.dp)
                        .shadow(2.dp)
                        .clickable { onNextEpisode() }
                )
            }
        }
        
        // Controls overlay - Top bar with Back, Episode counter, Mute
        if (showControls) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.TopStart)
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                // Left: Back button
                IconButton(onClick = onBackClick) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White
                    )
                }
                
                // Right: Episode counter + Mute button
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Episode counter
                    if (context.currentIndex > 0 && context.totalEpisodes > 0) {
                        Text(
                            text = "${context.currentIndex}/${context.totalEpisodes}",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier
                                .background(Color.Black.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                    
                    // Mute button (TikTok-style)
                    IconButton(onClick = { 
                        isMuted = !isMuted
                        exoPlayer.volume = if (isMuted) 0f else 1f
                    }) {
                        Icon(
                            imageVector = if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                            contentDescription = if (isMuted) "Unmute" else "Mute",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
        
        // Center play button when paused
        if (!playerState.isPlaying && showControls) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Surface(
                    shape = RoundedCornerShape(50),
                    color = Color.White.copy(alpha = 0.2f),
                    modifier = Modifier.size(80.dp)
                ) {
                    IconButton(
                        onClick = { exoPlayer.play() },
                        modifier = Modifier.fillMaxSize()
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = "Play",
                            tint = Color.White,
                            modifier = Modifier.size(40.dp)
                        )
                    }
                }
            }
        }
    }
    
    // Cleanup
    DisposableEffect(Unit) {
        onDispose {
            exoPlayer.release()
        }
    }
}

private fun formatTime(millis: Long): String {
    val seconds = (millis / 1000).toInt()
    val mins = seconds / 60
    val secs = seconds % 60
    return "$mins:${secs.toString().padStart(2, '0')}"
}

private fun formatCount(count: Int): String {
    return when {
        count >= 1_000_000 -> String.format("%.1fM", count / 1_000_000.0)
        count >= 1_000 -> String.format("%.1fK", count / 1_000.0)
        else -> count.toString()
    }
}
