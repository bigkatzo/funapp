/**
 * FUN App - Transaction Models
 */

package com.fun.app.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class Transaction(
    @Json(name = "_id") val id: String,
    val type: String,  // "credit_purchase", "credit_spend", "subscription"
    val amount: Double,
    val currency: String,
    val paymentMethod: String,  // "google_play", "stripe", "system"
    val status: String,
    val metadata: TransactionMetadata?,
    val createdAt: String
)

@JsonClass(generateAdapter = true)
data class TransactionMetadata(
    val credits: Int?,
    val seriesId: String?,
    val episodeNum: Int?,
    val productId: String?
)

@JsonClass(generateAdapter = true)
data class TransactionsResponse(
    val transactions: List<Transaction>,
    val pagination: Pagination
)

@JsonClass(generateAdapter = true)
data class CreditProduct(
    @Json(name = "_id") val id: String,
    val name: String,
    val credits: Int,
    val priceUSD: Double,
    val stripePriceId: String?,
    val appleProductId: String?,
    val googleProductId: String?,
    val bonus: Int?
) {
    val isPopular: Boolean
        get() = credits == 500

    val hasBonus: Boolean
        get() = bonus != null && bonus > 0
}

@JsonClass(generateAdapter = true)
data class CreditProductsResponse(
    val products: List<CreditProduct>
)

@JsonClass(generateAdapter = true)
data class SubscriptionProduct(
    @Json(name = "_id") val id: String,
    val name: String,
    val tier: String,  // "monthly", "annual"
    val priceUSD: Double,
    val stripePriceId: String?,
    val appleProductId: String?,
    val googleProductId: String?,
    val features: List<String>
)

@JsonClass(generateAdapter = true)
data class SubscriptionProductsResponse(
    val products: List<SubscriptionProduct>
)

@JsonClass(generateAdapter = true)
data class VerifyGoogleIAPRequest(
    val purchaseToken: String,
    val productId: String,
    val episodeId: String? = null
)
