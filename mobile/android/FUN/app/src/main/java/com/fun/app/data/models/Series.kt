/**
 * FUN App - Series Models
 */

package com.fun.app.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class Series(
    @Json(name = "_id") val id: String,
    val title: String,
    val description: String,
    val thumbnailUrl: String,
    val genre: String,
    val rating: Double?,
    val totalEpisodes: Int,
    val episodes: List<Episode>?,
    val tags: List<String>,
    val createdAt: String,
    val isLiked: Boolean?,
    val isFavorited: Boolean?,
    val likeCount: Int?
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
