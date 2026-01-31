import { useState, useEffect, useCallback } from 'react';
import { WatchHistoryEntry, SeriesProgress, Episode } from '@/types';
import { WatchHistoryManager } from '@/lib/watch-history';

/**
 * React hook for watch history
 */
export function useWatchHistory(userId: string = 'demo-user') {
  const [manager] = useState(() => new WatchHistoryManager(userId));
  const [history, setHistory] = useState<WatchHistoryEntry[]>([]);

  // Load history on mount
  useEffect(() => {
    setHistory(manager.getHistory());
  }, [manager]);

  const saveProgress = useCallback(
    (episode: Episode, progress: number, completed: boolean = false) => {
      manager.saveProgress(episode, progress, completed);
      setHistory(manager.getHistory());
    },
    [manager]
  );

  const getEpisodeProgress = useCallback(
    (episodeId: string) => {
      return manager.getEpisodeProgress(episodeId);
    },
    [manager]
  );

  const getSeriesHistory = useCallback(
    (seriesId: string) => {
      return manager.getSeriesHistory(seriesId);
    },
    [manager]
  );

  const getSeriesProgress = useCallback(
    (seriesId: string): SeriesProgress | null => {
      return manager.getSeriesProgress(seriesId);
    },
    [manager]
  );

  const isSeasonCompleted = useCallback(
    (seriesId: string, seasonNumber: number): boolean => {
      return manager.isSeasonCompleted(seriesId, seasonNumber);
    },
    [manager]
  );

  const getContinueWatching = useCallback(
    (seriesId: string) => {
      return manager.getContinueWatching(seriesId);
    },
    [manager]
  );

  const markCompleted = useCallback(
    (episodeId: string) => {
      manager.markCompleted(episodeId);
      setHistory(manager.getHistory());
    },
    [manager]
  );

  const clearHistory = useCallback(() => {
    manager.clearHistory();
    setHistory([]);
  }, [manager]);

  const getRecentlyWatched = useCallback(
    (limit: number = 10) => {
      return manager.getRecentlyWatched(limit);
    },
    [manager]
  );

  return {
    history,
    saveProgress,
    getEpisodeProgress,
    getSeriesHistory,
    getSeriesProgress,
    isSeasonCompleted,
    getContinueWatching,
    markCompleted,
    clearHistory,
    getRecentlyWatched,
  };
}
