/**
 * FUN App - Episode Model
 */

import Foundation

struct Episode: Codable, Identifiable {
    let id: String
    let seriesId: String
    let seasonNumber: Int
    let episodeNumber: Int
    let title: String
    let description: String?
    let thumbnailUrl: String
    let duration: Int  // in seconds
    let videoUrl: String?
    let unlockMethod: UnlockMethod
    let creditsCost: Int?
    let purchasePrice: Double?
    let stats: EpisodeStats
    var isLiked: Bool?
    var isUnlocked: Bool?
    var isWatched: Bool?
    var watchProgress: Double? // seconds watched
    let createdAt: Date
    
    // Legacy fields for backward compatibility
    let episodeNum: Int?
    let isFree: Bool?
    let unlockCostCredits: Int?
    let unlockCostUSD: Double?
    let premiumOnly: Bool?
    let tags: [ProductTag]?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case seriesId, seasonNumber, episodeNumber
        case title, description, thumbnailUrl
        case duration, videoUrl, unlockMethod
        case creditsCost, purchasePrice, stats
        case isLiked, isUnlocked, isWatched, watchProgress
        case createdAt
        // Legacy
        case episodeNum, isFree
        case unlockCostCredits, unlockCostUSD, premiumOnly
        case tags
    }
    
    var formattedDuration: String {
        let minutes = duration / 60
        let seconds = duration % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
    
    var progressPercent: Double {
        guard let progress = watchProgress, duration > 0 else { return 0 }
        return (progress / Double(duration)) * 100
    }
}

enum UnlockMethod: String, Codable {
    case free = "free"
    case credits = "credits"
    case premium = "premium"
    case purchase = "purchase"
}

struct EpisodeStats: Codable {
    let views: Int
    let likes: Int
    let comments: Int
}

struct ProductTag: Codable {
    let productId: String
    let timestamp: Int
    let productName: String
    let productImageUrl: String
    let priceUSD: Double
}

struct EpisodeResponse: Codable {
    let episode: Episode
}

struct FeedResponse: Codable {
    let episodes: [FeedEpisode]
    let pagination: Pagination
}

struct FeedEpisode: Codable, Identifiable {
    let id: String
    let series: FeedSeries
    let episode: Episode
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case series, episode
    }
}

struct FeedSeries: Codable {
    let id: String
    let title: String
    let thumbnailUrl: String
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title, thumbnailUrl
    }
}
