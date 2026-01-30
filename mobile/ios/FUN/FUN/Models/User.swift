/**
 * FUN App - User Model
 */

import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let displayName: String
    let avatarUrl: String?
    let credits: Int
    let isPremium: Bool
    let premiumTier: String?
    let premiumExpiresAt: String?
    let watchHistory: [WatchHistoryItem]?
    let favorites: [String]?
    let createdAt: String
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case email, displayName, avatarUrl, credits
        case isPremium, premiumTier, premiumExpiresAt
        case watchHistory, favorites, createdAt
    }
}

struct WatchHistoryItem: Codable {
    let seriesId: String
    let episodeNum: Int
    let watchedAt: String
}

struct AuthResponse: Codable {
    let user: User
    let tokens: Tokens
    
    struct Tokens: Codable {
        let accessToken: String
        let refreshToken: String
    }
}

struct ProfileResponse: Codable {
    let user: User
}
