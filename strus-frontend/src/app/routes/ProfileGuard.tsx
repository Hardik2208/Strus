
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '../../features/auth/store/auth.store';

export const ProfileGuard: React.FC = () => {
  const profileCompleted = useAuthStore(
    (state) => state.profileCompleted,
  );

  if (profileCompleted === null) {
    return null;
  }

  if (!profileCompleted) {
    return <Navigate to="/profile/setup" replace />;
  }

  return <Outlet />;
};
