import { prisma } from "../../../core/database/prisma.js";

import type {
  Milestone,
  Prisma,
  Project,
} from "../../../generated/prisma/client.js";

import { ProjectSetupStage } from "../../../generated/prisma/enums.js";

export class ExecutionRepository {
  // ==================================================
  // Project
  // ==================================================

  static findProjectById(
    tx: Prisma.TransactionClient,
    projectId: string
  ): Promise<Project | null> {
    return tx.project.findUnique({
      where: {
        id: projectId,
      },
    });
  }

  // ==================================================
  // Agreement Participants
  // ==================================================

  static findAgreementParticipants(
    tx: Prisma.TransactionClient,
    projectId: string
  ) {
    return tx.agreementParticipant.findMany({
      where: {
        agreement: {
          projectId,
        },
      },
    });
  }

  // ==================================================
  // Milestones
  // ==================================================

  static createMilestones(
    tx: Prisma.TransactionClient,
    data: Prisma.MilestoneCreateManyInput[]
  ) {
    return tx.milestone.createMany({
      data,
    });
  }

  // ==================================================
  // Dependencies
  // ==================================================

  static createDependencies(
    tx: Prisma.TransactionClient,
    data: Prisma.MilestoneDependencyCreateManyInput[]
  ) {
    return tx.milestoneDependency.createMany({
      data,
    });
  }

  // ==================================================
  // Project Setup Stage
  // ==================================================

  static updateSetupStage(
    tx: Prisma.TransactionClient,
    projectId: string,
    setupStage: ProjectSetupStage
  ) {
    return tx.project.update({
      where: {
        id: projectId,
      },
      data: {
        setupStage,
      },
    });
  }

  // ==================================================
// Agreement
// ==================================================

static findAgreementByProjectId(
  tx: Prisma.TransactionClient,
  projectId: string
) {
  return tx.agreement.findUnique({
    where: {
      projectId,
    },
    include: {
      participants: true,
    },
  });
}

// ==================================================
// Project Milestones
// ==================================================

static findProjectMilestones(
  tx: Prisma.TransactionClient,
  projectId: string
): Promise<Milestone[]> {
  return tx.milestone.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    orderBy: [
      {
        agreementParticipantId: "asc",
      },
      {
        order: "asc",
      },
    ],
  });
}

// ==================================================
// Soft Delete Project Milestones
// ==================================================

static softDeleteProjectMilestones(
  tx: Prisma.TransactionClient,
  projectId: string
) {
  return tx.milestone.updateMany({
    where: {
      projectId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });
}

// ==================================================
// Milestone
// ==================================================

static findMilestoneById(
  tx: Prisma.TransactionClient,
  milestoneId: string
) {
  return tx.milestone.findFirst({
    where: {
      id: milestoneId,
      deletedAt: null,
    },
  });
}

static incrementExtensionDays(
  tx: Prisma.TransactionClient,
  milestoneId: string,
  days: number,
  updatedById: string
) {
  return tx.milestone.update({
    where: {
      id: milestoneId,
    },
    data: {
      extensionDays: {
        increment: days,
      },

      updatedById,
    },
  });
}

// ==================================================
// Agreement Participants
// ==================================================

static findAgreementParticipantsByIds(
  tx: Prisma.TransactionClient,
  projectId: string,
  participantIds: string[]
) {
  return tx.agreementParticipant.findMany({
    where: {
      id: {
        in: participantIds,
      },

      agreement: {
        projectId,
      },
    },
  });
}
}