import React from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "../../auth/store/auth.store";
import { dashboardService } from "../services/dashboard.service";

import { OverviewCards } from "../components/widgets/OverviewCards";
import { ActiveProjectsWidget } from "../components/widgets/ActiveProjects";
import { QuickActionsWidget } from "../components/widgets/QuickActions";
import { MetricSkeleton, ProjectCardSkeleton } from "../components/widgets/Skeletons";
import { EmptyState } from "../components/widgets/EmptyStates";
import { RecentActivitiesWidget } from "../components/widgets/RecentActivities";
import { PendingInvitationsWidget } from "../components/widgets/PendingInvitations";

import { usePendingAgreementInvitations } from "../../agreement/hooks/useAgreementInvitations";

export const ProfessionalDashboardPage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const userId = user?.id;

  // PROFESSIONAL OVERVIEW

  const {
    data: overview,
    isLoading: loadingOverview,
    isError: errorOverview,
  } = useQuery({
    queryKey: ["dashboard", "professional", "overview", userId],
    queryFn: async () =>
      (await dashboardService.getProfessionalOverview()).data,
    enabled: isAuthenticated && Boolean(userId),
  });

  // PROFESSIONAL ACTIVE PROJECTS

  const {
    data: projects = [],
    isLoading: loadingProjects,
    isError: errorProjects,
  } = useQuery({
    queryKey: ["dashboard", "professional", "active-projects", userId],
    queryFn: async () =>
      (await dashboardService.getProfessionalActiveProjects()).data,
    enabled: isAuthenticated && Boolean(userId),
  });

  // AGREEMENT MODULE
  // Invitation lifecycle belongs to the Agreement module.

  const {
    data: invitationsData,
    isLoading: loadingInvitations,
    isError: errorInvitations,
  } = usePendingAgreementInvitations();

  // PROFESSIONAL QUICK ACTIONS

  const {
    data: quickActions = [],
    isLoading: loadingActions,
    isError: errorActions,
  } = useQuery({
    queryKey: ["dashboard", "professional", "quick-actions", userId],
    queryFn: async () =>
      (await dashboardService.getProfessionalQuickActions()).data,
    enabled: isAuthenticated && Boolean(userId),
  });

  // EVENTS MODULE

  const {
    data: activitiesData,
    isLoading: loadingActivities,
    isError: errorActivities,
  } = useQuery({
    queryKey: ["events", "dashboard", "professional", userId, 10],
    queryFn: async () =>
      (await dashboardService.getProfessionalActivities(10)).data,
    enabled: isAuthenticated && Boolean(userId),
  });

  const overviewMetrics = overview
    ? [
        { label: "Projects", value: overview.totalProjects },
        { label: "Active", value: overview.activeProjects },
        { label: "Draft", value: overview.draftProjects },
        { label: "Completed", value: overview.completedProjects },
      ]
    : [];

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-32)",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* OVERVIEW */}

      <section>
        <h2
          style={{
            fontSize: "var(--text-xl)",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-4)",
          }}
        >
          {greeting}
        </h2>

        <p
          style={{
            color: "var(--color-text-secondary)",
            marginBottom: "var(--space-24)",
          }}
        >
          Here's where your current work stands.
        </p>

        {loadingOverview ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "var(--space-16)",
            }}
          >
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "var(--space-32)",
          alignItems: "start",
        }}
      >
        {/* ACTIVE PROJECTS */}

        <section>
          <h3
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-16)",
            }}
          >
            Active Projects
          </h3>

          {loadingProjects ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "var(--space-16)",
              }}
            >
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          ) : errorProjects ? (
            <EmptyState
              title="Unable to load active projects"
              description="We couldn't fetch your active projects right now."
            />
          ) : (
            <ActiveProjectsWidget projects={projects} />
          )}
        </section>

        {/* PENDING AGREEMENT INVITATIONS */}

        <section>
          <h3
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-16)",
            }}
          >
            Pending Invitations
          </h3>

          {loadingInvitations ? (
            <ProjectCardSkeleton />
          ) : errorInvitations ? (
            <EmptyState
              title="Unable to load invitations"
              description="Open the Invitations section to check again."
            />
          ) : (
            <PendingInvitationsWidget
              invitations={invitationsData?.invitations || []}
            />
          )}
        </section>

        {/* RECENT ACTIVITY */}

        <section>
          <h3
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-16)",
            }}
          >
            Recent Activity
          </h3>

          {loadingActivities ? (
            <ProjectCardSkeleton />
          ) : errorActivities ? (
            <EmptyState
              title="Unable to load activity"
              description="Recent activity is temporarily unavailable."
            />
          ) : (
            <RecentActivitiesWidget
              activities={activitiesData?.data || []}
            />
          )}
        </section>
      </div>

      {/* QUICK ACTIONS */}

      <section>
        <h3
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-16)",
          }}
        >
          Quick Actions
        </h3>

        {loadingActions ? (
          <ProjectCardSkeleton />
        ) : errorActions ? (
          <EmptyState
            title="Unable to load quick actions"
            description="The dashboard shortcuts could not be loaded."
          />
        ) : (
          <QuickActionsWidget actions={quickActions} />
        )}
      </section>
    </div>
  );
};