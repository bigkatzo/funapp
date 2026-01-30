'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { contentAPI } from '@/lib/api-client';
import { Series } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Search, Play } from 'lucide-react';

export default function BrowsePage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Demo mode with mock data
  const isDemoMode = true;

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      setIsLoading(true);
      
      if (isDemoMode) {
        const mockSeries: Series[] = [
          {
            _id: 'series1',
            title: 'Love in the City',
            description: 'A modern romance about two professionals finding love in the bustling city. Follow Sarah and Alex as they navigate career ambitions and unexpected feelings.',
            thumbnailUrl: 'https://picsum.photos/seed/series1/400/600',
            coverImageUrl: 'https://picsum.photos/seed/cover1/1200/400',
            genre: ['Romance', 'Drama'],
            tags: ['love', 'city', 'professional'],
            creator: { _id: '1', displayName: 'Studio FUN', profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=SF' },
            totalEpisodes: 12,
            stats: { totalViews: 1254300, totalLikes: 89400, totalComments: 5200 },
            createdAt: new Date(),
          },
          {
            _id: 'series2',
            title: 'Mystery Manor',
            description: 'Detective Chen investigates mysterious disappearances in an old manor. Each episode unveils dark secrets and unexpected twists.',
            thumbnailUrl: 'https://picsum.photos/seed/series2/400/600',
            coverImageUrl: 'https://picsum.photos/seed/cover2/1200/400',
            genre: ['Mystery', 'Thriller'],
            tags: ['detective', 'mystery', 'suspense'],
            creator: { _id: '2', displayName: 'Mystery Productions', profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=MP' },
            totalEpisodes: 16,
            stats: { totalViews: 2890500, totalLikes: 178900, totalComments: 12400 },
            createdAt: new Date(),
          },
          {
            _id: 'series3',
            title: 'Campus Hearts',
            description: 'High school drama follows a group of friends dealing with love, friendship, and growing up. Heartwarming and emotional.',
            thumbnailUrl: 'https://picsum.photos/seed/series3/400/600',
            coverImageUrl: 'https://picsum.photos/seed/cover3/1200/400',
            genre: ['Drama', 'Youth'],
            tags: ['school', 'friendship', 'youth'],
            creator: { _id: '3', displayName: 'Youth Media', profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=YM' },
            totalEpisodes: 20,
            stats: { totalViews: 1876200, totalLikes: 145600, totalComments: 8900 },
            createdAt: new Date(),
          },
          {
            _id: 'series4',
            title: 'CEO Romance',
            description: 'When a powerful CEO meets a spirited intern, sparks fly. A classic romance with modern twists.',
            thumbnailUrl: 'https://picsum.photos/seed/series4/400/600',
            coverImageUrl: 'https://picsum.photos/seed/cover4/1200/400',
            genre: ['Romance', 'Business'],
            tags: ['ceo', 'office', 'romance'],
            creator: { _id: '1', displayName: 'Studio FUN', profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=SF' },
            totalEpisodes: 15,
            stats: { totalViews: 3245100, totalLikes: 234500, totalComments: 15600 },
            createdAt: new Date(),
          },
          {
            _id: 'series5',
            title: 'Time Traveler',
            description: 'A scientist accidentally discovers time travel and must fix historical mistakes while finding their way home.',
            thumbnailUrl: 'https://picsum.photos/seed/series5/400/600',
            coverImageUrl: 'https://picsum.photos/seed/cover5/1200/400',
            genre: ['Sci-Fi', 'Adventure'],
            tags: ['time-travel', 'science', 'adventure'],
            creator: { _id: '4', displayName: 'Sci-Fi Studios', profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=SS' },
            totalEpisodes: 18,
            stats: { totalViews: 2134800, totalLikes: 167800, totalComments: 9800 },
            createdAt: new Date(),
          },
          {
            _id: 'series6',
            title: 'Royal Affair',
            description: 'A forbidden romance between a prince and a commoner threatens the kingdom. Historical drama with epic scope.',
            thumbnailUrl: 'https://picsum.photos/seed/series6/400/600',
            coverImageUrl: 'https://picsum.photos/seed/cover6/1200/400',
            genre: ['Historical', 'Romance'],
            tags: ['royal', 'forbidden-love', 'historical'],
            creator: { _id: '5', displayName: 'Epic Drama Co', profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=ED' },
            totalEpisodes: 24,
            stats: { totalViews: 4567900, totalLikes: 389200, totalComments: 23400 },
            createdAt: new Date(),
          },
        ];
        setSeries(mockSeries);
        setIsLoading(false);
        return;
      }

      const response = await contentAPI.get<{ series: Series[] }>('/series');
      setSeries(response.series);
    } catch (error) {
      console.error('Failed to load series:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const genres = ['all', 'Romance', 'Drama', 'Mystery', 'Thriller', 'Youth', 'Sci-Fi', 'Historical'];

  const filteredSeries = series.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || s.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <h1 className="text-3xl font-bold mb-4">Explore Series</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
          <Input
            placeholder="Search series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
          />
        </div>
      </div>

      {/* Genre Filter */}
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-2">
          {genres.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGenre(genre)}
              className="capitalize whitespace-nowrap"
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>

      {/* Series Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredSeries.map((series) => (
            <Link key={series._id} href={`/series/${series._id}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                <div className="relative aspect-[2/3]">
                  <img
                    src={series.thumbnailUrl}
                    alt={series.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <Button size="sm" className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      Watch Now
                    </Button>
                  </div>
                  <Badge className="absolute top-2 right-2">
                    {series.totalEpisodes} Episodes
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold line-clamp-1 mb-1">{series.title}</h3>
                  <div className="flex gap-1 mb-2">
                    {series.genre.slice(0, 2).map((g) => (
                      <Badge key={g} variant="secondary" className="text-xs">
                        {g}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {(series.stats.totalViews / 1000).toFixed(0)}K
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {(series.stats.totalLikes / 1000).toFixed(0)}K
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredSeries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No series found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
