
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/auth.store';

import { dashboardService } from '../services/dashboard.service';

import { OverviewCards } from '../components/widgets/OverviewCards';
import { AttentionWidget } from '../components/widgets/AttentionWidget';
import { QuickActionsWidget } from '../components/widgets/QuickActions';
import { MetricSkeleton, ListSkeleton } from '../components/widgets/Skeletons';
import { EmptyState } from '../components/widgets/EmptyStates';
import { RecentActivitiesWidget } from '../components/widgets/RecentActivities';
import { WorkspaceInvitationsWidget } from '../components/widgets/WorkspaceInvitationsWidget';

export const ClientDashboardPage: React.FC = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // Client dashboard overview
  const {
    data: overview,
    isLoading: loadingOverview,
    isError: errorOverview,
  } = useQuery({
    queryKey: ['dashboard', 'client', 'overview'],
    queryFn: async () =>
      (await dashboardService.getClientOverview()).data,
    enabled: isAuthenticated,
  });

  // Client dashboard requires-attention items
  // API response: data is an array of RequiresAttentionItem
  const {
    data: attention = [],
    isLoading: loadingAttention,
    isError: errorAttention,
  } = useQuery({
    queryKey: ['dashboard', 'client', 'requires-attention'],
    queryFn: async () =>
      (await dashboardService.getClientAttention()).data,
    enabled: isAuthenticated,
  });

  // Recent activity comes from the Events module
  const {
    data: activitiesData,
    isLoading: loadingActivities,
    isError: errorActivities,
  } = useQuery({
    queryKey: ['dashboard', 'client', 'activities'],
    queryFn: async () =>
      (await dashboardService.getClientActivities(10)).data,
    enabled: isAuthenticated,
  });

  // Client quick actions are static navigation links.
  // There is no documented Client Quick Actions API.
  const clientQuickActions = [
    {
      key: 'projects',
      label: 'Projects',
      route: '/projects',
    },
    {
      key: 'agreements',
      label: 'Agreements',
      route: '/agreements',
    },
    {
      key: 'workspaces',
      label: 'Workspaces',
      route: '/workspaces',
    },
  ];

  const overviewMetrics = overview
    ? [
        { label: 'Workspaces', value: overview.totalWorkspaces },
        { label: 'Projects', value: overview.totalProjects },
        { label: 'Active', value: overview.activeProjects },
        { label: 'Draft', value: overview.draftProjects },
        { label: 'Completed', value: overview.completedProjects },
        { label: 'Attention', value: overview.requiresAttentionCount },
      ]
    : [];

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';

    return 'Good evening';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-32)',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {/* Greeting and Overview */}
      <section>
        <h2
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {getGreeting()}
        </h2>

        <p
          style={{
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-24)',
          }}
        >
          Here's what's happening across your work.
        </p>

        {loadingOverview ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'var(--space-16)',
            }}
          >
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </div>
        ) : errorOverview ? (
          <EmptyState
            title="Unable to load overview"
            description="There was a problem loading your dashboard metrics."
          />
        ) : (
          <OverviewCards metrics={overviewMetrics} />
        )}
      </section>

      {/* Dashboard Widgets */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 'var(--space-32)',
          alignItems: 'start',
        }}
      >
        {/* Workspace Invitations */}
        <section>
          <WorkspaceInvitationsWidget />
        </section>

        {/* Requires Attention */}
        <section>
          <h3
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-16)',
            }}
          >
            Requires Attention
          </h3>

          {loadingAttention ? (
            <ListSkeleton count={2} />
          ) : errorAttention ? (
            <EmptyState
              title="Unable to load items"
              description="We couldn't fetch your actionable items right now."
            />
          ) : (
            <AttentionWidget items={attention} />
          )}
        </section>

        {/* Recent Activity */}
        <section>
          <h3
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-16)',
            }}
          >
            Recent Activity
          </h3>

          {loadingActivities ? (
            <ListSkeleton count={3} />
          ) : errorActivities ? (
            <EmptyState
              title="Unable to load activity"
              description="We couldn't fetch your recent activity right now."
            />
          ) : (
            <RecentActivitiesWidget
              activities={activitiesData?.data || []}
            />
          )}
        </section>
      </div>

      {/* Quick Actions */}
      <section>
        <h3
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-16)',
          }}
        >
          Quick Actions
        </h3>

        <QuickActionsWidget actions={clientQuickActions} />
      </section>
    </div>
  );
};
