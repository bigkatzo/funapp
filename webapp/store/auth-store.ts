import { create } from 'zustand';
import { User } from '@/types';
import { authAPI, setAuthToken, clearAuthToken, getAuthToken } from '@/lib/api-client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await authAPI.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    setAuthToken(response.token);
    set({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  signup: async (email: string, password: string, displayName: string) => {
    const response = await authAPI.post<{ token: string; user: User }>('/auth/register', {
      email,
      password,
      displayName,
    });
    setAuthToken(response.token);
    set({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    clearAuthToken();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    const token = getAuthToken();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      setAuthToken(token);
      const user = await authAPI.get<User>('/auth/me');
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      clearAuthToken();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: (userData: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    }));
  },

  refreshUser: async () => {
    try {
      const user = await authAPI.get<User>('/auth/me');
      set({ user });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },
}));
