import { prisma } from "../../../core/database/prisma.js";
import { DashboardActivityMapper } from "../mappers/dashboard-activity.mapper.js";

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

  // ==================================================
  // Recent Activity
  // ==================================================

  static async getRecentActivity(
    userId: string,
    limit: number
  ) {
    const [
      projectAudits,
      agreementAudits,
    ] = await Promise.all([
      prisma.projectAudit.findMany({
        where: {
          project: {
            agreement: {
              participants: {
                some: {
                  userId,
                },
              },
            },
          },
        },

        take: limit,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,

          action: true,

          createdAt: true,

          project: {
            select: {
              id: true,

              title: true,
            },
          },
        },
      }),

      prisma.agreementAudit.findMany({
        where: {
          agreement: {
            participants: {
              some: {
                userId,
              },
            },
          },
        },

        take: limit,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,

          action: true,

          createdAt: true,

          agreement: {
            select: {
              project: {
                select: {
                  id: true,

                  title: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const projectActivities =
      projectAudits.map(
        DashboardActivityMapper.fromProjectAudit
      );

    const agreementActivities =
      agreementAudits.map(
        DashboardActivityMapper.fromAgreementAudit
      );

    return [
      ...projectActivities,
      ...agreementActivities,
    ]
      .sort(
        (a, b) =>
          b.createdAt.getTime() -
          a.createdAt.getTime()
      )
      .slice(0, limit);
  }
}