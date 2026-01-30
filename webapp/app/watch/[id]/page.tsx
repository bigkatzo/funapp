'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { contentAPI } from '@/lib/api-client';
import { Episode } from '@/types';
import { VerticalVideoPlayer } from '@/components/video/vertical-video-player';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Gift, CreditCard, Crown, Play } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [showUnlockSheet, setShowUnlockSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isDemoMode = true;

  useEffect(() => {
    loadEpisode();
  }, [episodeId]);

  const loadEpisode = async () => {
    try {
      setIsLoading(true);

      if (isDemoMode) {
        const mockEpisode: Episode = {
          _id: episodeId,
          seriesId: 'series1',
          episodeNumber: parseInt(episodeId.replace('ep', '')) || 1,
          title: 'Love in the City - Episode 1',
          description: 'Sarah meets Alex at a coffee shop, and their lives change forever.',
          videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          thumbnailUrl: 'https://picsum.photos/1080/1920?random=1',
          duration: 180,
          unlockMethod: episodeId === 'ep1' || episodeId === 'ep2' ? 'free' : 'credits',
          creditsCost: episodeId === 'ep1' || episodeId === 'ep2' ? undefined : 50,
          stats: { views: 15420, likes: 1230, comments: 89 },
          isLiked: false,
          isUnlocked: episodeId === 'ep1' || episodeId === 'ep2',
          createdAt: new Date(),
        };

        setEpisode(mockEpisode);
        
        // Show unlock sheet if locked
        if (!mockEpisode.isUnlocked && mockEpisode.unlockMethod !== 'free') {
          setShowUnlockSheet(true);
        }

        setIsLoading(false);
        return;
      }

      const response = await contentAPI.get<Episode>(`/episodes/${episodeId}`);
      setEpisode(response);

      if (!response.isUnlocked && response.unlockMethod !== 'free') {
        setShowUnlockSheet(true);
      }
    } catch (error) {
      console.error('Failed to load episode:', error);
      toast.error('Failed to load episode');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = (method: string) => {
    toast.success(`Unlocking with ${method}...`);
    setShowUnlockSheet(false);
    if (episode) {
      setEpisode({ ...episode, isUnlocked: true });
    }
  };

  const handleLike = async () => {
    if (!episode) return;
    setEpisode({
      ...episode,
      isLiked: !episode.isLiked,
      stats: {
        ...episode.stats,
        likes: episode.stats.likes + (episode.isLiked ? -1 : 1),
      },
    });
    toast.success(episode.isLiked ? 'Unliked!' : 'Liked!');
  };

  const handleComment = () => {
    toast.info('Comments coming soon!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: episode?.title,
        text: episode?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  if (isLoading || !episode) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // If locked, show locked screen
  if (!episode.isUnlocked && episode.unlockMethod !== 'free') {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center text-white">
          <Lock className="h-20 w-20 mx-auto mb-6 text-white/80" />
          <h1 className="text-3xl font-bold mb-4">{episode.title}</h1>
          <p className="text-white/80 mb-8">{episode.description}</p>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">Unlock this episode:</h3>
            <div className="space-y-3">
              {episode.unlockMethod === 'credits' && (
                <Button
                  className="w-full"
                  onClick={() => handleUnlock('credits')}
                >
                  <Gift className="mr-2 h-5 w-5" />
                  Use {episode.creditsCost} Credits
                </Button>
              )}
              {episode.unlockMethod === 'purchase' && (
                <Button
                  className="w-full"
                  onClick={() => handleUnlock('purchase')}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Buy for ${episode.purchasePrice}
                </Button>
              )}
              {episode.unlockMethod === 'premium' && (
                <Link href="/profile">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                    <Crown className="mr-2 h-5 w-5" />
                    Get Premium
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button variant="outline" className="w-full bg-white/10 border-white/30 text-white">
                  <Gift className="mr-2 h-5 w-5" />
                  Buy Credits
                </Button>
              </Link>
            </div>
          </div>

          <Button variant="ghost" onClick={() => router.back()} className="text-white">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-black">
      <VerticalVideoPlayer
        episode={episode}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onVideoEnd={() => {}}
        autoPlay
      />
    </div>
  );
}
