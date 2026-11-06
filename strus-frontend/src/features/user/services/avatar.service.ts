import { apiClient } from '../../../lib/api/api-client';
import type { ApiSuccess } from '../../../lib/api/api-error';

import type { AvatarResponse } from '../types/user.types';

export interface AvatarDeleteResponse {
  success: boolean;
  message: string;
}

export const avatarService = {
  async uploadAvatar(file: File): Promise<ApiSuccess<AvatarResponse>> {
    const formData = new FormData();

    // Must match uploadAvatar.single("avatar") in the backend.
    formData.append('avatar', file, file.name);

    return apiClient.post<any, ApiSuccess<AvatarResponse>>(
      '/users/me/avatar',
      formData
    );
  },

  async deleteAvatar(): Promise<AvatarDeleteResponse> {
    return apiClient.delete<any, AvatarDeleteResponse>(
      '/users/me/avatar'
    );
  },
};