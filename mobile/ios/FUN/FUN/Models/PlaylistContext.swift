/**
 * FUN App - Playlist Context Models
 */

import Foundation

enum PlaylistMode: String, Codable {
    case discover = "discover"
    case binge = "binge"
    case series = "series"
}

struct PlaylistContext {
    let mode: PlaylistMode
    var episodes: [Episode]
    var currentIndex: Int
    let seriesId: String?
    let seriesTitle: String?
    
    var currentEpisode: Episode? {
        guard currentIndex >= 0 && currentIndex < episodes.count else { return nil }
        return episodes[currentIndex]
    }
    
    var nextEpisode: Episode? {
        guard currentIndex + 1 < episodes.count else { return nil }
        return episodes[currentIndex + 1]
    }
    
    var previousEpisode: Episode? {
        guard currentIndex > 0 else { return nil }
        return episodes[currentIndex - 1]
    }
    
    var hasNext: Bool {
        return currentIndex + 1 < episodes.count
    }
    
    var hasPrevious: Bool {
        return currentIndex > 0
    }
    
    var position: (current: Int, total: Int) {
        return (currentIndex + 1, episodes.count)
    }
    
    mutating func moveNext() -> Bool {
        guard hasNext else { return false }
        currentIndex += 1
        return true
    }
    
    mutating func movePrevious() -> Bool {
        guard hasPrevious else { return false }
        currentIndex -= 1
        return true
    }
}
