import type { Prisma } from "../../../generated/prisma/client.js";

import { prisma } from "../../../core/database/prisma.js";

import { AgreementAuditAction } from "../../../generated/prisma/enums.js";

import type { ListAgreementAuditsDto } from "../dtos/list-agreement-audits.dto.js";

export class AgreementAuditRepository {
  // ==================================================
  // Create Audit
  // ==================================================

  static async create(
    tx: Prisma.TransactionClient,
    data: {
      agreementId: string;
      actorId: string;
      action: AgreementAuditAction;
      metadata?: Prisma.InputJsonValue;
    }
  ) {
    return tx.agreementAudit.create({
      data: {
        agreementId: data.agreementId,
        actorId: data.actorId,
        action: data.action,
        metadata: data.metadata,
      },
    });
  }

  // ==================================================
  // Agreement Audits
  // ==================================================

  static async findByAgreement(
    agreementId: string,
    query: ListAgreementAuditsDto
  ) {
    const where: Prisma.AgreementAuditWhereInput = {
      agreementId,

      ...(query.action && {
        action: query.action,
      }),
    };

    const [logs, total] =
      await prisma.$transaction([
        prisma.agreementAudit.findMany({
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

        prisma.agreementAudit.count({
          where,
        }),
      ]);

    return {
      logs,
      total,
    };
  }
}