/**
 * FUN App - Watch History Models
 */

import Foundation

struct WatchHistoryEntry: Codable, Identifiable {
    let id: String // episodeId
    let episodeId: String
    let seriesId: String
    let seasonNumber: Int
    let episodeNumber: Int
    var progress: Double // seconds watched
    let duration: Double
    var completed: Bool
    var watchedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id = "episodeId"
        case episodeId, seriesId, seasonNumber, episodeNumber
        case progress, duration, completed, watchedAt
    }
}

struct SeriesProgress: Codable {
    let seriesId: String
    var lastWatchedEpisodeId: String
    var lastWatchedSeasonNumber: Int
    var lastWatchedEpisodeNumber: Int
    var completedSeasons: [Int]
    var totalWatchTime: Double
}

struct ContinueWatchingInfo {
    let episodeId: String
    let seriesId: String
    let seasonNumber: Int
    let episodeNumber: Int
    let progress: Double
    let progressPercent: Double
}
