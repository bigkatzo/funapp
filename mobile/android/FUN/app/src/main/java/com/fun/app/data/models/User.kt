/**
 * FUN App - User Models
 */

package com.fun.app.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class User(
    @Json(name = "_id") val id: String,
    val email: String,
    val displayName: String,
    val avatarUrl: String?,
    val credits: Int,
    val isPremium: Boolean,
    val premiumTier: String?,
    val premiumExpiresAt: String?,
    val watchHistory: List<WatchHistoryItem>?,
    val favorites: List<String>?,
    val createdAt: String
)

@JsonClass(generateAdapter = true)
data class WatchHistoryItem(
    val seriesId: String,
    val episodeNum: Int,
    val watchedAt: String
)

// Request/Response Models

@JsonClass(generateAdapter = true)
data class SignupRequest(
    val email: String,
    val password: String,
    val displayName: String
)

@JsonClass(generateAdapter = true)
data class LoginRequest(
    val email: String,
    val password: String
)

@JsonClass(generateAdapter = true)
data class RefreshRequest(
    val refreshToken: String
)

@JsonClass(generateAdapter = true)
data class UpdateProfileRequest(
    val displayName: String?,
    val avatarUrl: String?
)

@JsonClass(generateAdapter = true)
data class ChangePasswordRequest(
    val oldPassword: String,
    val newPassword: String
)

@JsonClass(generateAdapter = true)
data class AuthResponse(
    val user: User,
    val tokens: Tokens
) {
    @JsonClass(generateAdapter = true)
    data class Tokens(
        val accessToken: String,
        val refreshToken: String
    )
}

@JsonClass(generateAdapter = true)
data class ProfileResponse(
    val user: User
)
