/**
 * FUN App - Feed ViewModel
 * Manages feed content and playback
 */

import Foundation
import Combine

@MainActor
class FeedViewModel: ObservableObject {
    @Published var episodes: [FeedEpisode] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var hasMore = true
    
    private var currentPage = 1
    private let pageLimit = 10
    private let apiClient = APIClient.shared
    private var episodesWatchedCount = 0
    private let interstitialFrequency = 3  // Show after every 3 episodes
    
    // MARK: - Data Loading
    
    func loadFeed(refresh: Bool = false) async {
        if refresh {
            currentPage = 1
            episodes = []
            hasMore = true
        }
        
        guard hasMore && !isLoading else { return }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let response: FeedResponse = try await apiClient.request(
                .feed(page: currentPage, limit: pageLimit)
            )
            
            if refresh {
                episodes = response.episodes
            } else {
                episodes.append(contentsOf: response.episodes)
            }
            
            hasMore = currentPage < response.pagination.pages
            currentPage += 1
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
    
    func loadMore() async {
        await loadFeed()
    }
    
    func refresh() async {
        await loadFeed(refresh: true)
    }
    
    // MARK: - Interactions
    
    func toggleLike(seriesId: String) async {
        do {
            try await apiClient.requestWithoutResponse(
                .likeSeries(id: seriesId),
                method: .post
            )
            
            // Update local state
            if let index = episodes.firstIndex(where: { $0.series.id == seriesId }) {
                // Toggle like state locally
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    // MARK: - Interstitial Ads
    
    func onEpisodeCompleted() {
        episodesWatchedCount += 1
        
        // Show interstitial after every 3 episodes
        if episodesWatchedCount % interstitialFrequency == 0 {
            AdManager.shared.showInterstitialAd()
        }
    }
    
    func onEpisodeStarted() {
        // Track episode view
    }
}
