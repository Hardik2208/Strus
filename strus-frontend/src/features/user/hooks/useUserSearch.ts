
import { useQuery } from '@tanstack/react-query';

import { userSearchService } from '../services/user-search.service';

export const useUserSearch = (query: string, page = 1) => {
  const normalizedQuery = query.trim();

  // Email lookup belongs to the invitation API, not public user search.
  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedQuery);

  return useQuery({
    queryKey: ['user', 'search', normalizedQuery, page],
    queryFn: () => userSearchService.searchUsers(normalizedQuery, page),
    enabled: normalizedQuery.length >= 2 && !looksLikeEmail && page >= 1,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
};
