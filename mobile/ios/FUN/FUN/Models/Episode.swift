/**
 * FUN App - Episode Model
 */

import Foundation

struct Episode: Codable, Identifiable {
    let id: String
    let episodeNum: Int
    let title: String
    let description: String?
    let thumbnailUrl: String
    let duration: Int  // in seconds
    let videoUrl: String?
    let isFree: Bool
    let unlockCostCredits: Int?
    let unlockCostUSD: Double?
    let premiumOnly: Bool
    let tags: [ProductTag]?
    let isUnlocked: Bool?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case episodeNum, title, description, thumbnailUrl
        case duration, videoUrl, isFree
        case unlockCostCredits, unlockCostUSD, premiumOnly
        case tags, isUnlocked
    }
    
    var formattedDuration: String {
        let minutes = duration / 60
        let seconds = duration % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
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
