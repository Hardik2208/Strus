import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthShell } from './features/auth/components/AuthShell';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { VerifyEmailPage } from './features/auth/pages/VerifyEmailPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { VerifyForgotPasswordPage } from './features/auth/pages/VerifyForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';
import { DashboardLayout } from './app/layouts/DashboardLayout';
import { ClientDashboardPage } from './features/dashboard/pages/ClientDashboardPage';
import { ProfessionalDashboardPage } from './features/dashboard/pages/ProfessionalDashboardPage';
import { ProfessionalProjectsPage } from './features/dashboard/pages/ProfessionalProjectsPage';
import { ProfessionalProjectDetailPage } from './features/dashboard/pages/ProfessionalProjectDetailPage';
import { ProfessionalInvitationsPage } from './features/dashboard/pages/ProfessionalInvitationsPage';
import { ActivitiesPage } from './features/dashboard/pages/ActivitiesPage';

import { WorkspacesPage } from './features/workspace/pages/WorkspacesPage';
import { WorkspaceDetailPage } from './features/workspace/pages/WorkspaceDetailPage';
import { ProjectDetailPage } from './features/project/pages/ProjectDetailPage';
import { ProjectOverviewTab } from './features/project/pages/ProjectOverviewTab';
import { ProjectSettingsTab } from './features/project/pages/ProjectSettingsTab';
import { AgreementPage } from './features/agreement/pages/AgreementPage';
import { ProjectExecutionTab } from './features/execution/pages/ProjectExecutionTab';
import { ProjectCommunicationTab } from './features/communication/pages/ProjectCommunicationTab';

import { ProfileGuard } from './app/routes/ProfileGuard';
import { ProfileSetupPage } from './features/user/pages/ProfileSetupPage';
import { SettingsProfilePage } from './features/user/pages/SettingsProfilePage';
import { SecurityPage } from './features/auth/pages/SecurityPage';
import { SettingsLayout } from './app/layouts/SettingsLayout';

import { PublicRoute } from './app/routes/PublicRoute';
import { ProtectedRoute } from './app/routes/ProtectedRoute';

import { authService } from './features/auth/services/auth.service';
import { useAuthStore } from './features/auth/store/auth.store';
import { tokenManager } from './lib/auth/token-manager';
import { useTokenRefresh } from './features/auth/hooks/useTokenRefresh';

import { PlaceholderPage } from './features/placeholder/PlaceholderPage';

// Helper component to render placeholders easily
const Placeholder = ({ title, description }: { title: string, description: string }) => (
  <PlaceholderPage title={title} description={description} />
);

import { queryClient } from './lib/api/query-client';

function App() {
  const { setLoading, clearAuth } = useAuthStore();
  
  useTokenRefresh();

  useEffect(() => {
    const hydrateAuth = async () => {
      const token = tokenManager.getAccessToken();
      if (!token) {
        clearAuth();
        return;
      }
      try {
        await authService.getMe();
      } catch (error) {
        // Clear auth is handled in service/interceptor
      } finally {
        setLoading(false);
      }
    };
    hydrateAuth();
  }, [clearAuth, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-md)',
            },
            success: {
              iconTheme: {
                primary: 'var(--color-success)',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--color-error)',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes - Wrapped in AuthShell */}
          <Route element={<AuthShell />}>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify-forgot-password" element={<VerifyForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>
          </Route>
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile/setup" element={<ProfileSetupPage />} />
            
            <Route element={<ProfileGuard />}>
              <Route element={<DashboardLayout />}>
                
                {/* Client Dashboard & Modules */}
                <Route path="/dashboard/client" element={<ClientDashboardPage />} />
                <Route path="/dashboard/client/activity" element={<ActivitiesPage />} />
                
                {/* Client Settings */}
                <Route path="/dashboard/client/settings" element={<SettingsLayout />}>
                  <Route index element={<SettingsProfilePage />} />
                  <Route path="profile" element={<SettingsProfilePage />} />
                  <Route path="security" element={<SecurityPage />} />
                </Route>

                {/* Professional Dashboard & Modules */}
                <Route path="/dashboard/professional" element={<ProfessionalDashboardPage />} />
                <Route path="/dashboard/professional/projects" element={<ProfessionalProjectsPage />} />
                <Route path="/dashboard/professional/projects/:projectId" element={<ProfessionalProjectDetailPage />}>
                  <Route index element={<Navigate to="overview" replace />} />
                  <Route path="overview" element={<ProjectOverviewTab />} />
                  <Route path="agreement" element={<AgreementPage />} />
                  <Route path="execution" element={<ProjectExecutionTab />} />
                  <Route path="communication" element={<ProjectCommunicationTab />} />
                </Route>
                <Route path="/dashboard/professional/scout" element={<Placeholder title="Scout Projects" description="Professional project discovery module." />} />
                <Route path="/dashboard/professional/activities" element={<ActivitiesPage />} />
                <Route path="/dashboard/professional/invitations" element={<ProfessionalInvitationsPage />} />
                
                {/* Professional Settings */}
                <Route path="/dashboard/professional/settings" element={<SettingsLayout />}>
                  <Route index element={<SettingsProfilePage />} />
                  <Route path="profile" element={<SettingsProfilePage />} />
                  <Route path="security" element={<SecurityPage />} />
                </Route>

                {/* Root Redirection to Dashboard */}
                <Route path="/dashboard" element={<Navigate to="/dashboard/client" replace />} />
                
                {/* Workspaces Routes - Left as Top Level independent as Workspace is a standalone container */}
                <Route path="/workspaces" element={<WorkspacesPage />} />
                <Route path="/workspaces/:workspaceId" element={<WorkspaceDetailPage />} />
                <Route path="/workspaces/:workspaceId/projects/:projectId" element={<ProjectDetailPage />}>
                  <Route index element={<Navigate to="overview" replace />} />
                  <Route path="overview" element={<ProjectOverviewTab />} />
                  <Route path="agreement" element={<AgreementPage />} />
                  <Route path="execution" element={<ProjectExecutionTab />} />
                  <Route path="communication" element={<ProjectCommunicationTab />} />
                  <Route path="activity" element={<Placeholder title="Activity" description="Project activity module." />} />
                  <Route path="settings" element={<ProjectSettingsTab />} />
                </Route>

                {/* Legacy Routes Redirects */}
                <Route path="/sessions" element={<Navigate to="/dashboard/client/settings" replace />} />
                <Route path="/change-password" element={<Navigate to="/dashboard/client/settings" replace />} />
                <Route path="/profile" element={<Navigate to="/dashboard/client/settings" replace />} />
                <Route path="/profile/edit" element={<Navigate to="/dashboard/client/settings" replace />} />
                <Route path="/settings" element={<Navigate to="/dashboard/client/settings" replace />} />
                <Route path="/settings/profile" element={<Navigate to="/dashboard/client/settings" replace />} />
                <Route path="/settings/security" element={<Navigate to="/dashboard/client/settings" replace />} />

              </Route>
              
              {/* Root Redirect */}
              <Route path="/" element={<Navigate to="/dashboard/client" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
