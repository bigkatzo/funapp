/**
 * FUN App - Comment Models
 */

package com.fun.app.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class Comment(
    @Json(name = "_id") val id: String,
    val userId: String,
    val seriesId: String,
    val episodeNum: Int?,
    val text: String,
    val createdAt: String,
    val user: CommentUser?
)

@JsonClass(generateAdapter = true)
data class CommentUser(
    val displayName: String,
    val avatarUrl: String?
)

@JsonClass(generateAdapter = true)
data class CommentsResponse(
    val comments: List<Comment>,
    val pagination: Pagination
)

@JsonClass(generateAdapter = true)
data class PostCommentRequest(
    val seriesId: String,
    val episodeNum: Int?,
    val text: String
)

@JsonClass(generateAdapter = true)
data class PostCommentResponse(
    val comment: Comment
)
