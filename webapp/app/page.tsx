'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { contentAPI } from '@/lib/api-client';
import { Episode } from '@/types';
import { VerticalVideoPlayer } from '@/components/video/vertical-video-player';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
      loadFeed();
    }
  }, [isAuthenticated]);

  const loadFeed = async () => {
    try {
      setIsLoading(true);
      
      // DEMO MODE: Use mock data
      if (isDemoMode) {
        const mockEpisodes: Episode[] = [
          {
            _id: '1',
            seriesId: 'series1',
            episodeNumber: 1,
            title: 'Love in the City - Episode 1',
            description: 'A chance encounter changes everything when Sarah meets Alex at a coffee shop.',
            videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            thumbnailUrl: 'https://picsum.photos/1080/1920?random=1',
            duration: 120,
            unlockMethod: 'free',
            stats: { views: 15420, likes: 1230, comments: 89 },
            isLiked: false,
            isUnlocked: true,
            createdAt: new Date(),
          },
          {
            _id: '2',
            seriesId: 'series1',
            episodeNumber: 2,
            title: 'Love in the City - Episode 2',
            description: 'Sarah and Alex go on their first date, but things don\'t go as planned.',
            videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            thumbnailUrl: 'https://picsum.photos/1080/1920?random=2',
            duration: 150,
            unlockMethod: 'free',
            stats: { views: 12300, likes: 980, comments: 67 },
            isLiked: false,
            isUnlocked: true,
            createdAt: new Date(),
          },
          {
            _id: '3',
            seriesId: 'series2',
            episodeNumber: 1,
            title: 'Mystery Manor - Episode 1',
            description: 'Detective Chen investigates a series of mysterious disappearances.',
            videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            thumbnailUrl: 'https://picsum.photos/1080/1920?random=3',
            duration: 180,
            unlockMethod: 'free',
            stats: { views: 28900, likes: 2100, comments: 156 },
            isLiked: false,
            isUnlocked: true,
            createdAt: new Date(),
          },
          {
            _id: '4',
            seriesId: 'series3',
            episodeNumber: 1,
            title: 'Campus Hearts - Episode 1',
            description: 'High school friends navigate the ups and downs of teenage life.',
            videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            thumbnailUrl: 'https://picsum.photos/1080/1920?random=4',
            duration: 150,
            unlockMethod: 'free',
            stats: { views: 19200, likes: 1450, comments: 98 },
            isLiked: false,
            isUnlocked: true,
            createdAt: new Date(),
          },
          {
            _id: '5',
            seriesId: 'series4',
            episodeNumber: 1,
            title: 'CEO Romance - Episode 1',
            description: 'A powerful CEO meets a spirited intern who changes everything.',
            videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            thumbnailUrl: 'https://picsum.photos/1080/1920?random=5',
            duration: 165,
            unlockMethod: 'free',
            stats: { views: 32400, likes: 2870, comments: 201 },
            isLiked: false,
            isUnlocked: true,
            createdAt: new Date(),
          },
        ];
        setEpisodes(mockEpisodes);
        setIsLoading(false);
        return;
      }
      
      const response = await contentAPI.get<{ episodes: Episode[] }>('/feed');
      setEpisodes(response.episodes);
    } catch (error) {
      console.error('Failed to load feed:', error);
      toast.error('Failed to load videos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    const episode = episodes[currentIndex];
    if (!episode) return;

    try {
      // DEMO MODE: Just update locally
      if (isDemoMode) {
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
        return;
      }
      
      await contentAPI.post(`/episodes/${episode._id}/like`);
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
      // Load more episodes when reaching the end
      setCurrentIndex(0); // Loop back for demo
      toast.info('Loading more videos...');
      loadFeed();
    }
  };

  const goToPrevVideo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleVideoEnd = () => {
    // Auto-advance to next video when current one ends
    setTimeout(() => {
      goToNextVideo();
    }, 500);
  };

  // Handle scroll/swipe for next/prev video
  useEffect(() => {
    let lastScrollTime = 0;
    const scrollThrottle = 800; // Prevent too rapid scrolling

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime < scrollThrottle) return;
      
      if (Math.abs(e.deltaY) > 10) { // Minimum scroll threshold
        if (e.deltaY > 0) {
          goToNextVideo();
          lastScrollTime = now;
        } else if (e.deltaY < 0) {
          goToPrevVideo();
          lastScrollTime = now;
        }
      }
    };

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToNextVideo();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevVideo();
      }
    };

    // Touch swipe for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchStartY - touchEndY;
      
      if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance
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

  return (
    <div className="h-screen overflow-hidden bg-black relative">
      <VerticalVideoPlayer
        episode={episodes[currentIndex]}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onVideoEnd={handleVideoEnd}
        autoPlay
      />
      
      {/* Video counter */}
      <div className="absolute top-4 left-4 z-40 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
        {currentIndex + 1} / {episodes.length}
      </div>

      {/* Navigation hints */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-4">
        <button
          onClick={goToPrevVideo}
          disabled={currentIndex === 0}
          className="bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm text-white p-3 rounded-full transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={goToNextVideo}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all animate-bounce"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Swipe hint for mobile (shows briefly) */}
      {currentIndex === 0 && (
        <div className="absolute bottom-24 left-0 right-0 z-40 text-center text-white/80 text-sm animate-pulse">
          <p>Swipe up or scroll to see more videos</p>
        </div>
      )}
    </div>
  );
}
