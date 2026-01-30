/**
 * FUN App - Vertical Video Player
 * TikTok-style vertical scrolling video player with HLS support
 */

import SwiftUI
import AVKit
import Combine

struct VerticalVideoPlayer: View {
    let episodes: [FeedEpisode]
    @State private var currentIndex: Int = 0
    @State private var showControls: Bool = true
    @State private var dragOffset: CGFloat = 0
    @StateObject private var feedViewModel = FeedViewModel()
    
    var body: some View {
        ZStack {
            Colors.background.ignoresSafeArea()
            
            TabView(selection: $currentIndex) {
                ForEach(Array(episodes.enumerated()), id: \.element.id) { index, episode in
                    VideoPlayerView(
                        episode: episode,
                        isActive: index == currentIndex,
                        showControls: $showControls
                    )
                    .tag(index)
                }
            }
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
            .ignoresSafeArea()
            .onChange(of: currentIndex) { newIndex in
                // Notify episode started
                feedViewModel.onEpisodeStarted()
                
                // Preload next episode
                if newIndex < episodes.count - 2 {
                    // Trigger preload logic
                }
            }
        }
    }
}

struct VideoPlayerView: View {
    let episode: FeedEpisode
    let isActive: Bool
    @Binding var showControls: Bool
    
    @StateObject private var playerManager = VideoPlayerManager()
    @State private var showLikeAnimation = false
    @State private var showUnlockSheet = false
    @State private var lastTapTime: Date?
    @State private var lastTapLocation: CGPoint?
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Video Player Layer
                if let videoUrl = episode.episode.videoUrl,
                   let isUnlocked = episode.episode.isUnlocked,
                   isUnlocked {
                    AVPlayerView(player: playerManager.player)
                        .ignoresSafeArea()
                        .onTapGesture(count: 2) { location in
                            handleDoubleTap(at: location)
                        }
                        .onTapGesture {
                            withAnimation {
                                showControls.toggle()
                            }
                        }
                        .gesture(
                            DragGesture()
                                .onChanged { value in
                                    handleDragGesture(value: value, geometry: geometry)
                                }
                        )
                } else {
                    // Locked Episode - Show Thumbnail
                    AsyncImage(url: URL(string: episode.episode.thumbnailUrl)) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Color.gray.opacity(0.3)
                    }
                    .frame(width: geometry.size.width, height: geometry.size.height)
                    .blur(radius: 20)
                    
                    // Lock Icon
                    VStack {
                        Image(systemName: "lock.fill")
                            .font(.system(size: 80))
                            .foregroundColor(.white)
                        
                        Text("Tap to Unlock")
                            .font(.headline)
                            .foregroundColor(.white)
                    }
                    .onTapGesture {
                        showUnlockSheet = true
                    }
                }
                
                // Like Animation
                if showLikeAnimation {
                    LikeAnimationView()
                        .transition(.scale.combined(with: .opacity))
                }
                
                // Player Overlay (Info, Buttons)
                if showControls {
                    PlayerOverlay(
                        episode: episode,
                        playerManager: playerManager,
                        onLike: {
                            // Trigger like action
                        },
                        onComment: {
                            // Show comments
                        },
                        onShare: {
                            // Show share sheet
                        }
                    )
                }
                
                // Loading Indicator
                if playerManager.isBuffering {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(1.5)
                }
                
                // Controls (play/pause)
                if showControls && !playerManager.isPlaying {
                    Button(action: {
                        playerManager.play()
                    }) {
                        Image(systemName: "play.circle.fill")
                            .font(.system(size: 70))
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
            }
        }
        .onAppear {
            if isActive, let videoUrl = episode.episode.videoUrl {
                setupPlayer(url: videoUrl)
            }
        }
        .onChange(of: isActive) { active in
            if active, let videoUrl = episode.episode.videoUrl {
                setupPlayer(url: videoUrl)
            } else {
                playerManager.pause()
            }
        }
        .sheet(isPresented: $showUnlockSheet) {
            UnlockSheet(episode: episode.episode, seriesId: episode.series.id)
        }
    }
    
    private func setupPlayer(url: String) {
        guard let videoURL = URL(string: url) else { return }
        playerManager.setupPlayer(url: videoURL)
        playerManager.play()
    }
    
    private func handleDoubleTap(at location: CGPoint) {
        let now = Date()
        
        if let lastTime = lastTapTime,
           let lastLocation = lastTapLocation,
           now.timeIntervalSince(lastTime) < 0.3 {
            // Double tap detected
            let screenWidth = UIScreen.main.bounds.width
            
            if location.x < screenWidth / 3 {
                // Left side - rewind 10s
                playerManager.seek(by: -10)
            } else if location.x > screenWidth * 2 / 3 {
                // Right side - forward 10s
                playerManager.seek(by: 10)
            } else {
                // Center - like
                showLikeAnimation = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                    showLikeAnimation = false
                }
            }
        }
        
        lastTapTime = now
        lastTapLocation = location
    }
    
    private func handleDragGesture(value: DragGesture.Value, geometry: GeometryProxy) {
        let screenWidth = geometry.size.width
        let dragX = value.location.x
        
        // Left edge - volume control
        if dragX < screenWidth * 0.2 {
            let dragY = value.translation.height
            let volumeChange = Float(dragY / 200)
            // Adjust volume
        }
        // Right edge - brightness control
        else if dragX > screenWidth * 0.8 {
            let dragY = value.translation.height
            let brightnessChange = dragY / 200
            // Adjust brightness
        }
    }
}

// AVPlayer View Wrapper
struct AVPlayerView: UIViewRepresentable {
    let player: AVPlayer?
    
    func makeUIView(context: Context) -> UIView {
        let view = UIView()
        view.backgroundColor = .black
        
        if let player = player {
            let playerLayer = AVPlayerLayer(player: player)
            playerLayer.videoGravity = .resizeAspectFill
            playerLayer.frame = UIScreen.main.bounds
            view.layer.addSublayer(playerLayer)
            context.coordinator.playerLayer = playerLayer
        }
        
        return view
    }
    
    func updateUIView(_ uiView: UIView, context: Context) {
        if let playerLayer = context.coordinator.playerLayer {
            playerLayer.frame = uiView.bounds
        }
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }
    
    class Coordinator {
        var playerLayer: AVPlayerLayer?
    }
}

// Video Player Manager
class VideoPlayerManager: ObservableObject {
    @Published var player: AVPlayer?
    @Published var isPlaying = false
    @Published var isBuffering = false
    @Published var currentTime: Double = 0
    @Published var duration: Double = 0
    @Published var progress: Double = 0
    
    private var timeObserver: Any?
    private var cancellables = Set<AnyCancellable>()
    
    func setupPlayer(url: URL) {
        // Clean up existing player
        cleanup()
        
        let asset = AVURLAsset(url: url)
        let playerItem = AVPlayerItem(asset: asset)
        
        // Apply quality preferences
        let quality = UserDefaults.standard.videoQuality
        if quality != .auto {
            playerItem.preferredMaximumResolution = quality.resolution
        }
        
        player = AVPlayer(playerItem: playerItem)
        player?.actionAtItemEnd = .none
        
        addObservers()
    }
    
    func play() {
        player?.play()
        isPlaying = true
    }
    
    func pause() {
        player?.pause()
        isPlaying = false
    }
    
    func seek(by seconds: Double) {
        guard let player = player,
              let currentItem = player.currentItem else { return }
        
        let currentTime = CMTimeGetSeconds(currentItem.currentTime())
        let newTime = max(0, currentTime + seconds)
        let cmTime = CMTime(seconds: newTime, preferredTimescale: 600)
        
        player.seek(to: cmTime)
    }
    
    func seek(to time: Double) {
        let cmTime = CMTime(seconds: time, preferredTimescale: 600)
        player?.seek(to: cmTime)
    }
    
    private func addObservers() {
        guard let player = player,
              let currentItem = player.currentItem else { return }
        
        // Time observer
        let interval = CMTime(seconds: 0.5, preferredTimescale: 600)
        timeObserver = player.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] time in
            self?.currentTime = time.seconds
            if let duration = self?.duration, duration > 0 {
                self?.progress = time.seconds / duration
            }
            
            // Auto-advance at 95%
            if let progress = self?.progress, progress >= 0.95 {
                // Trigger auto-advance
            }
        }
        
        // Duration observer
        currentItem.publisher(for: \.duration)
            .sink { [weak self] duration in
                if duration.isNumeric {
                    self?.duration = duration.seconds
                }
            }
            .store(in: &cancellables)
        
        // Status observer
        currentItem.publisher(for: \.status)
            .sink { [weak self] status in
                switch status {
                case .readyToPlay:
                    self?.isBuffering = false
                case .failed:
                    self?.isBuffering = false
                default:
                    break
                }
            }
            .store(in: &cancellables)
        
        // Buffering observer
        currentItem.publisher(for: \.isPlaybackBufferEmpty)
            .sink { [weak self] isEmpty in
                self?.isBuffering = isEmpty
            }
            .store(in: &cancellables)
        
        // Playback stalled observer
        NotificationCenter.default.publisher(for: .AVPlayerItemPlaybackStalled, object: currentItem)
            .sink { [weak self] _ in
                self?.isBuffering = true
            }
            .store(in: &cancellables)
    }
    
    func cleanup() {
        if let timeObserver = timeObserver {
            player?.removeTimeObserver(timeObserver)
            self.timeObserver = nil
        }
        
        cancellables.removeAll()
        player?.pause()
        player = nil
        
        isPlaying = false
        isBuffering = false
        currentTime = 0
        duration = 0
        progress = 0
    }
    
    deinit {
        cleanup()
    }
}

// Like Animation
struct LikeAnimationView: View {
    @State private var scale: CGFloat = 0.5
    @State private var opacity: Double = 0
    
    var body: some View {
        Image(systemName: "heart.fill")
            .font(.system(size: 100))
            .foregroundColor(.red)
            .scaleEffect(scale)
            .opacity(opacity)
            .onAppear {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                    scale = 1.2
                    opacity = 1
                }
                
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    withAnimation(.easeOut(duration: 0.3)) {
                        scale = 1.5
                        opacity = 0
                    }
                }
            }
    }
}

#Preview {
    VerticalVideoPlayer(episodes: [])
}
