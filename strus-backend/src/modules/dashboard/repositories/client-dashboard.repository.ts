import { prisma } from "../../../core/database/prisma.js";
import { DashboardActivityMapper } from "../mappers/dashboard-activity.mapper.js";

export class ClientDashboardRepository {
  // ==================================================
  // Workspace Summary
  // ==================================================

  static getWorkspaceSummary(
  userId: string
) {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },

    select: {
      id: true,

      name: true,

      slug: true,

      workspaceType: true,

      updatedAt: true,

      _count: {
        select: {
          members: true,
          projects: true,
        },
      },

      projects: {
        select: {
          id: true,
          status: true,
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },
  });
}

  // ==================================================
  // Dashboard Overview
  // ==================================================

  static getOverview(
  userId: string
) {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },

    select: {
      _count: {
        select: {
          projects: true,
        },
      },

      projects: {
        select: {
          status: true,
        },
      },
    },
  });
}

  // ==================================================
  // Requires Attention
  // ==================================================

  static async getRequiresAttention(
  userId: string
) {
  const invitations =
    await prisma.agreementParticipant.findMany({
      where: {
        userId,

        role: "CLIENT",

        invitationStatus: "PENDING",
      },

      select: {
        id: true,

        invitedAt: true,

        agreement: {
          select: {
            id: true,

            title: true,

            project: {
              select: {
                id: true,

                title: true,
              },
            },
          },
        },
      },

      orderBy: {
        invitedAt: "desc",
      },
    });

  return invitations.map(
    (invitation) => ({
      id: invitation.id,

      type: "AGREEMENT_SIGNATURE" as const,

      title:
        "Agreement Signature Required",

      description: `Please review and sign the agreement for "${invitation.agreement.project.title}".`,

      agreementId:
        invitation.agreement.id,

      projectId:
        invitation.agreement.project.id,

      projectTitle:
        invitation.agreement.project.title,

      createdAt:
        invitation.invitedAt,
    })
  );
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
          workspace: {
            members: {
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