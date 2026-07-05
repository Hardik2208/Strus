import type { Prisma } from "../../../generated/prisma/client.js";

import { prisma } from "../../../core/database/prisma.js";

import { AuditAction } from "../../../generated/prisma/enums.js";

export class WorkspaceAuditRepository {
  static async create(
    tx: Prisma.TransactionClient,
    data: {
      workspaceId: string;
      actorId: string;
      action: AuditAction;
      entityId?: string;
      metadata?: Prisma.InputJsonValue;
    }
  ) {
    return tx.workspaceAuditLog.create({
      data: {
        workspaceId: data.workspaceId,
        actorId: data.actorId,
        action: data.action,
        entityId: data.entityId,
        metadata: data.metadata,
      },
    });
  }

  static async findByWorkspace(
    workspaceId: string,
    page: number,
    limit: number
  ) {
    const where = {
      workspaceId,
    };

    const [logs, total] =
      await prisma.$transaction([
        prisma.workspaceAuditLog.findMany({
          where,

          include: {
            actor: {
              include: {
                profile: {
                  select: {
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },

          skip: (page - 1) * limit,

          take: limit,

          orderBy: {
            createdAt: "desc",
          },
        }),

        prisma.workspaceAuditLog.count({
          where,
        }),
      ]);

    return {
      logs,
      total,
    };
  }
}