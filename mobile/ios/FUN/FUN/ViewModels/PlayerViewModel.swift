/**
 * FUN App - Player ViewModel
 * Manages video playback state
 */

import Foundation
import AVFoundation
import Combine

@MainActor
class PlayerViewModel: ObservableObject {
    @Published var isPlaying = false
    @Published var currentTime: Double = 0
    @Published var duration: Double = 0
    @Published var isBuffering = false
    @Published var error: Error?
    
    var player: AVPlayer?
    private var timeObserver: Any?
    
    // MARK: - Playback Control
    
    func setupPlayer(url: URL) {
        let asset = AVURLAsset(url: url)
        let playerItem = AVPlayerItem(asset: asset)
        
        // Apply quality preferences
        let quality = UserDefaults.standard.videoQuality
        if quality != .auto {
            playerItem.preferredMaximumResolution = quality.resolution
        }
        
        player = AVPlayer(playerItem: playerItem)
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
    
    func togglePlayPause() {
        if isPlaying {
            pause()
        } else {
            play()
        }
    }
    
    func seek(to time: Double) {
        let cmTime = CMTime(seconds: time, preferredTimescale: 600)
        player?.seek(to: cmTime)
    }
    
    func cleanup() {
        player?.pause()
        player = nil
        removeObservers()
    }
    
    // MARK: - Observers
    
    private func addObservers() {
        guard let player = player else { return }
        
        // Time observer
        let interval = CMTime(seconds: 0.5, preferredTimescale: 600)
        timeObserver = player.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] time in
            self?.currentTime = time.seconds
        }
        
        // Duration observer
        player.currentItem?.publisher(for: \.duration)
            .sink { [weak self] duration in
                if duration.isNumeric {
                    self?.duration = duration.seconds
                }
            }
            .store(in: &cancellables)
        
        // Status observer
        player.currentItem?.publisher(for: \.status)
            .sink { [weak self] status in
                switch status {
                case .failed:
                    self?.error = player.currentItem?.error
                case .readyToPlay:
                    self?.error = nil
                default:
                    break
                }
            }
            .store(in: &cancellables)
        
        // Buffering observer
        player.currentItem?.publisher(for: \.isPlaybackBufferEmpty)
            .sink { [weak self] isEmpty in
                self?.isBuffering = isEmpty
            }
            .store(in: &cancellables)
    }
    
    private func removeObservers() {
        if let timeObserver = timeObserver {
            player?.removeTimeObserver(timeObserver)
            self.timeObserver = nil
        }
        cancellables.removeAll()
    }
    
    private var cancellables = Set<AnyCancellable>()
}

// MARK: - Video Quality Extensions

extension VideoQuality {
    var resolution: CGSize {
        switch self {
        case .auto:
            return .zero
        case .quality360:
            return CGSize(width: 360, height: 640)
        case .quality540:
            return CGSize(width: 540, height: 960)
        case .quality720:
            return CGSize(width: 720, height: 1280)
        case .quality1080:
            return CGSize(width: 1080, height: 1920)
        }
    }
}
