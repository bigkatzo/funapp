/**
 * FUN App - Watch History Screen (Android)
 * Grid of watched episodes
 */

package com.fun.app.ui.screens.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.fun.app.FunApplication
import com.fun.app.core.network.ApiClient
import com.fun.app.core.network.NetworkResult
import com.fun.app.core.network.safeApiCall
import com.fun.app.data.models.Episode
import com.fun.app.ui.theme.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun WatchHistoryScreen() {
    val viewModel: WatchHistoryViewModel = viewModel(factory = WatchHistoryViewModel.Factory)
    val history by viewModel.history.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadHistory()
    }
    
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Watch History") })
        }
    ) { paddingValues ->
        if (history.isEmpty() && !isLoading) {
            // Empty state
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = Icons.Default.PlayArrow,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = TextSecondary
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "No Watch History",
                    style = MaterialTheme.typography.titleLarge,
                    color = TextPrimary
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "Episodes you watch will appear here",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(3),
                contentPadding = PaddingValues(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.padding(paddingValues)
            ) {
                items(history) { item ->
                    WatchHistoryCard(item = item)
                }
                
                if (isLoading) {
                    items(6) {
                        WatchHistoryCardPlaceholder()
                    }
                }
            }
        }
    }
}

@Composable
private fun WatchHistoryCard(item: WatchHistoryItem) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        // Thumbnail
        AsyncImage(
            model = item.episode.thumbnailUrl,
            contentDescription = null,
            modifier = Modifier
                .fillMaxWidth()
                .height(150.dp)
                .clip(RoundedCornerShape(12.dp)),
            contentScale = ContentScale.Crop,
            placeholder = {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Surface
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = null,
                        modifier = Modifier.padding(32.dp),
                        tint = TextSecondary
                    )
                }
            }
        )
        
        // Series title
        Text(
            text = item.series.title,
            style = MaterialTheme.typography.bodySmall,
            color = TextPrimary,
            maxLines = 1
        )
        
        // Episode number
        Text(
            text = "Ep. ${item.episode.episodeNum}",
            style = MaterialTheme.typography.labelSmall,
            color = TextSecondary
        )
        
        // Watch time
        Text(
            text = formatTimeAgo(item.watchedAt),
            style = MaterialTheme.typography.labelSmall,
            color = TextSecondary
        )
    }
}

@Composable
private fun WatchHistoryCardPlaceholder() {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(150.dp),
            shape = RoundedCornerShape(12.dp),
            color = Surface
        ) {}
        
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(12.dp),
            shape = RoundedCornerShape(4.dp),
            color = Surface
        ) {}
        
        Surface(
            modifier = Modifier
                .width(60.dp)
                .height(10.dp),
            shape = RoundedCornerShape(4.dp),
            color = Surface
        ) {}
    }
}

private fun formatTimeAgo(dateString: String): String {
    return try {
        val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        parser.timeZone = TimeZone.getTimeZone("UTC")
        val date = parser.parse(dateString) ?: return ""
        
        val now = Date()
        val diff = now.time - date.time
        val days = diff / (24 * 60 * 60 * 1000)
        
        when {
            days == 0L -> "Today"
            days == 1L -> "Yesterday"
            days < 7 -> "$days days ago"
            days < 30 -> "${days / 7} weeks ago"
            else -> "${days / 30} months ago"
        }
    } catch (e: Exception) {
        ""
    }
}

// MARK: - ViewModel

class WatchHistoryViewModel(
    private val apiClient: ApiClient
) : ViewModel() {
    
    private val _history = MutableStateFlow<List<WatchHistoryItem>>(emptyList())
    val history: StateFlow<List<WatchHistoryItem>> = _history.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private var currentPage = 1
    private val pageLimit = 20
    
    fun loadHistory(refresh: Boolean = false) {
        if (refresh) {
            currentPage = 1
            _history.value = emptyList()
        }
        
        if (_isLoading.value) return
        
        viewModelScope.launch {
            _isLoading.value = true
            
            when (val result = safeApiCall {
                // TODO: Implement watch history API call
                // apiClient.apiService.getWatchHistory(page = currentPage, limit = pageLimit)
                WatchHistoryResponse(emptyList(), 0)
            }) {
                is NetworkResult.Success -> {
                    if (refresh) {
                        _history.value = result.data.history
                    } else {
                        _history.value = _history.value + result.data.history
                    }
                    currentPage++
                }
                else -> {}
            }
            
            _isLoading.value = false
        }
    }
    
    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return WatchHistoryViewModel(
                    apiClient = FunApplication.instance.apiClient
                ) as T
            }
        }
    }
}

// MARK: - Models

data class WatchHistoryItem(
    val id: String,
    val series: SeriesSummary,
    val episode: Episode,
    val watchedAt: String
)

data class SeriesSummary(
    val id: String,
    val title: String
)

data class WatchHistoryResponse(
    val history: List<WatchHistoryItem>,
    val total: Int
)
