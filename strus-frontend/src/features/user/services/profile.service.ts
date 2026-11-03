import { apiClient } from '../../../lib/api/api-client';
import type { ApiSuccess } from '../../../lib/api/api-error';
import type { UserProfile, ProfileSetupPayload, ProfileUpdatePayload } from '../types/user.types';

export const profileService = {
  async getMyProfile() {
    return apiClient.get<any, ApiSuccess<UserProfile>>('/users/me');
  },

  async createProfile(data: ProfileSetupPayload) {
    return apiClient.post<any, ApiSuccess<UserProfile>>('/users/me/profile', data);
  },

  async updateProfile(data: ProfileUpdatePayload) {
    return apiClient.patch<any, ApiSuccess<UserProfile>>('/users/me', data);
  }
};
