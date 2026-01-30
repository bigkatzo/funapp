/**
 * FUN App - Series Model
 */

import Foundation

struct Series: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let thumbnailUrl: String
    let genre: String
    let rating: Double?
    let totalEpisodes: Int
    let episodes: [Episode]?
    let tags: [String]
    let createdAt: String
    let isLiked: Bool?
    let isFavorited: Bool?
    let likeCount: Int?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title, description, thumbnailUrl, genre, rating
        case totalEpisodes, episodes, tags, createdAt
        case isLiked, isFavorited, likeCount
    }
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
