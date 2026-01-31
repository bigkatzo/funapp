/**
 * FUN App - Episode Transition Animation
 * Smooth animation between episodes
 */

import SwiftUI

struct EpisodeTransition: View {
    let fromEpisode: Episode
    let toEpisode: Episode
    let onComplete: () -> Void
    
    @State private var phase: TransitionPhase = .start
    @State private var progress: CGFloat = 0
    
    enum TransitionPhase {
        case start, showing, complete
    }
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack(spacing: 32) {
                // From Episode (fading out)
                if phase == .start {
                    VStack(spacing: 8) {
                        Text("Now leaving")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.6))
                        Text(fromEpisode.title)
                            .font(.body.bold())
                            .foregroundColor(.white.opacity(0.8))
                    }
                    .transition(.opacity.combined(with: .move(edge: .leading)))
                }
                
                // Arrow indicator
                Image(systemName: "arrow.down.circle.fill")
                    .font(.system(size: 48))
                    .foregroundColor(.purple)
                    .opacity(phase == .showing ? 1 : 0.3)
                    .scaleEffect(phase == .showing ? 1.2 : 1.0)
                    .animation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true), value: phase)
                
                // To Episode (fading in)
                if phase == .showing {
                    VStack(spacing: 8) {
                        Text("Up next")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.6))
                        Text(toEpisode.title)
                            .font(.title3.bold())
                            .foregroundColor(.white)
                        Text("S\(toEpisode.seasonNumber)E\(toEpisode.episodeNumber)")
                            .font(.subheadline)
                            .foregroundColor(.purple)
                    }
                    .transition(.opacity.combined(with: .move(edge: .trailing)))
                }
                
                // Loading bar
                VStack {
                    ProgressView(value: progress, total: 1.0)
                        .progressViewStyle(.linear)
                        .tint(.purple)
                        .frame(width: 200)
                }
            }
            .padding()
        }
        .onAppear {
            animateTransition()
        }
    }
    
    private func animateTransition() {
        // Phase 1: Show from episode (0.2s)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            withAnimation(.easeInOut(duration: 0.3)) {
                phase = .showing
            }
        }
        
        // Progress animation
        withAnimation(.linear(duration: 0.5)) {
            progress = 1.0
        }
        
        // Phase 2: Complete (0.5s)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            withAnimation(.easeInOut(duration: 0.2)) {
                phase = .complete
            }
            
            // Call completion
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                onComplete()
            }
        }
    }
}
