import { redis } from "../../../core/cache/redis.js";
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

import { prisma } from "../../../core/database/prisma.js";


export class SubmissionCache {
  private static readonly PREFIX =
    "submission";

  private static readonly TTL =
    60 * 10;

  // ==================================================
  // Submission
  // ==================================================

  static submissionKey(
    submissionId: string
  ): string {
    return `${this.PREFIX}:${submissionId}`;
  }

  // ==================================================
  // Milestone Submissions
  // ==================================================

  static milestoneKey(
    milestoneId: string
  ): string {
    return `${this.PREFIX}:milestone:${milestoneId}`;
  }

  // ==================================================
  // Get Submission
  // ==================================================

  static async getSubmission<T>(
    submissionId: string
  ): Promise<T | null> {
    const value =
      await redis.get(
        this.submissionKey(
          submissionId
        )
      );

    return value
      ? JSON.parse(value)
      : null;
  }

  // ==================================================
  // Cache Submission
  // ==================================================

  static async setSubmission(
    submissionId: string,
    value: unknown
  ): Promise<void> {
    await redis.set(
      this.submissionKey(
        submissionId
      ),
      JSON.stringify(value),
      {
        EX: this.TTL,
      }
    );
  }

  // ==================================================
  // Get Milestone Submissions
  // ==================================================

  static async getMilestoneSubmissions<T>(
    milestoneId: string
  ): Promise<T | null> {
    const value =
      await redis.get(
        this.milestoneKey(
          milestoneId
        )
      );

    return value
      ? JSON.parse(value)
      : null;
  }

  // ==================================================
  // Cache Milestone Submissions
  // ==================================================

  static async setMilestoneSubmissions(
    milestoneId: string,
    value: unknown
  ): Promise<void> {
    await redis.set(
      this.milestoneKey(
        milestoneId
      ),
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
    submissionId: string,
    milestoneId: string
  ): Promise<void> {
    await Promise.all([
  redis.del(
    this.submissionKey(
      submissionId
    )
  ),

  redis.del(
    this.milestoneKey(
      milestoneId
    )
  ),
]);
  }

  static async invalidateRelatedDashboards(
  submissionId: string
): Promise<void> {
  const submission =
    await prisma.milestoneSubmission.findUnique({
      where: {
        id: submissionId,
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

  if (!submission?.milestone.project.agreement) {
    return;
  }

  const clientUserId =
    submission.milestone.project.agreement.createdById;

  const professionalUserIds =
    submission.milestone.project.agreement.participants.map(
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