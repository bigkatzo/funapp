/**
 * FUN App - Ad Manager (iOS)
 * Manages AppLovin MAX ads (rewarded, interstitial, banner)
 */

import Foundation
import AppLovinSDK
import SwiftUI

class AdManager: NSObject, ObservableObject {
    static let shared = AdManager()
    
    @Published var isRewardedAdReady = false
    @Published var isInterstitialReady = false
    
    private var rewardedAd: MARewardedAd?
    private var interstitialAd: MAInterstitialAd?
    
    private var onRewardedComplete: ((Bool, String?) -> Void)?
    
    private override init() {
        super.init()
    }
    
    // MARK: - Initialization
    
    func initialize() {
        ALSdk.shared().mediationProvider = "max"
        
        #if DEBUG
        ALSdk.shared().settings.isTestModeEnabled = true
        #endif
        
        ALSdk.shared().initializeSdk { configuration in
            print("✅ AppLovin MAX SDK initialized")
            self.loadRewardedAd()
            self.loadInterstitialAd()
        }
    }
    
    // MARK: - Rewarded Ads
    
    func loadRewardedAd() {
        rewardedAd = MARewardedAd.shared(withAdUnitIdentifier: Config.maxRewardedAdUnitID)
        rewardedAd?.delegate = self
        rewardedAd?.load()
    }
    
    func showRewardedAd(completion: @escaping (Bool, String?) -> Void) {
        onRewardedComplete = completion
        
        if rewardedAd?.isReady == true {
            rewardedAd?.show()
        } else {
            completion(false, nil)
            loadRewardedAd()  // Try to load for next time
        }
    }
    
    // MARK: - Interstitial Ads
    
    func loadInterstitialAd() {
        interstitialAd = MAInterstitialAd(adUnitIdentifier: Config.maxInterstitialAdUnitID)
        interstitialAd?.delegate = self
        interstitialAd?.load()
    }
    
    func showInterstitialAd() {
        if interstitialAd?.isReady == true {
            interstitialAd?.show()
        } else {
            loadInterstitialAd()  // Load for next time
        }
    }
    
    // MARK: - Banner Ads
    
    func createBannerAd() -> MAAdView {
        let banner = MAAdView(adUnitIdentifier: Config.maxBannerAdUnitID)
        banner.delegate = self
        
        // Set banner size
        banner.frame = CGRect(x: 0, y: 0, width: UIScreen.main.bounds.width, height: 50)
        
        banner.loadAd()
        return banner
    }
}

// MARK: - MARewardedAdDelegate

extension AdManager: MARewardedAdDelegate {
    func didLoad(_ ad: MAAd) {
        print("✅ Rewarded ad loaded")
        isRewardedAdReady = true
    }
    
    func didFailToLoadAd(forAdUnitIdentifier adUnitIdentifier: String, withError error: MAError) {
        print("❌ Rewarded ad failed to load: \(error.message)")
        isRewardedAdReady = false
    }
    
    func didDisplay(_ ad: MAAd) {
        print("📺 Rewarded ad displayed")
    }
    
    func didHide(_ ad: MAAd) {
        print("👋 Rewarded ad hidden")
        loadRewardedAd()  // Preload next ad
    }
    
    func didClick(_ ad: MAAd) {
        print("👆 Rewarded ad clicked")
    }
    
    func didFail(toDisplay ad: MAAd, withError error: MAError) {
        print("❌ Rewarded ad failed to display: \(error.message)")
        onRewardedComplete?(false, nil)
        onRewardedComplete = nil
        loadRewardedAd()
    }
    
    func didRewardUser(for ad: MAAd, with reward: MAReward) {
        print("🎁 User rewarded: \(reward.amount) \(reward.label)")
        // Generate ad proof token (simple timestamp-based for now)
        let adProof = "max_rewarded_\(Date().timeIntervalSince1970)"
        onRewardedComplete?(true, adProof)
        onRewardedComplete = nil
    }
}

// MARK: - MAInterstitialAdDelegate

extension AdManager: MAInterstitialAdDelegate {
    func didLoad(_ ad: MAAd) {
        print("✅ Interstitial ad loaded")
        isInterstitialReady = true
    }
    
    func didFailToLoadAd(forAdUnitIdentifier adUnitIdentifier: String, withError error: MAError) {
        print("❌ Interstitial ad failed to load: \(error.message)")
        isInterstitialReady = false
    }
    
    func didDisplay(_ ad: MAAd) {
        print("📺 Interstitial ad displayed")
    }
    
    func didHide(_ ad: MAAd) {
        print("👋 Interstitial ad hidden")
        loadInterstitialAd()  // Preload next ad
    }
    
    func didClick(_ ad: MAAd) {
        print("👆 Interstitial ad clicked")
    }
    
    func didFail(toDisplay ad: MAAd, withError error: MAError) {
        print("❌ Interstitial ad failed to display: \(error.message)")
        loadInterstitialAd()
    }
}

// MARK: - MAAdViewAdDelegate

extension AdManager: MAAdViewAdDelegate {
    func didLoad(_ ad: MAAd) {
        print("✅ Banner ad loaded")
    }
    
    func didFailToLoadAd(forAdUnitIdentifier adUnitIdentifier: String, withError error: MAError) {
        print("❌ Banner ad failed to load: \(error.message)")
    }
    
    func didExpand(_ ad: MAAd) {}
    func didCollapse(_ ad: MAAd) {}
    func didDisplay(_ ad: MAAd) {}
    func didHide(_ ad: MAAd) {}
    func didClick(_ ad: MAAd) {}
    func didFail(toDisplay ad: MAAd, withError error: MAError) {}
}
