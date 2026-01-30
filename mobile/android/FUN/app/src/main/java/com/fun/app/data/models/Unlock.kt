/**
 * FUN App - Unlock Models
 */

package com.fun.app.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class Unlock(
    @Json(name = "_id") val id: String,
    val seriesId: String,
    val episodeNum: Int,
    val method: String,  // "ad", "credits", "iap", "premium"
    val creditsSpent: Int?,
    val unlockedAt: String
)

@JsonClass(generateAdapter = true)
data class UnlockRequest(
    val seriesId: String,
    val episodeNum: Int,
    val method: String,
    val adProof: String? = null,
    val receipt: String? = null
)

@JsonClass(generateAdapter = true)
data class UnlockResponse(
    val unlock: Unlock,
    val message: String
)

@JsonClass(generateAdapter = true)
data class UnlocksResponse(
    val unlocks: List<Unlock>
)
