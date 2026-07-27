import { prisma } from "../../../core/database/prisma.js";
import { WorkspaceRole } from "../../../generated/prisma/enums.js";

export class EventHelperRepository {

  /**
   * Check whether a user belongs to a workspace.
   */
  static async isWorkspaceMember(
    workspaceId: string,
    userId: string
  ): Promise<boolean> {

    const member =
      await prisma.workspaceMember.findUnique({

        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },

        select: {
          userId: true,
        },

      });

    return member !== null;

  }

  /**
   * Check whether multiple users belong to a workspace.
   */
  static async filterWorkspaceMembers(
    workspaceId: string,
    userIds: string[]
  ): Promise<string[]> {

    if (userIds.length === 0) {
      return [];
    }

    const members =
      await prisma.workspaceMember.findMany({

        where: {

          workspaceId,

          userId: {
            in: userIds,
          },

        },

        select: {
          userId: true,
        },

      });

    return members.map(
      member => member.userId
    );

  }

  /**
   * Get all workspace member IDs.
   */
  static async getWorkspaceMemberIds(
    workspaceId: string
  ): Promise<string[]> {

    const members =
      await prisma.workspaceMember.findMany({

        where: {
          workspaceId,
        },

        select: {
          userId: true,
        },

      });

    return members.map(
      member => member.userId
    );

  }

  /**
   * Resolve all information required to create
   * Workspace Member Joined notifications.
   */
  static async getWorkspaceMemberJoinedContext(
    workspaceId: string,
    joinedUserId: string
  ) {

    const workspace =
      await prisma.workspace.findUnique({

        where: {
          id: workspaceId,
        },

        select: {

          id: true,

          name: true,

          members: {

            where: {

              role: {

                in: [
                  WorkspaceRole.OWNER,
                  WorkspaceRole.ADMIN,
                ],

              },

            },

            select: {

              userId: true,

            },

          },

        },

      });

    if (!workspace) {
      return null;
    }

    const joinedUser =
      await prisma.user.findUnique({

        where: {
          id: joinedUserId,
        },

        select: {

          id: true,

          profile: {

            select: {

              firstName: true,

              lastName: true,

            },

          },

        },

      });

    if (!joinedUser) {
      return null;
    }

    return {

      workspaceId: workspace.id,

      workspaceName: workspace.name,

      joinedUserId,

      joinedUserName:
        `${joinedUser.profile?.firstName ?? ""} ${joinedUser.profile?.lastName ?? ""}`.trim(),

      recipientIds:
        workspace.members.map(
          member => member.userId
        ),

    };

  }

  /**
 * Resolve all information required to create
 * Workspace Member Removed notifications.
 */
static async getWorkspaceMemberRemovedContext(
  workspaceId: string,
  removedUserId: string
) {

  const workspace =
    await prisma.workspace.findUnique({

      where: {
        id: workspaceId,
      },

      select: {

        id: true,

        name: true,

        members: {

          where: {

            role: {

              in: [
                WorkspaceRole.OWNER,
                WorkspaceRole.ADMIN,
              ],

            },

          },

          select: {

            userId: true,

          },

        },

      },

    });

  if (!workspace) {
    return null;
  }

  const removedUser =
    await prisma.user.findUnique({

      where: {
        id: removedUserId,
      },

      select: {

        id: true,

        profile: {

          select: {

            firstName: true,

            lastName: true,

          },

        },

      },

    });

  if (!removedUser) {
    return null;
  }

  return {

    workspaceId: workspace.id,

    workspaceName: workspace.name,

    removedUserId,

    removedUserName:
      `${removedUser.profile?.firstName ?? ""} ${removedUser.profile?.lastName ?? ""}`.trim(),

    recipientIds:
      workspace.members.map(
        member => member.userId
      ),

  };

}

/**
 * Resolve all information required to create
 * Workspace Ownership Transferred notifications.
 */
static async getWorkspaceOwnershipTransferredContext(
  workspaceId: string,
  previousOwnerId: string,
  newOwnerId: string
) {

  const workspace =
    await prisma.workspace.findUnique({

      where: {
        id: workspaceId,
      },

      select: {

        id: true,

        name: true,

        members: {

          select: {

            userId: true,

          },

        },

      },

    });

  if (!workspace) {
    return null;
  }

  const [previousOwner, newOwner] =
    await Promise.all([

      prisma.user.findUnique({

        where: {
          id: previousOwnerId,
        },

        select: {

          id: true,

          profile: {

            select: {

              firstName: true,

              lastName: true,

            },

          },

        },

      }),

      prisma.user.findUnique({

        where: {
          id: newOwnerId,
        },

        select: {

          id: true,

          profile: {

            select: {

              firstName: true,

              lastName: true,

            },

          },

        },

      }),

    ]);

  if (!previousOwner || !newOwner) {
    return null;
  }

  return {

    workspaceId: workspace.id,

    workspaceName: workspace.name,

    previousOwnerId,

    previousOwnerName:
      `${previousOwner.profile?.firstName ?? ""} ${previousOwner.profile?.lastName ?? ""}`.trim(),

    newOwnerId,

    newOwnerName:
      `${newOwner.profile?.firstName ?? ""} ${newOwner.profile?.lastName ?? ""}`.trim(),

    recipientIds:
      workspace.members.map(
        member => member.userId
      ),

  };

}
}