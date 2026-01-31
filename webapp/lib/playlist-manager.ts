import { Episode, PlaylistMode, PlaylistContext, Series, Season } from '@/types';
import { watchHistory } from './watch-history';

/**
 * Playlist Manager
 * Handles episode queues and navigation for different viewing modes
 */
export class PlaylistManager {
  private mode: PlaylistMode;
  private episodes: Episode[];
  private currentIndex: number;
  private seriesId?: string;

  constructor(mode: PlaylistMode, episodes: Episode[], startIndex: number = 0, seriesId?: string) {
    this.mode = mode;
    this.episodes = episodes;
    this.currentIndex = startIndex;
    this.seriesId = seriesId;
  }

  /**
   * Get current playlist context
   */
  getContext(): PlaylistContext {
    const current = this.episodes[this.currentIndex];
    const next = this.episodes[this.currentIndex + 1];
    const prev = this.episodes[this.currentIndex - 1];

    return {
      mode: this.mode,
      currentEpisode: current,
      nextEpisode: next,
      prevEpisode: prev,
      seriesId: this.seriesId,
      seasonNumber: current?.seasonNumber,
      totalEpisodes: this.episodes.length,
    };
  }

  /**
   * Move to next episode
   */
  next(): Episode | null {
    if (this.currentIndex < this.episodes.length - 1) {
      this.currentIndex++;
      return this.episodes[this.currentIndex];
    }
    return null;
  }

  /**
   * Move to previous episode
   */
  previous(): Episode | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.episodes[this.currentIndex];
    }
    return null;
  }

  /**
   * Check if can move forward
   */
  hasNext(): boolean {
    return this.currentIndex < this.episodes.length - 1;
  }

  /**
   * Check if can move backward
   */
  hasPrevious(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Get current episode
   */
  getCurrentEpisode(): Episode {
    return this.episodes[this.currentIndex];
  }

  /**
   * Get current mode
   */
  getMode(): PlaylistMode {
    return this.mode;
  }

  /**
   * Update playlist mode (e.g., discover → binge)
   */
  setMode(mode: PlaylistMode): void {
    this.mode = mode;
  }

  /**
   * Replace entire playlist (e.g., when switching to binge mode)
   */
  replacePlaylist(episodes: Episode[], startIndex: number = 0): void {
    this.episodes = episodes;
    this.currentIndex = startIndex;
  }

  /**
   * Get current position
   */
  getCurrentPosition(): { current: number; total: number } {
    return {
      current: this.currentIndex + 1,
      total: this.episodes.length,
    };
  }
}

/**
 * Create playlist for Discover mode
 * Shows only Episode 1 from different series
 */
export async function createDiscoverPlaylist(allSeries: Series[]): Promise<Episode[]> {
  const playlist: Episode[] = [];
  const history = watchHistory;

  for (const series of allSeries) {
    const progress = history.getSeriesProgress(series._id);
    
    // Determine which episode 1 to show
    let targetEpisode: Episode | undefined;

    if (series.seasons && series.seasons.length > 0) {
      // Multi-season series
      if (progress && progress.completedSeasons.length > 0) {
        // User has completed seasons - show next unwatched season's E1
        const nextSeasonNumber = Math.max(...progress.completedSeasons) + 1;
        const nextSeason = series.seasons.find((s) => s.seasonNumber === nextSeasonNumber);
        
        if (nextSeason && nextSeason.episodes.length > 0) {
          targetEpisode = nextSeason.episodes[0]; // Next season's E1
        }
      } else {
        // Show Season 1, Episode 1
        const firstSeason = series.seasons.find((s) => s.seasonNumber === 1);
        if (firstSeason && firstSeason.episodes.length > 0) {
          targetEpisode = firstSeason.episodes[0];
        }
      }
    } else if (series.episodes && series.episodes.length > 0) {
      // Single season series (backward compatibility)
      targetEpisode = series.episodes[0];
    }

    if (targetEpisode) {
      // Enrich with series info for display
      playlist.push({
        ...targetEpisode,
        seasonNumber: targetEpisode.seasonNumber || 1,
      });
    }
  }

  // Shuffle for discovery (can implement smart algorithm later)
  return shuffleArray(playlist);
}

/**
 * Create playlist for Binge mode
 * Sequential episodes from current series/season
 */
export function createBingePlaylist(
  series: Series,
  startEpisodeId: string
): Episode[] {
  const allEpisodes: Episode[] = [];

  if (series.seasons && series.seasons.length > 0) {
    // Multi-season: collect all episodes in order
    for (const season of series.seasons.sort((a, b) => a.seasonNumber - b.seasonNumber)) {
      allEpisodes.push(...season.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber));
    }
  } else if (series.episodes) {
    // Single season
    allEpisodes.push(...series.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber));
  }

  // Find starting episode index
  const startIndex = allEpisodes.findIndex((ep) => ep._id === startEpisodeId);
  
  if (startIndex >= 0) {
    // Return episodes starting from the start episode
    return allEpisodes.slice(startIndex);
  }

  return allEpisodes;
}

/**
 * Create playlist for Series mode
 * All episodes from a specific season, or all seasons
 */
export function createSeriesPlaylist(
  series: Series,
  startEpisodeId: string,
  seasonNumber?: number
): Episode[] {
  let allEpisodes: Episode[] = [];

  if (seasonNumber && series.seasons) {
    // Specific season only
    const season = series.seasons.find((s) => s.seasonNumber === seasonNumber);
    if (season) {
      allEpisodes = season.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
    }
  } else if (series.seasons && series.seasons.length > 0) {
    // All seasons
    for (const season of series.seasons.sort((a, b) => a.seasonNumber - b.seasonNumber)) {
      allEpisodes.push(...season.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber));
    }
  } else if (series.episodes) {
    // Single season (backward compatibility)
    allEpisodes = series.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
  }

  // Find starting index
  const startIndex = allEpisodes.findIndex((ep) => ep._id === startEpisodeId);
  
  if (startIndex >= 0) {
    return allEpisodes.slice(startIndex);
  }

  return allEpisodes;
}

/**
 * Get next unwatched episode in a series
 */
export function getNextUnwatchedEpisode(series: Series): Episode | null {
  const history = watchHistory;
  const seriesHistory = history.getSeriesHistory(series._id);
  const watchedIds = new Set(seriesHistory.filter((h) => h.completed).map((h) => h.episodeId));

  const allEpisodes: Episode[] = [];
  
  if (series.seasons && series.seasons.length > 0) {
    for (const season of series.seasons.sort((a, b) => a.seasonNumber - b.seasonNumber)) {
      allEpisodes.push(...season.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber));
    }
  } else if (series.episodes) {
    allEpisodes.push(...series.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber));
  }

  // Find first unwatched episode
  return allEpisodes.find((ep) => !watchedIds.has(ep._id)) || null;
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Pre-fetch next episode data (for performance)
 */
export function prefetchNextEpisode(nextEpisode: Episode | undefined): void {
  if (!nextEpisode?.videoUrl) return;

  // Create link element to prefetch video
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = nextEpisode.videoUrl;
  link.as = 'fetch';
  document.head.appendChild(link);

  // Also prefetch thumbnail
  if (nextEpisode.thumbnailUrl) {
    const imgLink = document.createElement('link');
    imgLink.rel = 'prefetch';
    imgLink.href = nextEpisode.thumbnailUrl;
    imgLink.as = 'image';
    document.head.appendChild(imgLink);
  }
}
