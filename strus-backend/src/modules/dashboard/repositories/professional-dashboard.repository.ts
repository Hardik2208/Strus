import { prisma } from "../../../core/database/prisma.js";

export class ProfessionalDashboardRepository {
  // ==================================================
  // Dashboard Overview
  // ==================================================

  static getOverview(
    userId: string
  ) {
    return prisma.project.findMany({
      where: {
        agreement: {
          participants: {
            some: {
              userId,
              role: "PROFESSIONAL",
            },
          },
        },
      },

      select: {
        status: true,
      },
    });
  }

  // ==================================================
  // Pending Invitations
  // ==================================================

  static getPendingInvitations(
  userId: string
) {
  return prisma.agreementParticipant.findMany({
    where: {
      userId,

      role: "PROFESSIONAL",

      invitationStatus: "PENDING",
    },

    orderBy: {
      invitedAt: "desc",
    },

    select: {
      id: true,

      invitedAt: true,

      agreement: {
  select: {
    id: true,

    project: {
      select: {
        id: true,
        title: true,

        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },

    createdBy: {
      select: {
        id: true,

        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    },
  },
},
    },
  });
}

  // ==================================================
  // Active Projects
  // ==================================================

  static getActiveProjects(
  userId: string
) {
  return prisma.agreementParticipant.findMany({
    where: {
      userId,

      role: "PROFESSIONAL",

      invitationStatus: "ACCEPTED",

      agreement: {
        project: {
          status: "ACTIVE",

          deletedAt: null,
        },
      },
    },

    include: {
      agreement: {
        include: {
          project: {
            include: {
              workspace: true,
            },
          },

          createdBy: {
  include: {
    profile: true,
  },
},
        },
      },

      milestones: {
        where: {
          deletedAt: null,
        },

        orderBy: {
          order: "asc",
        },
      },

      user: {
        include: {
          profile: true,
        },
      },
    },
  });
}
}