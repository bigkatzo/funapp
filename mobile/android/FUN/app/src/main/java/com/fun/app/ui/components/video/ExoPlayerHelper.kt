/**
 * FUN App - ExoPlayer Helper Functions
 * Lifecycle management and state tracking for ExoPlayer in Compose
 */

package com.fun.app.ui.components.video

import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer

/**
 * Remember an ExoPlayer instance with proper lifecycle management
 */
@Composable
fun rememberExoPlayer(videoUrl: String?): ExoPlayer {
    val context = LocalContext.current
    
    val player = remember {
        ExoPlayer.Builder(context).build().apply {
            videoUrl?.let { url ->
                val mediaItem = MediaItem.fromUri(url)
                setMediaItem(mediaItem)
                prepare()
                playWhenReady = true
            }
        }
    }
    
    // Update media source when URL changes
    LaunchedEffect(videoUrl) {
        videoUrl?.let { url ->
            val mediaItem = MediaItem.fromUri(url)
            player.setMediaItem(mediaItem)
            player.prepare()
            player.playWhenReady = true
        }
    }
    
    // Cleanup on disposal
    DisposableEffect(Unit) {
        onDispose {
            player.release()
        }
    }
    
    return player
}

/**
 * Track ExoPlayer state reactively
 */
@Composable
fun rememberExoPlayerState(player: ExoPlayer): ExoPlayerState {
    var isPlaying by remember { mutableStateOf(player.isPlaying) }
    var progress by remember { mutableStateOf(0f) }
    var duration by remember { mutableLongStateOf(0L) }
    var currentPosition by remember { mutableLongStateOf(0L) }
    var isBuffering by remember { mutableStateOf(false) }
    
    DisposableEffect(player) {
        val listener = object : Player.Listener {
            override fun onIsPlayingChanged(playing: Boolean) {
                isPlaying = playing
            }
            
            override fun onPlaybackStateChanged(state: Int) {
                isBuffering = state == Player.STATE_BUFFERING
                
                when (state) {
                    Player.STATE_READY -> {
                        duration = if (player.duration > 0) player.duration else 0L
                        currentPosition = player.currentPosition
                        progress = if (duration > 0) {
                            (currentPosition.toFloat() / duration).coerceIn(0f, 1f)
                        } else 0f
                    }
                    Player.STATE_ENDED -> {
                        progress = 1f
                    }
                    else -> {}
                }
            }
        }
        
        player.addListener(listener)
        
        // Poll for progress updates
        val job = kotlinx.coroutines.CoroutineScope(
            kotlinx.coroutines.Dispatchers.Main
        ).launch {
            while (true) {
                if (player.isPlaying) {
                    duration = if (player.duration > 0) player.duration else 0L
                    currentPosition = player.currentPosition
                    progress = if (duration > 0) {
                        (currentPosition.toFloat() / duration).coerceIn(0f, 1f)
                    } else 0f
                }
                kotlinx.coroutines.delay(100)
            }
        }
        
        onDispose {
            player.removeListener(listener)
            job.cancel()
        }
    }
    
    return ExoPlayerState(
        isPlaying = isPlaying,
        progress = progress,
        duration = duration,
        currentPosition = currentPosition,
        isBuffering = isBuffering
    )
}

/**
 * State holder for ExoPlayer
 */
data class ExoPlayerState(
    val isPlaying: Boolean,
    val progress: Float,
    val duration: Long,
    val currentPosition: Long,
    val isBuffering: Boolean
)

/**
 * Extension functions for ExoPlayer
 */
fun ExoPlayer.seekBy(milliseconds: Long) {
    val newPosition = (currentPosition + milliseconds).coerceIn(0L, duration)
    seekTo(newPosition)
}

fun ExoPlayer.setPlaybackSpeed(speed: Float) {
    setPlaybackParameters(
        androidx.media3.common.PlaybackParameters(speed)
    )
}
