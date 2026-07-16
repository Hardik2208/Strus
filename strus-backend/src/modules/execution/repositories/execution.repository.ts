import { prisma } from "../../../core/database/prisma.js";

import type {
  Milestone,
  Prisma,
  Project,
} from "../../../generated/prisma/client.js";

import {
  ProjectSetupStage,
  MilestoneStatus,
} from "../../../generated/prisma/enums.js";

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
  daysAdded: number,
  userId: string
) {
  return tx.milestone.update({
    where: {
      id: milestoneId,
    },

    data: {
      extensionDays: {
        increment: daysAdded,
      },

      updatedBy: {
        connect: {
          id: userId,
        },
      },
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

static updateMilestone(
  tx: Prisma.TransactionClient,
  milestoneId: string,
  data: Prisma.MilestoneUpdateInput
) {
  return tx.milestone.update({
    where: {
      id: milestoneId,
    },

    data,
  });
}

// ==================================================
// Next Milestone
// ==================================================

static findNextMilestone(
  tx: Prisma.TransactionClient,
  projectId: string,
  agreementParticipantId: string,
  order: number
) {
  return tx.milestone.findFirst({
    where: {
      projectId,

      agreementParticipantId,

      order: order + 1,

      deletedAt: null,
    },
  });
}

static async findFirstMilestones(
  tx: Prisma.TransactionClient,
  projectId: string
) {
  return tx.milestone.findMany({
    where: {
      projectId,
      order: 1,
      deletedAt: null,
    },
  });
}


static async startFirstMilestones(
  tx: Prisma.TransactionClient,
  projectId: string,
  startedAt: Date
) {
  return tx.milestone.updateMany({
    where: {
      projectId,
      order: 1,
      deletedAt: null,
    },
    data: {
      status: MilestoneStatus.IN_PROGRESS,
      startedAt,
    },
  });
}

// ==================================================
// Start Next Milestone
// ==================================================

static async startNextMilestone(
  tx: Prisma.TransactionClient,
  projectId: string,
  agreementParticipantId: string,
  currentOrder: number,
  startedAt: Date
) {
  return tx.milestone.updateMany({
    where: {
      projectId,
      agreementParticipantId,
      order: currentOrder + 1,
      status: MilestoneStatus.NOT_STARTED,
      deletedAt: null,
    },
    data: {
      status: MilestoneStatus.IN_PROGRESS,
      startedAt,
    },
  });
}

static async isAgreementParticipant(
  tx: Prisma.TransactionClient,
  projectId: string,
  userId: string
): Promise<boolean> {
  const participant =
    await tx.agreementParticipant.findFirst({
      where: {
        agreement: {
          projectId,
        },

        userId,

        invitationStatus: "ACCEPTED",
      },

      select: {
        id: true,
      },
    });

  return participant !== null;
}

static async hasIncompleteMilestones(
  tx: Prisma.TransactionClient,
  projectId: string
): Promise<boolean> {
  const count = await tx.milestone.count({
    where: {
      projectId,
      deletedAt: null,
      status: {
        not: MilestoneStatus.COMPLETED,
      },
    },
  });

  return count > 0;
}

// ==================================================
// Agreement Participant By User
// ==================================================

static findAgreementParticipantByUser(
  tx: Prisma.TransactionClient,
  projectId: string,
  userId: string
) {
  return tx.agreementParticipant.findFirst({
    where: {
      agreement: {
        projectId,
      },

      userId,

      invitationStatus: "ACCEPTED",
    },
  });
}
}