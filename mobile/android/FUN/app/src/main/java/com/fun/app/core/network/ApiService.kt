/**
 * FUN App - API Service Interface
 */

package com.fun.app.core.network

import com.fun.app.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // MARK: - Authentication

    @POST("/auth/signup")
    suspend fun signup(@Body request: SignupRequest): Response<AuthResponse>

    @POST("/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("/auth/refresh")
    suspend fun refreshToken(@Body request: RefreshRequest): Response<AuthResponse>

    @GET("/auth/profile")
    suspend fun getProfile(): Response<ProfileResponse>

    @PUT("/auth/profile")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): Response<ProfileResponse>

    @PUT("/auth/password")
    suspend fun changePassword(@Body request: ChangePasswordRequest): Response<Unit>

    @DELETE("/auth/account")
    suspend fun deleteAccount(): Response<Unit>

    // MARK: - Content

    @GET("/feed")
    suspend fun getFeed(
        @Query("page") page: Int,
        @Query("limit") limit: Int
    ): Response<FeedResponse>

    @GET("/series")
    suspend fun getSeries(
        @Query("page") page: Int,
        @Query("limit") limit: Int
    ): Response<SeriesListResponse>

    @GET("/series/{id}")
    suspend fun getSeriesDetail(@Path("id") id: String): Response<SeriesDetailResponse>

    @GET("/series/{id}/episodes/{num}")
    suspend fun getEpisode(
        @Path("id") seriesId: String,
        @Path("num") episodeNum: Int
    ): Response<EpisodeResponse>

    @GET("/series/search")
    suspend fun searchSeries(
        @Query("q") query: String,
        @Query("page") page: Int
    ): Response<SeriesListResponse>

    @POST("/series/{id}/like")
    suspend fun toggleLike(@Path("id") seriesId: String): Response<Unit>

    @POST("/series/{id}/favorite")
    suspend fun toggleFavorite(@Path("id") seriesId: String): Response<Unit>

    // MARK: - Unlocks

    @POST("/unlock")
    suspend fun unlockEpisode(@Body request: UnlockRequest): Response<UnlockResponse>

    @GET("/unlocks")
    suspend fun getUnlocks(): Response<UnlocksResponse>

    // MARK: - Comments

    @GET("/comments")
    suspend fun getComments(
        @Query("seriesId") seriesId: String,
        @Query("page") page: Int
    ): Response<CommentsResponse>

    @POST("/comments")
    suspend fun postComment(@Body request: PostCommentRequest): Response<PostCommentResponse>

    // MARK: - Payments

    @GET("/credits/products")
    suspend fun getCreditProducts(): Response<CreditProductsResponse>

    @GET("/transactions")
    suspend fun getTransactions(@Query("page") page: Int): Response<TransactionsResponse>

    @POST("/iap/verify/google")
    suspend fun verifyGoogleIAP(@Body request: VerifyGoogleIAPRequest): Response<Unit>

    @GET("/subscription/products")
    suspend fun getSubscriptionProducts(): Response<SubscriptionProductsResponse>
}
