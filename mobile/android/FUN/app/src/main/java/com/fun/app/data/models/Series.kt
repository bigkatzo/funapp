/**
 * FUN App - Series Models
 */

package com.fun.app.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class Creator(
    @Json(name = "_id") val id: String,
    val displayName: String,
    val profileImage: String
)

@JsonClass(generateAdapter = true)
data class Season(
    @Json(name = "_id") val id: String,
    val seasonNumber: Int,
    val title: String?,
    val description: String?,
    val episodes: List<Episode>,
    val thumbnailUrl: String?,
    val releaseDate: java.util.Date?,
    var isCompleted: Boolean? = null // User has watched all episodes
)

@JsonClass(generateAdapter = true)
data class Series(
    @Json(name = "_id") val id: String,
    val title: String,
    val description: String,
    val thumbnailUrl: String,
    val coverImageUrl: String,
    val genre: List<String>,
    val tags: List<String>,
    val creatorId: String,
    val creator: Creator,
    val totalEpisodes: Int,
    val stats: SeriesStats,
    val isActive: Boolean,
    val isFeatured: Boolean,
    val createdAt: java.util.Date,
    val seasons: List<Season>? = null, // Multi-season support
    val episodes: List<Episode>? = null, // Backward compatibility
    // Legacy support
    val rating: Double? = null,
    val isLiked: Boolean? = null,
    val isFavorited: Boolean? = null
) {
    val allEpisodes: List<Episode>
        get() {
            return seasons
                ?.sortedBy { it.seasonNumber }
                ?.flatMap { it.episodes.sortedBy { ep -> ep.episodeNumber } }
                ?: episodes?.sortedBy { it.episodeNumber }
                ?: emptyList()
        }
}

@JsonClass(generateAdapter = true)
data class SeriesStats(
    val totalViews: Int,
    val totalLikes: Int,
    val totalComments: Int
)

@JsonClass(generateAdapter = true)
data class SeriesListResponse(
    val series: List<Series>,
    val pagination: Pagination
)

@JsonClass(generateAdapter = true)
data class SeriesDetailResponse(
    val series: Series
)

@JsonClass(generateAdapter = true)
data class Pagination(
    val page: Int,
    val limit: Int,
    val total: Int,
    val pages: Int
)
