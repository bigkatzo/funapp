export interface User {
  _id: string;
  email: string;
  displayName: string;
  profileImage?: string;
  credits: number;
  isPremium: boolean;
  premiumUntil?: Date;
  createdAt: Date;
}

export interface Season {
  seasonNumber: number;
  title?: string;
  description?: string;
  episodes: Episode[];
  thumbnailUrl?: string;
  releaseDate?: Date;
  isCompleted?: boolean; // User has watched all episodes
}

export interface Series {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  coverImageUrl?: string;
  genre: string[];
  tags: string[];
  creator: {
    _id: string;
    displayName: string;
    profileImage?: string;
  };
  totalEpisodes: number;
  seasons?: Season[]; // Multi-season support
  episodes?: Episode[]; // Backward compatibility
  stats: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
  };
  createdAt: Date;
}

export interface Episode {
  _id: string;
  seriesId: string;
  seasonNumber: number; // Season support
  episodeNumber: number;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  unlockMethod: 'free' | 'credits' | 'premium' | 'purchase';
  creditsCost?: number;
  purchasePrice?: number;
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
  isUnlocked?: boolean;
  isWatched?: boolean; // User completed this episode
  watchProgress?: number; // Seconds watched
  createdAt: Date;
}

// Playlist and watch mode types
export type PlaylistMode = 'discover' | 'binge' | 'series';

export interface PlaylistContext {
  mode: PlaylistMode;
  currentEpisode: Episode;
  nextEpisode?: Episode;
  prevEpisode?: Episode;
  seriesId?: string;
  seasonNumber?: number;
  totalEpisodes?: number;
}

export interface WatchHistoryEntry {
  userId: string;
  episodeId: string;
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
  progress: number; // Seconds watched
  duration: number; // Total episode duration
  completed: boolean; // Watched >90%
  watchedAt: Date;
}

export interface SeriesProgress {
  seriesId: string;
  lastWatchedEpisodeId: string;
  lastWatchedSeasonNumber: number;
  lastWatchedEpisodeNumber: number;
  completedSeasons: number[]; // Array of completed season numbers
  totalWatchTime: number; // Total seconds watched across all episodes
}

export interface Comment {
  _id: string;
  episodeId: string;
  userId: string;
  user: {
    displayName: string;
    profileImage?: string;
  };
  text: string;
  createdAt: Date;
}

export interface Transaction {
  _id: string;
  type: 'credit_purchase' | 'credit_spend' | 'subscription' | 'episode_purchase';
  amount: number;
  credits?: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
