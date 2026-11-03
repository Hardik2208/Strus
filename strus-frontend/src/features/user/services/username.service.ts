import { apiClient } from '../../../lib/api/api-client';
import type { ApiSuccess } from '../../../lib/api/api-error';
import type { UsernameAvailabilityResponse, UserProfile } from '../types/user.types';

export const usernameService = {
  async checkAvailability(username: string) {
    const normalized = username.toLowerCase();
    return apiClient.get<any, ApiSuccess<UsernameAvailabilityResponse>>(`/users/check-username?username=${normalized}`);
  },

  async updateUsername(username: string) {
    const normalized = username.toLowerCase();
    return apiClient.patch<any, ApiSuccess<UserProfile>>('/users/me/username', { username: normalized });
  }
};
