/**
 * FUN App - Configuration
 */

package com.fun.app.core.constants

object Config {
    enum class Environment {
        DEVELOPMENT,
        STAGING,
        PRODUCTION
    }

    val current = Environment.DEVELOPMENT

    val baseURL: String
        get() = when (current) {
            Environment.DEVELOPMENT -> "http://10.0.2.2:8000/api"  // Android emulator localhost
            Environment.STAGING -> "https://api-staging.fun.app"
            Environment.PRODUCTION -> "https://api.fun.app"
        }

    val socketURL: String
        get() = when (current) {
            Environment.DEVELOPMENT -> "http://10.0.2.2:3002"  // Content Service
            Environment.STAGING -> "https://socket-staging.fun.app"
            Environment.PRODUCTION -> "https://socket.fun.app"
        }

    // AppLovin MAX Ad Unit IDs
    val maxRewardedAdUnitID: String
        get() = when (current) {
            Environment.DEVELOPMENT -> "YOUR_MAX_REWARDED_AD_UNIT_ID"  // Get from MAX dashboard
            Environment.STAGING, Environment.PRODUCTION -> "YOUR_MAX_REWARDED_AD_UNIT_ID_PROD"
        }

    val maxInterstitialAdUnitID: String
        get() = when (current) {
            Environment.DEVELOPMENT -> "YOUR_MAX_INTERSTITIAL_AD_UNIT_ID"
            Environment.STAGING, Environment.PRODUCTION -> "YOUR_MAX_INTERSTITIAL_AD_UNIT_ID_PROD"
        }

    val maxBannerAdUnitID: String
        get() = when (current) {
            Environment.DEVELOPMENT -> "YOUR_MAX_BANNER_AD_UNIT_ID"
            Environment.STAGING, Environment.PRODUCTION -> "YOUR_MAX_BANNER_AD_UNIT_ID_PROD"
        }

    const val APP_VERSION = "1.0.0"
}
