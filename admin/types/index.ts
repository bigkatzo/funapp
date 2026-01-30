// User Types
export interface User {
  _id: string;
  email: string;
  displayName: string;
  profileImage?: string;
  credits: number;
  isPremium: boolean;
  premiumUntil?: Date;
  role: 'user' | 'admin' | 'creator';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Series & Episode Types
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
  episodes?: Episode[];
  stats: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    averageRating: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Episode {
  _id: string;
  seriesId: string;
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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Types
export interface Transaction {
  _id: string;
  userId: string;
  user?: {
    email: string;
    displayName: string;
  };
  type: 'credit_purchase' | 'credit_spend' | 'subscription' | 'episode_purchase';
  amount: number;
  credits?: number;
  currency: string;
  platform: 'ios' | 'android' | 'web';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata?: {
    episodeId?: string;
    seriesId?: string;
    productId?: string;
    receipt?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Video Upload Types
export interface VideoUpload {
  _id: string;
  uploadId: string;
  filename: string;
  originalName: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  resolution?: string;
  format?: string;
  error?: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalSeries: number;
  totalEpisodes: number;
  totalViews: number;
  totalRevenue: number;
  revenueChange: number;
  usersChange: number;
  viewsChange: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
}

export interface PopularContent {
  _id: string;
  title: string;
  type: 'series' | 'episode';
  views: number;
  likes: number;
  revenue: number;
}

export interface UserGrowth {
  date: string;
  totalUsers: number;
  newUsers: number;
  premiumUsers: number;
}

// API Response Types
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

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Form Types
export interface SeriesFormData {
  title: string;
  description: string;
  genre: string[];
  tags: string[];
  thumbnailUrl: string;
  coverImageUrl?: string;
  isFeatured: boolean;
  isActive: boolean;
}

export interface EpisodeFormData {
  seriesId: string;
  episodeNumber: number;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
  unlockMethod: 'free' | 'credits' | 'premium' | 'purchase';
  creditsCost?: number;
  purchasePrice?: number;
  isActive: boolean;
}
