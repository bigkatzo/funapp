/**
 * FUN App - Series Model
 */

import Foundation

struct Series: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let thumbnailUrl: String
    let coverImageUrl: String
    let genre: [String] // Changed to array for multiple genres
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
    let episodes: [Episode]?
    
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
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title, description, thumbnailUrl, coverImageUrl
        case genre, tags, creatorId, creator
        case totalEpisodes, totalViews, totalLikes, totalComments
        case isActive, isFeatured, createdAt, episodes
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
