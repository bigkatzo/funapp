/**
 * FUN App - View Extensions
 * Common view modifiers and animations
 */

import SwiftUI

// MARK: - Shimmer Effect

extension View {
    func shimmer() -> some View {
        self.modifier(ShimmerModifier())
    }
}

struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = 0
    
    func body(content: Content) -> some View {
        content
            .overlay(
                LinearGradient(
                    colors: [
                        .clear,
                        Colors.primary.opacity(0.3),
                        .clear
                    ],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .offset(x: -200 + phase)
                .mask(content)
            )
            .onAppear {
                withAnimation(
                    .linear(duration: 1.5)
                    .repeatForever(autoreverses: false)
                ) {
                    phase = 600
                }
            }
    }
}

// MARK: - Loading State

extension View {
    func loading(_ isLoading: Bool) -> some View {
        self.overlay(
            Group {
                if isLoading {
                    LoadingOverlay()
                }
            }
        )
    }
}

struct LoadingOverlay: View {
    var body: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()
            
            VStack(spacing: 16) {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.5)
                
                Text("Loading...")
                    .font(.subheadline)
                    .foregroundColor(.white)
            }
            .padding(32)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Colors.surface)
            )
        }
    }
}

// MARK: - Error Toast

extension View {
    func errorToast(message: Binding<String?>) -> some View {
        self.overlay(
            ErrorToast(message: message),
            alignment: .top
        )
    }
}

struct ErrorToast: View {
    @Binding var message: String?
    
    var body: some View {
        if let message = message {
            VStack {
                HStack(spacing: 12) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .foregroundColor(.white)
                    
                    Text(message)
                        .font(.subheadline)
                        .foregroundColor(.white)
                        .lineLimit(2)
                    
                    Spacer()
                    
                    Button(action: {
                        withAnimation {
                            self.message = nil
                        }
                    }) {
                        Image(systemName: "xmark")
                            .foregroundColor(.white)
                            .font(.caption)
                    }
                }
                .padding()
                .background(Colors.accent)
                .cornerRadius(12)
                .shadow(radius: 8)
                .padding()
                
                Spacer()
            }
            .transition(.move(edge: .top).combined(with: .opacity))
            .animation(.spring(), value: message)
            .onAppear {
                // Auto-dismiss after 3 seconds
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    withAnimation {
                        self.message = nil
                    }
                }
            }
        }
    }
}

// MARK: - Success Toast

extension View {
    func successToast(message: Binding<String?>) -> some View {
        self.overlay(
            SuccessToast(message: message),
            alignment: .top
        )
    }
}

struct SuccessToast: View {
    @Binding var message: String?
    
    var body: some View {
        if let message = message {
            VStack {
                HStack(spacing: 12) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.white)
                    
                    Text(message)
                        .font(.subheadline)
                        .foregroundColor(.white)
                    
                    Spacer()
                }
                .padding()
                .background(Colors.success)
                .cornerRadius(12)
                .shadow(radius: 8)
                .padding()
                
                Spacer()
            }
            .transition(.move(edge: .top).combined(with: .opacity))
            .animation(.spring(), value: message)
            .onAppear {
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    withAnimation {
                        self.message = nil
                    }
                }
            }
        }
    }
}

// MARK: - Bounce Animation

extension View {
    func bounceOnTap() -> some View {
        self.modifier(BounceModifier())
    }
}

struct BounceModifier: ViewModifier {
    @State private var scale: CGFloat = 1.0
    
    func body(content: Content) -> some View {
        content
            .scaleEffect(scale)
            .simultaneousGesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                            scale = 0.95
                        }
                    }
                    .onEnded { _ in
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                            scale = 1.0
                        }
                    }
            )
    }
}

// MARK: - Fade In Animation

extension View {
    func fadeIn(duration: Double = 0.5) -> some View {
        self.modifier(FadeInModifier(duration: duration))
    }
}

struct FadeInModifier: ViewModifier {
    let duration: Double
    @State private var opacity: Double = 0
    
    func body(content: Content) -> some View {
        content
            .opacity(opacity)
            .onAppear {
                withAnimation(.easeIn(duration: duration)) {
                    opacity = 1
                }
            }
    }
}

// MARK: - Slide In Animation

extension View {
    func slideIn(from edge: Edge, duration: Double = 0.5) -> some View {
        self.modifier(SlideInModifier(edge: edge, duration: duration))
    }
}

struct SlideInModifier: ViewModifier {
    let edge: Edge
    let duration: Double
    @State private var offset: CGFloat = 100
    
    func body(content: Content) -> some View {
        content
            .offset(
                x: edge == .leading ? -offset : (edge == .trailing ? offset : 0),
                y: edge == .top ? -offset : (edge == .bottom ? offset : 0)
            )
            .onAppear {
                withAnimation(.spring(response: duration, dampingFraction: 0.8)) {
                    offset = 0
                }
            }
    }
}

// MARK: - Touch Optimization (TikTok-style)

extension View {
    /// Prevent text selection and improve touch responsiveness
    func disableTextSelection() -> some View {
        self
            .textSelection(.disabled)
            .allowsHitTesting(true)
    }
    
    /// Optimize for TikTok-style video interactions
    func optimizeForVideoGestures() -> some View {
        self
            .contentShape(Rectangle())
            .simultaneousGesture(TapGesture(count: 0))
    }
}
