
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '../../auth/store/auth.store';
import { USER_QUERY_KEYS } from '../constants/user.constants';
import { avatarService } from '../services/avatar.service';
import { profileService } from '../services/profile.service';
import { usernameService } from '../services/username.service';
import type {
  MyProfileResponse,
  ProfileSetupPayload,
  ProfileUpdatePayload,
} from '../types/user.types';

// Fetch the currently authenticated user's complete profile.
export const useProfile = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<MyProfileResponse>({
    queryKey: USER_QUERY_KEYS.profile,
    queryFn: async () => {
      const response = await profileService.getMyProfile();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

// Create the user's profile during onboarding.
export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileSetupPayload) =>
      profileService.createProfile(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.profile,
      });
    },
  });
};

// Update editable profile fields.
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) =>
      profileService.updateProfile(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.profile,
      });
    },
  });
};

// Update the authenticated user's username.
export const useUpdateUsername = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) =>
      usernameService.updateUsername(username),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: USER_QUERY_KEYS.profile,
        }),
        queryClient.invalidateQueries({
          queryKey: ['user', 'username'],
        }),
      ]);
    },
  });
};

// Upload a new avatar.
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => avatarService.uploadAvatar(file),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.profile,
      });
    },
  });
};

// Remove the current avatar.
export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => avatarService.deleteAvatar(),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.profile,
      });
    },
  });
};
