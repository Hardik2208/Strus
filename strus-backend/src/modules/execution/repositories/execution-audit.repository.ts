import { prisma } from "../../../core/database/prisma.js";

import type { Prisma } from "../../../generated/prisma/client.js";

export class ExecutionAuditRepository {
  // ==================================================
  // Create Audit
  // ==================================================

  static create(
    tx: Prisma.TransactionClient,
    data: Prisma.ExecutionAuditCreateInput
  ) {
    return tx.executionAudit.create({
      data,
    });
  }

  // ==================================================
  // Get Project Audits
  // ==================================================

  static findByProjectId(
    projectId: string
  ) {
    return prisma.executionAudit.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}