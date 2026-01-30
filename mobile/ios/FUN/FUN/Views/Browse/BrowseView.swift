import SwiftUI

struct BrowseView: View {
    @StateObject private var viewModel = BrowseViewModel()
    @State private var searchText = ""
    @State private var selectedGenre: String = "all"
    
    let genres = ["all", "Romance", "Drama", "Mystery", "Thriller", "Youth", "Sci-Fi", "Historical"]
    
    let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search Bar
                SearchBar(text: $searchText)
                    .padding(.horizontal)
                    .padding(.top, 8)
                
                // Genre Filter
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(genres, id: \.self) { genre in
                            GenreChip(
                                title: genre.capitalized,
                                isSelected: selectedGenre == genre,
                                action: { selectedGenre = genre }
                            )
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical, 12)
                
                // Series Grid
                if viewModel.isLoading {
                    LoadingView()
                } else if filteredSeries.isEmpty {
                    EmptyStateView(
                        icon: "magnifyingglass",
                        title: "No Series Found",
                        message: "Try adjusting your search or filters"
                    )
                } else {
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: 12) {
                            ForEach(filteredSeries) { series in
                                NavigationLink(destination: SeriesDetailView(series: series)) {
                                    SeriesCard(series: series)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding(.horizontal)
                        .padding(.bottom, 100) // Tab bar clearance
                    }
                }
            }
            .navigationTitle("Explore")
            .navigationBarTitleDisplayMode(.large)
            .background(Color(.systemGroupedBackground))
        }
        .onAppear {
            viewModel.loadSeries()
        }
    }
    
    var filteredSeries: [Series] {
        viewModel.series.filter { series in
            let matchesSearch = searchText.isEmpty ||
                series.title.localizedCaseInsensitiveContains(searchText) ||
                series.description.localizedCaseInsensitiveContains(searchText)
            
            let matchesGenre = selectedGenre == "all" ||
                series.genre.contains(selectedGenre)
            
            return matchesSearch && matchesGenre
        }
    }
}

// MARK: - Series Card
struct SeriesCard: View {
    let series: Series
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Thumbnail
            AsyncImage(url: URL(string: series.thumbnailUrl)) { phase in
                switch phase {
                case .empty:
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .aspectRatio(2/3, contentMode: .fit)
                        .overlay(ProgressView())
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(2/3, contentMode: .fill)
                case .failure:
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .aspectRatio(2/3, contentMode: .fit)
                        .overlay(
                            Image(systemName: "photo")
                                .foregroundColor(.gray)
                        )
                @unknown default:
                    EmptyView()
                }
            }
            .cornerRadius(12)
            .overlay(
                VStack {
                    HStack {
                        Spacer()
                        Text("\(series.totalEpisodes) EP")
                            .font(.caption2.bold())
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.purple.opacity(0.9))
                            .foregroundColor(.white)
                            .cornerRadius(8)
                            .padding(8)
                    }
                    Spacer()
                }
            )
            
            // Title
            Text(series.title)
                .font(.subheadline.bold())
                .foregroundColor(.primary)
                .lineLimit(2)
            
            // Genres
            HStack(spacing: 4) {
                ForEach(series.genre.prefix(2), id: \.self) { genre in
                    Text(genre)
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.purple.opacity(0.1))
                        .foregroundColor(.purple)
                        .cornerRadius(4)
                }
            }
            
            // Stats
            HStack(spacing: 12) {
                Label("\(formatCount(series.stats.totalViews))", systemImage: "eye.fill")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                
                Label("\(formatCount(series.stats.totalLikes))", systemImage: "heart.fill")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
    }
    
    private func formatCount(_ count: Int) -> String {
        if count >= 1_000_000 {
            return String(format: "%.1fM", Double(count) / 1_000_000)
        } else if count >= 1_000 {
            return String(format: "%.1fK", Double(count) / 1_000)
        }
        return "\(count)"
    }
}

// MARK: - Genre Chip
struct GenreChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline.weight(isSelected ? .semibold : .regular))
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.purple : Color.gray.opacity(0.1))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(20)
        }
    }
}

// MARK: - Search Bar
struct SearchBar: View {
    @Binding var text: String
    
    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.gray)
            
            TextField("Search series...", text: $text)
                .textFieldStyle(PlainTextFieldStyle())
            
            if !text.isEmpty {
                Button(action: { text = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray)
                }
            }
        }
        .padding(10)
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

// MARK: - Empty State
struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text(title)
                .font(.headline)
                .foregroundColor(.primary)
            
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    BrowseView()
}
