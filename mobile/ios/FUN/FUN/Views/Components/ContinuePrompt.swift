/**
 * FUN App - Continue Prompt
 * Shows after Episode 1 ends in Discover mode
 */

import SwiftUI

struct ContinuePrompt: View {
    let series: Series
    let nextEpisode: Episode
    let onContinue: () -> Void
    let onSkip: () -> Void
    
    @State private var countdown = 10
    @State private var isVisible = true
    
    var body: some View {
        if isVisible {
            ZStack {
                // Background blur
                Color.black.opacity(0.8)
                    .ignoresSafeArea()
                    .blur(radius: 20)
                
                VStack(spacing: 24) {
                    // Next Episode Thumbnail
                    AsyncImage(url: URL(string: nextEpisode.thumbnailUrl)) { image in
                        image
                            .resizable()
                            .aspectRatio(16/9, contentMode: .fill)
                    } placeholder: {
                        Rectangle()
                            .fill(Color.gray.opacity(0.3))
                    }
                    .frame(height: 200)
                    .cornerRadius(12)
                    .overlay(
                        LinearGradient(
                            colors: [.clear, .black.opacity(0.8)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                        .cornerRadius(12)
                    )
                    .overlay(
                        VStack {
                            Spacer()
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Next Episode")
                                        .font(.caption)
                                        .foregroundColor(.white.opacity(0.8))
                                    Text(nextEpisode.title)
                                        .font(.headline)
                                        .foregroundColor(.white)
                                        .lineLimit(1)
                                }
                                Spacer()
                            }
                            .padding()
                        }
                    )
                    
                    // Text
                    VStack(spacing: 8) {
                        Text("Continue watching?")
                            .font(.title2.bold())
                            .foregroundColor(.white)
                        
                        Text(series.title)
                            .font(.title3)
                            .foregroundColor(.white.opacity(0.9))
                        
                        Text("Season \(nextEpisode.seasonNumber), Episode \(nextEpisode.episodeNumber)")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.7))
                    }
                    
                    // Buttons
                    VStack(spacing: 12) {
                        Button(action: {
                            isVisible = false
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                                onContinue()
                            }
                        }) {
                            HStack {
                                Image(systemName: "play.fill")
                                Text("Continue Watching")
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(
                                LinearGradient(
                                    colors: [Color.purple, Color.pink],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(12)
                        }
                        
                        Button(action: {
                            isVisible = false
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                                onSkip()
                            }
                        }) {
                            HStack {
                                Image(systemName: "xmark")
                                Text("Keep Discovering (\(countdown)s)")
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(Color.white.opacity(0.2))
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.white.opacity(0.3), lineWidth: 1)
                            )
                        }
                    }
                    
                    // Description
                    if let description = nextEpisode.description {
                        Text(description)
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.6))
                            .multilineTextAlignment(.center)
                            .lineLimit(2)
                            .padding(.horizontal)
                    }
                }
                .padding(.horizontal, 24)
            }
            .transition(.opacity.combined(with: .scale))
            .onAppear {
                startCountdown()
            }
        }
    }
    
    private func startCountdown() {
        Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { timer in
            countdown -= 1
            if countdown <= 0 {
                timer.invalidate()
                onSkip()
            }
        }
    }
}
