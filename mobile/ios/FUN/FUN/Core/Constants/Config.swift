/**
 * FUN App - Configuration
 * Environment-specific settings
 */

import Foundation

enum Environment {
    case development
    case staging
    case production
}

struct Config {
    // Current environment
    static let current: Environment = .development
    
    // API Base URL
    static var baseURL: String {
        switch current {
        case .development:
            return "http://localhost:8000/api"  // Kong Gateway
        case .staging:
            return "https://api-staging.fun.app"
        case .production:
            return "https://api.fun.app"
        }
    }
    
    // Socket.IO URL
    static var socketURL: String {
        switch current {
        case .development:
            return "http://localhost:3002"  // Content Service directly
        case .staging:
            return "https://socket-staging.fun.app"
        case .production:
            return "https://socket.fun.app"
        }
    }
    
    // AppLovin MAX Ad Unit IDs
    static var maxRewardedAdUnitID: String {
        switch current {
        case .development:
            return "YOUR_MAX_REWARDED_AD_UNIT_ID"  // Get from MAX dashboard
        case .staging, .production:
            return "YOUR_MAX_REWARDED_AD_UNIT_ID_PROD"
        }
    }
    
    static var maxInterstitialAdUnitID: String {
        switch current {
        case .development:
            return "YOUR_MAX_INTERSTITIAL_AD_UNIT_ID"
        case .staging, .production:
            return "YOUR_MAX_INTERSTITIAL_AD_UNIT_ID_PROD"
        }
    }
    
    static var maxBannerAdUnitID: String {
        switch current {
        case .development:
            return "YOUR_MAX_BANNER_AD_UNIT_ID"
        case .staging, .production:
            return "YOUR_MAX_BANNER_AD_UNIT_ID_PROD"
        }
    }
    
    // App settings
    static let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
    static let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
}
