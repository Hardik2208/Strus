import { redis } from "../../../core/cache/redis.js";
import { prisma } from "../../../core/database/prisma.js";
import { ClientDashboardOverviewCache } from "../../dashboard/client-dashboard-cache/overview.cache.js";
import { ProjectMapper } from "../mappers/project.mapper.js";
import { ClientDashboardWorkspacesCache } from "../../dashboard/client-dashboard-cache/workspaces.cache.js";

import { ClientDashboardRequiresAttentionCache } from "../../dashboard/client-dashboard-cache/requires-attention.cache.js";

import { ProfessionalDashboardOverviewCache } from "../../dashboard/professional-dashboard-cache/overview.cache.js";

import { ProfessionalDashboardActiveProjectsCache } from "../../dashboard/professional-dashboard-cache/active-projects.cache.js";

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
  projectId: string,
  additionalProfessionalIds: string[] = []
): Promise<void> {
  const project = await prisma.project.findUnique({
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

  const clientUserId = project.agreement.createdById;

  const professionalUserIds = [
    ...new Set([
      ...project.agreement.participants.map(
        (participant) => participant.userId
      ),
      ...additionalProfessionalIds,
    ]),
  ];

  await Promise.all([
    ClientDashboardOverviewCache.invalidate(clientUserId),

    ClientDashboardWorkspacesCache.invalidate(clientUserId),

    ClientDashboardRequiresAttentionCache.invalidate(clientUserId),

    ...professionalUserIds.flatMap((userId) => [
      ProfessionalDashboardOverviewCache.invalidate(userId),

      ProfessionalDashboardActiveProjectsCache.invalidate(userId),
    ]),
  ]);
}


  // ==================================================
  // Professional Project List
  // ==================================================

  private static professionalProjectsKey(
    userId: string,
    queryHash: string
  ) {
    return `professional:${userId}:projects:${queryHash}`;
  }

  static async getProfessionalProjects(
    userId: string,
    queryHash: string
  ) {
    const cached = await redis.get(
      this.professionalProjectsKey(
        userId,
        queryHash
      )
    );

    return cached
      ? JSON.parse(cached)
      : null;
  }

  static async setProfessionalProjects(
    userId: string,
    queryHash: string,
    value: unknown
  ) {
    await redis.set(
      this.professionalProjectsKey(
        userId,
        queryHash
      ),
      JSON.stringify(value),
      {
        EX: TTL,
      }
    );
  }

  static async invalidateProfessionalProjects(
    userId: string
  ) {
    const keys = await redis.keys(
      `professional:${userId}:projects:*`
    );

    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  static async syncProject(
  projectId: string,
  affectedProfessionalIds: string[] = []
): Promise<void> {
  // Read the committed database state, not an earlier transaction snapshot.
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
    },
    include: {
      agreement: {
        include: {
          participants: {
            select: {
              userId: true,
              role: true,
              invitationStatus: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    await this.invalidate(projectId);
    return;
  }

  // Refresh the single-project cache with the latest database state.
  await this.set(
    projectId,
    ProjectMapper.toResponse(project)
  );

  // Include current accepted professionals and users affected
  // by this operation (including a professional just removed).
  const currentProfessionalIds =
    project.agreement?.participants
      .filter(
        (participant) =>
          participant.role === "PROFESSIONAL" &&
          participant.invitationStatus === "ACCEPTED"
      )
      .map((participant) => participant.userId) ?? [];

  const professionalIds = [
    ...new Set([
      ...currentProfessionalIds,
      ...affectedProfessionalIds,
    ]),
  ];

  // Invalidate all derived caches that contain project information.
  await Promise.all([
    this.invalidateWorkspace(project.workspaceId),

    ...professionalIds.map((userId) =>
      this.invalidateProfessionalProjects(userId)
    ),

    this.invalidateRelatedDashboards(
      projectId,
      professionalIds
    ),
  ]);
}
}