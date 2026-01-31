/**
 * FUN App - Video Player Manager
 * Manages AVPlayer state and playback
 */

import Foundation
import AVKit
import Combine

class VideoPlayerManager: ObservableObject {
    @Published var isPlaying = false
    @Published var currentTime: Double = 0
    @Published var duration: Double = 0
    @Published var progress: Double = 0
    
    var player: AVPlayer?
    private var timeObserver: Any?
    private var cancellables = Set<AnyCancellable>()
    
    init() {}
    
    func setupPlayer(url: URL) {
        player = AVPlayer(url: url)
        setupTimeObserver()
        setupNotifications()
    }
    
    private func setupTimeObserver() {
        let interval = CMTime(seconds: 0.1, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
        
        timeObserver = player?.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] time in
            guard let self = self else { return }
            
            self.currentTime = time.seconds
            
            if let duration = self.player?.currentItem?.duration.seconds,
               duration.isFinite {
                self.duration = duration
                self.progress = duration > 0 ? self.currentTime / duration : 0
            }
        }
    }
    
    private func setupNotifications() {
        NotificationCenter.default.publisher(for: .AVPlayerItemDidPlayToEndTime)
            .sink { [weak self] _ in
                self?.isPlaying = false
            }
            .store(in: &cancellables)
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
        let cmTime = CMTime(seconds: time, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
        player?.seek(to: cmTime)
    }
    
    func seek(by seconds: Double) {
        let newTime = currentTime + seconds
        seek(to: max(0, min(newTime, duration)))
    }
    
    func setPlaybackRate(_ rate: Float) {
        player?.rate = rate
    }
    
    deinit {
        if let timeObserver = timeObserver {
            player?.removeTimeObserver(timeObserver)
        }
    }
}
