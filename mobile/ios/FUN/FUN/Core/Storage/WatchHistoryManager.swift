/**
 * FUN App - Watch History Manager
 * Tracks user's viewing progress and history in UserDefaults
 */

import Foundation

class WatchHistoryManager {
    static let shared = WatchHistoryManager()
    
    private let watchHistoryKey = "watchHistory"
    private let seriesProgressKey = "seriesProgress"
    private let userId: String
    
    init(userId: String = "demo-user") {
        self.userId = userId
    }
    
    // MARK: - Watch Progress
    
    func saveProgress(episode: Episode, progress: Double, completed: Bool = false) {
        let entry = WatchHistoryEntry(
            id: episode.id,
            episodeId: episode.id,
            seriesId: episode.seriesId,
            seasonNumber: episode.seasonNumber,
            episodeNumber: episode.episodeNumber,
            progress: progress,
            duration: Double(episode.duration),
            completed: completed,
            watchedAt: Date()
        )
        
        var history = getHistory()
        if let index = history.firstIndex(where: { $0.episodeId == episode.id }) {
            history[index] = entry
        } else {
            history.append(entry)
        }
        
        // Keep only last 500 entries
        if history.count > 500 {
            history = Array(history.suffix(500))
        }
        
        saveHistory(history)
        updateSeriesProgress(episode: episode, progress: progress, completed: completed)
    }
    
    func getHistory() -> [WatchHistoryEntry] {
        guard let data = UserDefaults.standard.data(forKey: watchHistoryKey),
              let history = try? JSONDecoder().decode([WatchHistoryEntry].self, from: data) else {
            return []
        }
        return history
    }
    
    private func saveHistory(_ history: [WatchHistoryEntry]) {
        if let data = try? JSONEncoder().encode(history) {
            UserDefaults.standard.set(data, forKey: watchHistoryKey)
        }
    }
    
    func getEpisodeProgress(episodeId: String) -> WatchHistoryEntry? {
        return getHistory().first { $0.episodeId == episodeId }
    }
    
    func getSeriesHistory(seriesId: String) -> [WatchHistoryEntry] {
        return getHistory()
            .filter { $0.seriesId == seriesId }
            .sorted { lhs, rhs in
                if lhs.seasonNumber != rhs.seasonNumber {
                    return lhs.seasonNumber < rhs.seasonNumber
                }
                return lhs.episodeNumber < rhs.episodeNumber
            }
    }
    
    // MARK: - Series Progress
    
    private func updateSeriesProgress(episode: Episode, progress: Double, completed: Bool) {
        var allProgress = getAllSeriesProgress()
        
        if let index = allProgress.firstIndex(where: { $0.seriesId == episode.seriesId }) {
            allProgress[index].lastWatchedEpisodeId = episode.id
            allProgress[index].lastWatchedSeasonNumber = episode.seasonNumber
            allProgress[index].lastWatchedEpisodeNumber = episode.episodeNumber
            allProgress[index].totalWatchTime += progress
            
            // Check if season is completed
            if completed {
                let seriesHistory = getSeriesHistory(seriesId: episode.seriesId)
                let seasonEpisodes = seriesHistory.filter { $0.seasonNumber == episode.seasonNumber }
                let seasonCompleted = !seasonEpisodes.isEmpty && seasonEpisodes.allSatisfy { $0.completed }
                
                if seasonCompleted && !allProgress[index].completedSeasons.contains(episode.seasonNumber) {
                    allProgress[index].completedSeasons.append(episode.seasonNumber)
                    allProgress[index].completedSeasons.sort()
                }
            }
        } else {
            allProgress.append(SeriesProgress(
                seriesId: episode.seriesId,
                lastWatchedEpisodeId: episode.id,
                lastWatchedSeasonNumber: episode.seasonNumber,
                lastWatchedEpisodeNumber: episode.episodeNumber,
                completedSeasons: completed ? [episode.seasonNumber] : [],
                totalWatchTime: progress
            ))
        }
        
        saveSeriesProgress(allProgress)
    }
    
    func getSeriesProgress(seriesId: String) -> SeriesProgress? {
        return getAllSeriesProgress().first { $0.seriesId == seriesId }
    }
    
    func getAllSeriesProgress() -> [SeriesProgress] {
        guard let data = UserDefaults.standard.data(forKey: seriesProgressKey),
              let progress = try? JSONDecoder().decode([SeriesProgress].self, from: data) else {
            return []
        }
        return progress
    }
    
    private func saveSeriesProgress(_ progress: [SeriesProgress]) {
        if let data = try? JSONEncoder().encode(progress) {
            UserDefaults.standard.set(data, forKey: seriesProgressKey)
        }
    }
    
    func isSeasonCompleted(seriesId: String, seasonNumber: Int) -> Bool {
        guard let progress = getSeriesProgress(seriesId: seriesId) else { return false }
        return progress.completedSeasons.contains(seasonNumber)
    }
    
    func getContinueWatching(seriesId: String) -> ContinueWatchingInfo? {
        guard let progress = getSeriesProgress(seriesId: seriesId),
              let episodeProgress = getEpisodeProgress(episodeId: progress.lastWatchedEpisodeId) else {
            return nil
        }
        
        let progressPercent = episodeProgress.duration > 0 
            ? (episodeProgress.progress / episodeProgress.duration) * 100 
            : 0
        
        return ContinueWatchingInfo(
            episodeId: progress.lastWatchedEpisodeId,
            seriesId: seriesId,
            seasonNumber: progress.lastWatchedSeasonNumber,
            episodeNumber: progress.lastWatchedEpisodeNumber,
            progress: episodeProgress.progress,
            progressPercent: progressPercent
        )
    }
    
    func markCompleted(episodeId: String) {
        var history = getHistory()
        if let index = history.firstIndex(where: { $0.episodeId == episodeId }) {
            history[index].completed = true
            history[index].progress = history[index].duration
            saveHistory(history)
        }
    }
    
    func clearHistory() {
        UserDefaults.standard.removeObject(forKey: watchHistoryKey)
        UserDefaults.standard.removeObject(forKey: seriesProgressKey)
    }
    
    func getRecentlyWatched(limit: Int = 10) -> [WatchHistoryEntry] {
        return Array(getHistory()
            .sorted { $0.watchedAt > $1.watchedAt }
            .prefix(limit))
    }
}
