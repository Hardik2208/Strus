import { prisma } from "../../../core/database/prisma.js";

import {
  AgreementInvitationStatus,
  WorkspaceRole,
} from "../../../generated/prisma/enums.js";

export class EventHelperRepository {

  /**
   * Common context for all Project notifications.
   */
  private static async getProjectContext(
    projectId: string
  ) {

    const project =
      await prisma.project.findUnique({

        where: {
          id: projectId,
        },

        select: {

          id: true,

          title: true,

          createdById: true,

          workspace: {

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

          },

          agreement: {

            select: {

              participants: {

                where: {

                  invitationStatus:
                    AgreementInvitationStatus.ACCEPTED,

                },

                select: {
                  userId: true,
                },

              },

            },

          },

        },

      });

    if (!project) {
      return null;
    }

    return {

      projectId: project.id,

      projectTitle: project.title,

      workspaceId: project.workspace.id,

      workspaceName: project.workspace.name,

      createdById: project.createdById,

      clientRecipientIds:
        project.workspace.members.map(
          member => member.userId
        ),

      professionalRecipientIds:
        project.agreement?.participants.map(
          participant => participant.userId
        ) ?? [],

    };

  }

  /**
   * Project Created
   */
  static async getProjectCreatedContext(
    projectId: string
  ) {

    const context =
      await this.getProjectContext(projectId);

    if (!context) {
      return null;
    }

    return {

      projectId: context.projectId,

      projectTitle: context.projectTitle,

      recipientIds: [
        context.createdById,
      ],

    };

  }

/**
 * Project Updated
 */
static async getProjectUpdatedContext(
  projectId: string
) {

  const context =
    await this.getProjectContext(projectId);

  if (!context) {
    return null;
  }

  return {

    projectId: context.projectId,

    projectTitle: context.projectTitle,

    clientRecipientIds: context.clientRecipientIds,

    professionalRecipientIds: context.professionalRecipientIds,

  };

}
  /**
   * Project Activated
   */
  static async getProjectActivatedContext(
    projectId: string
  ) {

    return this.getProjectContext(projectId);

  }

  /**
   * Project Completed
   */
  static async getProjectCompletedContext(
    projectId: string
  ) {

    return this.getProjectContext(projectId);

  }

  /**
   * Project Deleted
   */
  static async getProjectDeletedContext(
    projectId: string
  ) {

    return this.getProjectContext(projectId);

  }

  /**
 * Project Transferred
 */
static async getProjectTransferredContext(
  projectId: string,
  destinationWorkspaceId: string
) {

  const project =
    await prisma.project.findUnique({

      where: {
        id: projectId,
      },

      select: {

        id: true,

        title: true,

        createdById: true,

      },

    });

  if (!project) {
    return null;
  }

  const destinationWorkspace =
    await prisma.workspace.findUnique({

      where: {
        id: destinationWorkspaceId,
      },

      select: {

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

  return {

    projectId: project.id,

    projectTitle: project.title,

    createdById: project.createdById,

    destinationRecipientIds:
      destinationWorkspace?.members.map(
        member => member.userId
      ) ?? [],

  };

}
}