/**
 * FUN App - Watch History View
 * Grid of watched episodes
 */

import SwiftUI

struct WatchHistoryView: View {
    @StateObject private var viewModel = WatchHistoryViewModel()
    
    let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]
    
    var body: some View {
        ZStack {
            Colors.background.ignoresSafeArea()
            
            if viewModel.episodes.isEmpty && !viewModel.isLoading {
                emptyState
            } else {
                ScrollView {
                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(viewModel.episodes) { episode in
                            WatchHistoryCard(episode: episode)
                        }
                        
                        // Loading more indicator
                        if viewModel.isLoading {
                            ForEach(0..<6) { _ in
                                WatchHistoryCardPlaceholder()
                            }
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("Watch History")
        .navigationBarTitleDisplayMode(.large)
        .task {
            await viewModel.loadHistory()
        }
    }
    
    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "clock.fill")
                .font(.system(size: 64))
                .foregroundColor(Colors.textSecondary)
            
            Text("No Watch History")
                .font(.title2.bold())
                .foregroundColor(Colors.textPrimary)
            
            Text("Episodes you watch will appear here")
                .font(.subheadline)
                .foregroundColor(Colors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}

struct WatchHistoryCard: View {
    let episode: WatchHistoryItem
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Thumbnail
            AsyncImage(url: URL(string: episode.episode.thumbnailUrl ?? "")) { image in
                image
                    .resizable()
                    .scaledToFill()
            } placeholder: {
                Rectangle()
                    .fill(Colors.surface)
                    .overlay(
                        Image(systemName: "play.circle.fill")
                            .font(.largeTitle)
                            .foregroundColor(Colors.textSecondary)
                    )
            }
            .frame(height: 150)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            
            // Episode info
            VStack(alignment: .leading, spacing: 4) {
                Text(episode.series.title)
                    .font(.caption.weight(.semibold))
                    .foregroundColor(Colors.textPrimary)
                    .lineLimit(1)
                
                Text("Ep. \(episode.episode.episodeNum)")
                    .font(.caption2)
                    .foregroundColor(Colors.textSecondary)
                
                // Watch date
                Text(timeAgo(from: episode.watchedAt))
                    .font(.caption2)
                    .foregroundColor(Colors.textSecondary)
            }
        }
    }
    
    private func timeAgo(from dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return "" }
        
        let interval = Date().timeIntervalSince(date)
        let days = Int(interval / 86400)
        
        if days == 0 {
            return "Today"
        } else if days == 1 {
            return "Yesterday"
        } else if days < 7 {
            return "\(days) days ago"
        } else if days < 30 {
            return "\(days / 7) weeks ago"
        } else {
            return "\(days / 30) months ago"
        }
    }
}

struct WatchHistoryCardPlaceholder: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            RoundedRectangle(cornerRadius: 12)
                .fill(Colors.surface)
                .frame(height: 150)
            
            RoundedRectangle(cornerRadius: 4)
                .fill(Colors.surface)
                .frame(height: 12)
            
            RoundedRectangle(cornerRadius: 4)
                .fill(Colors.surface)
                .frame(height: 10)
                .frame(width: 60)
        }
    }
}

// MARK: - ViewModel

@MainActor
class WatchHistoryViewModel: ObservableObject {
    @Published var episodes: [WatchHistoryItem] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private var currentPage = 1
    private let pageLimit = 20
    private let apiClient = APIClient.shared
    
    func loadHistory(refresh: Bool = false) async {
        if refresh {
            currentPage = 1
            episodes = []
        }
        
        guard !isLoading else { return }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let response: WatchHistoryResponse = try await apiClient.request(
                .watchHistory(page: currentPage, limit: pageLimit)
            )
            
            if refresh {
                episodes = response.history
            } else {
                episodes.append(contentsOf: response.history)
            }
            
            currentPage += 1
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
}

// MARK: - Models

struct WatchHistoryItem: Identifiable, Decodable {
    let id: String
    let series: SeriesSummary
    let episode: Episode
    let watchedAt: String
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case series, episode, watchedAt
    }
}

struct SeriesSummary: Decodable {
    let id: String
    let title: String
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title
    }
}

struct WatchHistoryResponse: Decodable {
    let history: [WatchHistoryItem]
    let total: Int
}

#Preview {
    NavigationView {
        WatchHistoryView()
    }
}
