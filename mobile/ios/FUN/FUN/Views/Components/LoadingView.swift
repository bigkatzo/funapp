/**
 * FUN App - Loading View
 * Shimmer loading state
 */

import SwiftUI

struct LoadingView: View {
    @State private var isAnimating = false
    
    var body: some View {
        VStack(spacing: 16) {
            ForEach(0..<3) { _ in
                ShimmerCard()
            }
        }
        .padding()
    }
}

struct ShimmerCard: View {
    @State private var startPoint = UnitPoint(x: -1, y: 0.5)
    @State private var endPoint = UnitPoint(x: 0, y: 0.5)
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Thumbnail
            RoundedRectangle(cornerRadius: 12)
                .fill(
                    LinearGradient(
                        colors: [Colors.surface, Colors.cardBackground, Colors.surface],
                        startPoint: startPoint,
                        endPoint: endPoint
                    )
                )
                .frame(height: 200)
            
            // Title
            RoundedRectangle(cornerRadius: 4)
                .fill(
                    LinearGradient(
                        colors: [Colors.surface, Colors.cardBackground, Colors.surface],
                        startPoint: startPoint,
                        endPoint: endPoint
                    )
                )
                .frame(height: 20)
            
            // Subtitle
            RoundedRectangle(cornerRadius: 4)
                .fill(
                    LinearGradient(
                        colors: [Colors.surface, Colors.cardBackground, Colors.surface],
                        startPoint: startPoint,
                        endPoint: endPoint
                    )
                )
                .frame(width: 150, height: 16)
        }
        .onAppear {
            withAnimation(Animation.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                startPoint = UnitPoint(x: 1, y: 0.5)
                endPoint = UnitPoint(x: 2, y: 0.5)
            }
        }
    }
}

#Preview {
    LoadingView()
        .background(Colors.background)
}
