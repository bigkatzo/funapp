'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { contentAPI } from '@/lib/api-client';
import { Episode, Series } from '@/types';
import { VerticalVideoPlayer } from '@/components/video/vertical-video-player';
import { ContinuePrompt } from '@/components/video/continue-prompt';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createDiscoverPlaylist } from '@/lib/playlist-manager';
import { useWatchHistory } from '@/hooks/use-watch-history';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();
  const watchHistoryManager = useWatchHistory();
  
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [mode, setMode] = useState<'discover' | 'binge'>('discover');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // DEMO MODE: Skip auth check for local testing
  const isDemoMode = true;

  useEffect(() => {
    if (!isDemoMode && !authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated || isDemoMode) {
      loadDiscoverFeed();
    }
  }, [isAuthenticated]);

  const loadDiscoverFeed = async () => {
    try {
      setIsLoading(true);
      
      // DEMO MODE: Use mock data
      if (isDemoMode) {
        const mockSeries: Series[] = [
          {
            _id: 'series1',
            title: 'Love in the City',
            description: 'A modern romance',
            thumbnailUrl: 'https://picsum.photos/seed/series1/400/600',
            genre: ['Romance', 'Drama'],
            tags: ['love', 'city'],
            creator: { _id: '1', displayName: 'Studio FUN' },
            totalEpisodes: 12,
            stats: { totalViews: 1254300, totalLikes: 89400, totalComments: 5200 },
            createdAt: new Date(),
            seasons: [
              {
                seasonNumber: 1,
                episodes: [
                  {
                    _id: 'ep1',
                    seriesId: 'series1',
                    seasonNumber: 1,
                    episodeNumber: 1,
                    title: 'Love in the City - Episode 1',
                    description: 'Sarah meets Alex at a coffee shop, and their lives change forever.',
                    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    thumbnailUrl: 'https://picsum.photos/1080/1920?random=1',
                    duration: 180,
                    unlockMethod: 'free',
                    stats: { views: 15420, likes: 1230, comments: 89 },
                    isLiked: false,
                    isUnlocked: true,
                    createdAt: new Date(),
                  },
                  {
                    _id: 'ep2',
                    seriesId: 'series1',
                    seasonNumber: 1,
                    episodeNumber: 2,
                    title: 'Love in the City - Episode 2',
                    description: 'Sarah and Alex go on their first date.',
                    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    thumbnailUrl: 'https://picsum.photos/1080/1920?random=2',
                    duration: 150,
                    unlockMethod: 'free',
                    stats: { views: 12300, likes: 980, comments: 67 },
                    isLiked: false,
                    isUnlocked: true,
                    createdAt: new Date(),
                  },
                ],
              },
            ],
          },
          {
            _id: 'series2',
            title: 'Mystery Manor',
            description: 'Detective Chen investigates',
            thumbnailUrl: 'https://picsum.photos/seed/series2/400/600',
            genre: ['Mystery', 'Thriller'],
            tags: ['detective', 'mystery'],
            creator: { _id: '2', displayName: 'Mystery Productions' },
            totalEpisodes: 16,
            stats: { totalViews: 2890500, totalLikes: 178900, totalComments: 12400 },
            createdAt: new Date(),
            seasons: [
              {
                seasonNumber: 1,
                episodes: [
                  {
                    _id: 'ep3',
                    seriesId: 'series2',
                    seasonNumber: 1,
                    episodeNumber: 1,
                    title: 'Mystery Manor - Episode 1',
                    description: 'Detective Chen investigates mysterious disappearances.',
                    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    thumbnailUrl: 'https://picsum.photos/1080/1920?random=3',
                    duration: 180,
                    unlockMethod: 'free',
                    stats: { views: 28900, likes: 2100, comments: 156 },
                    isLiked: false,
                    isUnlocked: true,
                    createdAt: new Date(),
                  },
                ],
              },
            ],
          },
          {
            _id: 'series3',
            title: 'Campus Hearts',
            description: 'High school drama',
            thumbnailUrl: 'https://picsum.photos/seed/series3/400/600',
            genre: ['Drama', 'Youth'],
            tags: ['school', 'friendship'],
            creator: { _id: '3', displayName: 'Youth Media' },
            totalEpisodes: 20,
            stats: { totalViews: 1876200, totalLikes: 145600, totalComments: 8900 },
            createdAt: new Date(),
            seasons: [
              {
                seasonNumber: 1,
                episodes: [
                  {
                    _id: 'ep4',
                    seriesId: 'series3',
                    seasonNumber: 1,
                    episodeNumber: 1,
                    title: 'Campus Hearts - Episode 1',
                    description: 'High school friends navigate teenage life.',
                    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    thumbnailUrl: 'https://picsum.photos/1080/1920?random=4',
                    duration: 150,
                    unlockMethod: 'free',
                    stats: { views: 19200, likes: 1450, comments: 98 },
                    isLiked: false,
                    isUnlocked: true,
                    createdAt: new Date(),
                  },
                ],
              },
            ],
          },
          {
            _id: 'series4',
            title: 'CEO Romance',
            description: 'Corporate love story',
            thumbnailUrl: 'https://picsum.photos/seed/series4/400/600',
            genre: ['Romance', 'Business'],
            tags: ['ceo', 'office'],
            creator: { _id: '1', displayName: 'Studio FUN' },
            totalEpisodes: 15,
            stats: { totalViews: 3245100, totalLikes: 234500, totalComments: 15600 },
            createdAt: new Date(),
            seasons: [
              {
                seasonNumber: 1,
                episodes: [
                  {
                    _id: 'ep5',
                    seriesId: 'series4',
                    seasonNumber: 1,
                    episodeNumber: 1,
                    title: 'CEO Romance - Episode 1',
                    description: 'A powerful CEO meets a spirited intern.',
                    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    thumbnailUrl: 'https://picsum.photos/1080/1920?random=5',
                    duration: 165,
                    unlockMethod: 'free',
                    stats: { views: 32400, likes: 2870, comments: 201 },
                    isLiked: false,
                    isUnlocked: true,
                    createdAt: new Date(),
                  },
                ],
              },
            ],
          },
        ];

        setAllSeries(mockSeries);
        
        // Create discover playlist (Episode 1s only)
        const discoverPlaylist = await createDiscoverPlaylist(mockSeries);
        setEpisodes(discoverPlaylist);
        setIsLoading(false);
        return;
      }
      
      const response = await contentAPI.get<{ series: Series[] }>('/series');
      setAllSeries(response.series);
      
      const discoverPlaylist = await createDiscoverPlaylist(response.series);
      setEpisodes(discoverPlaylist);
    } catch (error) {
      console.error('Failed to load discover feed:', error);
      toast.error('Failed to load discover feed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    const episode = episodes[currentIndex];
    if (!episode) return;

    try {
      setEpisodes((prev) =>
        prev.map((ep, idx) =>
          idx === currentIndex
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
      toast.success(episode.isLiked ? 'Unliked!' : 'Liked!');
    } catch (error) {
      toast.error('Failed to like video');
    }
  };

  const handleComment = () => {
    toast.info('Comments feature coming soon!');
  };

  const handleShare = () => {
    const episode = episodes[currentIndex];
    if (!episode) return;

    if (navigator.share) {
      navigator.share({
        title: episode.title,
        text: episode.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const goToNextVideo = () => {
    if (currentIndex < episodes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast.info('Loading more videos...');
      loadDiscoverFeed();
    }
  };

  const goToPrevVideo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleVideoEnd = () => {
    const currentEpisode = episodes[currentIndex];
    
    // Save watch progress
    watchHistoryManager.saveProgress(currentEpisode, currentEpisode.duration, true);
    
    // In discover mode, show continue prompt for Episode 1s
    if (mode === 'discover' && currentEpisode.episodeNumber === 1) {
      setShowContinuePrompt(true);
    } else {
      // Auto-advance in binge mode
      setTimeout(() => {
        goToNextVideo();
      }, 500);
    }
  };

  const handleContinueSeries = async () => {
    const currentEpisode = episodes[currentIndex];
    const series = allSeries.find(s => s._id === currentEpisode.seriesId);
    
    if (!series) {
      toast.error('Series not found');
      return;
    }

    // Switch to binge mode
    setMode('binge');
    setShowContinuePrompt(false);
    
    // Navigate to watch page in binge mode
    router.push(`/watch/${currentEpisode._id}?mode=binge&seriesId=${series._id}`);
  };

  const handleSkipToDiscover = () => {
    setShowContinuePrompt(false);
    goToNextVideo();
  };

  const handleSeriesTitleClick = () => {
    const currentEpisode = episodes[currentIndex];
    if (currentEpisode) {
      router.push(`/series/${currentEpisode.seriesId}`);
    }
  };

  // Handle scroll/swipe for next/prev video
  useEffect(() => {
    let lastScrollTime = 0;
    const scrollThrottle = 800;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime < scrollThrottle) return;
      
      if (Math.abs(e.deltaY) > 10) {
        if (e.deltaY > 0) {
          goToNextVideo();
          lastScrollTime = now;
        } else if (e.deltaY < 0) {
          goToPrevVideo();
          lastScrollTime = now;
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToNextVideo();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevVideo();
      }
    };

    let touchStartY = 0;
    let touchEndY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchStartY - touchEndY;
      
      if (Math.abs(swipeDistance) > 50) {
        if (swipeDistance > 0) {
          goToNextVideo();
        } else {
          goToPrevVideo();
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
  }, [currentIndex, episodes.length]);

  if ((authLoading && !isDemoMode) || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-white text-center">
          No videos available.
          <br />
          Check back soon!
        </p>
      </div>
    );
  }

  const currentEpisode = episodes[currentIndex];
  const currentSeries = currentEpisode ? allSeries.find(s => s._id === currentEpisode.seriesId) : null;

  if (!currentEpisode) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-white text-center">
          No videos available.
          <br />
          Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-black relative">
      <VerticalVideoPlayer
        episode={currentEpisode}
        series={currentSeries}
        mode="discover"
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onVideoEnd={handleVideoEnd}
        onSeriesTitleClick={handleSeriesTitleClick}
        currentPosition={{ current: currentIndex + 1, total: episodes.length }}
        autoPlay
      />
      
      {/* Continue Prompt */}
      {showContinuePrompt && currentSeries && (
        <ContinuePrompt
          series={currentSeries}
          nextEpisode={currentSeries.seasons?.[0]?.episodes?.[1] || currentEpisode}
          onContinue={handleContinueSeries}
          onSkip={handleSkipToDiscover}
        />
      )}

      {/* Video counter */}
      <div className="absolute top-4 left-4 z-40 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
        {currentIndex + 1} / {episodes.length}
      </div>

      {/* Mode indicator (for demo) */}
      <div className="absolute top-4 right-4 z-40 bg-purple-600/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
        Discover Mode
      </div>
    </div>
  );
}
