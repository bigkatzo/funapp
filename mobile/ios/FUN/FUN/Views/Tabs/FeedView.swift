/**
 * FUN App - Feed View (Updated with Video Player)
 * Vertical scrolling video feed
 */

import SwiftUI

struct FeedView: View {
    @StateObject private var viewModel = FeedViewModel()
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showPlayer = false
    
    init() {
        // Listen for episode completion
        NotificationCenter.default.addObserver(
            forName: NSNotification.Name("EpisodeCompleted"),
            object: nil,
            queue: .main
        ) { _ in
            Task { @MainActor in
                viewModel.onEpisodeCompleted()
            }
        }
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Colors.background.ignoresSafeArea()
                
                if viewModel.isLoading && viewModel.episodes.isEmpty {
                    LoadingView()
                } else if viewModel.episodes.isEmpty {
                    emptyStateView
                } else {
                    // Vertical Video Player
                    VerticalVideoPlayer(episodes: viewModel.episodes)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Text("FUN")
                        .font(.title2.bold())
                        .foregroundColor(Colors.primary)
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    creditsBadge
                }
            }
            .task {
                if viewModel.episodes.isEmpty {
                    await viewModel.loadFeed()
                }
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "film.stack")
                .font(.system(size: 60))
                .foregroundColor(Colors.textSecondary)
            
            Text("No Episodes Yet")
                .font(.headline)
                .foregroundColor(Colors.textPrimary)
            
            Text("Check back later for new content")
                .font(.subheadline)
                .foregroundColor(Colors.textSecondary)
            
            Button(action: {
                Task {
                    await viewModel.refresh()
                }
            }) {
                Text("Refresh")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Colors.primary)
                    .cornerRadius(20)
            }
        }
    }
    
    private var creditsBadge: some View {
        HStack(spacing: 6) {
            Image(systemName: "star.fill")
                .font(.caption)
                .foregroundColor(.yellow)
            
            Text("\(authViewModel.currentUser?.credits ?? 0)")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(Colors.textPrimary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Colors.surface)
        .cornerRadius(16)
    }
}

#Preview {
    FeedView()
        .environmentObject(AuthViewModel())
}
