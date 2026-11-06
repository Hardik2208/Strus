
import { apiClient } from '../../../lib/api/api-client';
import type { ApiSuccess } from '../../../lib/api/api-error';

import type {
  UsernameAvailabilityResponse,
  UsernameUpdateResponse,
} from '../types/user.types';

export const usernameService = {
  async checkAvailability(username: string) {
    const normalized = username.trim().toLowerCase();

    return apiClient.get<any, ApiSuccess<UsernameAvailabilityResponse>>(
      `/users/check-username?username=${encodeURIComponent(normalized)}`
    );
  },

  async updateUsername(username: string) {
    const normalized = username.trim().toLowerCase();

    return apiClient.patch<any, ApiSuccess<UsernameUpdateResponse>>(
      '/users/me/username',
      { username: normalized }
    );
  },
};
