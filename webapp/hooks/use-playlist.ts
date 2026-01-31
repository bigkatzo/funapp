import { useState, useEffect, useCallback } from 'react';
import { Episode, PlaylistMode, PlaylistContext, Series } from '@/types';
import {
  PlaylistManager,
  createDiscoverPlaylist,
  createBingePlaylist,
  createSeriesPlaylist,
  prefetchNextEpisode,
} from '@/lib/playlist-manager';

interface UsePlaylistOptions {
  mode: PlaylistMode;
  episodes: Episode[];
  startIndex?: number;
  seriesId?: string;
}

/**
 * React hook for playlist management
 */
export function usePlaylist(options: UsePlaylistOptions) {
  const { mode, episodes, startIndex = 0, seriesId } = options;
  
  const [manager] = useState(
    () => new PlaylistManager(mode, episodes, startIndex, seriesId)
  );
  const [context, setContext] = useState<PlaylistContext>(manager.getContext());

  // Update context when manager changes
  const updateContext = useCallback(() => {
    const newContext = manager.getContext();
    setContext(newContext);
    
    // Prefetch next episode for smooth playback
    if (newContext.nextEpisode) {
      prefetchNextEpisode(newContext.nextEpisode);
    }
  }, [manager]);

  useEffect(() => {
    updateContext();
  }, [updateContext]);

  const next = useCallback(() => {
    const nextEpisode = manager.next();
    updateContext();
    return nextEpisode;
  }, [manager, updateContext]);

  const previous = useCallback(() => {
    const prevEpisode = manager.previous();
    updateContext();
    return prevEpisode;
  }, [manager, updateContext]);

  const hasNext = useCallback(() => {
    return manager.hasNext();
  }, [manager]);

  const hasPrevious = useCallback(() => {
    return manager.hasPrevious();
  }, [manager]);

  const getCurrentEpisode = useCallback(() => {
    return manager.getCurrentEpisode();
  }, [manager]);

  const getMode = useCallback(() => {
    return manager.getMode();
  }, [manager]);

  const setMode = useCallback(
    (newMode: PlaylistMode) => {
      manager.setMode(newMode);
      updateContext();
    },
    [manager, updateContext]
  );

  const replacePlaylist = useCallback(
    (newEpisodes: Episode[], newStartIndex: number = 0) => {
      manager.replacePlaylist(newEpisodes, newStartIndex);
      updateContext();
    },
    [manager, updateContext]
  );

  const getCurrentPosition = useCallback(() => {
    return manager.getCurrentPosition();
  }, [manager]);

  return {
    context,
    next,
    previous,
    hasNext,
    hasPrevious,
    getCurrentEpisode,
    getMode,
    setMode,
    replacePlaylist,
    getCurrentPosition,
  };
}

/**
 * Hook to create discover playlist from series list
 */
export function useDiscoverPlaylist(allSeries: Series[]) {
  const [playlist, setPlaylist] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlaylist = async () => {
      setIsLoading(true);
      const discoverPlaylist = await createDiscoverPlaylist(allSeries);
      setPlaylist(discoverPlaylist);
      setIsLoading(false);
    };

    loadPlaylist();
  }, [allSeries]);

  return { playlist, isLoading };
}

/**
 * Hook to create binge playlist for a series
 */
export function useBingePlaylist(series: Series | null, startEpisodeId: string) {
  const [playlist, setPlaylist] = useState<Episode[]>([]);

  useEffect(() => {
    if (!series) return;
    const bingePlaylist = createBingePlaylist(series, startEpisodeId);
    setPlaylist(bingePlaylist);
  }, [series, startEpisodeId]);

  return { playlist };
}

/**
 * Hook to create series playlist
 */
export function useSeriesPlaylist(
  series: Series | null,
  startEpisodeId: string,
  seasonNumber?: number
) {
  const [playlist, setPlaylist] = useState<Episode[]>([]);

  useEffect(() => {
    if (!series) return;
    const seriesPlaylist = createSeriesPlaylist(series, startEpisodeId, seasonNumber);
    setPlaylist(seriesPlaylist);
  }, [series, startEpisodeId, seasonNumber]);

  return { playlist };
}
