import Foundation
import Combine

@MainActor
class BrowseViewModel: ObservableObject {
    @Published var series: [Series] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiClient = APIClient.shared
    private var cancellables = Set<AnyCancellable>()
    
    func loadSeries() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let response = try await apiClient.request(
                    endpoint: .getSeries,
                    responseType: SeriesListResponse.self
                )
                self.series = response.series
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
        series = [
            Series(
                id: "series1",
                title: "Love in the City",
                description: "A modern romance about finding love in unexpected places. Follow Sarah and Alex as they navigate the complexities of city life and relationships.",
                thumbnailUrl: "https://picsum.photos/seed/series1/400/600",
                coverImageUrl: "https://picsum.photos/seed/cover1/1200/400",
                genre: ["Romance", "Drama"],
                tags: ["love", "city-life", "modern"],
                creatorId: "1",
                creator: Creator(id: "1", displayName: "Romance Studios", profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=RS"),
                totalEpisodes: 12,
                totalViews: 2500000,
                totalLikes: 180000,
                totalComments: 15000,
                isActive: true,
                isFeatured: true,
                createdAt: Date()
            ),
            Series(
                id: "series2",
                title: "Mystery Manor",
                description: "A gripping mystery series set in an old mansion. Dark secrets unfold as our detective uncovers the truth behind the family's past.",
                thumbnailUrl: "https://picsum.photos/seed/series2/400/600",
                coverImageUrl: "https://picsum.photos/seed/cover2/1200/400",
                genre: ["Mystery", "Thriller"],
                tags: ["mystery", "detective", "mansion"],
                creatorId: "2",
                creator: Creator(id: "2", displayName: "Mystery Productions", profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=MP"),
                totalEpisodes: 16,
                totalViews: 3200000,
                totalLikes: 220000,
                totalComments: 18500,
                isActive: true,
                isFeatured: true,
                createdAt: Date()
            ),
            Series(
                id: "series3",
                title: "High School Dreams",
                description: "Coming-of-age drama about friendship, love, and growing up. Experience the ups and downs of teenage life in this heartwarming series.",
                thumbnailUrl: "https://picsum.photos/seed/series3/400/600",
                coverImageUrl: "https://picsum.photos/seed/cover3/1200/400",
                genre: ["Youth", "Drama"],
                tags: ["school", "friendship", "teen"],
                creatorId: "3",
                creator: Creator(id: "3", displayName: "Youth Media", profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=YM"),
                totalEpisodes: 20,
                totalViews: 5600000,
                totalLikes: 450000,
                totalComments: 32000,
                isActive: true,
                isFeatured: false,
                createdAt: Date()
            ),
            Series(
                id: "series4",
                title: "Time Traveler's Paradox",
                description: "Sci-fi adventure through time and space. One person's journey to fix the past and save the future.",
                thumbnailUrl: "https://picsum.photos/seed/series4/400/600",
                coverImageUrl: "https://picsum.photos/seed/cover4/1200/400",
                genre: ["Sci-Fi", "Adventure"],
                tags: ["time-travel", "adventure", "sci-fi"],
                creatorId: "4",
                creator: Creator(id: "4", displayName: "Future Films", profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=FF"),
                totalEpisodes: 10,
                totalViews: 1800000,
                totalLikes: 125000,
                totalComments: 9800,
                isActive: true,
                isFeatured: false,
                createdAt: Date()
            ),
            Series(
                id: "series5",
                title: "Corporate Warfare",
                description: "Behind the scenes of a cutthroat business empire. Power, betrayal, and ambition collide in the boardroom.",
                thumbnailUrl: "https://picsum.photos/seed/series5/400/600",
                coverImageUrl: "https://picsum.photos/seed/cover5/1200/400",
                genre: ["Drama", "Thriller"],
                tags: ["business", "corporate", "power"],
                creatorId: "5",
                creator: Creator(id: "5", displayName: "Drama Network", profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=DN"),
                totalEpisodes: 14,
                totalViews: 2100000,
                totalLikes: 165000,
                totalComments: 11200,
                isActive: true,
                isFeatured: false,
                createdAt: Date()
            ),
            Series(
                id: "series6",
                title: "The Last Kingdom",
                description: "A forbidden romance between a prince and a commoner threatens the kingdom. Historical drama with epic scope.",
                thumbnailUrl: "https://picsum.photos/seed/series6/400/600",
                coverImageUrl: "https://picsum.photos/seed/cover6/1200/400",
                genre: ["Historical", "Romance"],
                tags: ["royal", "forbidden-love", "historical"],
                creatorId: "6",
                creator: Creator(id: "6", displayName: "Epic Drama Co", profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=ED"),
                totalEpisodes: 24,
                totalViews: 4567000,
                totalLikes: 389000,
                totalComments: 23400,
                isActive: true,
                isFeatured: true,
                createdAt: Date()
            )
        ]
        isLoading = false
    }
}

// MARK: - Response Models
struct SeriesListResponse: Codable {
    let series: [Series]
}

// MARK: - Creator Model
struct Creator: Codable, Identifiable {
    let id: String
    let displayName: String
    let profileImage: String
}
