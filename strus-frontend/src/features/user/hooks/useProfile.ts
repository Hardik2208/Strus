import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profile.service';
import { USER_QUERY_KEYS } from '../constants/user.constants';
import { useAuthStore } from '../../auth/store/auth.store';

export const useProfile = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: USER_QUERY_KEYS.profile,
    queryFn: async () => {
      const response = await profileService.getMyProfile();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
