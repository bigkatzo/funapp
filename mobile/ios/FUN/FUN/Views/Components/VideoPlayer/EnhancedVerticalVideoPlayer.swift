/**
 * FUN App - Enhanced Vertical Video Player
 * TikTok-style player with Discover/Binge/Series modes
 */

import SwiftUI
import AVKit

struct EnhancedVerticalVideoPlayer: View {
    let context: PlaylistContext
    let series: Series?
    let onVideoEnd: () -> Void
    let onSwipeDown: () -> Void
    let onSeriesTitleTap: () -> Void
    let onBackClick: () -> Void
    let onNextEpisode: (() -> Void)?
    let onPrevEpisode: (() -> Void)?
    
    @StateObject private var playerManager = VideoPlayerManager()
    @State private var showControls = true
    @State private var showSeekAnimation: SeekDirection? = nil
    @State private var isLongPressing = false
    @State private var controlsTimer: Timer?
    
    enum SeekDirection {
        case forward, backward
    }
    
    var currentEpisode: Episode? {
        context.currentEpisode
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Video Player
                if let episode = currentEpisode,
                   let videoUrl = episode.videoUrl,
                   let url = URL(string: videoUrl),
                   episode.isUnlocked ?? false {
                    
                    AVPlayerView(player: playerManager.player)
                        .ignoresSafeArea()
                        .onTapGesture(count: 2) { location in
                            handleDoubleTap(location: location, width: geometry.size.width)
                        }
                        .onTapGesture(count: 1) {
                            handleSingleTap()
                        }
                        .onLongPressGesture(minimumDuration: 0.5) {
                            handleLongPress()
                        } onPressingChanged: { pressing in
                            if !pressing {
                                handleLongPressEnd()
                            }
                        }
                        .onAppear {
                            playerManager.setupPlayer(url: url)
                            playerManager.play()
                        }
                } else {
                    // Locked episode view
                    LockedEpisodeView(episode: currentEpisode)
                }
                
                // Progress Bar - Top
                VStack {
                    if playerManager.duration > 0 {
                        ProgressView(value: playerManager.progress, total: 1.0)
                            .progressViewStyle(.linear)
                            .tint(.red)
                            .frame(height: 2)
                    }
                    Spacer()
                }
                .ignoresSafeArea()
                
                // Seek Animations
                if let direction = showSeekAnimation {
                    seekAnimationView(direction: direction, geometry: geometry)
                }
                
                // Long Press Indicator
                if isLongPressing {
                    Text("2x Speed")
                        .font(.title2.bold())
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.black.opacity(0.7))
                        .cornerRadius(20)
                }
                
                // Controls Overlay
                if showControls {
                    controlsOverlay(geometry: geometry)
                }
                
                // Play/Pause Center
                if !playerManager.isPlaying && showControls {
                    Circle()
                        .fill(Color.white.opacity(0.2))
                        .frame(width: 80, height: 80)
                        .overlay(
                            Image(systemName: "play.fill")
                                .font(.system(size: 40))
                                .foregroundColor(.white)
                                .offset(x: 4)
                        )
                }
            }
        }
        .background(Color.black)
    }
    
    // MARK: - Controls Overlay
    
    @ViewBuilder
    private func controlsOverlay(geometry: GeometryProxy) -> some View {
        VStack {
            // Top Bar
            HStack {
                // Back Button
                Button(action: onBackClick) {
                    Image(systemName: "chevron.left")
                        .font(.title3)
                        .foregroundColor(.white)
                        .frame(width: 44, height: 44)
                        .background(Color.white.opacity(0.2))
                        .clipShape(Circle())
                }
                
                // Series Title
                Button(action: onSeriesTitleTap) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(series?.title ?? currentEpisode?.title ?? "")
                            .font(.subheadline.bold())
                            .foregroundColor(.white)
                            .lineLimit(1)
                        
                        if let episode = currentEpisode {
                            Text("S\(episode.seasonNumber)E\(episode.episodeNumber)")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                        }
                    }
                }
                
                Spacer()
            }
            .padding()
            .padding(.top, geometry.safeAreaInsets.top)
            
            Spacer()
            
            // Bottom Controls
            HStack(alignment: .bottom) {
                // Left: Episode Info & Controls
                VStack(alignment: .leading, spacing: 12) {
                    if let episode = currentEpisode {
                        Text(episode.title)
                            .font(.headline.bold())
                            .foregroundColor(.white)
                            .lineLimit(2)
                        
                        if let description = episode.description {
                            Text(description)
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.9))
                                .lineLimit(2)
                        }
                    }
                    
                    // Time & Controls
                    HStack(spacing: 16) {
                        Button(action: {
                            playerManager.player?.isMuted.toggle()
                        }) {
                            Image(systemName: (playerManager.player?.isMuted ?? false) ? "speaker.slash.fill" : "speaker.wave.2.fill")
                                .font(.title3)
                                .foregroundColor(.white)
                        }
                        
                        Text("\(formatTime(playerManager.currentTime)) / \(formatTime(playerManager.duration))")
                            .font(.caption.bold())
                            .foregroundColor(.white)
                        
                        if let position = context.position {
                            Text("\(position.current)/\(position.total)")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                        }
                        
                        Spacer()
                        
                        Button(action: {
                            // Fullscreen
                        }) {
                            Image(systemName: "arrow.up.left.and.arrow.down.right")
                                .font(.title3)
                                .foregroundColor(.white)
                        }
                    }
                }
                
                Spacer()
                
                // Right: Social Actions
                VStack(spacing: 20) {
                    // Like
                    socialButton(
                        icon: (currentEpisode?.isLiked ?? false) ? "heart.fill" : "heart",
                        count: currentEpisode?.stats.likes ?? 0,
                        color: (currentEpisode?.isLiked ?? false) ? .red : .white,
                        action: { /* Handle like */ }
                    )
                    
                    // Comment
                    socialButton(
                        icon: "message.fill",
                        count: currentEpisode?.stats.comments ?? 0,
                        color: .white,
                        action: { /* Handle comment */ }
                    )
                    
                    // Share
                    socialButton(
                        icon: "square.and.arrow.up",
                        count: nil,
                        color: .white,
                        action: { /* Handle share */ }
                    )
                    
                    Divider()
                        .background(Color.white.opacity(0.3))
                        .frame(height: 1)
                        .padding(.vertical, 8)
                    
                    // Navigation Arrows
                    if context.hasPrevious, let onPrev = onPrevEpisode {
                        Button(action: onPrev) {
                            Image(systemName: "chevron.up")
                                .font(.title2)
                                .foregroundColor(.white)
                                .frame(width: 40, height: 40)
                                .background(Color.white.opacity(0.2))
                                .clipShape(Circle())
                        }
                    }
                    
                    if context.hasNext, let onNext = onNextEpisode {
                        Button(action: onNext) {
                            Image(systemName: "chevron.down")
                                .font(.title2)
                                .foregroundColor(.white)
                                .frame(width: 40, height: 40)
                                .background(Color.white.opacity(0.2))
                                .clipShape(Circle())
                        }
                    }
                }
            }
            .padding()
            .padding(.bottom, geometry.safeAreaInsets.bottom + 80) // Account for tab bar
        }
    }
    
    // MARK: - Helper Views
    
    @ViewBuilder
    private func socialButton(icon: String, count: Int?, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                    .frame(width: 48, height: 48)
                    .background(Color.white.opacity(0.2))
                    .clipShape(Circle())
                
                if let count = count {
                    Text(formatCount(count))
                        .font(.caption.bold())
                        .foregroundColor(.white)
                }
            }
        }
    }
    
    @ViewBuilder
    private func seekAnimationView(direction: SeekDirection, geometry: GeometryProxy) -> some View {
        HStack {
            if direction == .backward {
                Spacer()
                    .frame(width: geometry.size.width / 3)
                
                Image(systemName: "gobackward.10")
                    .font(.system(size: 60))
                    .foregroundColor(.white)
                    .padding(20)
                    .background(Color.black.opacity(0.5))
                    .clipShape(Circle())
                    .transition(.scale.combined(with: .opacity))
                
                Spacer()
            } else {
                Spacer()
                
                Image(systemName: "goforward.10")
                    .font(.system(size: 60))
                    .foregroundColor(.white)
                    .padding(20)
                    .background(Color.black.opacity(0.5))
                    .clipShape(Circle())
                    .transition(.scale.combined(with: .opacity))
                
                Spacer()
                    .frame(width: geometry.size.width / 3)
            }
        }
    }
    
    // MARK: - Gesture Handlers
    
    private func handleSingleTap() {
        withAnimation {
            showControls.toggle()
        }
        resetControlsTimer()
    }
    
    private func handleDoubleTap(location: CGPoint, width: CGFloat) {
        let leftThird = width / 3
        let rightThird = width * 2 / 3
        
        if location.x < leftThird {
            // Rewind 10s
            playerManager.seek(by: -10)
            showSeekAnimation = .backward
        } else if location.x > rightThird {
            // Forward 10s
            playerManager.seek(by: 10)
            showSeekAnimation = .forward
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            showSeekAnimation = nil
        }
    }
    
    private func handleLongPress() {
        isLongPressing = true
        playerManager.setPlaybackRate(2.0)
    }
    
    private func handleLongPressEnd() {
        isLongPressing = false
        playerManager.setPlaybackRate(1.0)
    }
    
    private func resetControlsTimer() {
        controlsTimer?.invalidate()
        
        if playerManager.isPlaying {
            controlsTimer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: false) { _ in
                withAnimation {
                    showControls = false
                }
            }
        }
    }
    
    private func formatTime(_ seconds: Double) -> String {
        let minutes = Int(seconds) / 60
        let secs = Int(seconds) % 60
        return String(format: "%d:%02d", minutes, secs)
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

struct LockedEpisodeView: View {
    let episode: Episode?
    
    var body: some View {
        ZStack {
            if let episode = episode {
                AsyncImage(url: URL(string: episode.thumbnailUrl)) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    Color.gray.opacity(0.3)
                }
                .blur(radius: 20)
            }
            
            VStack(spacing: 16) {
                Image(systemName: "lock.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.white)
                
                Text("Tap to Unlock")
                    .font(.headline)
                    .foregroundColor(.white)
            }
        }
        .ignoresSafeArea()
    }
}
