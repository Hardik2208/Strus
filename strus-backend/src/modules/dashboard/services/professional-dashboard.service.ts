import type {
  ProfessionalDashboardOverview,
  ActiveProjectSummary,
  ProfessionalQuickAction,
  ProfessionalDashboardActivity,
} from "../interfaces/professional-dashboard.interface.js";

import { ProfessionalDashboardRepository } from "../repositories/professional-dashboard.repository.js";
import { ProfessionalDashboardOverviewCache } from "../professional-dashboard-cache/overview.cache.js";

import { ProfessionalDashboardActiveProjectsCache } from "../professional-dashboard-cache/active-projects.cache.js";

import { ProfessionalDashboardRecentActivityCache } from "../professional-dashboard-cache/recent-activity.cache.js";

export class ProfessionalDashboardService {
  // ==================================================
  // Overview
  // ==================================================

  static async getOverview(
  userId: string
): Promise<ProfessionalDashboardOverview> {
  const cached =
  await ProfessionalDashboardOverviewCache.get<ProfessionalDashboardOverview>(
    userId
  );

  if (cached) {
    return cached;
  }

  const overviewData =
    await ProfessionalDashboardRepository.getOverview(
      userId
    );

  const overview: ProfessionalDashboardOverview = {
    totalProjects:
      overviewData.length,

    activeProjects:
      overviewData.filter(
        (project) =>
          project.status ===
          "ACTIVE"
      ).length,

    completedProjects:
      overviewData.filter(
        (project) =>
          project.status ===
          "COMPLETED"
      ).length,

    draftProjects:
      overviewData.filter(
        (project) =>
          project.status ===
          "DRAFT"
      ).length,
  };

  await ProfessionalDashboardOverviewCache.set(
  userId,
  overview
);

  return overview;
}

  // ==================================================
  // Active Projects
  // ==================================================

  static async getActiveProjects(
  userId: string
): Promise<
  ActiveProjectSummary[]
> {
  const cached =
  await ProfessionalDashboardActiveProjectsCache.get<ActiveProjectSummary[]>(
    userId
  );

  if (cached) {
    return cached;
  }

  const projects =
    await ProfessionalDashboardRepository.getActiveProjects(
      userId
    );

  const activeProjects =
    projects.map(
      (participant) => {
        const client =
          participant.agreement.createdBy;

        const milestone =
          participant.milestones[0] ??
          null;

        return {
          id:
            participant.agreement.project.id,

          name:
            participant.agreement.project.title,

          workspaceId:
            participant.agreement.project.workspace.id,

          workspaceName:
            participant.agreement.project.workspace.name,

          clientId:
            client.id,

          clientName:
            client.profile
              ? `${client.profile.firstName} ${client.profile.lastName}`
              : "",

          currentMilestoneId:
            milestone?.id ?? null,

          currentMilestoneName:
            milestone
              ? `Milestone ${milestone.order}`
              : null,

          progress: 0,

          status:
            participant.agreement.project.status,
        };
      }
    );

  await ProfessionalDashboardActiveProjectsCache.set(
  userId,
  activeProjects
);

  return activeProjects;
}

  // ==================================================
  // Recent Activity
  // ==================================================

  static async getRecentActivity(
  userId: string,
  activityLimit: number
): Promise<
  ProfessionalDashboardActivity[]
> {
  const cached =
  await ProfessionalDashboardRecentActivityCache.get<ProfessionalDashboardActivity[]>(
    userId,
    activityLimit
  );

  if (cached) {
    return cached;
  }

  const activity =
    await ProfessionalDashboardRepository.getRecentActivity(
      userId,
      activityLimit
    );

  await ProfessionalDashboardRecentActivityCache.set(
  userId,
  activity,
  activityLimit
);

  return activity;
}

  // ==================================================
  // Quick Actions
  // ==================================================

  static getQuickActions(): ProfessionalQuickAction[] {
    return [
      {
        key:
          "VIEW_INVITATIONS",

        label:
          "View Invitations",

        route:
          "/dashboard/professional/invitations",
      },

      {
        key:
          "CONTINUE_PROJECT",

        label:
          "Continue Latest Project",

        route:
          "/dashboard/professional/projects",
      },

      {
        key:
          "ACTIVE_PROJECTS",

        label:
          "Open Active Projects",

        route:
          "/dashboard/professional/projects",
      },

      {
        key:
          "RECENT_ACTIVITY",

        label:
          "View Recent Activity",

        route:
          "/dashboard/professional/activity",
      },
    ];
  }
} 