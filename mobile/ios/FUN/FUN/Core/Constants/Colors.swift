/**
 * FUN App - Color Palette
 * Shared design system colors
 */

import SwiftUI

struct Colors {
    // Primary colors
    static let primary = Color(hex: "007BFF")
    static let background = Color(hex: "000000")
    static let surface = Color(hex: "1A1A1A")
    static let cardBackground = Color(hex: "2A2A2A")
    
    // Accent colors
    static let accent = Color(hex: "FF3B30")
    static let success = Color(hex: "34C759")
    static let warning = Color(hex: "FF9500")
    
    // Text colors
    static let textPrimary = Color.white
    static let textSecondary = Color(hex: "A0A0A0")
    
    // Additional UI colors
    static let divider = Color(hex: "333333")
    static let overlay = Color.black.opacity(0.6)
}

// Color extension for hex support
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
