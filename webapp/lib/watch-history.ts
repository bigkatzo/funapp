import { WatchHistoryEntry, SeriesProgress, Episode } from '@/types';

const WATCH_HISTORY_KEY = 'watchHistory';
const SERIES_PROGRESS_KEY = 'seriesProgress';

/**
 * Watch History Manager
 * Tracks user's viewing progress and history in localStorage
 */
export class WatchHistoryManager {
  private userId: string;

  constructor(userId: string = 'demo-user') {
    this.userId = userId;
  }

  /**
   * Save watch progress for an episode
   */
  saveProgress(
    episode: Episode,
    progress: number,
    completed: boolean = false
  ): void {
    const entry: WatchHistoryEntry = {
      userId: this.userId,
      episodeId: episode._id,
      seriesId: episode.seriesId,
      seasonNumber: episode.seasonNumber,
      episodeNumber: episode.episodeNumber,
      progress,
      duration: episode.duration,
      completed,
      watchedAt: new Date(),
    };

    const history = this.getHistory();
    const existingIndex = history.findIndex(
      (h) => h.episodeId === episode._id && h.userId === this.userId
    );

    if (existingIndex >= 0) {
      history[existingIndex] = entry;
    } else {
      history.push(entry);
    }

    // Keep only last 500 entries
    if (history.length > 500) {
      history.splice(0, history.length - 500);
    }

    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));

    // Update series progress
    this.updateSeriesProgress(episode, progress, completed);
  }

  /**
   * Get all watch history
   */
  getHistory(): WatchHistoryEntry[] {
    try {
      const data = localStorage.getItem(WATCH_HISTORY_KEY);
      if (!data) return [];
      
      const history = JSON.parse(data) as WatchHistoryEntry[];
      return history
        .filter((h) => h.userId === this.userId)
        .map((h) => ({
          ...h,
          watchedAt: new Date(h.watchedAt),
        }));
    } catch (error) {
      console.error('Failed to parse watch history:', error);
      return [];
    }
  }

  /**
   * Get watch progress for specific episode
   */
  getEpisodeProgress(episodeId: string): WatchHistoryEntry | null {
    const history = this.getHistory();
    return history.find((h) => h.episodeId === episodeId) || null;
  }

  /**
   * Get all watched episodes for a series
   */
  getSeriesHistory(seriesId: string): WatchHistoryEntry[] {
    return this.getHistory()
      .filter((h) => h.seriesId === seriesId)
      .sort((a, b) => {
        if (a.seasonNumber !== b.seasonNumber) {
          return a.seasonNumber - b.seasonNumber;
        }
        return a.episodeNumber - b.episodeNumber;
      });
  }

  /**
   * Update series progress summary
   */
  private updateSeriesProgress(
    episode: Episode,
    progress: number,
    completed: boolean
  ): void {
    const allProgress = this.getAllSeriesProgress();
    const existing = allProgress.find((p) => p.seriesId === episode.seriesId);

    if (existing) {
      existing.lastWatchedEpisodeId = episode._id;
      existing.lastWatchedSeasonNumber = episode.seasonNumber;
      existing.lastWatchedEpisodeNumber = episode.episodeNumber;
      existing.totalWatchTime += progress;

      // Check if season is completed
      if (completed) {
        const seriesHistory = this.getSeriesHistory(episode.seriesId);
        const seasonEpisodes = seriesHistory.filter(
          (h) => h.seasonNumber === episode.seasonNumber
        );
        const seasonCompleted = seasonEpisodes.every((h) => h.completed);

        if (seasonCompleted && !existing.completedSeasons.includes(episode.seasonNumber)) {
          existing.completedSeasons.push(episode.seasonNumber);
          existing.completedSeasons.sort((a, b) => a - b);
        }
      }
    } else {
      allProgress.push({
        seriesId: episode.seriesId,
        lastWatchedEpisodeId: episode._id,
        lastWatchedSeasonNumber: episode.seasonNumber,
        lastWatchedEpisodeNumber: episode.episodeNumber,
        completedSeasons: completed ? [episode.seasonNumber] : [],
        totalWatchTime: progress,
      });
    }

    localStorage.setItem(SERIES_PROGRESS_KEY, JSON.stringify(allProgress));
  }

  /**
   * Get series progress
   */
  getSeriesProgress(seriesId: string): SeriesProgress | null {
    const allProgress = this.getAllSeriesProgress();
    return allProgress.find((p) => p.seriesId === seriesId) || null;
  }

  /**
   * Get all series progress
   */
  getAllSeriesProgress(): SeriesProgress[] {
    try {
      const data = localStorage.getItem(SERIES_PROGRESS_KEY);
      if (!data) return [];
      return JSON.parse(data) as SeriesProgress[];
    } catch (error) {
      console.error('Failed to parse series progress:', error);
      return [];
    }
  }

  /**
   * Check if user has completed a season
   */
  isSeasonCompleted(seriesId: string, seasonNumber: number): boolean {
    const progress = this.getSeriesProgress(seriesId);
    return progress?.completedSeasons.includes(seasonNumber) || false;
  }

  /**
   * Get continue watching info for a series
   */
  getContinueWatching(seriesId: string): {
    episodeId: string;
    seasonNumber: number;
    episodeNumber: number;
    progress: number;
  } | null {
    const progress = this.getSeriesProgress(seriesId);
    if (!progress) return null;

    const episodeProgress = this.getEpisodeProgress(progress.lastWatchedEpisodeId);
    
    return {
      episodeId: progress.lastWatchedEpisodeId,
      seasonNumber: progress.lastWatchedSeasonNumber,
      episodeNumber: progress.lastWatchedEpisodeNumber,
      progress: episodeProgress?.progress || 0,
    };
  }

  /**
   * Mark episode as completed
   */
  markCompleted(episodeId: string): void {
    const history = this.getHistory();
    const entry = history.find((h) => h.episodeId === episodeId);
    
    if (entry) {
      entry.completed = true;
      entry.progress = entry.duration;
      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
    }
  }

  /**
   * Clear all watch history (for testing/reset)
   */
  clearHistory(): void {
    localStorage.removeItem(WATCH_HISTORY_KEY);
    localStorage.removeItem(SERIES_PROGRESS_KEY);
  }

  /**
   * Get recently watched episodes
   */
  getRecentlyWatched(limit: number = 10): WatchHistoryEntry[] {
    return this.getHistory()
      .sort((a, b) => b.watchedAt.getTime() - a.watchedAt.getTime())
      .slice(0, limit);
  }
}

// Singleton instance for demo mode
export const watchHistory = new WatchHistoryManager('demo-user');
