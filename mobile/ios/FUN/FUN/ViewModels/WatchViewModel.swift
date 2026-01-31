/**
 * FUN App - Watch View Model
 * Manages state for unified watch experience
 */

import Foundation
import Combine

@MainActor
class WatchViewModel: ObservableObject {
    @Published var playlistContext: PlaylistContext?
    @Published var series: Series?
    @Published var isLoading = true
    
    private let episodeId: String
    private var mode: PlaylistMode
    private let seriesId: String?
    private let watchHistory = WatchHistoryManager.shared
    
    var currentEpisode: Episode? {
        playlistContext?.currentEpisode
    }
    
    var nextEpisode: Episode? {
        playlistContext?.nextEpisode
    }
    
    var previousEpisode: Episode? {
        playlistContext?.previousEpisode
    }
    
    var hasNext: Bool {
        playlistContext?.hasNext ?? false
    }
    
    var hasPrevious: Bool {
        playlistContext?.hasPrevious ?? false
    }
    
    var isFirstEpisode: Bool {
        guard let episode = currentEpisode else { return false }
        return episode.seasonNumber == 1 && episode.episodeNumber == 1
    }
    
    init(episodeId: String, mode: PlaylistMode, seriesId: String?) {
        self.episodeId = episodeId
        self.mode = mode
        self.seriesId = seriesId
    }
    
    func loadData() async {
        isLoading = true
        
        // TODO: Load series from API
        // For now, create mock playlist
        
        if let seriesId = seriesId {
            // Load series details
            // series = await fetchSeries(seriesId)
        }
        
        // Create playlist based on mode
        await createPlaylist()
        
        isLoading = false
    }
    
    private func createPlaylist() async {
        // TODO: Implement playlist creation based on mode
        // For now, create empty context
        
        playlistContext = PlaylistContext(
            mode: mode,
            episodes: [],
            currentIndex: 0,
            seriesId: seriesId,
            seriesTitle: series?.title
        )
    }
    
    func moveToNext() {
        playlistContext?.moveNext()
        saveProgress(completed: false)
        
        // Prefetch next episode
        if let next = nextEpisode {
            PlaylistManager.prefetchNextEpisode(next)
        }
    }
    
    func moveToPrevious() {
        playlistContext?.movePrevious()
    }
    
    func switchToBingeMode() {
        mode = .binge
        // Reload playlist in binge mode
        Task {
            await createPlaylist()
        }
    }
    
    func saveProgress(completed: Bool) {
        guard let episode = currentEpisode else { return }
        // Save progress to history
        watchHistory.saveProgress(
            episode: episode,
            progress: 0, // Get from player
            completed: completed
        )
    }
}
