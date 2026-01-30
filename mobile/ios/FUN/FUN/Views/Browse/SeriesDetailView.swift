import SwiftUI

struct SeriesDetailView: View {
    let series: Series
    @StateObject private var viewModel: SeriesDetailViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var selectedTab = 0
    
    init(series: Series) {
        self.series = series
        _viewModel = StateObject(wrappedValue: SeriesDetailViewModel(seriesId: series.id))
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Cover Image Header
                ZStack(alignment: .topLeading) {
                    AsyncImage(url: URL(string: series.coverImageUrl)) { phase in
                        switch phase {
                        case .empty:
                            Rectangle()
                                .fill(LinearGradient(
                                    colors: [Color.purple, Color.pink],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ))
                                .frame(height: 250)
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(height: 250)
                                .clipped()
                        case .failure:
                            Rectangle()
                                .fill(Color.gray.opacity(0.3))
                                .frame(height: 250)
                        @unknown default:
                            EmptyView()
                        }
                    }
                    .overlay(
                        LinearGradient(
                            colors: [.clear, .black.opacity(0.7)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    
                    // Back Button
                    Button(action: { dismiss() }) {
                        Image(systemName: "chevron.left")
                            .font(.title3.weight(.semibold))
                            .foregroundColor(.white)
                            .padding(12)
                            .background(Color.black.opacity(0.3))
                            .clipShape(Circle())
                    }
                    .padding()
                }
                
                // Series Info
                VStack(alignment: .leading, spacing: 16) {
                    // Title & Stats
                    VStack(alignment: .leading, spacing: 8) {
                        Text(series.title)
                            .font(.title.bold())
                        
                        HStack(spacing: 16) {
                            Label("\(formatCount(series.totalViews))", systemImage: "eye.fill")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            
                            Label("\(formatCount(series.totalLikes))", systemImage: "heart.fill")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            
                            HStack(spacing: 4) {
                                Image(systemName: "star.fill")
                                    .foregroundColor(.yellow)
                                Text("4.8")
                            }
                            .font(.subheadline)
                        }
                    }
                    
                    // Genres
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(series.genre, id: \.self) { genre in
                                Text(genre)
                                    .font(.caption.bold())
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color.purple.opacity(0.2))
                                    .foregroundColor(.purple)
                                    .cornerRadius(16)
                            }
                        }
                    }
                    
                    Divider()
                    
                    // Description
                    Text(series.description)
                        .font(.body)
                        .foregroundColor(.secondary)
                        .lineSpacing(4)
                    
                    // Creator
                    HStack(spacing: 12) {
                        AsyncImage(url: URL(string: series.creator.profileImage)) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Circle()
                                .fill(Color.purple.opacity(0.3))
                        }
                        .frame(width: 48, height: 48)
                        .clipShape(Circle())
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(series.creator.displayName)
                                .font(.subheadline.bold())
                            Text("Creator")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                    }
                    .padding(.top, 8)
                    
                    Divider()
                }
                .padding()
                
                // Tabs
                Picker("", selection: $selectedTab) {
                    Text("Episodes (\(series.totalEpisodes))").tag(0)
                    Text("Details").tag(1)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding(.horizontal)
                
                // Content
                if selectedTab == 0 {
                    episodesTab
                } else {
                    detailsTab
                }
            }
        }
        .navigationBarHidden(true)
        .ignoresSafeArea(edges: .top)
        .onAppear {
            viewModel.loadEpisodes()
        }
    }
    
    // MARK: - Episodes Tab
    var episodesTab: some View {
        LazyVStack(spacing: 12) {
            if viewModel.isLoading {
                ForEach(0..<5, id: \.self) { _ in
                    EpisodeCardSkeleton()
                }
            } else {
                ForEach(viewModel.episodes) { episode in
                    NavigationLink(destination: destinationForEpisode(episode)) {
                        EpisodeCard(episode: episode)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
        }
        .padding()
        .padding(.bottom, 100)
    }
    
    // MARK: - Details Tab
    var detailsTab: some View {
        VStack(alignment: .leading, spacing: 20) {
            DetailSection(
                title: "Release Date",
                value: formatDate(series.createdAt)
            )
            
            DetailSection(
                title: "Total Episodes",
                value: "\(series.totalEpisodes)"
            )
            
            DetailSection(
                title: "Status",
                value: series.isActive ? "Ongoing" : "Completed"
            )
            
            if series.isFeatured {
                DetailSection(
                    title: "Featured",
                    value: "⭐️ Yes"
                )
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Tags")
                    .font(.subheadline.bold())
                    .foregroundColor(.secondary)
                
                FlowLayout(spacing: 8) {
                    ForEach(series.tags, id: \.self) { tag in
                        Text("#\(tag)")
                            .font(.caption)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                    }
                }
            }
        }
        .padding()
        .padding(.bottom, 100)
    }
    
    // MARK: - Helper Functions
    private func destinationForEpisode(_ episode: Episode) -> some View {
        Group {
            if episode.isUnlocked {
                // Navigate to player
                FeedView() // In production, navigate to specific episode player
            } else {
                // Show unlock sheet
                Text("Unlock screen") // In production, show unlock modal
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
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

// MARK: - Episode Card
struct EpisodeCard: View {
    let episode: Episode
    
    var body: some View {
        HStack(spacing: 12) {
            // Thumbnail
            AsyncImage(url: URL(string: episode.thumbnailUrl)) { phase in
                switch phase {
                case .empty:
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(width: 120, height: 90)
                        .overlay(ProgressView())
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 120, height: 90)
                        .clipped()
                case .failure:
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(width: 120, height: 90)
                @unknown default:
                    EmptyView()
                }
            }
            .cornerRadius(8)
            .overlay(
                ZStack {
                    if !episode.isUnlocked {
                        Color.black.opacity(0.6)
                        Image(systemName: "lock.fill")
                            .foregroundColor(.white)
                            .font(.title2)
                    }
                }
                .cornerRadius(8)
            )
            
            // Info
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("EP \(episode.episodeNumber)")
                        .font(.caption.bold())
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.purple)
                        .foregroundColor(.white)
                        .cornerRadius(4)
                    
                    Spacer()
                    
                    if !episode.isUnlocked {
                        unlockBadge
                    }
                }
                
                Text(episode.title)
                    .font(.subheadline.bold())
                    .foregroundColor(.primary)
                    .lineLimit(2)
                
                Text(episode.description ?? "")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                Spacer()
                
                HStack(spacing: 12) {
                    Label("\(formatCount(episode.viewCount))", systemImage: "eye.fill")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    
                    Label("\(formatCount(episode.likeCount))", systemImage: "heart.fill")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(12)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
    
    @ViewBuilder
    var unlockBadge: some View {
        switch episode.unlockMethod {
        case .free:
            EmptyView()
        case .credits:
            HStack(spacing: 2) {
                Image(systemName: "giftcard.fill")
                    .font(.caption2)
                Text("\(episode.creditsRequired ?? 0)")
                    .font(.caption2.bold())
            }
            .foregroundColor(.orange)
        case .purchase:
            HStack(spacing: 2) {
                Image(systemName: "dollarsign.circle.fill")
                    .font(.caption2)
                Text(String(format: "$%.2f", episode.purchasePrice ?? 0))
                    .font(.caption2.bold())
            }
            .foregroundColor(.green)
        case .premium:
            HStack(spacing: 2) {
                Image(systemName: "crown.fill")
                    .font(.caption2)
                Text("Premium")
                    .font(.caption2.bold())
            }
            .foregroundColor(.yellow)
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

// MARK: - Episode Card Skeleton
struct EpisodeCardSkeleton: View {
    var body: some View {
        HStack(spacing: 12) {
            Rectangle()
                .fill(Color.gray.opacity(0.3))
                .frame(width: 120, height: 90)
                .cornerRadius(8)
            
            VStack(alignment: .leading, spacing: 8) {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: 20)
                    .cornerRadius(4)
                
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: 14)
                    .cornerRadius(4)
                
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: 14)
                    .cornerRadius(4)
            }
        }
        .padding(12)
    }
}

// MARK: - Detail Section
struct DetailSection: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.subheadline.bold())
                .foregroundColor(.secondary)
            Text(value)
                .font(.body)
        }
    }
}

// MARK: - Flow Layout
struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(
            in: proposal.replacingUnspecifiedDimensions().width,
            subviews: subviews,
            spacing: spacing
        )
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(
            in: bounds.width,
            subviews: subviews,
            spacing: spacing
        )
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.positions[index].x, y: bounds.minY + result.positions[index].y), proposal: .unspecified)
        }
    }
    
    struct FlowResult {
        var size: CGSize = .zero
        var positions: [CGPoint] = []
        
        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var x: CGFloat = 0
            var y: CGFloat = 0
            var lineHeight: CGFloat = 0
            
            for subview in subviews {
                let size = subview.sizeThatFits(.unspecified)
                
                if x + size.width > maxWidth && x > 0 {
                    x = 0
                    y += lineHeight + spacing
                    lineHeight = 0
                }
                
                positions.append(CGPoint(x: x, y: y))
                lineHeight = max(lineHeight, size.height)
                x += size.width + spacing
            }
            
            self.size = CGSize(width: maxWidth, height: y + lineHeight)
        }
    }
}

#Preview {
    NavigationView {
        SeriesDetailView(series: Series(
            id: "1",
            title: "Love in the City",
            description: "A modern romance about finding love in unexpected places.",
            thumbnailUrl: "https://picsum.photos/seed/series1/400/600",
            coverImageUrl: "https://picsum.photos/seed/cover1/1200/400",
            genre: ["Romance", "Drama"],
            tags: ["love", "city-life", "modern"],
            creatorId: "1",
            creator: Creator(id: "1", displayName: "Romance Studios", profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=RS"),
            totalEpisodes: 12,
            totalViews: 2500000,
            totalLikes: 180000,
            totalComments: 15000,
            isActive: true,
            isFeatured: true,
            createdAt: Date()
        ))
    }
}
