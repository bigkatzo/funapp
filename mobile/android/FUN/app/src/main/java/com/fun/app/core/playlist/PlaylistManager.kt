/**
 * FUN App - Playlist Manager
 * Handles episode queues and navigation for different viewing modes
 */

package com.fun.app.core.playlist

import com.fun.app.core.storage.WatchHistoryManager
import com.fun.app.data.models.*

object PlaylistManager {
    
    // MARK: - Create Discover Playlist
    
    fun createDiscoverPlaylist(series: List<Series>, watchHistory: WatchHistoryManager): List<Episode> {
        val playlist = mutableListOf<Episode>()
        
        for (seriesItem in series) {
            // Determine which episode 1 to show
            var targetEpisode: Episode? = null
            
            if (!seriesItem.seasons.isNullOrEmpty()) {
                // Multi-season series
                val progress = watchHistory.getSeriesProgress(seriesItem.id)
                
                if (progress != null && progress.completedSeasons.isNotEmpty()) {
                    // User has completed seasons - show next unwatched season's E1
                    val nextSeasonNumber = progress.completedSeasons.maxOrNull()!! + 1
                    val nextSeason = seriesItem.seasons.find { it.seasonNumber == nextSeasonNumber }
                    if (nextSeason != null && nextSeason.episodes.isNotEmpty()) {
                        targetEpisode = nextSeason.episodes.first()
                    }
                } else {
                    // Show Season 1, Episode 1
                    val firstSeason = seriesItem.seasons.find { it.seasonNumber == 1 }
                    if (firstSeason != null && firstSeason.episodes.isNotEmpty()) {
                        targetEpisode = firstSeason.episodes.first()
                    }
                }
            } else if (!seriesItem.episodes.isNullOrEmpty()) {
                // Single season series
                targetEpisode = seriesItem.episodes.first()
            }
            
            if (targetEpisode != null) {
                playlist.add(targetEpisode)
            }
        }
        
        // Shuffle for discovery
        return playlist.shuffled()
    }
    
    // MARK: - Create Binge Playlist
    
    fun createBingePlaylist(series: Series, startEpisodeId: String): List<Episode> {
        val allEpisodes = series.allEpisodes
        val startIndex = allEpisodes.indexOfFirst { it.id == startEpisodeId }
        
        return if (startIndex >= 0) {
            allEpisodes.drop(startIndex)
        } else {
            allEpisodes
        }
    }
    
    // MARK: - Create Series Playlist
    
    fun createSeriesPlaylist(series: Series, startEpisodeId: String, seasonNumber: Int? = null): List<Episode> {
        val allEpisodes = if (seasonNumber != null && series.seasons != null) {
            // Specific season only
            val season = series.seasons.find { it.seasonNumber == seasonNumber }
            season?.episodes?.sortedBy { it.episodeNumber } ?: emptyList()
        } else {
            // All episodes
            series.allEpisodes
        }
        
        val startIndex = allEpisodes.indexOfFirst { it.id == startEpisodeId }
        
        return if (startIndex >= 0) {
            allEpisodes.drop(startIndex)
        } else {
            allEpisodes
        }
    }
    
    // MARK: - Get Next Unwatched Episode
    
    fun getNextUnwatchedEpisode(series: Series, watchHistory: WatchHistoryManager): Episode? {
        val seriesHistory = watchHistory.getSeriesHistory(series.id)
        val watchedIds = seriesHistory.filter { it.completed }.map { it.episodeId }.toSet()
        
        return series.allEpisodes.firstOrNull { !watchedIds.contains(it.id) }
    }
}
