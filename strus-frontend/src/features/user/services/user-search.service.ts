import { apiClient } from '../../../lib/api/api-client';
import type { PublicUserIdentity } from '../types/user.types';

export interface UserSearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export interface UserSearchResponse {
  success: boolean;
  data: PublicUserIdentity[];
  pagination: UserSearchPagination;
}

export const userSearchService = {
  async searchUsers(query: string, page: number = 1) {
    return apiClient.get<any, UserSearchResponse>(`/users/search?q=${encodeURIComponent(query)}&page=${page}`);
  }
};
