package com.fun.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fun.app.core.network.ApiService
import com.fun.app.core.network.NetworkResult
import com.fun.app.data.models.Creator
import com.fun.app.data.models.Series
import com.fun.app.data.models.SeriesStats
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Date
import javax.inject.Inject

data class BrowseUiState(
    val series: List<Series> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class BrowseViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(BrowseUiState())
    val uiState: StateFlow<BrowseUiState> = _uiState.asStateFlow()

    fun loadSeries() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            when (val result = apiService.getSeries()) {
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
                    // Load mock data for development
                    loadMockData()
                }
                is NetworkResult.Exception -> {
                    // Load mock data for development
                    loadMockData()
                }
            }
        }
    }

    fun search(query: String) {
        // Filter is done in the UI layer for now
        // In production, you'd call a search API endpoint
    }

    private fun loadMockData() {
        val mockSeries = listOf(
            Series(
                id = "series1",
                title = "Love in the City",
                description = "A modern romance about finding love in unexpected places. Follow Sarah and Alex as they navigate the complexities of city life and relationships.",
                thumbnailUrl = "https://picsum.photos/seed/series1/400/600",
                coverImageUrl = "https://picsum.photos/seed/cover1/1200/400",
                genre = listOf("Romance", "Drama"),
                tags = listOf("love", "city-life", "modern"),
                creatorId = "1",
                creator = Creator(
                    id = "1",
                    displayName = "Romance Studios",
                    profileImage = "https://api.dicebear.com/7.x/initials/svg?seed=RS"
                ),
                totalEpisodes = 12,
                stats = SeriesStats(
                    totalViews = 2500000,
                    totalLikes = 180000,
                    totalComments = 15000
                ),
                isActive = true,
                isFeatured = true,
                createdAt = Date()
            ),
            Series(
                id = "series2",
                title = "Mystery Manor",
                description = "A gripping mystery series set in an old mansion. Dark secrets unfold as our detective uncovers the truth behind the family's past.",
                thumbnailUrl = "https://picsum.photos/seed/series2/400/600",
                coverImageUrl = "https://picsum.photos/seed/cover2/1200/400",
                genre = listOf("Mystery", "Thriller"),
                tags = listOf("mystery", "detective", "mansion"),
                creatorId = "2",
                creator = Creator(
                    id = "2",
                    displayName = "Mystery Productions",
                    profileImage = "https://api.dicebear.com/7.x/initials/svg?seed=MP"
                ),
                totalEpisodes = 16,
                stats = SeriesStats(
                    totalViews = 3200000,
                    totalLikes = 220000,
                    totalComments = 18500
                ),
                isActive = true,
                isFeatured = true,
                createdAt = Date()
            ),
            Series(
                id = "series3",
                title = "High School Dreams",
                description = "Coming-of-age drama about friendship, love, and growing up. Experience the ups and downs of teenage life in this heartwarming series.",
                thumbnailUrl = "https://picsum.photos/seed/series3/400/600",
                coverImageUrl = "https://picsum.photos/seed/cover3/1200/400",
                genre = listOf("Youth", "Drama"),
                tags = listOf("school", "friendship", "teen"),
                creatorId = "3",
                creator = Creator(
                    id = "3",
                    displayName = "Youth Media",
                    profileImage = "https://api.dicebear.com/7.x/initials/svg?seed=YM"
                ),
                totalEpisodes = 20,
                stats = SeriesStats(
                    totalViews = 5600000,
                    totalLikes = 450000,
                    totalComments = 32000
                ),
                isActive = true,
                isFeatured = false,
                createdAt = Date()
            ),
            Series(
                id = "series4",
                title = "Time Traveler's Paradox",
                description = "Sci-fi adventure through time and space. One person's journey to fix the past and save the future.",
                thumbnailUrl = "https://picsum.photos/seed/series4/400/600",
                coverImageUrl = "https://picsum.photos/seed/cover4/1200/400",
                genre = listOf("Sci-Fi", "Adventure"),
                tags = listOf("time-travel", "adventure", "sci-fi"),
                creatorId = "4",
                creator = Creator(
                    id = "4",
                    displayName = "Future Films",
                    profileImage = "https://api.dicebear.com/7.x/initials/svg?seed=FF"
                ),
                totalEpisodes = 10,
                stats = SeriesStats(
                    totalViews = 1800000,
                    totalLikes = 125000,
                    totalComments = 9800
                ),
                isActive = true,
                isFeatured = false,
                createdAt = Date()
            ),
            Series(
                id = "series5",
                title = "Corporate Warfare",
                description = "Behind the scenes of a cutthroat business empire. Power, betrayal, and ambition collide in the boardroom.",
                thumbnailUrl = "https://picsum.photos/seed/series5/400/600",
                coverImageUrl = "https://picsum.photos/seed/cover5/1200/400",
                genre = listOf("Drama", "Thriller"),
                tags = listOf("business", "corporate", "power"),
                creatorId = "5",
                creator = Creator(
                    id = "5",
                    displayName = "Drama Network",
                    profileImage = "https://api.dicebear.com/7.x/initials/svg?seed=DN"
                ),
                totalEpisodes = 14,
                stats = SeriesStats(
                    totalViews = 2100000,
                    totalLikes = 165000,
                    totalComments = 11200
                ),
                isActive = true,
                isFeatured = false,
                createdAt = Date()
            ),
            Series(
                id = "series6",
                title = "The Last Kingdom",
                description = "A forbidden romance between a prince and a commoner threatens the kingdom. Historical drama with epic scope.",
                thumbnailUrl = "https://picsum.photos/seed/series6/400/600",
                coverImageUrl = "https://picsum.photos/seed/cover6/1200/400",
                genre = listOf("Historical", "Romance"),
                tags = listOf("royal", "forbidden-love", "historical"),
                creatorId = "6",
                creator = Creator(
                    id = "6",
                    displayName = "Epic Drama Co",
                    profileImage = "https://api.dicebear.com/7.x/initials/svg?seed=ED"
                ),
                totalEpisodes = 24,
                stats = SeriesStats(
                    totalViews = 4567000,
                    totalLikes = 389000,
                    totalComments = 23400
                ),
                isActive = true,
                isFeatured = true,
                createdAt = Date()
            )
        )

        _uiState.update {
            it.copy(
                series = mockSeries,
                isLoading = false,
                error = null
            )
        }
    }
}
