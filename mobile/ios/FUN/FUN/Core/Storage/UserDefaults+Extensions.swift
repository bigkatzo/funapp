/**
 * FUN App - UserDefaults Extensions
 * Convenience methods for app preferences
 */

import Foundation

extension UserDefaults {
    enum Keys {
        static let hasCompletedOnboarding = "hasCompletedOnboarding"
        static let videoQuality = "videoQuality"
        static let notificationsEnabled = "notificationsEnabled"
        static let autoplayEnabled = "autoplayEnabled"
    }
    
    // Onboarding
    var hasCompletedOnboarding: Bool {
        get { bool(forKey: Keys.hasCompletedOnboarding) }
        set { set(newValue, forKey: Keys.hasCompletedOnboarding) }
    }
    
    // Video settings
    var videoQuality: VideoQuality {
        get {
            guard let rawValue = string(forKey: Keys.videoQuality),
                  let quality = VideoQuality(rawValue: rawValue) else {
                return .auto
            }
            return quality
        }
        set { set(newValue.rawValue, forKey: Keys.videoQuality) }
    }
    
    // Notification settings
    var notificationsEnabled: Bool {
        get { bool(forKey: Keys.notificationsEnabled) }
        set { set(newValue, forKey: Keys.notificationsEnabled) }
    }
    
    // Autoplay settings
    var autoplayEnabled: Bool {
        get { 
            // Default to true if not set
            return object(forKey: Keys.autoplayEnabled) as? Bool ?? true
        }
        set { set(newValue, forKey: Keys.autoplayEnabled) }
    }
}

enum VideoQuality: String, CaseIterable {
    case auto = "Auto"
    case quality360 = "360p"
    case quality540 = "540p"
    case quality720 = "720p"
    case quality1080 = "1080p"
    
    var displayName: String {
        return rawValue
    }
}
