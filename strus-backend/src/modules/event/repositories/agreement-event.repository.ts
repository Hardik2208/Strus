import { prisma } from "../../../core/database/prisma.js";
import { AgreementInvitationStatus } from "../../../generated/prisma/enums.js";

export class AgreementHelperRepository {

    // ======================================================
// Agreement Context
// ======================================================

private static async getAgreementContext(
  agreementId: string
) {

  const agreement =
    await prisma.agreement.findUnique({

      where: {
        id: agreementId,
      },

      select: {

        id: true,

        title: true,

        projectId: true,

        createdById: true,

        project: {

          select: {

            workspace: {

              select: {

                ownerId: true,

              },

            },

          },

        },

        participants: {

          where: {

            invitationStatus:
              AgreementInvitationStatus.ACCEPTED,

          },

          select: {

            id: true,

            userId: true,

          },

        },

      },

    });

  if (!agreement) {
    return null;
  }

  return {

    agreementId: agreement.id,

    agreementTitle: agreement.title,

    projectId: agreement.projectId,

    createdById: agreement.createdById,

    workspaceOwnerId:
      agreement.project.workspace.ownerId,

    participantIds:
      agreement.participants.map(
        participant => participant.userId
      ),

  };

}

static async getAgreementCreatedContext(
  agreementId: string
) {

  const context =
    await this.getAgreementContext(
      agreementId
    );

  if (!context) {
    return null;
  }

  return {

    agreementId: context.agreementId,

    agreementTitle: context.agreementTitle,

    projectId: context.projectId,

    clientRecipientIds: [

      context.createdById,

      context.workspaceOwnerId,

    ],

    professionalRecipientIds:
      context.participantIds,

  };

}

static async getAgreementUpdatedContext(
  agreementId: string
) {

  return this.getAgreementCreatedContext(
    agreementId
  );

}

static async getProfessionalInvitedContext(
  participantId: string
) {

  const participant =
    await prisma.agreementParticipant.findUnique({

      where: {
        id: participantId,
      },

      select: {

        id: true,

        userId: true,

        agreement: {

          select: {

            id: true,

            title: true,

            projectId: true,

            createdById: true,

          },

        },

      },

    });

  if (!participant) {
    return null;
  }

  return {

    agreementId:
      participant.agreement.id,

    agreementTitle:
      participant.agreement.title,

    projectId:
      participant.agreement.projectId,

    clientRecipientIds: [

      participant.agreement.createdById,

    ],

    professionalRecipientIds: [

      participant.userId,

    ],

  };

}

static async getInvitationAcceptedContext(
  participantId: string
) {

  return this.getProfessionalInvitedContext(
    participantId
  );

}

static async getInvitationDeclinedContext(
  participantId: string
) {

  return this.getProfessionalInvitedContext(
    participantId
  );

}

static async getInvitationWithdrawnContext(
  participantId: string
) {

  return this.getProfessionalInvitedContext(
    participantId
  );

}

static async getProfessionalRemovedContext(
  participantId: string
) {

  return this.getProfessionalInvitedContext(
    participantId
  );

}
}