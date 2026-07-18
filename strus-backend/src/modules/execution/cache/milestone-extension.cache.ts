import { redis } from "../../../core/cache/redis.js";
import { prisma } from "../../../core/database/prisma.js";

import {
  AgreementParticipantRole,
} from "../../../generated/prisma/client.js";

import { ClientDashboardOverviewCache } from "../../dashboard/client-dashboard-cache/overview.cache.js";
import { ClientDashboardWorkspacesCache } from "../../dashboard/client-dashboard-cache/workspaces.cache.js";
import { ClientDashboardRequiresAttentionCache } from "../../dashboard/client-dashboard-cache/requires-attention.cache.js";
import { ClientDashboardRecentActivityCache } from "../../dashboard/client-dashboard-cache/recent-activity.cache.js";

import { ProfessionalDashboardOverviewCache } from "../../dashboard/professional-dashboard-cache/overview.cache.js";
import { ProfessionalDashboardActiveProjectsCache } from "../../dashboard/professional-dashboard-cache/active-projects.cache.js";
import { ProfessionalDashboardRecentActivityCache } from "../../dashboard/professional-dashboard-cache/recent-activity.cache.js";

export class MilestoneExtensionCache {
  private static readonly PREFIX =
    "milestone-extension";

  private static readonly TTL =
    60 * 10;

  // ==================================================
  // Cache Key
  // ==================================================

  static extensionKey(
    extensionId: string
  ): string {
    return `${this.PREFIX}:${extensionId}`;
  }

  // ==================================================
  // Get
  // ==================================================

  static async get<T>(
    extensionId: string
  ): Promise<T | null> {
    const value = await redis.get(
      this.extensionKey(extensionId)
    );

    return value
      ? JSON.parse(value)
      : null;
  }

  // ==================================================
  // Set
  // ==================================================

  static async set(
    extensionId: string,
    value: unknown
  ): Promise<void> {
    await redis.set(
      this.extensionKey(extensionId),
      JSON.stringify(value),
      {
        EX: this.TTL,
      }
    );
  }

  // ==================================================
  // Invalidate
  // ==================================================

  static async invalidate(
    extensionId: string
  ): Promise<void> {
    await redis.del(
      this.extensionKey(extensionId)
    );
  }

  // ==================================================
  // Dashboard Cache
  // ==================================================

  static async invalidateRelatedDashboards(
    extensionId: string
  ): Promise<void> {
    const extension =
      await prisma.milestoneExtension.findUnique({
        where: {
          id: extensionId,
        },

        select: {
          milestone: {
            select: {
              project: {
                select: {
                  agreement: {
                    select: {
                      createdById: true,

                      participants: {
                        where: {
                          role:
                            AgreementParticipantRole.PROFESSIONAL,
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
          },
        },
      });

    if (!extension?.milestone.project.agreement) {
      return;
    }

    const clientUserId =
      extension.milestone.project.agreement.createdById;

    const professionalUserIds =
      extension.milestone.project.agreement.participants.map(
        participant => participant.userId
      );

    await Promise.all([
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

      ...professionalUserIds.flatMap(userId => [
        ProfessionalDashboardOverviewCache.invalidate(
          userId
        ),

        ProfessionalDashboardActiveProjectsCache.invalidate(
          userId
        ),

        ProfessionalDashboardRecentActivityCache.invalidate(
          userId
        ),
      ]),
    ]);
  }
}