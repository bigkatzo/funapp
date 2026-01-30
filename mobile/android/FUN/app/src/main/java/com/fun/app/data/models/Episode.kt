/**
 * FUN App - Episode Models
 */

package com.fun.app.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class Episode(
    @Json(name = "_id") val id: String,
    val episodeNum: Int,
    val title: String,
    val description: String?,
    val thumbnailUrl: String,
    val duration: Int,  // in seconds
    val videoUrl: String?,
    val isFree: Boolean,
    val unlockCostCredits: Int?,
    val unlockCostUSD: Double?,
    val premiumOnly: Boolean,
    val tags: List<ProductTag>?,
    val isUnlocked: Boolean?
) {
    val formattedDuration: String
        get() {
            val minutes = duration / 60
            val seconds = duration % 60
            return String.format("%d:%02d", minutes, seconds)
        }
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
