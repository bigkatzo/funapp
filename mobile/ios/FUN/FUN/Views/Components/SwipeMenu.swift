/**
 * FUN App - Swipe Menu
 * Navigation menu shown on swipe down in Binge/Series modes
 */

import SwiftUI

struct SwipeMenu: View {
    let hasPrevious: Bool
    let mode: PlaylistMode
    let onPreviousEpisode: (() -> Void)?
    let onBackToDiscover: (() -> Void)?
    let onBackToSeries: (() -> Void)?
    let onClose: () -> Void
    
    @State private var isVisible = true
    
    var body: some View {
        if isVisible {
            ZStack {
                // Background
                Color.black.opacity(0.6)
                    .ignoresSafeArea()
                    .onTapGesture {
                        dismiss()
                    }
                
                // Menu
                VStack(spacing: 16) {
                    Text("Where would you like to go?")
                        .font(.title3.bold())
                        .foregroundColor(.white)
                        .padding(.bottom, 8)
                    
                    // Previous Episode
                    if hasPrevious, let onPrevious = onPreviousEpisode {
                        Button(action: {
                            dismiss()
                            onPrevious()
                        }) {
                            HStack {
                                Image(systemName: "chevron.up")
                                Text("Previous Episode")
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.white.opacity(0.2))
                            .cornerRadius(12)
                        }
                    }
                    
                    // Back to Discover (Binge mode)
                    if mode == .binge, let onDiscover = onBackToDiscover {
                        Button(action: {
                            dismiss()
                            onDiscover()
                        }) {
                            HStack {
                                Image(systemName: "house.fill")
                                Text("Back to Discover")
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.white.opacity(0.1))
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.white.opacity(0.3), lineWidth: 1)
                            )
                        }
                    }
                    
                    // Back to Series (Series mode)
                    if mode == .series, let onSeries = onBackToSeries {
                        Button(action: {
                            dismiss()
                            onSeries()
                        }) {
                            HStack {
                                Image(systemName: "arrow.left")
                                Text("Back to Series")
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.white.opacity(0.1))
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.white.opacity(0.3), lineWidth: 1)
                            )
                        }
                    }
                    
                    // Cancel
                    Button(action: dismiss) {
                        Text("Cancel")
                            .font(.headline)
                            .foregroundColor(.white.opacity(0.8))
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                    }
                }
                .padding(24)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color.white.opacity(0.1))
                        .background(.ultraThinMaterial)
                )
                .padding(.horizontal, 32)
            }
            .transition(.opacity.combined(with: .move(edge: .bottom)))
        }
    }
    
    private func dismiss() {
        withAnimation {
            isVisible = false
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            onClose()
        }
    }
}
