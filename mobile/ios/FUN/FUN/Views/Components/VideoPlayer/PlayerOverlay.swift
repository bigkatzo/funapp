/**
 * FUN App - Player Overlay
 * Info and interaction buttons overlaid on video
 */

import SwiftUI

struct PlayerOverlay: View {
    let episode: FeedEpisode
    @ObservedObject var playerManager: VideoPlayerManager
    let onLike: () -> Void
    let onComment: () -> Void
    let onShare: () -> Void
    
    @State private var isLiked = false
    @State private var likeCount: Int = 0
    @State private var viewerCount: Int = 0
    @State private var showLikeAnimation = false
    
    var body: some View {
        ZStack {
            // Gradient overlay for readability
            VStack {
                Spacer()
                LinearGradient(
                    colors: [.clear, .black.opacity(0.7)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 300)
            }
            .ignoresSafeArea()
            
            VStack {
                // Top info
                HStack {
                    Text(episode.series.title)
                        .font(.headline)
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    // Credits badge
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.caption)
                            .foregroundColor(.yellow)
                        Text("150")
                            .font(.caption.weight(.semibold))
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Colors.surface.opacity(0.8))
                    .cornerRadius(12)
                }
                .padding()
                
                Spacer()
                
                // Bottom content and actions
                HStack(alignment: .bottom) {
                    // Left: Episode info
                    VStack(alignment: .leading, spacing: 12) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Episode \(episode.episode.episodeNum)")
                                .font(.subheadline.weight(.semibold))
                                .foregroundColor(.white)
                            
                            Text(episode.episode.title)
                                .font(.title3.weight(.bold))
                                .foregroundColor(.white)
                        }
                        
                        if let description = episode.episode.description {
                            Text(description)
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.9))
                                .lineLimit(2)
                        }
                        
                        // Progress bar
                        if playerManager.duration > 0 {
                            VStack(spacing: 4) {
                                GeometryReader { geometry in
                                    ZStack(alignment: .leading) {
                                        Rectangle()
                                            .fill(.white.opacity(0.3))
                                            .frame(height: 3)
                                        
                                        Rectangle()
                                            .fill(.white)
                                            .frame(width: geometry.size.width * playerManager.progress, height: 3)
                                    }
                                    .cornerRadius(1.5)
                                }
                                .frame(height: 3)
                                
                                HStack {
                                    Text(formatTime(playerManager.currentTime))
                                        .font(.caption2)
                                        .foregroundColor(.white.opacity(0.8))
                                    
                                    Spacer()
                                    
                                    Text(formatTime(playerManager.duration))
                                        .font(.caption2)
                                        .foregroundColor(.white.opacity(0.8))
                                }
                            }
                        }
                    }
                    
                    Spacer()
                    
                    // Right: Action buttons
                    VStack(spacing: 24) {
                        // Like button
                        ActionButton(
                            icon: isLiked ? "heart.fill" : "heart",
                            count: episode.series.likeCount ?? 0,
                            color: isLiked ? .red : .white
                        ) {
                            isLiked.toggle()
                            onLike()
                        }
                        
                        // Comment button
                        ActionButton(
                            icon: "bubble.left",
                            count: 0,
                            color: .white
                        ) {
                            onComment()
                        }
                        
                        // Share button
                        ActionButton(
                            icon: "square.and.arrow.up",
                            count: nil,
                            color: .white
                        ) {
                            onShare()
                        }
                        
                        // More button
                        Button(action: {
                            // Show more options
                        }) {
                            Image(systemName: "ellipsis")
                                .font(.title2)
                                .foregroundColor(.white)
                                .frame(width: 44, height: 44)
                                .background(.ultraThinMaterial)
                                .clipShape(Circle())
                        }
                    }
                }
                .padding()
                .padding(.bottom, 20)
            }
        }
    }
    
    private func formatTime(_ seconds: Double) -> String {
        let minutes = Int(seconds) / 60
        let remainingSeconds = Int(seconds) % 60
        return String(format: "%d:%02d", minutes, remainingSeconds)
    }
}

struct ActionButton: View {
    let icon: String
    let count: Int?
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                    .frame(width: 44, height: 44)
                    .background(.ultraThinMaterial)
                    .clipShape(Circle())
                
                if let count = count {
                    Text(formatCount(count))
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                }
            }
        }
    }
    
    private func formatCount(_ count: Int) -> String {
        if count >= 1_000_000 {
            return String(format: "%.1fM", Double(count) / 1_000_000)
        } else if count >= 1_000 {
            return String(format: "%.1fK", Double(count) / 1_000)
        } else {
            return "\(count)"
        }
    }
}
