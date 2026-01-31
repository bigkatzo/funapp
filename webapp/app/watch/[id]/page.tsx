'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { contentAPI } from '@/lib/api-client';
import { Episode, Series, PlaylistMode } from '@/types';
import { VerticalVideoPlayer } from '@/components/video/vertical-video-player';
import { ContinuePrompt } from '@/components/video/continue-prompt';
import { SwipeMenu } from '@/components/video/swipe-menu';
import { EpisodeTransition } from '@/components/video/episode-transition';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Gift, CreditCard, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { usePlaylist, useBingePlaylist, useSeriesPlaylist } from '@/hooks/use-playlist';
import { useWatchHistory } from '@/hooks/use-watch-history';
import { createBingePlaylist, createSeriesPlaylist } from '@/lib/playlist-manager';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const episodeId = params.id as string;
  const mode = (searchParams.get('mode') as PlaylistMode) || 'series';
  const seriesId = searchParams.get('seriesId') as string;

  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUnlockSheet, setShowUnlockSheet] = useState(false);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [showSwipeMenu, setShowSwipeMenu] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionFrom, setTransitionFrom] = useState<Episode | null>(null);
  const [transitionTo, setTransitionTo] = useState<Episode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const watchHistoryManager = useWatchHistory();
  const isDemoMode = true;

  // Load series and create playlist based on mode
  useEffect(() => {
    loadSeriesAndPlaylist();
  }, [episodeId, mode, seriesId]);

  const loadSeriesAndPlaylist = async () => {
    try {
      setIsLoading(true);

      if (isDemoMode) {
        // Mock series with full season data
        const mockSeries: Series = {
          _id: seriesId || 'series1',
          title: 'Love in the City',
          description: 'A modern romance about two professionals finding love in the bustling city.',
          thumbnailUrl: 'https://picsum.photos/seed/series1/400/600',
          coverImageUrl: 'https://picsum.photos/seed/cover1/1200/400',
          genre: ['Romance', 'Drama'],
          tags: ['love', 'city', 'professional'],
          creator: {
            _id: '1',
            displayName: 'Studio FUN',
            profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=SF'
          },
          totalEpisodes: 12,
          stats: { totalViews: 1254300, totalLikes: 89400, totalComments: 5200 },
          createdAt: new Date(),
          seasons: [
            {
              seasonNumber: 1,
              episodes: Array.from({ length: 12 }, (_, i) => ({
                _id: `ep${i + 1}`,
                seriesId: seriesId || 'series1',
                seasonNumber: 1,
                episodeNumber: i + 1,
                title: `Episode ${i + 1}: ${i === 0 ? 'The Beginning' : i === 11 ? 'The Finale' : 'Chapter ' + (i + 1)}`,
                description: `In this episode, the story continues... ${i === 0 ? 'It all begins here.' : ''}`,
                videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                thumbnailUrl: `https://picsum.photos/seed/ep${i}/1080/1920`,
                duration: 120 + Math.floor(Math.random() * 60),
                unlockMethod: i < 3 ? 'free' : 'credits',
                creditsCost: i >= 3 ? 50 : undefined,
                stats: {
                  views: Math.floor(Math.random() * 50000) + 10000,
                  likes: Math.floor(Math.random() * 5000) + 1000,
                  comments: Math.floor(Math.random() * 500) + 50,
                },
                isLiked: false,
                isUnlocked: i < 3,
                createdAt: new Date(),
              })),
            },
          ],
        };

        setSeries(mockSeries);

        // Create playlist based on mode
        let playlist: Episode[] = [];
        if (mode === 'binge' || mode === 'series') {
          playlist = createBingePlaylist(mockSeries, episodeId);
        } else {
          // Discover mode - just the current episode
          const episode = mockSeries.seasons?.[0]?.episodes.find(ep => ep._id === episodeId);
          if (episode) playlist = [episode];
        }

        setEpisodes(playlist);
        const startIndex = playlist.findIndex(ep => ep._id === episodeId);
        setCurrentIndex(startIndex >= 0 ? startIndex : 0);

        // Check if current episode is locked
        const currentEp = playlist[startIndex >= 0 ? startIndex : 0];
        if (currentEp && !currentEp.isUnlocked && currentEp.unlockMethod !== 'free') {
          setShowUnlockSheet(true);
        }

        setIsLoading(false);
        return;
      }

      // Real API calls
      const seriesResponse = await contentAPI.get<Series>(`/series/${seriesId}`);
      setSeries(seriesResponse);

      // Create appropriate playlist
      let playlist: Episode[] = [];
      if (mode === 'binge') {
        playlist = createBingePlaylist(seriesResponse, episodeId);
      } else if (mode === 'series') {
        playlist = createSeriesPlaylist(seriesResponse, episodeId);
      }

      setEpisodes(playlist);
      const startIndex = playlist.findIndex(ep => ep._id === episodeId);
      setCurrentIndex(startIndex >= 0 ? startIndex : 0);

    } catch (error) {
      console.error('Failed to load series:', error);
      toast.error('Failed to load episode');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const currentEpisode = episodes[currentIndex];
  const hasNext = currentIndex < episodes.length - 1;
  const hasPrevious = currentIndex > 0;

  const handleUnlock = (method: string) => {
    toast.success(`Unlocking with ${method}...`);
    setShowUnlockSheet(false);
    if (currentEpisode) {
      // Update episode unlock status
      setEpisodes(prev =>
        prev.map(ep =>
          ep._id === currentEpisode._id ? { ...ep, isUnlocked: true } : ep
        )
      );
    }
  };

  const handleLike = async () => {
    if (!currentEpisode) return;
    
    setEpisodes(prev =>
      prev.map(ep =>
        ep._id === currentEpisode._id
          ? {
              ...ep,
              isLiked: !ep.isLiked,
              stats: {
                ...ep.stats,
                likes: ep.stats.likes + (ep.isLiked ? -1 : 1),
              },
            }
          : ep
      )
    );
    toast.success(currentEpisode.isLiked ? 'Unliked!' : 'Liked!');
  };

  const handleComment = () => {
    toast.info('Comments coming soon!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentEpisode?.title,
        text: currentEpisode?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const handleVideoEnd = () => {
    if (!currentEpisode) return;

    // Save watch progress
    watchHistoryManager.saveProgress(currentEpisode, currentEpisode.duration, true);

    // In binge mode with episode 1, show continue prompt
    if (mode === 'binge' && currentEpisode.episodeNumber === 1) {
      setShowContinuePrompt(true);
    } else if (hasNext) {
      // Auto-advance to next episode
      setTimeout(() => handleNextEpisode(), 1000);
    } else {
      // End of playlist
      toast.info('You\'ve reached the end!');
      setTimeout(() => router.push(`/series/${series?._id}`), 2000);
    }
  };

  const handleNextEpisode = () => {
    if (!hasNext) return;

    const nextEpisode = episodes[currentIndex + 1];
    
    // Check if next episode is locked
    if (!nextEpisode.isUnlocked && nextEpisode.unlockMethod !== 'free') {
      setCurrentIndex(currentIndex + 1);
      setShowUnlockSheet(true);
      return;
    }

    // Show transition animation
    setTransitionFrom(currentEpisode);
    setTransitionTo(nextEpisode);
    setShowTransition(true);
  };

  const handlePrevEpisode = () => {
    if (!hasPrevious) return;

    const prevEpisode = episodes[currentIndex - 1];
    setTransitionFrom(currentEpisode);
    setTransitionTo(prevEpisode);
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
    if (transitionTo) {
      const newIndex = episodes.findIndex(ep => ep._id === transitionTo._id);
      if (newIndex >= 0) {
        setCurrentIndex(newIndex);
      }
    }
    setTransitionFrom(null);
    setTransitionTo(null);
  };

  const handleBackClick = () => {
    if (mode === 'series') {
      router.push(`/series/${series?._id}`);
    } else if (mode === 'binge') {
      router.push('/');
    } else {
      router.back();
    }
  };

  const handleSeriesTitleClick = () => {
    router.push(`/series/${series?._id}`);
  };

  const handleSwipeDown = () => {
    if (mode === 'discover') {
      router.push('/');
    } else {
      setShowSwipeMenu(true);
    }
  };

  const handleBackToDiscover = () => {
    router.push('/');
  };

  const handleBackToSeries = () => {
    router.push(`/series/${series?._id}`);
  };

  // Handle scroll/swipe navigation
  useEffect(() => {
    let lastScrollTime = 0;
    const scrollThrottle = 800;

    const handleWheel = (e: WheelEvent) => {
      if (showContinuePrompt || showSwipeMenu || showTransition) return;
      
      const now = Date.now();
      if (now - lastScrollTime < scrollThrottle) return;
      
      if (Math.abs(e.deltaY) > 10) {
        if (e.deltaY > 0 && hasNext) {
          handleNextEpisode();
          lastScrollTime = now;
        } else if (e.deltaY < 0) {
          handleSwipeDown();
          lastScrollTime = now;
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showContinuePrompt || showSwipeMenu || showTransition) return;
      
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        if (hasNext) handleNextEpisode();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handleSwipeDown();
      }
    };

    let touchStartY = 0;
    let touchEndY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (showContinuePrompt || showSwipeMenu || showTransition) return;
      
      touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchStartY - touchEndY;
      
      if (Math.abs(swipeDistance) > 50) {
        if (swipeDistance > 0 && hasNext) {
          handleNextEpisode();
        } else if (swipeDistance < 0) {
          handleSwipeDown();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, episodes.length, showContinuePrompt, showSwipeMenu, showTransition]);

  if (isLoading || !currentEpisode) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // If locked, show unlock screen
  if (!currentEpisode.isUnlocked && currentEpisode.unlockMethod !== 'free') {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center text-white">
          <Lock className="h-20 w-20 mx-auto mb-6 text-white/80" />
          <h1 className="text-3xl font-bold mb-4">{currentEpisode.title}</h1>
          <p className="text-white/80 mb-8">{currentEpisode.description}</p>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">Unlock this episode:</h3>
            <div className="space-y-3">
              {currentEpisode.unlockMethod === 'credits' && (
                <Button
                  className="w-full"
                  onClick={() => handleUnlock('credits')}
                >
                  <Gift className="mr-2 h-5 w-5" />
                  Use {currentEpisode.creditsCost} Credits
                </Button>
              )}
              {currentEpisode.unlockMethod === 'purchase' && (
                <Button
                  className="w-full"
                  onClick={() => handleUnlock('purchase')}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Buy for ${currentEpisode.purchasePrice}
                </Button>
              )}
              {currentEpisode.unlockMethod === 'premium' && (
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600" onClick={() => handleUnlock('premium')}>
                  <Crown className="mr-2 h-5 w-5" />
                  Get Premium
                </Button>
              )}
            </div>
          </div>

          <Button variant="ghost" onClick={handleBackClick} className="text-white">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-black relative">
      {/* Video Player */}
      <VerticalVideoPlayer
        episode={currentEpisode}
        series={series || undefined}
        mode={mode}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onVideoEnd={handleVideoEnd}
        onBackClick={handleBackClick}
        onSeriesTitleClick={handleSeriesTitleClick}
        onNextEpisode={hasNext ? handleNextEpisode : undefined}
        onPrevEpisode={hasPrevious ? handlePrevEpisode : undefined}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        currentPosition={{ current: currentIndex + 1, total: episodes.length }}
        autoPlay
      />

      {/* Continue Prompt (for binge mode after Episode 1) */}
      {showContinuePrompt && series && episodes[currentIndex + 1] && (
        <ContinuePrompt
          series={series}
          nextEpisode={episodes[currentIndex + 1]}
          onContinue={() => {
            setShowContinuePrompt(false);
            handleNextEpisode();
          }}
          onSkip={() => {
            setShowContinuePrompt(false);
            router.push('/');
          }}
        />
      )}

      {/* Swipe Menu */}
      {showSwipeMenu && (
        <SwipeMenu
          onPreviousEpisode={hasPrevious ? handlePrevEpisode : undefined}
          onBackToDiscover={mode === 'binge' ? handleBackToDiscover : undefined}
          onBackToSeries={mode === 'series' ? handleBackToSeries : undefined}
          hasPrevious={hasPrevious}
          mode={mode}
          onClose={() => setShowSwipeMenu(false)}
        />
      )}

      {/* Episode Transition */}
      {showTransition && transitionFrom && transitionTo && (
        <EpisodeTransition
          fromEpisode={transitionFrom}
          toEpisode={transitionTo}
          onComplete={handleTransitionComplete}
        />
      )}

      {/* Mode Indicator - Only show for Discover Mode */}
      {mode === 'discover' && (
        <div className="absolute top-4 right-4 z-40 bg-purple-600/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
          Discover Mode
        </div>
      )}
    </div>
  );
}
