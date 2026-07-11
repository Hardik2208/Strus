import { prisma } from "../../../core/database/prisma.js";

import type { Prisma } from "../../../generated/prisma/client.js";

export class MilestoneExtensionRepository {
  // ==================================================
  // Create
  // ==================================================

  static create(
    tx: Prisma.TransactionClient,
    data: Prisma.MilestoneExtensionCreateInput
  ) {
    return tx.milestoneExtension.create({
      data,
    });
  }

  // ==================================================
  // Find By Milestone
  // ==================================================

  static findByMilestone(
    milestoneId: string
  ) {
    return prisma.milestoneExtension.findMany({
      where: {
        milestoneId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}