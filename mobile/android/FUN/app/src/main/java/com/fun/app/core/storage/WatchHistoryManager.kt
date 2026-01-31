/**
 * FUN App - Watch History Manager
 * Tracks user's viewing progress and history in SharedPreferences
 */

package com.fun.app.core.storage

import android.content.Context
import android.content.SharedPreferences
import com.fun.app.data.models.*
import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import java.util.Date

class WatchHistoryManager(context: Context, private val userId: String = "demo-user") {
    
    private val prefs: SharedPreferences = context.getSharedPreferences("watch_history", Context.MODE_PRIVATE)
    private val moshi = Moshi.Builder().add(KotlinJsonAdapterFactory()).build()
    
    companion object {
        private const val WATCH_HISTORY_KEY = "watchHistory"
        private const val SERIES_PROGRESS_KEY = "seriesProgress"
        
        @Volatile
        private var INSTANCE: WatchHistoryManager? = null
        
        fun getInstance(context: Context): WatchHistoryManager {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: WatchHistoryManager(context.applicationContext).also { INSTANCE = it }
            }
        }
    }
    
    // MARK: - Watch Progress
    
    fun saveProgress(episode: Episode, progress: Double, completed: Boolean = false) {
        val entry = WatchHistoryEntry(
            episodeId = episode.id,
            seriesId = episode.seriesId,
            seasonNumber = episode.seasonNumber,
            episodeNumber = episode.episodeNumber,
            progress = progress,
            duration = episode.duration.toDouble(),
            completed = completed,
            watchedAt = Date()
        )
        
        val history = getHistory().toMutableList()
        val existingIndex = history.indexOfFirst { it.episodeId == episode.id }
        
        if (existingIndex >= 0) {
            history[existingIndex] = entry
        } else {
            history.add(entry)
        }
        
        // Keep only last 500 entries
        val trimmedHistory = if (history.size > 500) {
            history.takeLast(500)
        } else {
            history
        }
        
        saveHistory(trimmedHistory)
        updateSeriesProgress(episode, progress, completed)
    }
    
    fun getHistory(): List<WatchHistoryEntry> {
        val json = prefs.getString(WATCH_HISTORY_KEY, null) ?: return emptyList()
        val type = Types.newParameterizedType(List::class.java, WatchHistoryEntry::class.java)
        val adapter = moshi.adapter<List<WatchHistoryEntry>>(type)
        return adapter.fromJson(json) ?: emptyList()
    }
    
    private fun saveHistory(history: List<WatchHistoryEntry>) {
        val type = Types.newParameterizedType(List::class.java, WatchHistoryEntry::class.java)
        val adapter = moshi.adapter<List<WatchHistoryEntry>>(type)
        val json = adapter.toJson(history)
        prefs.edit().putString(WATCH_HISTORY_KEY, json).apply()
    }
    
    fun getEpisodeProgress(episodeId: String): WatchHistoryEntry? {
        return getHistory().firstOrNull { it.episodeId == episodeId }
    }
    
    fun getSeriesHistory(seriesId: String): List<WatchHistoryEntry> {
        return getHistory()
            .filter { it.seriesId == seriesId }
            .sortedWith(compareBy({ it.seasonNumber }, { it.episodeNumber }))
    }
    
    // MARK: - Series Progress
    
    private fun updateSeriesProgress(episode: Episode, progress: Double, completed: Boolean) {
        val allProgress = getAllSeriesProgress().toMutableList()
        val existingIndex = allProgress.indexOfFirst { it.seriesId == episode.seriesId }
        
        if (existingIndex >= 0) {
            val existing = allProgress[existingIndex]
            existing.lastWatchedEpisodeId = episode.id
            existing.lastWatchedSeasonNumber = episode.seasonNumber
            existing.lastWatchedEpisodeNumber = episode.episodeNumber
            existing.totalWatchTime += progress
            
            // Check if season is completed
            if (completed) {
                val seriesHistory = getSeriesHistory(episode.seriesId)
                val seasonEpisodes = seriesHistory.filter { it.seasonNumber == episode.seasonNumber }
                val seasonCompleted = seasonEpisodes.isNotEmpty() && seasonEpisodes.all { it.completed }
                
                if (seasonCompleted && !existing.completedSeasons.contains(episode.seasonNumber)) {
                    existing.completedSeasons.add(episode.seasonNumber)
                    existing.completedSeasons.sort()
                }
            }
        } else {
            allProgress.add(SeriesProgress(
                seriesId = episode.seriesId,
                lastWatchedEpisodeId = episode.id,
                lastWatchedSeasonNumber = episode.seasonNumber,
                lastWatchedEpisodeNumber = episode.episodeNumber,
                completedSeasons = if (completed) mutableListOf(episode.seasonNumber) else mutableListOf(),
                totalWatchTime = progress
            ))
        }
        
        saveSeriesProgress(allProgress)
    }
    
    fun getSeriesProgress(seriesId: String): SeriesProgress? {
        return getAllSeriesProgress().firstOrNull { it.seriesId == seriesId }
    }
    
    fun getAllSeriesProgress(): List<SeriesProgress> {
        val json = prefs.getString(SERIES_PROGRESS_KEY, null) ?: return emptyList()
        val type = Types.newParameterizedType(List::class.java, SeriesProgress::class.java)
        val adapter = moshi.adapter<List<SeriesProgress>>(type)
        return adapter.fromJson(json) ?: emptyList()
    }
    
    private fun saveSeriesProgress(progress: List<SeriesProgress>) {
        val type = Types.newParameterizedType(List::class.java, SeriesProgress::class.java)
        val adapter = moshi.adapter<List<SeriesProgress>>(type)
        val json = adapter.toJson(progress)
        prefs.edit().putString(SERIES_PROGRESS_KEY, json).apply()
    }
    
    fun isSeasonCompleted(seriesId: String, seasonNumber: Int): Boolean {
        return getSeriesProgress(seriesId)?.completedSeasons?.contains(seasonNumber) ?: false
    }
    
    fun getContinueWatching(seriesId: String): ContinueWatchingInfo? {
        val progress = getSeriesProgress(seriesId) ?: return null
        val episodeProgress = getEpisodeProgress(progress.lastWatchedEpisodeId) ?: return null
        
        val progressPercent = if (episodeProgress.duration > 0) {
            (episodeProgress.progress / episodeProgress.duration) * 100
        } else {
            0.0
        }
        
        return ContinueWatchingInfo(
            episodeId = progress.lastWatchedEpisodeId,
            seriesId = seriesId,
            seasonNumber = progress.lastWatchedSeasonNumber,
            episodeNumber = progress.lastWatchedEpisodeNumber,
            progress = episodeProgress.progress,
            progressPercent = progressPercent
        )
    }
    
    fun markCompleted(episodeId: String) {
        val history = getHistory().toMutableList()
        val index = history.indexOfFirst { it.episodeId == episodeId }
        
        if (index >= 0) {
            history[index] = history[index].copy(
                completed = true,
                progress = history[index].duration
            )
            saveHistory(history)
        }
    }
    
    fun clearHistory() {
        prefs.edit()
            .remove(WATCH_HISTORY_KEY)
            .remove(SERIES_PROGRESS_KEY)
            .apply()
    }
    
    fun getRecentlyWatched(limit: Int = 10): List<WatchHistoryEntry> {
        return getHistory()
            .sortedByDescending { it.watchedAt }
            .take(limit)
    }
}
