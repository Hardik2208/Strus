import type { Prisma, Workspace, WorkspaceMember } from "../../../generated/prisma/client.js";

import {
  WorkspaceInvitationStatus,
  WorkspaceRole,
} from "../../../generated/prisma/enums.js";
import type {
  CreateWorkspaceInput,
  CreateWorkspaceMemberInput,
} from "../types/create-workspace.types.js";
import { WorkspaceType } from "../../../generated/prisma/enums.js";

import { prisma } from "../../../core/database/prisma.js";

export class WorkspaceRepository {
  static async createWorkspace(
    tx: Prisma.TransactionClient,
    data: CreateWorkspaceInput
  ): Promise<Workspace> {
    return tx.workspace.create({
      data: {
        ownerId: data.ownerId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        workspaceType: data.workspaceType,
      },
    });
  }

  static async createWorkspaceMember(
    tx: Prisma.TransactionClient,
    data: CreateWorkspaceMemberInput
  ): Promise<WorkspaceMember> {
    return tx.workspaceMember.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        role: data.role,
      },
    });
  }

  static async slugExists(
  slug: string
): Promise<boolean> {
  const workspace =
    await prisma.workspace.findUnique({
      where: {
        slug,
      },

      select: {
        id: true,
      },
    });

  return !!workspace;
}

static async findUserWorkspaces(
  userId: string
): Promise<
  Prisma.WorkspaceMemberGetPayload<{
    include: {
      workspace: true;
    };
  }>[]
> {
  return prisma.workspaceMember.findMany({
    where: {
      userId,
    },

    include: {
      workspace: true,
    },

    orderBy: {
      joinedAt: "asc",
    },
  });
}

static async findById(
  workspaceId: string,
  userId: string
): Promise<
  Prisma.WorkspaceMemberGetPayload<{
    include: {
      workspace: true;
    };
  }> | null
> {
  return prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },

    include: {
      workspace: true,
    },
  });
}

static async updateWorkspace(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  data: Prisma.WorkspaceUpdateInput
): Promise<Workspace> {
  return tx.workspace.update({
    where: {
      id: workspaceId,
    },
    data,
  });
}

static async deleteWorkspace(
  tx: Prisma.TransactionClient,
  workspaceId: string
): Promise<void> {
  await tx.workspace.delete({
    where: {
      id: workspaceId,
    },
  });
}


static async findWorkspaceMembers(
  workspaceId: string
): Promise<
  Prisma.WorkspaceMemberGetPayload<{
    include: {
      user: {
        include: {
          profile: {
            select: {
              username: true;
              firstName: true;
              lastName: true;
              avatarUrl: true;
            };
          };
        };
      };
    };
  }>[]
> {
  return prisma.workspaceMember.findMany({
    where: {
      workspaceId,
    },

    include: {
      user: {
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

    orderBy: [
      {
        role: "asc",
      },
      {
        joinedAt: "asc",
      },
    ],
  });
}

static async findMember(
  workspaceId: string,
  memberId: string
) {
  return prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: memberId,
      },
    },
  });
}

static async updateMemberRole(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  memberId: string,
  role: WorkspaceRole
) {
  return tx.workspaceMember.update({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: memberId,
      },
    },
    data: {
      role,
    },
  });
}

static async createInvitation(
  tx: Prisma.TransactionClient,
  data: {
    workspaceId: string;
    invitedByUserId: string;
    invitedUserId: string;
    expiresAt: Date;
  }
) {
  return tx.workspaceInvitation.create({
  data,

  include: {
    invitedBy: {
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
});
}

static async findPendingInvitation(
  workspaceId: string,
  invitedUserId: string
) {
  return prisma.workspaceInvitation.findFirst({
    where: {
      workspaceId,

      invitedUserId,

      status:
        WorkspaceInvitationStatus.PENDING,
    },
  });
}

static async findWorkspaceInvitations(
  workspaceId: string,
  page: number,
  limit: number
) {
  const where = {
    workspaceId,
  };

  const [invitations, total] =
    await prisma.$transaction([
      prisma.workspaceInvitation.findMany({
        where,

        include: {
          invitedBy: {
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

      prisma.workspaceInvitation.count({
        where,
      }),
    ]);

  return {
    invitations,
    total,
  };
}

static async findInvitationById(
  invitationId: string
) {
  return prisma.workspaceInvitation.findUnique({
    where: {
      id: invitationId,
    },

    include: {
      invitedUser: true,
    },
  });
}

static async updateInvitationStatus(
  tx: Prisma.TransactionClient,
  invitationId: string,
  status: WorkspaceInvitationStatus
) {
  return tx.workspaceInvitation.update({
    where: {
      id: invitationId,
    },

    data: {
      status,
    },
  });
}

static async deleteInvitation(
  tx: Prisma.TransactionClient,
  invitationId: string
) {
  await tx.workspaceInvitation.delete({
    where: {
      id: invitationId,
    },
  });
}

static async findMemberByEmail(
  workspaceId: string,
  email: string
) {
  return prisma.workspaceMember.findFirst({
    where: {
      workspaceId,

      user: {
        email,
      },
    },

    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
}

static async findUserByIdentifier(
  identifier: string
) {
  return prisma.user.findFirst({
    where: {
      OR: [
        {
          email: identifier,
        },
        {
          profile: {
            username: identifier,
          },
        },
      ],
    },

    select: {
      id: true,
      email: true,
      profileCompleted: true,

      profile: {
        select: {
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  });
}

static async findInvitationsForUser(
  userId: string
) {
  return prisma.workspaceInvitation.findMany({
    where: {
      invitedUserId: userId,

      status:
        WorkspaceInvitationStatus.PENDING,
    },

    include: {
      workspace: true,

      invitedBy: {
        include: {
          profile: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

static async findAcceptedMember(
  workspaceId: string,
  userId: string
) {
  return prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
}

static async removeMember(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  memberId: string
): Promise<void> {
  await tx.workspaceMember.delete({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: memberId,
      },
    },
  });
}

static async countMembers(
  workspaceId: string
): Promise<number> {
  return prisma.workspaceMember.count({
    where: {
      workspaceId,
    },
  });
}

static async leaveWorkspace(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  userId: string
): Promise<void> {
  await tx.workspaceMember.delete({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
}

static async updateWorkspaceOwner(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  newOwnerId: string
): Promise<void> {
  await tx.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      ownerId: newOwnerId,
    },
  });
}

static async searchUsers(query: string) {
  return prisma.user.findMany({
    where: {
      profileCompleted: true,

      profile: {
        OR: [
          {
            username: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            firstName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
    },

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

    take: 20,

    orderBy: {
      profile: {
        username: "asc",
      },
    },
  });
}

static async searchWorkspaceMembers(
  workspaceId: string,
  search: string | undefined,
  page: number,
  limit: number
) {
  const where: Prisma.WorkspaceMemberWhereInput = {
    workspaceId,

    ...(search
      ? {
          user: {
            profile: {
              is: {
                OR: [
                  {
                    username: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    firstName: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    lastName: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            },
          },
        }
      : {}),
  };

  const [members, total] =
    await prisma.$transaction([
      prisma.workspaceMember.findMany({
        where,

        include: {
          user: {
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

        orderBy: [
          {
            joinedAt: "asc",
          },
        ],
      }),

      prisma.workspaceMember.count({
        where,
      }),
    ]);

  return {
    members,
    total,
  };
}

static async findWorkspaceIds(
  userId: string
): Promise<
  {
    workspaceId: string;
  }[]
> {
  return prisma.workspaceMember.findMany({
    where: {
      userId,
    },

    select: {
      workspaceId: true,
    },
  });
}

static async findWorkspaceById(
  workspaceId: string
) {
  return prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });
}
}