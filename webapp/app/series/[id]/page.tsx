'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { contentAPI } from '@/lib/api-client';
import { Series, Episode, Season } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { SeasonSelector } from '@/components/series/season-selector';
import { ArrowLeft, Play, PlayCircle, Lock, Eye, Heart, MessageCircle, Star, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useWatchHistory } from '@/hooks/use-watch-history';
import { cn } from '@/lib/utils';

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;
  const watchHistoryManager = useWatchHistory();
  
  const [series, setSeries] = useState<Series | null>(null);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const isDemoMode = true;

  useEffect(() => {
    loadSeriesDetail();
  }, [seriesId]);

  const loadSeriesDetail = async () => {
    try {
      setIsLoading(true);
      
      if (isDemoMode) {
        // Mock series with seasons
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
          seasons: [
            {
              seasonNumber: 1,
              title: 'Season 1',
              description: 'The beginning of an unforgettable journey',
              episodes: Array.from({ length: 12 }, (_, i) => ({
                _id: `ep${i + 1}`,
                seriesId: seriesId,
                seasonNumber: 1,
                episodeNumber: i + 1,
                title: `Episode ${i + 1}: ${i < 3 ? 'The Beginning' : i < 6 ? 'Rising Action' : i < 9 ? 'Climax' : 'Resolution'}`,
                description: `In this episode, our heroes face new challenges and discoveries. ${i === 0 ? 'The story begins...' : i === 11 ? 'The thrilling conclusion!' : 'The plot thickens...'}`,
                videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                thumbnailUrl: `https://picsum.photos/seed/ep${i}/400/225`,
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

        // Enrich episodes with watch progress
        if (mockSeries.seasons) {
          for (const season of mockSeries.seasons) {
            for (const episode of season.episodes) {
              const progress = watchHistoryManager.getEpisodeProgress(episode._id);
              if (progress) {
                episode.isWatched = progress.completed;
                episode.watchProgress = progress.progress;
              }
            }
          }
        }

        setSeries(mockSeries);
        setIsLoading(false);
        return;
      }

      const seriesResponse = await contentAPI.get<Series>(`/series/${seriesId}`);
      setSeries(seriesResponse);
    } catch (error) {
      console.error('Failed to load series:', error);
      toast.error('Failed to load series details');
      router.push('/browse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEpisodeClick = (episode: Episode) => {
    router.push(`/watch/${episode._id}?mode=series&seriesId=${seriesId}`);
  };

  const handlePlayFromStart = () => {
    const firstEpisode = series?.seasons?.[0]?.episodes?.[0];
    if (firstEpisode) {
      router.push(`/watch/${firstEpisode._id}?mode=series&seriesId=${seriesId}`);
    }
  };

  const handleContinueWatching = () => {
    const continueInfo = watchHistoryManager.getContinueWatching(seriesId);
    if (continueInfo) {
      router.push(`/watch/${continueInfo.episodeId}?mode=series&seriesId=${seriesId}`);
    }
  };

  if (isLoading || !series) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const currentSeasonData = series.seasons?.find(s => s.seasonNumber === currentSeason) || series.seasons?.[0];
  const episodes = currentSeasonData?.episodes || [];
  const seriesProgress = watchHistoryManager.getSeriesProgress(seriesId);
  const continueInfo = watchHistoryManager.getContinueWatching(seriesId);
  const completedSeasons = seriesProgress?.completedSeasons || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-24">
      {/* Back Button */}
      <div className="p-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Cover Image with Gradient Overlay */}
      <div className="relative h-56 sm:h-72 md:h-96">
        <img
          src={series.coverImageUrl || series.thumbnailUrl}
          alt={series.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Series Title & Stats Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{series.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {series.genre.map((g) => (
              <Badge key={g} variant="secondary" className="text-sm">{g}</Badge>
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
      <div className="p-4 sm:p-6 mt-4 relative z-10">
        {/* Primary CTAs */}
        <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 mb-4">
              {/* Play from Start */}
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 sm:h-14 text-base sm:text-lg font-semibold"
                onClick={handlePlayFromStart}
              >
                <PlayCircle className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                Play from Start
              </Button>

              {/* Continue Watching (if applicable) */}
              {continueInfo && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                  onClick={handleContinueWatching}
                >
                  <Clock className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                  Continue S{continueInfo.seasonNumber}E{continueInfo.episodeNumber}
                </Button>
              )}
            </div>

            {/* Watch Progress */}
            {seriesProgress && seriesProgress.totalWatchTime > 0 && (
              <div className="text-sm text-muted-foreground text-center">
                <p>
                  {Math.floor(seriesProgress.totalWatchTime / 60)} minutes watched
                  {completedSeasons.length > 0 && ` • ${completedSeasons.length} season${completedSeasons.length > 1 ? 's' : ''} completed`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed mb-4">{series.description}</p>
            
            <div className="flex items-center gap-3 pt-4 border-t">
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

        {/* Season Selector (if multiple seasons) */}
        {series.seasons && series.seasons.length > 1 && (
          <div className="mb-4">
            <SeasonSelector
              seasons={series.seasons}
              currentSeason={currentSeason}
              onSeasonChange={setCurrentSeason}
              completedSeasons={completedSeasons}
            />
          </div>
        )}

        {/* Episodes List */}
        <div className="space-y-3 mt-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4">
            {currentSeasonData?.title || `Season ${currentSeason}`} Episodes
          </h3>
          
          {episodes.map((episode) => {
            const isWatched = episode.isWatched || false;
            const watchProgress = episode.watchProgress || 0;
            const progressPercent = (watchProgress / episode.duration) * 100;
            const isCurrentlyWatching = continueInfo?.episodeId === episode._id;

            return (
              <Card
                key={episode._id}
                className={cn(
                  'overflow-hidden hover:shadow-lg transition-all cursor-pointer border-2',
                  isCurrentlyWatching && 'border-purple-600 ring-2 ring-purple-200'
                )}
                onClick={() => handleEpisodeClick(episode)}
              >
                <CardContent className="p-0">
                  <div className="flex gap-3 sm:gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-28 sm:w-40 flex-shrink-0">
                      <img
                        src={episode.thumbnailUrl}
                        alt={episode.title}
                        className="w-full h-20 sm:h-24 object-cover"
                      />
                      
                      {/* Status Overlays */}
                      {isWatched && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      
                      {!episode.isUnlocked && episode.unlockMethod !== 'free' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Lock className="h-6 w-6 text-white" />
                        </div>
                      )}
                      
                      {/* Duration */}
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                        {Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, '0')}
                      </div>
                      
                      {/* Watch Progress Bar */}
                      {watchProgress > 0 && progressPercent < 95 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                          <div
                            className="h-full bg-purple-600"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Episode Info */}
                    <div className="flex-1 py-2 sm:py-3 pr-3 sm:pr-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm sm:text-base font-semibold line-clamp-1">{episode.title}</h4>
                            {isCurrentlyWatching && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-600">
                                Continue
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                            {episode.description}
                          </p>
                          <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
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
                        
                        {/* Unlock Status */}
                        <div className="flex flex-col items-end gap-2">
                          {episode.isUnlocked || episode.unlockMethod === 'free' ? (
                            <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-600">
                              <Play className="h-3 w-3" />
                              {isWatched ? 'Rewatch' : 'Play'}
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
            );
          })}
        </div>

        {/* Series Stats & Details */}
        <Card className="mt-8">
          <CardContent className="pt-6 space-y-6">
            <div>
              <h4 className="font-semibold mb-3 text-lg">About this Series</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{series.totalEpisodes}</div>
                  <div className="text-sm text-muted-foreground">Episodes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {series.seasons?.length || 1}
                  </div>
                  <div className="text-sm text-muted-foreground">Season{series.seasons && series.seasons.length > 1 ? 's' : ''}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(series.stats.totalViews / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">4.8</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
