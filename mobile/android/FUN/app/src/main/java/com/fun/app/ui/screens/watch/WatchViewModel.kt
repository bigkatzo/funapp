/**
 * FUN App - Watch View Model
 * Manages state for unified watch experience
 */

package com.fun.app.ui.screens.watch

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.fun.app.core.playlist.PlaylistManager
import com.fun.app.core.storage.WatchHistoryManager
import com.fun.app.data.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class WatchViewModel(
    private val episodeId: String,
    private var mode: PlaylistMode,
    private val seriesId: String?,
    private val watchHistory: WatchHistoryManager
) : ViewModel() {
    
    private val _playlistContext = MutableStateFlow<PlaylistContext?>(null)
    val playlistContext: StateFlow<PlaylistContext?> = _playlistContext.asStateFlow()
    
    private val _series = MutableStateFlow<Series?>(null)
    val series: StateFlow<Series?> = _series.asStateFlow()
    
    private val _showContinuePrompt = MutableStateFlow(false)
    val showContinuePrompt: StateFlow<Boolean> = _showContinuePrompt.asStateFlow()
    
    private val _showSwipeMenu = MutableStateFlow(false)
    val showSwipeMenu: StateFlow<Boolean> = _showSwipeMenu.asStateFlow()
    
    private val _showTransition = MutableStateFlow(false)
    val showTransition: StateFlow<Boolean> = _showTransition.asStateFlow()
    
    private val _transitionFrom = MutableStateFlow<Episode?>(null)
    val transitionFrom: StateFlow<Episode?> = _transitionFrom.asStateFlow()
    
    private val _transitionTo = MutableStateFlow<Episode?>(null)
    val transitionTo: StateFlow<Episode?> = _transitionTo.asStateFlow()
    
    val currentEpisode: Episode?
        get() = _playlistContext.value?.currentEpisode
    
    val nextEpisode: Episode?
        get() = _playlistContext.value?.nextEpisode
    
    val previousEpisode: Episode?
        get() = _playlistContext.value?.previousEpisode
    
    private val isFirstEpisode: Boolean
        get() = currentEpisode?.let {
            it.seasonNumber == 1 && it.episodeNumber == 1
        } ?: false
    
    fun loadData() {
        viewModelScope.launch {
            // TODO: Load series from API
            // For now, create mock playlist
            
            if (seriesId != null) {
                // Load series details
                // _series.value = fetchSeries(seriesId)
            }
            
            // Create playlist based on mode
            createPlaylist()
        }
    }
    
    private fun createPlaylist() {
        // TODO: Implement playlist creation based on mode
        // For now, create empty context
        
        _playlistContext.value = PlaylistContext(
            mode = mode,
            episodes = emptyList(),
            currentIndex = 0,
            seriesId = seriesId,
            seriesTitle = _series.value?.title
        )
    }
    
    fun handleVideoEnd() {
        saveProgress(completed = true)
        
        when {
            mode == PlaylistMode.DISCOVER && isFirstEpisode -> {
                _showContinuePrompt.value = true
            }
            hasNext() -> {
                handleNextEpisode()
            }
        }
    }
    
    fun handleNextEpisode() {
        val current = currentEpisode ?: return
        val next = nextEpisode ?: return
        
        _transitionFrom.value = current
        _transitionTo.value = next
        _showTransition.value = true
    }
    
    fun handlePrevEpisode() {
        val current = currentEpisode ?: return
        val prev = previousEpisode ?: return
        
        _transitionFrom.value = current
        _transitionTo.value = prev
        _showTransition.value = true
        
        viewModelScope.launch {
            kotlinx.coroutines.delay(500)
            moveToPrevious()
            _showTransition.value = false
        }
    }
    
    fun handleTransitionComplete() {
        moveToNext()
        _showTransition.value = false
        _transitionFrom.value = null
        _transitionTo.value = null
    }
    
    fun handleSwipeDown() {
        if (mode == PlaylistMode.DISCOVER) {
            // Navigate back will be handled by caller
        } else {
            _showSwipeMenu.value = true
        }
    }
    
    fun hasNext(): Boolean = _playlistContext.value?.hasNext ?: false
    
    fun hasPrevious(): Boolean = _playlistContext.value?.hasPrevious ?: false
    
    fun hidePrompt() {
        _showContinuePrompt.value = false
    }
    
    fun hideSwipeMenu() {
        _showSwipeMenu.value = false
    }
    
    fun switchToBingeMode() {
        mode = PlaylistMode.BINGE
        createPlaylist()
    }
    
    private fun moveToNext() {
        _playlistContext.value?.let { context ->
            if (context.moveNext()) {
                _playlistContext.value = context.copy()
                saveProgress(completed = false)
                
                // Prefetch next episode
                nextEpisode?.let { /* TODO: Prefetch */ }
            }
        }
    }
    
    private fun moveToPrevious() {
        _playlistContext.value?.let { context ->
            if (context.movePrevious()) {
                _playlistContext.value = context.copy()
            }
        }
    }
    
    private fun saveProgress(completed: Boolean) {
        currentEpisode?.let { episode ->
            watchHistory.saveProgress(
                episode = episode,
                progress = 0.0, // Get from player
                completed = completed
            )
        }
    }
}

class WatchViewModelFactory(
    private val episodeId: String,
    private val mode: PlaylistMode,
    private val seriesId: String?
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(WatchViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return WatchViewModel(
                episodeId,
                mode,
                seriesId,
                // TODO: Inject WatchHistoryManager properly
                WatchHistoryManager(context = TODO(), userId = "demo-user")
            ) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
