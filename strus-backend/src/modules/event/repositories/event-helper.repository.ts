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

    return members.map((member) => member.userId);
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
    (member) => member.userId
  );
}


}
