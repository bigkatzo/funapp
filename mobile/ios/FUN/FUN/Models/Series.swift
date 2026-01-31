/**
 * FUN App - Series Model
 */

import Foundation

struct Creator: Codable, Identifiable {
    let id: String
    let displayName: String
    let profileImage: String
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case displayName, profileImage
    }
}

struct Season: Codable, Identifiable {
    let id: String
    let seasonNumber: Int
    let title: String?
    let description: String?
    let episodes: [Episode]
    let thumbnailUrl: String?
    let releaseDate: Date?
    var isCompleted: Bool? // User has watched all episodes
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case seasonNumber, title, description, episodes
        case thumbnailUrl, releaseDate, isCompleted
    }
}

struct Series: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let thumbnailUrl: String
    let coverImageUrl: String
    let genre: [String]
    let tags: [String]
    let creatorId: String
    let creator: Creator
    let totalEpisodes: Int
    let totalViews: Int
    let totalLikes: Int
    let totalComments: Int
    let isActive: Bool
    let isFeatured: Bool
    let createdAt: Date
    let seasons: [Season]? // Multi-season support
    let episodes: [Episode]? // Backward compatibility
    
    // Legacy support
    let rating: Double?
    let isLiked: Bool?
    let isFavorited: Bool?
    
    var stats: SeriesStats {
        SeriesStats(
            totalViews: totalViews,
            totalLikes: totalLikes,
            totalComments: totalComments
        )
    }
    
    var allEpisodes: [Episode] {
        if let seasons = seasons {
            return seasons
                .sorted { $0.seasonNumber < $1.seasonNumber }
                .flatMap { $0.episodes.sorted { $0.episodeNumber < $1.episodeNumber } }
        } else if let episodes = episodes {
            return episodes.sorted { $0.episodeNumber < $1.episodeNumber }
        }
        return []
    }
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title, description, thumbnailUrl, coverImageUrl
        case genre, tags, creatorId, creator
        case totalEpisodes, totalViews, totalLikes, totalComments
        case isActive, isFeatured, createdAt, seasons, episodes
        case rating, isLiked, isFavorited
    }
}

struct SeriesStats: Codable {
    let totalViews: Int
    let totalLikes: Int
    let totalComments: Int
}

struct SeriesListResponse: Codable {
    let series: [Series]
    let pagination: Pagination
}

struct SeriesDetailResponse: Codable {
    let series: Series
}

struct Pagination: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let pages: Int
}
