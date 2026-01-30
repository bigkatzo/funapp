/**
 * FUN App - Video Player Manager (Android)
 * Manages ExoPlayer lifecycle and state
 */

package com.fun.app.ui.components.player

import android.content.Context
import androidx.compose.runtime.mutableStateOf
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.trackselection.DefaultTrackSelector

class VideoPlayerManager(context: Context) {
    
    private val trackSelector = DefaultTrackSelector(context)
    
    val player: ExoPlayer = ExoPlayer.Builder(context)
        .setTrackSelector(trackSelector)
        .build()
        .apply {
            repeatMode = Player.REPEAT_MODE_OFF
            addListener(playerListener)
        }
    
    val isPlaying = mutableStateOf(false)
    val isBuffering = mutableStateOf(false)
    val currentPosition = mutableStateOf(0L)
    val duration = mutableStateOf(0L)
    val progress = mutableStateOf(0f)
    
    private var hasTriggeredCompletion = false
    var onEpisodeCompleted: (() -> Unit)? = null
    
    private val playerListener = object : Player.Listener {
        override fun onPlaybackStateChanged(playbackState: Int) {
            isBuffering.value = playbackState == Player.STATE_BUFFERING
            
            if (playbackState == Player.STATE_READY) {
                duration.value = player.duration
            }
            
            // Auto-advance at 95%
            if (playbackState == Player.STATE_ENDED) {
                // Trigger auto-advance to next episode
            }
        }
        
        override fun onIsPlayingChanged(playing: Boolean) {
            isPlaying.value = playing
        }
        
        override fun onPlayerError(error: PlaybackException) {
            // Handle playback error
            isBuffering.value = false
        }
    }
    
    init {
        // Update progress periodically
        startProgressUpdater()
    }
    
    fun setupPlayer(url: String) {
        val mediaItem = MediaItem.fromUri(url)
        player.setMediaItem(mediaItem)
        player.prepare()
    }
    
    fun play() {
        player.play()
    }
    
    fun pause() {
        player.pause()
    }
    
    fun togglePlayPause() {
        if (isPlaying.value) {
            pause()
        } else {
            play()
        }
    }
    
    fun seekBy(millis: Long) {
        val newPosition = (player.currentPosition + millis).coerceIn(0, player.duration)
        player.seekTo(newPosition)
    }
    
    fun seekTo(position: Long) {
        player.seekTo(position)
    }
    
    private fun startProgressUpdater() {
        // Update current position and progress
        // This would be better with a coroutine, but keeping it simple
        val updateRunnable = object : Runnable {
            override fun run() {
                if (player.duration > 0) {
                    currentPosition.value = player.currentPosition
                    progress.value = player.currentPosition.toFloat() / player.duration.toFloat()
                    
                    // Check for auto-advance (95%)
                    if (progress.value >= 0.95f && !hasTriggeredCompletion) {
                        hasTriggeredCompletion = true
                        onEpisodeCompleted?.invoke()
                    }
                }
                
                android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(this, 500)
            }
        }
        
        android.os.Handler(android.os.Looper.getMainLooper()).post(updateRunnable)
    }
    
    fun release() {
        player.removeListener(playerListener)
        player.release()
        hasTriggeredCompletion = false
    }
}
