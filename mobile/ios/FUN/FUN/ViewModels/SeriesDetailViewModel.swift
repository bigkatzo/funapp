import Foundation
import Combine

@MainActor
class SeriesDetailViewModel: ObservableObject {
    @Published var episodes: [Episode] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let seriesId: String
    private let apiClient = APIClient.shared
    private var cancellables = Set<AnyCancellable>()
    
    init(seriesId: String) {
        self.seriesId = seriesId
    }
    
    func loadEpisodes() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let response = try await apiClient.request(
                    endpoint: .getSeriesEpisodes(seriesId: seriesId),
                    responseType: EpisodesListResponse.self
                )
                self.episodes = response.episodes
                self.isLoading = false
            } catch {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
                // Load mock data for development
                loadMockData()
            }
        }
    }
    
    private func loadMockData() {
        episodes = (1...12).map { number in
            let isFree = number <= 3
            let isPremium = number > 9
            let requiresCredits = !isFree && !isPremium && number % 2 == 0
            let requiresPurchase = !isFree && !isPremium && number % 2 != 0
            
            var unlockMethod: UnlockMethod = .free
            var creditsRequired: Int? = nil
            var purchasePrice: Double? = nil
            
            if isPremium {
                unlockMethod = .premium
            } else if requiresCredits {
                unlockMethod = .credits
                creditsRequired = 50
            } else if requiresPurchase {
                unlockMethod = .purchase
                purchasePrice = 0.99
            }
            
            return Episode(
                id: "ep\(number)",
                seriesId: seriesId,
                episodeNumber: number,
                title: "Episode \(number)",
                description: "An exciting episode that continues the story. Don't miss the surprising twist at the end!",
                thumbnailUrl: "https://picsum.photos/seed/ep\(number)/400/600",
                videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
                duration: 300,
                unlockMethod: unlockMethod,
                creditsRequired: creditsRequired,
                purchasePrice: purchasePrice,
                isUnlocked: isFree,
                viewCount: Int.random(in: 50000...200000),
                likeCount: Int.random(in: 5000...20000),
                commentCount: Int.random(in: 500...2000),
                createdAt: Date()
            )
        }
        isLoading = false
    }
}

// MARK: - Response Models
struct EpisodesListResponse: Codable {
    let episodes: [Episode]
}
