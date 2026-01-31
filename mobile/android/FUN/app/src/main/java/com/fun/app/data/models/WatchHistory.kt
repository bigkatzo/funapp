/**
 * FUN App - Watch History Models
 */

package com.fun.app.data.models

import com.squareup.moshi.JsonClass
import java.util.Date

@JsonClass(generateAdapter = true)
data class WatchHistoryEntry(
    val episodeId: String,
    val seriesId: String,
    val seasonNumber: Int,
    val episodeNumber: Int,
    var progress: Double, // seconds watched
    val duration: Double,
    var completed: Boolean,
    var watchedAt: Date
)

@JsonClass(generateAdapter = true)
data class SeriesProgress(
    val seriesId: String,
    var lastWatchedEpisodeId: String,
    var lastWatchedSeasonNumber: Int,
    var lastWatchedEpisodeNumber: Int,
    var completedSeasons: MutableList<Int>,
    var totalWatchTime: Double
)

data class ContinueWatchingInfo(
    val episodeId: String,
    val seriesId: String,
    val seasonNumber: Int,
    val episodeNumber: Int,
    val progress: Double,
    val progressPercent: Double
)
