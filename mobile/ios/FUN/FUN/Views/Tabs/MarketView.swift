/**
 * FUN App - Market View (Placeholder)
 * Commerce integration deferred to Phase 2
 */

import SwiftUI

struct MarketView: View {
    var body: some View {
        NavigationView {
            ZStack {
                Colors.background.ignoresSafeArea()
                
                VStack(spacing: 24) {
                    Image(systemName: "bag.fill")
                        .font(.system(size: 80))
                        .foregroundColor(Colors.primary)
                    
                    Text("Market Coming Soon")
                        .font(.title.bold())
                        .foregroundColor(Colors.textPrimary)
                    
                    Text("Shop for products featured in your favorite series")
                        .font(.body)
                        .foregroundColor(Colors.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                    
                    Text("Stay tuned for updates!")
                        .font(.caption)
                        .foregroundColor(Colors.textSecondary)
                }
            }
            .navigationTitle("Market")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}

#Preview {
    MarketView()
}
