import { ProjectStatus } from "../../../generated/prisma/client.js";

import { ClientDashboardOverviewCache } from "../client-dashboard-cache/overview.cache.js";
import { ClientDashboardWorkspacesCache } from "../client-dashboard-cache/workspaces.cache.js";
import { ClientDashboardRequiresAttentionCache } from "../client-dashboard-cache/requires-attention.cache.js";
import { ClientDashboardRecentActivityCache } from "../client-dashboard-cache/recent-activity.cache.js";

import { ClientDashboardRepository } from "../repositories/client-dashboard.repository.js";

export class ClientDashboardService {
  // ==================================================
  // Dashboard Overview
  // ==================================================

  static async getOverview(
    userId: string
  ) {
    const cachedOverview =
  await ClientDashboardOverviewCache.get(
    userId
  );

    if (cachedOverview) {
      return cachedOverview;
    }

    const workspaces =
      await ClientDashboardRepository.getWorkspaceSummary(
        userId
      );

    const totalWorkspaces =
      workspaces.length;

    let totalProjects = 0;

    let activeProjects = 0;

    let draftProjects = 0;

    let completedProjects = 0;

    for (const workspace of workspaces) {
      totalProjects +=
        workspace._count.projects;

      for (const project of workspace.projects) {
        switch (project.status) {
          case ProjectStatus.ACTIVE:
            activeProjects++;
            break;

          case ProjectStatus.DRAFT:
            draftProjects++;
            break;

          case ProjectStatus.COMPLETED:
            completedProjects++;
            break;
        }
      }
    }

    const requiresAttention =
      await ClientDashboardRepository.getRequiresAttention(
        userId
      );

    const overview = {
      totalWorkspaces,

      totalProjects,

      activeProjects,

      draftProjects,

      completedProjects,

      requiresAttentionCount:
        requiresAttention.length,
    };

    await ClientDashboardOverviewCache.set(
  userId,
  overview
);

    return overview;
  }

  // ==================================================
  // Workspace Summary
  // ==================================================

  static async getWorkspaces(
    userId: string
  ) {
    const cachedWorkspaces =
  await ClientDashboardWorkspacesCache.get(
    userId
  );

    if (cachedWorkspaces) {
      return cachedWorkspaces;
    }

    const workspaces =
      await ClientDashboardRepository.getWorkspaceSummary(
        userId
      );

    const workspaceSummaries =
      workspaces.map(
        (workspace) => {
          const activeProjects =
            workspace.projects.filter(
              (project) =>
                project.status ===
                ProjectStatus.ACTIVE
            ).length;

          const draftProjects =
            workspace.projects.filter(
              (project) =>
                project.status ===
                ProjectStatus.DRAFT
            ).length;

          const completedProjects =
            workspace.projects.filter(
              (project) =>
                project.status ===
                ProjectStatus.COMPLETED
            ).length;

          return {
            id: workspace.id,

            name: workspace.name,

            slug: workspace.slug,

            workspaceType:
              workspace.workspaceType,

            updatedAt:
              workspace.updatedAt,

            memberCount:
              workspace._count.members,

            totalProjects:
              workspace._count.projects,

            activeProjects,

            draftProjects,

            completedProjects,

            executionProgress:
              null,
          };
        }
      );

    workspaceSummaries.sort(
      (a, b) => {
        if (
          b.activeProjects !==
          a.activeProjects
        ) {
          return (
            b.activeProjects -
            a.activeProjects
          );
        }

        if (
          b.draftProjects !==
          a.draftProjects
        ) {
          return (
            b.draftProjects -
            a.draftProjects
          );
        }

        return (
          new Date(
            b.updatedAt
          ).getTime() -
          new Date(
            a.updatedAt
          ).getTime()
        );
      }
    );

    await ClientDashboardWorkspacesCache.set(
  userId,
  workspaceSummaries
);

    return workspaceSummaries;
  }

  // ==================================================
  // Requires Attention
  // ==================================================

  static async getRequiresAttention(
    userId: string
  ) {
    const cachedAttention =
  await ClientDashboardRequiresAttentionCache.get(
    userId
  );

    if (cachedAttention) {
      return cachedAttention;
    }

    const attention =
      await ClientDashboardRepository.getRequiresAttention(
        userId
      );

    await ClientDashboardRequiresAttentionCache.set(
  userId,
  attention
);

    return attention;
  }

  // ==================================================
  // Recent Activity
  // ==================================================

  static async getRecentActivity(
    userId: string,
    activityLimit: number
  ) {
    const cachedActivity =
  await ClientDashboardRecentActivityCache.get(
    userId,
    activityLimit
  );

    if (cachedActivity) {
      return cachedActivity;
    }

    const activity =
      await ClientDashboardRepository.getRecentActivity(
        userId,
        activityLimit
      );

    await ClientDashboardRecentActivityCache.set(
  userId,
  activity,
  activityLimit
);

    return activity;
  }
}