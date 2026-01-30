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
    val episodeNumber: Int, // New field
    val episodeNum: Int? = null, // Legacy field
    val title: String,
    val description: String?,
    val thumbnailUrl: String,
    val videoUrl: String?,
    val duration: Int,  // in seconds
    val unlockMethod: UnlockMethod,
    val creditsRequired: Int?,
    val purchasePrice: Double?,
    val isUnlocked: Boolean,
    val viewCount: Int = 0,
    val likeCount: Int = 0,
    val commentCount: Int = 0,
    val createdAt: java.util.Date,
    // Legacy fields for backward compatibility
    val isFree: Boolean? = null,
    val unlockCostCredits: Int? = null,
    val unlockCostUSD: Double? = null,
    val premiumOnly: Boolean? = null,
    val tags: List<ProductTag>? = null
) {
    val formattedDuration: String
        get() {
            val minutes = duration / 60
            val seconds = duration % 60
            return String.format("%d:%02d", minutes, seconds)
        }
}

enum class UnlockMethod {
    FREE,
    CREDITS,
    PURCHASE,
    PREMIUM
}

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
