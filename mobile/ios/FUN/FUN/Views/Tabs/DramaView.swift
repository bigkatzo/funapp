/**
 * FUN App - Drama View
 * Browse series grid
 */

import SwiftUI

struct DramaView: View {
    @State private var series: [Series] = []
    @State private var isLoading = false
    @State private var searchText = ""
    
    var body: some View {
        NavigationView {
            ZStack {
                Colors.background.ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Search bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(Colors.textSecondary)
                        
                        TextField("Search series...", text: $searchText)
                            .foregroundColor(Colors.textPrimary)
                        
                        if !searchText.isEmpty {
                            Button(action: {
                                searchText = ""
                            }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(Colors.textSecondary)
                            }
                        }
                    }
                    .padding()
                    .background(Colors.surface)
                    .cornerRadius(12)
                    .padding()
                    
                    if series.isEmpty {
                        emptyStateView
                    } else {
                        ScrollView {
                            LazyVGrid(columns: [
                                GridItem(.flexible(), spacing: 16),
                                GridItem(.flexible(), spacing: 16)
                            ], spacing: 16) {
                                ForEach(series) { item in
                                    seriesCard(item)
                                }
                            }
                            .padding()
                        }
                    }
                }
            }
            .navigationTitle("Drama")
            .navigationBarTitleDisplayMode(.large)
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "square.stack.3d.up.slash")
                .font(.system(size: 60))
                .foregroundColor(Colors.textSecondary)
            
            Text("No Series Available")
                .font(.headline)
                .foregroundColor(Colors.textPrimary)
            
            Text("Check back later for new series")
                .font(.subheadline)
                .foregroundColor(Colors.textSecondary)
        }
    }
    
    private func seriesCard(_ series: Series) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            // Thumbnail
            Rectangle()
                .fill(Color.gray.opacity(0.3))
                .aspectRatio(9/16, contentMode: .fit)
                .cornerRadius(12)
                .overlay(
                    VStack {
                        Spacer()
                        HStack {
                            Image(systemName: "play.circle.fill")
                                .font(.largeTitle)
                                .foregroundColor(.white)
                        }
                        Spacer()
                    }
                )
            
            // Title
            Text(series.title)
                .font(.subheadline.weight(.semibold))
                .foregroundColor(Colors.textPrimary)
                .lineLimit(2)
            
            // Episode count
            Text("\(series.totalEpisodes) episodes")
                .font(.caption)
                .foregroundColor(Colors.textSecondary)
        }
    }
}

#Preview {
    DramaView()
}
