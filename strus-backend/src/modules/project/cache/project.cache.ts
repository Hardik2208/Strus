import { redis } from "../../../core/cache/redis.js";
import { prisma } from "../../../core/database/prisma.js";
import { ClientDashboardOverviewCache } from "../../dashboard/client-dashboard-cache/overview.cache.js";

import { ClientDashboardWorkspacesCache } from "../../dashboard/client-dashboard-cache/workspaces.cache.js";

import { ClientDashboardRequiresAttentionCache } from "../../dashboard/client-dashboard-cache/requires-attention.cache.js";

import { ClientDashboardRecentActivityCache } from "../../dashboard/client-dashboard-cache/recent-activity.cache.js";

import { ProfessionalDashboardOverviewCache } from "../../dashboard/professional-dashboard-cache/overview.cache.js";

import { ProfessionalDashboardActiveProjectsCache } from "../../dashboard/professional-dashboard-cache/active-projects.cache.js";

import { ProfessionalDashboardRecentActivityCache } from "../../dashboard/professional-dashboard-cache/recent-activity.cache.js";
const TTL = 60 * 10; // 10 minutes

export class ProjectCache {
  // ==================================================
  // Single Project
  // ==================================================

  private static projectKey(
    projectId: string
  ) {
    return `project:${projectId}`;
  }

  static async get(
    projectId: string
  ) {
    const cached = await redis.get(
      this.projectKey(projectId)
    );

    return cached
      ? JSON.parse(cached)
      : null;
  }

  static async set(
    projectId: string,
    value: unknown
  ) {
    await redis.set(
      this.projectKey(projectId),
      JSON.stringify(value),
      {
        EX: TTL,
      }
    );
  }

  static async invalidate(
    projectId: string
  ) {
    await redis.del(
      this.projectKey(projectId)
    );
  }

  // ==================================================
  // Workspace Project List
  // ==================================================

  private static workspaceProjectsKey(
    workspaceId: string,
    queryHash: string
  ) {
    return `workspace:${workspaceId}:projects:${queryHash}`;
  }

  static async getWorkspaceProjects(
    workspaceId: string,
    queryHash: string
  ) {
    const cached = await redis.get(
      this.workspaceProjectsKey(
        workspaceId,
        queryHash
      )
    );

    return cached
      ? JSON.parse(cached)
      : null;
  }

  static async setWorkspaceProjects(
    workspaceId: string,
    queryHash: string,
    value: unknown
  ) {
    await redis.set(
      this.workspaceProjectsKey(
        workspaceId,
        queryHash
      ),
      JSON.stringify(value),
      {
        EX: TTL,
      }
    );
  }

  static async invalidateWorkspace(
    workspaceId: string
  ) {
    const keys = await redis.keys(
      `workspace:${workspaceId}:projects:*`
    );

    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  static async invalidateRelatedDashboards(
  projectId: string
): Promise<void> {
  const project =
    await prisma.project.findUnique({
      where: {
        id: projectId,
      },

      select: {
        agreement: {
          select: {
            createdById: true,

            participants: {
              where: {
                role: "PROFESSIONAL",
              },

              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

  if (!project?.agreement) {
    return;
  }

  const clientUserId =
    project.agreement.createdById;

  const professionalUserIds =
    project.agreement.participants.map(
      (participant) => participant.userId
    );

  await Promise.all([
  // Client Dashboard
  ClientDashboardOverviewCache.invalidate(
    clientUserId
  ),

  ClientDashboardWorkspacesCache.invalidate(
    clientUserId
  ),

  ClientDashboardRequiresAttentionCache.invalidate(
    clientUserId
  ),

  ClientDashboardRecentActivityCache.invalidate(
    clientUserId
  ),

  // Professional Dashboard
  ...professionalUserIds.flatMap(
    (userId) => [
      ProfessionalDashboardOverviewCache.invalidate(
        userId
      ),

      ProfessionalDashboardActiveProjectsCache.invalidate(
        userId
      ),

      ProfessionalDashboardRecentActivityCache.invalidate(
        userId
      ),
    ]
  ),
]);
}
}