import { redis } from "../../../core/cache/redis.js";

import type { Milestone } from "../../../generated/prisma/client.js";

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
}