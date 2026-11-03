import { apiClient } from '../../../lib/api/api-client';
import type { ApiSuccess } from '../../../lib/api/api-error';
import type { UserProfile } from '../types/user.types';

export const avatarService = {
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiClient.post<any, ApiSuccess<UserProfile>>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async deleteAvatar() {
    return apiClient.delete<any, ApiSuccess<UserProfile>>('/users/me/avatar');
  }
};
