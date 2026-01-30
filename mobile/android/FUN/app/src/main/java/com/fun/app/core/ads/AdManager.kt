/**
 * FUN App - Ad Manager (Android)
 * Manages AppLovin MAX ads (rewarded, interstitial, banner)
 */

package com.fun.app.core.ads

import android.app.Activity
import android.content.Context
import com.applovin.mediation.MaxAd
import com.applovin.mediation.MaxAdViewAdListener
import com.applovin.mediation.MaxError
import com.applovin.mediation.MaxReward
import com.applovin.mediation.MaxRewardedAdListener
import com.applovin.mediation.ads.MaxAdView
import com.applovin.mediation.ads.MaxInterstitialAd
import com.applovin.mediation.ads.MaxRewardedAd
import com.applovin.sdk.AppLovinSdk
import com.applovin.sdk.AppLovinSdkConfiguration
import com.fun.app.core.constants.Config
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class AdManager(private val context: Context) {
    
    private val _isRewardedAdReady = MutableStateFlow(false)
    val isRewardedAdReady: StateFlow<Boolean> = _isRewardedAdReady.asStateFlow()
    
    private val _isInterstitialReady = MutableStateFlow(false)
    val isInterstitialReady: StateFlow<Boolean> = _isInterstitialReady.asStateFlow()
    
    private var rewardedAd: MaxRewardedAd? = null
    private var interstitialAd: MaxInterstitialAd? = null
    
    private var onRewardedComplete: ((Boolean, String?) -> Unit)? = null
    
    // MARK: - Initialization
    
    fun initialize() {
        AppLovinSdk.getInstance(context).mediationProvider = "max"
        AppLovinSdk.getInstance(context).settings.testDeviceAdvertisingIds = listOf("TEST_DEVICE_ID")
        
        if (Config.current == Config.Environment.DEVELOPMENT) {
            AppLovinSdk.getInstance(context).settings.isTestModeEnabled = true
        }
        
        AppLovinSdk.getInstance(context).initializeSdk { configuration: AppLovinSdkConfiguration ->
            println("✅ AppLovin MAX SDK initialized")
            loadRewardedAd()
            loadInterstitialAd()
        }
    }
    
    // MARK: - Rewarded Ads
    
    fun loadRewardedAd() {
        rewardedAd = MaxRewardedAd.getInstance(Config.maxRewardedAdUnitID, context)
        rewardedAd?.setListener(rewardedAdListener)
        rewardedAd?.loadAd()
    }
    
    fun showRewardedAd(activity: Activity, completion: (Boolean, String?) -> Unit) {
        onRewardedComplete = completion
        
        if (rewardedAd?.isReady == true) {
            rewardedAd?.showAd(activity)
        } else {
            completion(false, null)
            loadRewardedAd()  // Load for next time
        }
    }
    
    private val rewardedAdListener = object : MaxRewardedAdListener {
        override fun onAdLoaded(ad: MaxAd) {
            println("✅ Rewarded ad loaded")
            _isRewardedAdReady.value = true
        }
        
        override fun onAdLoadFailed(adUnitId: String, error: MaxError) {
            println("❌ Rewarded ad failed to load: ${error.message}")
            _isRewardedAdReady.value = false
        }
        
        override fun onAdDisplayed(ad: MaxAd) {
            println("📺 Rewarded ad displayed")
        }
        
        override fun onAdHidden(ad: MaxAd) {
            println("👋 Rewarded ad hidden")
            loadRewardedAd()  // Preload next ad
        }
        
        override fun onAdClicked(ad: MaxAd) {
            println("👆 Rewarded ad clicked")
        }
        
        override fun onAdDisplayFailed(ad: MaxAd, error: MaxError) {
            println("❌ Rewarded ad failed to display: ${error.message}")
            onRewardedComplete?.invoke(false, null)
            onRewardedComplete = null
            loadRewardedAd()
        }
        
        override fun onUserRewarded(ad: MaxAd, reward: MaxReward) {
            println("🎁 User rewarded: ${reward.amount} ${reward.label}")
            // Generate ad proof token
            val adProof = "max_rewarded_${System.currentTimeMillis()}"
            onRewardedComplete?.invoke(true, adProof)
            onRewardedComplete = null
        }
        
        override fun onRewardedVideoStarted(ad: MaxAd) {
            println("▶️ Rewarded video started")
        }
        
        override fun onRewardedVideoCompleted(ad: MaxAd) {
            println("✅ Rewarded video completed")
        }
    }
    
    // MARK: - Interstitial Ads
    
    fun loadInterstitialAd() {
        interstitialAd = MaxInterstitialAd(Config.maxInterstitialAdUnitID, context)
        interstitialAd?.setListener(interstitialAdListener)
        interstitialAd?.loadAd()
    }
    
    fun showInterstitialAd(activity: Activity) {
        if (interstitialAd?.isReady == true) {
            interstitialAd?.showAd(activity)
        } else {
            loadInterstitialAd()  // Load for next time
        }
    }
    
    private val interstitialAdListener = object : MaxAdListener {
        override fun onAdLoaded(ad: MaxAd) {
            println("✅ Interstitial ad loaded")
            _isInterstitialReady.value = true
        }
        
        override fun onAdLoadFailed(adUnitId: String, error: MaxError) {
            println("❌ Interstitial ad failed to load: ${error.message}")
            _isInterstitialReady.value = false
        }
        
        override fun onAdDisplayed(ad: MaxAd) {
            println("📺 Interstitial ad displayed")
        }
        
        override fun onAdHidden(ad: MaxAd) {
            println("👋 Interstitial ad hidden")
            loadInterstitialAd()  // Preload next ad
        }
        
        override fun onAdClicked(ad: MaxAd) {
            println("👆 Interstitial ad clicked")
        }
        
        override fun onAdDisplayFailed(ad: MaxAd, error: MaxError) {
            println("❌ Interstitial ad failed to display: ${error.message}")
            loadInterstitialAd()
        }
    }
    
    // MARK: - Banner Ads
    
    fun createBannerAd(): MaxAdView {
        val banner = MaxAdView(Config.maxBannerAdUnitID, context)
        banner.setListener(bannerAdListener)
        banner.loadAd()
        return banner
    }
    
    private val bannerAdListener = object : MaxAdViewAdListener {
        override fun onAdLoaded(ad: MaxAd) {
            println("✅ Banner ad loaded")
        }
        
        override fun onAdLoadFailed(adUnitId: String, error: MaxError) {
            println("❌ Banner ad failed to load: ${error.message}")
        }
        
        override fun onAdDisplayed(ad: MaxAd) {}
        override fun onAdHidden(ad: MaxAd) {}
        override fun onAdClicked(ad: MaxAd) {}
        override fun onAdDisplayFailed(ad: MaxAd, error: MaxError) {}
        override fun onAdExpanded(ad: MaxAd) {}
        override fun onAdCollapsed(ad: MaxAd) {}
    }
}
