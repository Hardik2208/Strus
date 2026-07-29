import { prisma } from "../../../core/database/prisma.js";
import { AgreementInvitationStatus } from "../../../generated/prisma/enums.js";

export class ExecutionHelperRepository {

  // ======================================================
  // Execution Plan
  // ======================================================

  private static async getExecutionPlanContext(
    projectId: string
  ) {

    const project = await prisma.project.findUnique({

      where: {
        id: projectId,
      },

      select: {

        id: true,

        title: true,

        createdById: true,

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

      clientRecipientIds: [

        project.createdById,

      ],

      professionalRecipientIds:
        project.agreement?.participants.map(
          participant => participant.userId
        ) ?? [],

    };

  }

  static async getExecutionPlanCreatedContext(
    projectId: string
  ) {

    return this.getExecutionPlanContext(projectId);

  }

  static async getExecutionPlanUpdatedContext(
    projectId: string
  ) {

    return this.getExecutionPlanContext(projectId);

  }

  // ======================================================
  // Milestone Context
  // ======================================================

  private static async getMilestoneContext(
    milestoneId: string
  ) {

    const milestone =
      await prisma.milestone.findUnique({

        where: {
          id: milestoneId,
        },

        select: {

          id: true,

          order: true,

          project: {

            select: {

              id: true,

              title: true,

              createdById: true,

            },

          },

          agreementParticipant: {

            select: {

              id: true,

              userId: true,

            },

          },

        },

      });

    if (!milestone) {
      return null;
    }

    return {

      milestoneId: milestone.id,

      milestoneOrder: milestone.order,

      projectId: milestone.project.id,

      projectTitle: milestone.project.title,

      agreementParticipantId:
        milestone.agreementParticipant.id,

      clientRecipientIds: [

        milestone.project.createdById,

      ],

      professionalRecipientIds: [

        milestone.agreementParticipant.userId,

      ],

    };

  }

  static async getMilestoneStartedContext(
    milestoneId: string
  ) {

    return this.getMilestoneContext(
      milestoneId
    );

  }

  static async getMilestoneCompletedContext(
    milestoneId: string
  ) {

    return this.getMilestoneContext(
      milestoneId
    );

  }

  // ======================================================
  // Submission
  // ======================================================

  static async getSubmissionCreatedContext(
    submissionId: string
  ) {

    const submission =
      await prisma.milestoneSubmission.findUnique({

        where: {
          id: submissionId,
        },

        select: {

          id: true,

          milestone: {

            select: {

              id: true,

            },

          },

        },

      });

    if (!submission) {
      return null;
    }

    return this.getMilestoneContext(
      submission.milestone.id
    );

  }

  // ======================================================
  // Revision
  // ======================================================

  static async getRevisionRequestedContext(
    revisionRequestId: string
  ) {

    const revision =
      await prisma.revisionRequest.findUnique({

        where: {
          id: revisionRequestId,
        },

        select: {

          milestoneId: true,

        },

      });

    if (!revision) {
      return null;
    }

    return this.getMilestoneContext(
      revision.milestoneId
    );

  }

  // ======================================================
  // Extension
  // ======================================================

  static async getExtensionGrantedContext(
    extensionId: string
  ) {

    const extension =
      await prisma.milestoneExtension.findUnique({

        where: {
          id: extensionId,
        },

        select: {

          milestoneId: true,

        },

      });

    if (!extension) {
      return null;
    }

    return this.getMilestoneContext(
      extension.milestoneId
    );

  }

  // ======================================================
  // Project Assets
  // ======================================================

  static async getProjectAssetSharedContext(
    projectAssetId: string
  ) {

    const asset =
      await prisma.projectAsset.findUnique({

        where: {
          id: projectAssetId,
        },

        select: {

          id: true,

          project: {

            select: {

              id: true,

              title: true,

              createdById: true,

            },

          },

          visibleToParticipants: {

            select: {

              participant: {

                select: {

                  userId: true,

                },

              },

            },

          },

        },

      });

    if (!asset) {
      return null;
    }

    return {

      projectAssetId: asset.id,

      projectId: asset.project.id,

      projectTitle: asset.project.title,

      clientRecipientIds: [

        asset.project.createdById,

      ],

      professionalRecipientIds:
        asset.visibleToParticipants.map(
          visibility => visibility.participant.userId
        ),

    };

  }

}