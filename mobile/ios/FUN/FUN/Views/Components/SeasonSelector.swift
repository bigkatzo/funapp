/**
 * FUN App - Season Selector Component
 * Dropdown for selecting seasons
 */

import SwiftUI

struct SeasonSelector: View {
    let seasons: [Season]
    @Binding var currentSeason: Int
    let completedSeasons: [Int]
    @State private var isExpanded = false
    
    var body: some View {
        if seasons.count <= 1 {
            EmptyView()
        } else {
            VStack(alignment: .leading, spacing: 0) {
                // Selected Season Button
                Button(action: {
                    withAnimation {
                        isExpanded.toggle()
                    }
                }) {
                    HStack {
                        Text(seasonTitle(currentSeason))
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        Spacer()
                        
                        Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                            .font(.caption.weight(.semibold))
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                    )
                }
                
                // Dropdown Menu
                if isExpanded {
                    VStack(spacing: 0) {
                        ForEach(seasons, id: \.seasonNumber) { season in
                            Button(action: {
                                currentSeason = season.seasonNumber
                                withAnimation {
                                    isExpanded = false
                                }
                            }) {
                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(seasonTitle(season.seasonNumber))
                                            .font(.subheadline.weight(.semibold))
                                            .foregroundColor(currentSeason == season.seasonNumber ? .purple : .primary)
                                        
                                        Text("\(season.episodes.count) episodes")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                    
                                    Spacer()
                                    
                                    if completedSeasons.contains(season.seasonNumber) {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundColor(.green)
                                    }
                                    
                                    if currentSeason == season.seasonNumber {
                                        Image(systemName: "checkmark")
                                            .foregroundColor(.purple)
                                    }
                                }
                                .padding()
                                .background(currentSeason == season.seasonNumber ? Color.purple.opacity(0.1) : Color.clear)
                            }
                            
                            if season.seasonNumber != seasons.last?.seasonNumber {
                                Divider()
                            }
                        }
                    }
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(radius: 8)
                    .padding(.top, 4)
                }
            }
        }
    }
    
    private func seasonTitle(_ number: Int) -> String {
        if let season = seasons.first(where: { $0.seasonNumber == number }),
           let title = season.title, !title.isEmpty {
            return title
        }
        return "Season \(number)"
    }
}
