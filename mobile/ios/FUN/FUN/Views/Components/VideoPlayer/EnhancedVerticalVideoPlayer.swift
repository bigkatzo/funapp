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
    @State private var speedLocked = false
    @State private var isUnlocking = false
    @State private var controlsTimer: Timer?
    @State private var lockTimer: Timer?
    @State private var unlockTimer: Timer?
    
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
                
                // Seek Animations
                if let direction = showSeekAnimation {
                    seekAnimationView(direction: direction, geometry: geometry)
                }
                
                // Speed Indicator
                if isLongPressing || speedLocked || isUnlocking {
                    Text(speedIndicatorText)
                        .font(.title2.bold())
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.black.opacity(0.7))
                        .cornerRadius(20)
                }
                
                // Social Actions & Navigation - Always Visible
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
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
                        .padding(.trailing, 16)
                        .padding(.bottom, 120)
                    }
                }
                
                // Interactive Seek Bar at Bottom - Only when controls shown
                if showControls {
                    VStack {
                        Spacer()
                        VStack(spacing: 4) {
                            seekBarView()
                        }
                        .padding(.bottom, 100)
                    }
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
            
            // Right Side: Social Actions (always visible in parent view)
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
                
                Image(systemName: "gobackward.5")
                    .font(.system(size: 60))
                    .foregroundColor(.white)
                    .padding(20)
                    .background(Color.black.opacity(0.5))
                    .clipShape(Circle())
                    .transition(.scale.combined(with: .opacity))
                
                Spacer()
            } else {
                Spacer()
                
                Image(systemName: "goforward.5")
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
    
    @ViewBuilder
    private func seekBarView() -> some View {
        VStack(spacing: 8) {
            // Interactive Seek Slider
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // Track background
                    Rectangle()
                        .fill(Color.white.opacity(0.3))
                        .frame(height: 2)
                        .cornerRadius(1)
                    
                    // Progress fill
                    Rectangle()
                        .fill(Color.red)
                        .frame(width: geometry.size.width * CGFloat(playerManager.progress), height: 2)
                        .cornerRadius(1)
                    
                    // Draggable thumb
                    Circle()
                        .fill(Color.red)
                        .frame(width: 12, height: 12)
                        .shadow(color: .black.opacity(0.4), radius: 3, x: 0, y: 2)
                        .offset(x: (geometry.size.width - 12) * CGFloat(playerManager.progress))
                        .gesture(
                            DragGesture(minimumDistance: 0)
                                .onChanged { value in
                                    let newProgress = max(0, min(1, value.location.x / geometry.size.width))
                                    let newTime = playerManager.duration * newProgress
                                    playerManager.seek(to: newTime)
                                }
                        )
                }
            }
            .frame(height: 12)
            .padding(.horizontal, 16)
            
            // Episode info - 2 lines max
            VStack(alignment: .leading, spacing: 2) {
                if let episode = currentEpisode {
                    Text(episode.title)
                        .font(.body.bold())
                        .foregroundColor(.white)
                        .lineLimit(1)
                    
                    Text("\(series?.title ?? "") • S\(episode.seasonNumber)E\(episode.episodeNumber)")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.8))
                        .lineLimit(1)
                }
            }
            .padding(.horizontal, 16)
        }
        .padding(.bottom, 4)
    }
    
    // MARK: - Gesture Handlers
    
    private func handleSingleTap() {
        // Single tap now toggles play/pause
        playerManager.togglePlayPause()
        
        // Also show controls briefly
        withAnimation {
            showControls = true
        }
        resetControlsTimer()
    }
    
    private func handleDoubleTap(location: CGPoint, width: CGFloat) {
        let leftThird = width / 3
        let rightThird = width * 2 / 3
        
        if location.x < leftThird {
            // Rewind 5s (changed from 10s)
            playerManager.seek(by: -5)
            showSeekAnimation = .backward
        } else if location.x > rightThird {
            // Forward 5s (changed from 10s)
            playerManager.seek(by: 5)
            showSeekAnimation = .forward
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            showSeekAnimation = nil
        }
    }
    
    private func handleLongPress() {
        if speedLocked {
            // Start unlock process (2 seconds)
            isUnlocking = true
            unlockTimer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: false) { _ in
                speedLocked = false
                isLongPressing = false
                isUnlocking = false
                playerManager.setPlaybackRate(1.0)
            }
        } else {
            // Start 2x speed
            isLongPressing = true
            playerManager.setPlaybackRate(2.0)
            
            // Lock after 3 seconds of holding
            lockTimer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: false) { _ in
                speedLocked = true
            }
        }
    }
    
    private func handleLongPressEnd() {
        // Cancel timers
        lockTimer?.invalidate()
        unlockTimer?.invalidate()
        
        // If was unlocking, cancel it
        if isUnlocking {
            isUnlocking = false
            return
        }
        
        // If not locked, return to normal speed
        if !speedLocked {
            isLongPressing = false
            playerManager.setPlaybackRate(1.0)
        }
    }
    
    private var speedIndicatorText: String {
        if isUnlocking {
            return "Unlocking..."
        } else if speedLocked {
            return "2x Speed (Locked)"
        } else {
            return "2x Speed"
        }
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
