/**
 * FUN App - Episode Models
 */

package com.fun.app.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class Episode(
    @Json(name = "_id") val id: String,
    val seriesId: String,
    val seasonNumber: Int = 1,
    val episodeNumber: Int,
    val title: String,
    val description: String?,
    val thumbnailUrl: String,
    val videoUrl: String?,
    val duration: Int,  // in seconds
    val unlockMethod: UnlockMethod,
    val creditsRequired: Int? = null,
    val purchasePrice: Double? = null,
    val stats: EpisodeStats,
    var isLiked: Boolean = false,
    var isUnlocked: Boolean = false,
    var isWatched: Boolean = false,
    var watchProgress: Double? = null, // seconds watched
    val createdAt: java.util.Date,
    // Legacy fields for backward compatibility
    val episodeNum: Int? = null,
    val isFree: Boolean? = null,
    val unlockCostCredits: Int? = null,
    val unlockCostUSD: Double? = null,
    val premiumOnly: Boolean? = null,
    val tags: List<ProductTag>? = null,
    val viewCount: Int = 0,
    val likeCount: Int = 0,
    val commentCount: Int = 0
) {
    val formattedDuration: String
        get() {
            val minutes = duration / 60
            val seconds = duration % 60
            return String.format("%d:%02d", minutes, seconds)
        }
    
    val progressPercent: Double
        get() {
            val progress = watchProgress ?: return 0.0
            return if (duration > 0) (progress / duration) * 100 else 0.0
        }
}

enum class UnlockMethod {
    @Json(name = "free") FREE,
    @Json(name = "credits") CREDITS,
    @Json(name = "purchase") PURCHASE,
    @Json(name = "premium") PREMIUM
}

@JsonClass(generateAdapter = true)
data class EpisodeStats(
    val views: Int,
    val likes: Int,
    val comments: Int
)

@JsonClass(generateAdapter = true)
data class ProductTag(
    val productId: String,
    val timestamp: Int,
    val productName: String,
    val productImageUrl: String,
    val priceUSD: Double
)

@JsonClass(generateAdapter = true)
data class EpisodeResponse(
    val episode: Episode
)

@JsonClass(generateAdapter = true)
data class EpisodesListResponse(
    val episodes: List<Episode>
)

@JsonClass(generateAdapter = true)
data class FeedResponse(
    val episodes: List<FeedEpisode>,
    val pagination: Pagination
)

@JsonClass(generateAdapter = true)
data class FeedEpisode(
    @Json(name = "_id") val id: String,
    val series: FeedSeries,
    val episode: Episode
)

@JsonClass(generateAdapter = true)
data class FeedSeries(
    @Json(name = "_id") val id: String,
    val title: String,
    val thumbnailUrl: String
)
