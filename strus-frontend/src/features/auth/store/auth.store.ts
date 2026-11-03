import { create } from "zustand";
import type { AuthenticatedUser } from "../types/auth.types";

interface AuthState {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  accessToken: string | null;
  profileCompleted: boolean | null;
  sessionId: string | null;
  isLoading: boolean;
  
  setAuth: (user: AuthenticatedUser, accessToken: string, profileCompleted: boolean) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  profileCompleted: null,
  sessionId: null,
  isLoading: true, // Initial state before hydrate check

  setAuth: (user, accessToken, profileCompleted) => set({
    isAuthenticated: true,
    user,
    accessToken,
    profileCompleted,
    sessionId: user.sessionId,
    isLoading: false,
  }),
  
  clearAuth: () => set({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    profileCompleted: null,
    sessionId: null,
    isLoading: false,
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
}));
