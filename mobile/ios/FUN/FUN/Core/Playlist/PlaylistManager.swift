/**
 * FUN App - Playlist Manager
 * Handles episode queues and navigation for different viewing modes
 */

import Foundation

class PlaylistManager {
    
    // MARK: - Create Discover Playlist
    
    static func createDiscoverPlaylist(series: [Series]) -> [Episode] {
        var playlist: [Episode] = []
        let watchHistory = WatchHistoryManager.shared
        
        for seriesItem in series {
            // Determine which episode 1 to show
            var targetEpisode: Episode?
            
            if let seasons = seriesItem.seasons, !seasons.isEmpty {
                // Multi-season series
                let progress = watchHistory.getSeriesProgress(seriesId: seriesItem.id)
                
                if let progress = progress, !progress.completedSeasons.isEmpty {
                    // User has completed seasons - show next unwatched season's E1
                    let nextSeasonNumber = progress.completedSeasons.max()! + 1
                    if let nextSeason = seasons.first(where: { $0.seasonNumber == nextSeasonNumber }),
                       let firstEp = nextSeason.episodes.first {
                        targetEpisode = firstEp
                    }
                } else {
                    // Show Season 1, Episode 1
                    if let firstSeason = seasons.first(where: { $0.seasonNumber == 1 }),
                       let firstEp = firstSeason.episodes.first {
                        targetEpisode = firstEp
                    }
                }
            } else if let episodes = seriesItem.episodes, let firstEp = episodes.first {
                // Single season series
                targetEpisode = firstEp
            }
            
            if let episode = targetEpisode {
                playlist.append(episode)
            }
        }
        
        // Shuffle for discovery
        return playlist.shuffled()
    }
    
    // MARK: - Create Binge Playlist
    
    static func createBingePlaylist(series: Series, startEpisodeId: String) -> [Episode] {
        let allEpisodes = series.allEpisodes
        
        guard let startIndex = allEpisodes.firstIndex(where: { $0.id == startEpisodeId }) else {
            return allEpisodes
        }
        
        // Return episodes starting from the start episode
        return Array(allEpisodes[startIndex...])
    }
    
    // MARK: - Create Series Playlist
    
    static func createSeriesPlaylist(series: Series, startEpisodeId: String, seasonNumber: Int? = nil) -> [Episode] {
        var allEpisodes: [Episode] = []
        
        if let seasonNum = seasonNumber, let seasons = series.seasons {
            // Specific season only
            if let season = seasons.first(where: { $0.seasonNumber == seasonNum }) {
                allEpisodes = season.episodes.sorted { $0.episodeNumber < $1.episodeNumber }
            }
        } else {
            // All episodes
            allEpisodes = series.allEpisodes
        }
        
        guard let startIndex = allEpisodes.firstIndex(where: { $0.id == startEpisodeId }) else {
            return allEpisodes
        }
        
        return Array(allEpisodes[startIndex...])
    }
    
    // MARK: - Get Next Unwatched Episode
    
    static func getNextUnwatchedEpisode(series: Series) -> Episode? {
        let watchHistory = WatchHistoryManager.shared
        let seriesHistory = watchHistory.getSeriesHistory(seriesId: series.id)
        let watchedIds = Set(seriesHistory.filter { $0.completed }.map { $0.episodeId })
        
        let allEpisodes = series.allEpisodes
        return allEpisodes.first { !watchedIds.contains($0.id) }
    }
    
    // MARK: - Prefetch Next Episode
    
    static func prefetchNextEpisode(_ episode: Episode?) {
        guard let episode = episode,
              let urlString = episode.videoUrl,
              let url = URL(string: urlString) else {
            return
        }
        
        // Prefetch video
        URLSession.shared.dataTask(with: url) { _, _, _ in
            // Prefetch initiated
        }.resume()
        
        // Prefetch thumbnail
        if let thumbnailURL = URL(string: episode.thumbnailUrl) {
            URLSession.shared.dataTask(with: thumbnailURL) { _, _, _ in
                // Prefetch initiated
            }.resume()
        }
    }
}
