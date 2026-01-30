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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFeed();
    }
  }, [isAuthenticated]);

  const loadFeed = async () => {
    try {
      setIsLoading(true);
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

  const handleVideoEnd = () => {
    if (currentIndex < episodes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      loadFeed(); // Load more episodes
    }
  };

  // Handle scroll/swipe for next/prev video
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && currentIndex < episodes.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentIndex, episodes.length]);

  if (authLoading || isLoading) {
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
    <div className="h-screen overflow-hidden bg-black">
      <VerticalVideoPlayer
        episode={episodes[currentIndex]}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onVideoEnd={handleVideoEnd}
        autoPlay
      />
    </div>
  );
}
