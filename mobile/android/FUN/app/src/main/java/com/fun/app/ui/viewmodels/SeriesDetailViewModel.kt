package com.fun.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fun.app.core.network.ApiService
import com.fun.app.core.network.NetworkResult
import com.fun.app.data.models.Episode
import com.fun.app.data.models.Series
import com.fun.app.data.models.UnlockMethod
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Date
import javax.inject.Inject

data class SeriesDetailUiState(
    val series: Series? = null,
    val episodes: List<Episode> = emptyList(),
    val isLoading: Boolean = false,
    val isLoadingEpisodes: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class SeriesDetailViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(SeriesDetailUiState())
    val uiState: StateFlow<SeriesDetailUiState> = _uiState.asStateFlow()

    fun loadSeries(seriesId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            when (val result = apiService.getSeriesDetail(seriesId)) {
                is NetworkResult.Success -> {
                    _uiState.update {
                        it.copy(
                            series = result.data.series,
                            isLoading = false,
                            error = null
                        )
                    }
                }
                is NetworkResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = result.message
                        )
                    }
                }
                is NetworkResult.Exception -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = result.exception.message
                        )
                    }
                }
            }
        }
    }

    fun loadEpisodes(seriesId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoadingEpisodes = true) }

            when (val result = apiService.getSeriesEpisodes(seriesId)) {
                is NetworkResult.Success -> {
                    _uiState.update {
                        it.copy(
                            episodes = result.data.episodes,
                            isLoadingEpisodes = false
                        )
                    }
                }
                is NetworkResult.Error -> {
                    // Load mock data for development
                    loadMockEpisodes(seriesId)
                }
                is NetworkResult.Exception -> {
                    // Load mock data for development
                    loadMockEpisodes(seriesId)
                }
            }
        }
    }

    private fun loadMockEpisodes(seriesId: String) {
        val mockEpisodes = (1..12).map { number ->
            val isFree = number <= 3
            val isPremium = number > 9
            val requiresCredits = !isFree && !isPremium && number % 2 == 0
            val requiresPurchase = !isFree && !isPremium && number % 2 != 0

            var unlockMethod = UnlockMethod.FREE
            var creditsRequired: Int? = null
            var purchasePrice: Double? = null

            if (isPremium) {
                unlockMethod = UnlockMethod.PREMIUM
            } else if (requiresCredits) {
                unlockMethod = UnlockMethod.CREDITS
                creditsRequired = 50
            } else if (requiresPurchase) {
                unlockMethod = UnlockMethod.PURCHASE
                purchasePrice = 0.99
            }

            Episode(
                id = "ep$number",
                seriesId = seriesId,
                episodeNumber = number,
                title = "Episode $number",
                description = "An exciting episode that continues the story. Don't miss the surprising twist at the end!",
                thumbnailUrl = "https://picsum.photos/seed/ep$number/400/600",
                videoUrl = "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
                duration = 300,
                unlockMethod = unlockMethod,
                creditsRequired = creditsRequired,
                purchasePrice = purchasePrice,
                isUnlocked = isFree,
                viewCount = (50000..200000).random(),
                likeCount = (5000..20000).random(),
                commentCount = (500..2000).random(),
                createdAt = Date()
            )
        }

        _uiState.update {
            it.copy(
                episodes = mockEpisodes,
                isLoadingEpisodes = false
            )
        }
    }
}
