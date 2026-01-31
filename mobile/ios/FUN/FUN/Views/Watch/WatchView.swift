/**
 * FUN App - Unified Watch View
 * Supports Discover, Binge, and Series modes
 */

import SwiftUI

struct WatchView: View {
    let episodeId: String
    let mode: PlaylistMode
    let seriesId: String?
    
    @StateObject private var viewModel: WatchViewModel
    @State private var showContinuePrompt = false
    @State private var showSwipeMenu = false
    @State private var showTransition = false
    @State private var transitionFrom: Episode?
    @State private var transitionTo: Episode?
    @Environment(\.dismiss) private var dismiss
    
    init(episodeId: String, mode: PlaylistMode, seriesId: String?) {
        self.episodeId = episodeId
        self.mode = mode
        self.seriesId = seriesId
        _viewModel = StateObject(wrappedValue: WatchViewModel(
            episodeId: episodeId,
            mode: mode,
            seriesId: seriesId
        ))
    }
    
    var body: some View {
        ZStack {
            // Video Player
            if let context = viewModel.playlistContext {
                EnhancedVerticalVideoPlayer(
                    context: context,
                    series: viewModel.series,
                    onVideoEnd: handleVideoEnd,
                    onSwipeDown: handleSwipeDown,
                    onSeriesTitleTap: handleSeriesTitleTap,
                    onBackClick: handleBackClick,
                    onNextEpisode: context.hasNext ? handleNextEpisode : nil,
                    onPrevEpisode: context.hasPrevious ? handlePrevEpisode : nil
                )
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.black)
            }
            
            // Continue Prompt (after Ep1 in Discover)
            if showContinuePrompt,
               let series = viewModel.series,
               let nextEpisode = viewModel.nextEpisode {
                ContinuePrompt(
                    series: series,
                    nextEpisode: nextEpisode,
                    onContinue: {
                        showContinuePrompt = false
                        viewModel.switchToBingeMode()
                        handleNextEpisode()
                    },
                    onSkip: {
                        showContinuePrompt = false
                        dismiss()
                    }
                )
            }
            
            // Swipe Menu
            if showSwipeMenu {
                SwipeMenu(
                    hasPrevious: viewModel.hasPrevious,
                    mode: mode,
                    onPreviousEpisode: viewModel.hasPrevious ? handlePrevEpisode : nil,
                    onBackToDiscover: mode == .binge ? handleBackToDiscover : nil,
                    onBackToSeries: mode == .series ? handleBackToSeries : nil,
                    onClose: { showSwipeMenu = false }
                )
            }
            
            // Episode Transition
            if showTransition,
               let from = transitionFrom,
               let to = transitionTo {
                EpisodeTransition(
                    fromEpisode: from,
                    toEpisode: to,
                    onComplete: handleTransitionComplete
                )
            }
            
            // Mode Badge
            VStack {
                HStack {
                    Spacer()
                    Text("\(mode.rawValue.capitalized) Mode")
                        .font(.caption.bold())
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.purple.opacity(0.8))
                        .cornerRadius(12)
                        .padding()
                }
                Spacer()
            }
        }
        .navigationBarHidden(true)
        .statusBar(hidden: true)
        .task {
            await viewModel.loadData()
        }
    }
    
    // MARK: - Event Handlers
    
    private func handleVideoEnd() {
        viewModel.saveProgress(completed: true)
        
        if mode == .discover && viewModel.isFirstEpisode {
            showContinuePrompt = true
        } else if viewModel.hasNext {
            handleNextEpisode()
        } else {
            dismiss()
        }
    }
    
    private func handleNextEpisode() {
        guard let currentEp = viewModel.currentEpisode,
              let nextEp = viewModel.nextEpisode else { return }
        
        transitionFrom = currentEp
        transitionTo = nextEp
        showTransition = true
    }
    
    private func handlePrevEpisode() {
        guard let currentEp = viewModel.currentEpisode,
              let prevEp = viewModel.previousEpisode else { return }
        
        transitionFrom = currentEp
        transitionTo = prevEp
        showTransition = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            viewModel.moveToPrevious()
            showTransition = false
        }
    }
    
    private func handleTransitionComplete() {
        viewModel.moveToNext()
        showTransition = false
        transitionFrom = nil
        transitionTo = nil
    }
    
    private func handleSwipeDown() {
        if mode == .discover {
            dismiss()
        } else {
            showSwipeMenu = true
        }
    }
    
    private func handleSeriesTitleTap() {
        if let seriesId = viewModel.series?.id {
            // Navigate to series detail
        }
    }
    
    private func handleBackClick() {
        dismiss()
    }
    
    private func handleBackToDiscover() {
        // Navigate back to discover feed
        showSwipeMenu = false
        dismiss()
    }
    
    private func handleBackToSeries() {
        // Navigate back to series detail
        showSwipeMenu = false
        dismiss()
    }
}
