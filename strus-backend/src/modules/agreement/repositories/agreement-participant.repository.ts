import type {
  AgreementParticipant,
  Prisma,
} from "../../../generated/prisma/client.js";

import {
  AgreementInvitationStatus,
} from "../../../generated/prisma/enums.js";

import { prisma } from "../../../core/database/prisma.js";

export class AgreementParticipantRepository {
  // ==================================================
  // Create
  // ==================================================

  static async create(
    tx: Prisma.TransactionClient,
    data: Prisma.AgreementParticipantCreateInput
  ): Promise<AgreementParticipant> {
    return tx.agreementParticipant.create({
      data,
    });
  }

  // ==================================================
  // Update
  // ==================================================

  static async update(
    tx: Prisma.TransactionClient,
    id: string,
    data: Prisma.AgreementParticipantUpdateInput
  ): Promise<AgreementParticipant> {
    return tx.agreementParticipant.update({
      where: {
        id,
      },
      data,
    });
  }

  // ==================================================
  // Delete
  // ==================================================

  static async delete(
    tx: Prisma.TransactionClient,
    id: string
  ) {
    return tx.agreementParticipant.delete({
      where: {
        id,
      },
    });
  }

  // ==================================================
  // Find By Id
  // ==================================================

  static async findById(
    id: string
  ) {
    return prisma.agreementParticipant.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        agreement: {
          include: {
            project: true,
          },
        },
      },
    });
  }

  // ==================================================
  // Find By Agreement
  // ==================================================

  static async findByAgreement(
    agreementId: string
  ) {
    return prisma.agreementParticipant.findMany({
      where: {
        agreementId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  // ==================================================
  // Latest Invitation
  // ==================================================

  static async findLatestInvitation(
    agreementId: string,
    userId: string
  ) {
    return prisma.agreementParticipant.findFirst({
      where: {
        agreementId,
        userId,
      },
      orderBy: {
        invitedAt: "desc",
      },
    });
  }

  // ==================================================
  // Pending Invitation
  // ==================================================

  static async findPendingInvitation(
    agreementId: string,
    userId: string
  ) {
    return prisma.agreementParticipant.findFirst({
      where: {
        agreementId,
        userId,
        invitationStatus:
          AgreementInvitationStatus.PENDING,
      },
      orderBy: {
        invitedAt: "desc",
      },
    });
  }

  // ==================================================
  // Accepted Professional
  // ==================================================

  static async findAcceptedProfessional(
    agreementId: string,
    userId: string
  ) {
    return prisma.agreementParticipant.findFirst({
      where: {
        agreementId,
        userId,
        invitationStatus:
          AgreementInvitationStatus.ACCEPTED,
      },
      orderBy: {
        joinedAt: "desc",
      },
    });
  }

  // ==================================================
  // Count Accepted Professionals
  // ==================================================

  static async countAcceptedProfessionals(
    agreementId: string
  ) {
    return prisma.agreementParticipant.count({
      where: {
        agreementId,
        invitationStatus:
          AgreementInvitationStatus.ACCEPTED,
      },
    });
  }

  // ==================================================
  // User Invitations
  // ==================================================

  static async findByUser(
    userId: string
  ) {
    return prisma.agreementParticipant.findMany({
      where: {
        userId,
      },
      include: {
        agreement: {
          include: {
            project: true,
          },
        },
      },
      orderBy: {
        invitedAt: "desc",
      },
    });
  }
}