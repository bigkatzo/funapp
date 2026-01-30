'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentAPI } from '@/lib/api-client';
import { Series, Episode } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Play, Lock, Eye, Heart, MessageCircle, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;
  
  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isDemoMode = true;

  useEffect(() => {
    loadSeriesDetail();
  }, [seriesId]);

  const loadSeriesDetail = async () => {
    try {
      setIsLoading(true);
      
      if (isDemoMode) {
        // Mock series data
        const mockSeries: Series = {
          _id: seriesId,
          title: seriesId === 'series1' ? 'Love in the City' : 'Mystery Manor',
          description: seriesId === 'series1' 
            ? 'A modern romance about two professionals finding love in the bustling city. Sarah, an ambitious architect, and Alex, a charming photographer, meet by chance and discover an unexpected connection. As they navigate their busy careers and personal challenges, they learn that sometimes love finds you when you least expect it.'
            : 'Detective Chen investigates a series of mysterious disappearances at the infamous Blackwood Manor. Each episode reveals dark secrets, hidden passages, and supernatural elements that challenge everything Chen thought was real.',
          thumbnailUrl: `https://picsum.photos/seed/${seriesId}/400/600`,
          coverImageUrl: `https://picsum.photos/seed/cover-${seriesId}/1200/400`,
          genre: seriesId === 'series1' ? ['Romance', 'Drama'] : ['Mystery', 'Thriller'],
          tags: seriesId === 'series1' ? ['love', 'city', 'professional'] : ['detective', 'mystery', 'suspense'],
          creator: {
            _id: '1',
            displayName: seriesId === 'series1' ? 'Studio FUN' : 'Mystery Productions',
            profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=SF'
          },
          totalEpisodes: 12,
          stats: {
            totalViews: 1254300,
            totalLikes: 89400,
            totalComments: 5200,
          },
          createdAt: new Date(),
        };

        // Mock episodes data
        const mockEpisodes: Episode[] = Array.from({ length: 12 }, (_, i) => ({
          _id: `ep${i + 1}`,
          seriesId: seriesId,
          episodeNumber: i + 1,
          title: `Episode ${i + 1}: ${i < 3 ? 'The Beginning' : i < 6 ? 'Rising Action' : i < 9 ? 'Climax' : 'Resolution'}`,
          description: `In this episode, our heroes face new challenges and discoveries. ${i === 0 ? 'The story begins...' : i === 11 ? 'The thrilling conclusion!' : 'The plot thickens...'}`,
          videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          thumbnailUrl: `https://picsum.photos/seed/ep${i}/400/225`,
          duration: 120 + Math.floor(Math.random() * 180),
          unlockMethod: i < 2 ? 'free' : i < 6 ? 'credits' : i < 10 ? 'premium' : 'purchase',
          creditsCost: i >= 2 && i < 6 ? 50 : undefined,
          purchasePrice: i >= 10 ? 1.99 : undefined,
          stats: {
            views: Math.floor(Math.random() * 50000) + 10000,
            likes: Math.floor(Math.random() * 5000) + 1000,
            comments: Math.floor(Math.random() * 500) + 50,
          },
          isLiked: false,
          isUnlocked: i < 2,
          createdAt: new Date(),
        }));

        setSeries(mockSeries);
        setEpisodes(mockEpisodes);
        setIsLoading(false);
        return;
      }

      const [seriesResponse, episodesResponse] = await Promise.all([
        contentAPI.get<Series>(`/series/${seriesId}`),
        contentAPI.get<{ episodes: Episode[] }>(`/series/${seriesId}/episodes`),
      ]);

      setSeries(seriesResponse);
      setEpisodes(episodesResponse.episodes);
    } catch (error) {
      console.error('Failed to load series:', error);
      toast.error('Failed to load series details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEpisodeClick = (episode: Episode) => {
    if (episode.isUnlocked || episode.unlockMethod === 'free') {
      router.push(`/watch/${episode._id}`);
    } else {
      toast.info('This episode is locked. Unlock to watch!');
    }
  };

  if (isLoading || !series) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-24">
      {/* Back Button */}
      <div className="p-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Cover Image */}
      <div className="relative h-64 md:h-80">
        <img
          src={series.coverImageUrl || series.thumbnailUrl}
          alt={series.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{series.title}</h1>
          <div className="flex gap-2 mb-3">
            {series.genre.map((g) => (
              <Badge key={g} variant="secondary">{g}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {(series.stats.totalViews / 1000).toFixed(0)}K views
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {(series.stats.totalLikes / 1000).toFixed(0)}K likes
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              4.8
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">{series.description}</p>
            
            <div className="flex items-center gap-3 mt-4 pt-4 border-t">
              <Avatar>
                <AvatarImage src={series.creator.profileImage} />
                <AvatarFallback>{series.creator.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{series.creator.displayName}</div>
                <div className="text-sm text-muted-foreground">Creator</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Episodes List */}
        <Tabs defaultValue="episodes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="episodes">Episodes ({series.totalEpisodes})</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="episodes" className="space-y-3 mt-4">
            {episodes.map((episode) => (
              <Card
                key={episode._id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleEpisodeClick(episode)}
              >
                <CardContent className="p-0">
                  <div className="flex gap-4">
                    <div className="relative w-40 flex-shrink-0">
                      <img
                        src={episode.thumbnailUrl}
                        alt={episode.title}
                        className="w-full h-24 object-cover"
                      />
                      {!episode.isUnlocked && episode.unlockMethod !== 'free' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Lock className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                        {Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                    
                    <div className="flex-1 py-3 pr-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1 line-clamp-1">{episode.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {episode.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {(episode.stats.views / 1000).toFixed(1)}K
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {(episode.stats.likes / 1000).toFixed(1)}K
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {episode.isUnlocked || episode.unlockMethod === 'free' ? (
                            <Badge variant="outline" className="gap-1">
                              <Play className="h-3 w-3" />
                              Play
                            </Badge>
                          ) : (
                            <>
                              {episode.unlockMethod === 'credits' && (
                                <Badge variant="secondary">{episode.creditsCost} Credits</Badge>
                              )}
                              {episode.unlockMethod === 'premium' && (
                                <Badge className="gap-1 bg-gradient-to-r from-purple-600 to-pink-600">
                                  Premium
                                </Badge>
                              )}
                              {episode.unlockMethod === 'purchase' && (
                                <Badge variant="secondary">${episode.purchasePrice}</Badge>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {series.genre.map((g) => (
                      <Badge key={g} variant="outline">{g}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {series.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">#{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{series.totalEpisodes}</div>
                      <div className="text-sm text-muted-foreground">Episodes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{(series.stats.totalViews / 1000000).toFixed(1)}M</div>
                      <div className="text-sm text-muted-foreground">Total Views</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{(series.stats.totalLikes / 1000).toFixed(0)}K</div>
                      <div className="text-sm text-muted-foreground">Likes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{(series.stats.totalComments / 1000).toFixed(1)}K</div>
                      <div className="text-sm text-muted-foreground">Comments</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
