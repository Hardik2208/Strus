import { prisma } from "../../../core/database/prisma.js";

import type { Prisma } from "../../../generated/prisma/client.js";

export class MilestoneDependencyRepository {
  // ==================================================
  // Create
  // ==================================================

  static create(
    tx: Prisma.TransactionClient,
    data: Prisma.MilestoneDependencyCreateInput
  ) {
    return tx.milestoneDependency.create({
      data,
    });
  }

  // ==================================================
  // Find By Id
  // ==================================================

  static findById(
    dependencyId: string
  ) {
    return prisma.milestoneDependency.findUnique({
      where: {
        id: dependencyId,
      },
    });
  }

  // ==================================================
  // Find Existing Dependency
  // ==================================================

  static findExisting(
    milestoneId: string,
    dependsOnMilestoneId: string
  ) {
    return prisma.milestoneDependency.findUnique({
      where: {
        milestoneId_dependsOnMilestoneId: {
          milestoneId,
          dependsOnMilestoneId,
        },
      },
    });
  }

  // ==================================================
  // Find By Milestone
  // ==================================================

  static findByMilestone(
    milestoneId: string
  ) {
    return prisma.milestoneDependency.findMany({
      where: {
        milestoneId,
      },
      include: {
        dependsOn: true,
      },
    });
  }

  // ==================================================
  // Find Project Dependencies
  // ==================================================

  static findProjectDependencies(
    projectId: string
  ) {
    return prisma.milestoneDependency.findMany({
      where: {
        milestone: {
          projectId,
          deletedAt: null,
        },
      },
      include: {
        milestone: true,
        dependsOn: true,
      },
    });
  }

  // ==================================================
  // Delete
  // ==================================================

  static delete(
    tx: Prisma.TransactionClient,
    dependencyId: string
  ) {
    return tx.milestoneDependency.delete({
      where: {
        id: dependencyId,
      },
    });
  }
}