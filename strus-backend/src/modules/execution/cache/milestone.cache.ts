import { redis } from "../../../core/cache/redis.js";
import { prisma } from "../../../core/database/prisma.js";
import type { Milestone } from "../../../generated/prisma/client.js";
import { ClientDashboardOverviewCache } from "../../dashboard/client-dashboard-cache/overview.cache.js";

import { ClientDashboardWorkspacesCache } from "../../dashboard/client-dashboard-cache/workspaces.cache.js";

import { ClientDashboardRequiresAttentionCache } from "../../dashboard/client-dashboard-cache/requires-attention.cache.js";

import { ClientDashboardRecentActivityCache } from "../../dashboard/client-dashboard-cache/recent-activity.cache.js";

import { ProfessionalDashboardOverviewCache } from "../../dashboard/professional-dashboard-cache/overview.cache.js";

import { ProfessionalDashboardActiveProjectsCache } from "../../dashboard/professional-dashboard-cache/active-projects.cache.js";

import { ProfessionalDashboardRecentActivityCache } from "../../dashboard/professional-dashboard-cache/recent-activity.cache.js";

import {
  AgreementParticipantRole
} from "../../../generated/prisma/client.js";

export class MilestoneCache {
  private static readonly TTL = 60 * 10;

  private static byProjectKey(
    projectId: string
  ) {
    return `project:${projectId}:execution-plan`;
  }

  private static byMilestoneKey(
    milestoneId: string
  ) {
    return `milestone:${milestoneId}`;
  }

  // ==================================================
  // Execution Plan
  // ==================================================

  static async getExecutionPlan(
    projectId: string
  ): Promise<Milestone[] | null> {
    const cached = await redis.get(
      this.byProjectKey(projectId)
    );

    if (!cached) {
      return null;
    }

    return JSON.parse(cached);
  }

  static async setExecutionPlan(
    projectId: string,
    milestones: Milestone[]
  ): Promise<void> {
    await redis.setEx(
      this.byProjectKey(projectId),
      this.TTL,
      JSON.stringify(milestones)
    );
  }

  static async invalidateExecutionPlan(
    projectId: string
  ): Promise<void> {
    await redis.del(
      this.byProjectKey(projectId)
    );
  }

  // ==================================================
  // Milestone
  // ==================================================

  static async getMilestone(
    milestoneId: string
  ): Promise<Milestone | null> {
    const cached = await redis.get(
      this.byMilestoneKey(milestoneId)
    );

    if (!cached) {
      return null;
    }

    return JSON.parse(cached);
  }

  static async setMilestone(
    milestone: Milestone
  ): Promise<void> {
    await redis.setEx(
      this.byMilestoneKey(milestone.id),
      this.TTL,
      JSON.stringify(milestone)
    );
  }

  static async invalidateMilestone(
    milestoneId: string
  ): Promise<void> {
    await redis.del(
      this.byMilestoneKey(milestoneId)
    );
  }

  static async invalidateRelatedDashboards(
  milestoneId: string
): Promise<void> {
  const milestone = await prisma.milestone.findUnique({
    where: {
      id: milestoneId,
    },

    select: {
      project: {
        select: {
          agreement: {
            select: {
              createdById: true,

              participants: {
                where: {
                  role: AgreementParticipantRole.PROFESSIONAL,
                },

                select: {
                  userId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!milestone?.project.agreement) {
    return;
  }

  const clientUserId =
    milestone.project.agreement.createdById;

  const professionalUserIds =
    milestone.project.agreement.participants.map(
      participant => participant.userId
    );

  await Promise.all([
    ClientDashboardOverviewCache.invalidate(clientUserId),
    ClientDashboardWorkspacesCache.invalidate(clientUserId),
    ClientDashboardRequiresAttentionCache.invalidate(clientUserId),
    ClientDashboardRecentActivityCache.invalidate(clientUserId),

    ...professionalUserIds.flatMap(userId => [
      ProfessionalDashboardOverviewCache.invalidate(userId),
      ProfessionalDashboardActiveProjectsCache.invalidate(userId),
      ProfessionalDashboardRecentActivityCache.invalidate(userId),
    ]),
  ]);
}


}