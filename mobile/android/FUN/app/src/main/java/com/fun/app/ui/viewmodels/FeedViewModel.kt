/**
 * FUN App - Feed ViewModel (Android)
 */

package com.fun.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.fun.app.FunApplication
import com.fun.app.core.network.ApiClient
import com.fun.app.core.network.NetworkResult
import com.fun.app.core.network.safeApiCall
import com.fun.app.data.models.FeedEpisode
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class FeedViewModel(
    private val apiClient: ApiClient
) : ViewModel() {
    
    private val _episodes = MutableStateFlow<List<FeedEpisode>>(emptyList())
    val episodes: StateFlow<List<FeedEpisode>> = _episodes.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()
    
    private var currentPage = 1
    private val pageLimit = 10
    private var hasMore = true
    private var episodesWatchedCount = 0
    private val interstitialFrequency = 3  // Show after every 3 episodes
    
    fun loadFeed(refresh: Boolean = false) {
        if (refresh) {
            currentPage = 1
            _episodes.value = emptyList()
            hasMore = true
        }
        
        if (!hasMore && !refresh) return
        
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            
            when (val result = safeApiCall {
                apiClient.apiService.getFeed(page = currentPage, limit = pageLimit)
            }) {
                is NetworkResult.Success -> {
                    if (refresh) {
                        _episodes.value = result.data.episodes
                    } else {
                        _episodes.value = _episodes.value + result.data.episodes
                    }
                    
                    hasMore = currentPage < result.data.pagination.pages
                    currentPage++
                }
                is NetworkResult.Error -> {
                    _errorMessage.value = result.message
                }
                else -> {}
            }
            
            _isLoading.value = false
        }
    }
    
    fun loadMore() {
        loadFeed(refresh = false)
    }
    
    fun refresh() {
        loadFeed(refresh = true)
    }
    
    fun onEpisodeCompleted() {
        episodesWatchedCount++
        
        // Show interstitial after every 3 episodes
        if (episodesWatchedCount % interstitialFrequency == 0) {
            // Note: This requires Activity context, will be triggered from UI layer
        }
    }
    
    fun onEpisodeStarted() {
        // Track episode view
    }
    
    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return FeedViewModel(
                    apiClient = FunApplication.instance.apiClient
                ) as T
            }
        }
    }
}
