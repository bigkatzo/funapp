/**
 * FUN App - Banner Ad View
 * UIViewRepresentable wrapper for AppLovin MAX banner
 */

import SwiftUI
import AppLovinSDK

struct BannerAdView: UIViewRepresentable {
    
    func makeUIView(context: Context) -> MAAdView {
        return AdManager.shared.createBannerAd()
    }
    
    func updateUIView(_ uiView: MAAdView, context: Context) {
        // No updates needed
    }
}
