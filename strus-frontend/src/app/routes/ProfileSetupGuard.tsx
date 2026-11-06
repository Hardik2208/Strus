
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '../../features/auth/store/auth.store';

export const ProfileSetupGuard: React.FC = () => {
  const profileCompleted = useAuthStore(
    (state) => state.profileCompleted,
  );

  if (profileCompleted === null) {
    return null;
  }

  if (profileCompleted) {
    return <Navigate to="/dashboard/client" replace />;
  }

  return <Outlet />;
};
