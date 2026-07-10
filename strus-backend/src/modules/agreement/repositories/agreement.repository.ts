import type {
  Agreement,
  Prisma,
} from "../../../generated/prisma/client.js";

import { prisma } from "../../../core/database/prisma.js";

export class AgreementRepository {
  // ==================================================
  // Create
  // ==================================================

  static async create(
    tx: Prisma.TransactionClient,
    data: Prisma.AgreementCreateInput
  ): Promise<Agreement> {
    return tx.agreement.create({
      data,
    });
  }

  // ==================================================
  // Exists
  // ==================================================

  static async existsByProjectId(
    projectId: string
  ): Promise<boolean> {
    const agreement =
      await prisma.agreement.findUnique({
        where: {
          projectId,
        },

        select: {
          id: true,
        },
      });

    return !!agreement;
  }

  // ==================================================
  // Find By Project
  // ==================================================

  static async findByProjectId(
    projectId: string
  ) {
    return prisma.agreement.findUnique({
      where: {
        projectId,
      },

      include: {
        project: true,

        participants: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });
  }

  // ==================================================
  // Update
  // ==================================================

  static async update(
    tx: Prisma.TransactionClient,
    agreementId: string,
    data: Prisma.AgreementUpdateInput
  ): Promise<Agreement> {
    return tx.agreement.update({
      where: {
        id: agreementId,
      },

      data,
    });
  }

  // ==================================================
  // Delete
  // ==================================================

  static async delete(
    tx: Prisma.TransactionClient,
    agreementId: string
  ) {
    return tx.agreement.delete({
      where: {
        id: agreementId,
      },
    });
  }

  

}