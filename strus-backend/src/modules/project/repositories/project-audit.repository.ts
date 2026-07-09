import type { Prisma } from "../../../generated/prisma/client.js";

import { prisma } from "../../../core/database/prisma.js";

import { ProjectAuditAction } from "../../../generated/prisma/enums.js";
import type { ListProjectAuditsDto } from "../dtos/list-project-audits.dto.js";

export class ProjectAuditRepository {
  static async create(
    tx: Prisma.TransactionClient,
    data: {
      projectId: string;
      actorId: string;
      action: ProjectAuditAction;
      metadata?: Prisma.InputJsonValue;
    }
  ) {
    return tx.projectAudit.create({
      data: {
        projectId: data.projectId,
        actorId: data.actorId,
        action: data.action,
        metadata: data.metadata,
      },
    });
  }

  static async findByProject(
  projectId: string,
  query: ListProjectAuditsDto
) {
  const where: Prisma.ProjectAuditWhereInput = {
    projectId,

    ...(query.action && {
      action: query.action,
    }),
  };

  const [logs, total] =
    await prisma.$transaction([
      prisma.projectAudit.findMany({
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

        skip:
          (query.page - 1) *
          query.limit,

        take: query.limit,

        orderBy: {
          createdAt: query.order,
        },
      }),

      prisma.projectAudit.count({
        where,
      }),
    ]);

  return {
    logs,
    total,
  };
}
}