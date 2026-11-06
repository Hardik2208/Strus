
import { apiClient } from '../../../lib/api/api-client';

import type {
  PublicUserIdentity,
  UserSearchPagination,
} from '../types/user.types';

export interface UserSearchApiResponse {
  success: true;
  data: PublicUserIdentity[];
  pagination: UserSearchPagination;
}

export const userSearchService = {
  async searchUsers(query: string, page: number = 1) {
    const params = new URLSearchParams({
      q: query.trim(),
      page: String(Math.max(1, page)),
    });

    return apiClient.get<any, UserSearchApiResponse>(
      `/users/search?${params.toString()}`
    );
  },
};
