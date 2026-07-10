import type { Response } from "express";

import { prisma } from "../../../core/database/prisma.js";

import { AgreementParticipantService } from "../services/agreement-participant.service.js";
import { AgreementParticipantMapper } from "../mappers/agreement-participant.mapper.js";
import { AgreementInvitationStatus } from "../../../generated/prisma/enums.js";
import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";
import { getIO } from "../../../core/socket/socket.js";
import { SocketEvents } from "../../../core/socket/socket-events.js";
import type { InviteProfessionalDto } from "../dtos/invite-professional.dto.js";
import type { UpdateInvitationStatusDto } from "../dtos/update-invitation-status.dto.js";
import {
  inviteProfessionalSchema,
} from "../dtos/invite-professional.dto.js";

import {
  updateInvitationStatusSchema,
} from "../dtos/update-invitation-status.dto.js";

export class AgreementParticipantController {
  // ==================================================
  // Get Participants
  // ==================================================

  static async getAll(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const projectId = req.params.projectId as string;

    const participants =
      await AgreementParticipantService.getAll(
        projectId,
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data:
        AgreementParticipantMapper.toResponseList(
          participants
        ),
    });
  }

  // ==================================================
  // Invite Professional
  // ==================================================

  static async invite(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const projectId = req.params.projectId as string;

    const dto =
  inviteProfessionalSchema.parse(
    req.body
  );

    const participant =
      await prisma.$transaction(
        (tx) =>
          AgreementParticipantService.invite(
            tx,
            projectId,
            req.user.id,
            dto
          )
      );
    
      getIO()
  .to(`user:${participant.userId}`)
  .emit(
    SocketEvents.AGREEMENT_INVITATION_CREATED,
    {
      participantId: participant.id,
      agreementId: participant.agreementId,
      projectId,
      userId: participant.userId,
      invitedBy: req.user.id,
      invitedAt: participant.invitedAt,
    }
  );

    return res.status(201).json({
      success: true,
      message:
        "Professional invited successfully.",
      data:
        AgreementParticipantMapper.toResponse(
          participant
        ),
    });
  }

  // ==================================================
  // Update Invitation
  // ==================================================

  static async updateInvitationStatus(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const projectId =
      req.params.projectId as string;

    const participantId =
      req.params.participantId as string;

    const dto =
  updateInvitationStatusSchema.parse(
    req.body
  );

    const participant =
      await prisma.$transaction(
        (tx) =>
          AgreementParticipantService.updateInvitationStatus(
            tx,
            projectId,
            participantId,
            req.user.id,
            dto
          )
      );

    if (
  dto.status ===
  AgreementInvitationStatus.ACCEPTED
) {
  const sockets =
    await getIO()
      .in(`user:${participant.userId}`)
      .fetchSockets();

  for (const socket of sockets) {
    socket.join(
      `project:${projectId}`
    );
  }

  getIO()
    .to(`user:${participant.agreement.createdById}`)
    .emit(
      SocketEvents.AGREEMENT_INVITATION_ACCEPTED,
      {
        participantId: participant.id,
        agreementId:
          participant.agreementId,
        projectId,
        userId:
          participant.userId,
        acceptedAt:
          participant.respondedAt,
      }
    );
}

if (
  dto.status ===
  AgreementInvitationStatus.DECLINED
) {
  getIO()
    .to(`user:${participant.agreement.createdById}`)
    .emit(
      SocketEvents.AGREEMENT_INVITATION_DECLINED,
      {
        participantId: participant.id,
        agreementId:
          participant.agreementId,
        projectId,
        userId:
          participant.userId,
        declinedAt:
          participant.respondedAt,
      }
    );
}

    return res.status(200).json({
      success: true,
      message:
        "Invitation updated successfully.",
      data:
        AgreementParticipantMapper.toResponse(
          participant
        ),
    });
  }

  // ==================================================
  // Remove Professional
  // ==================================================

  static async remove(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const projectId =
      req.params.projectId as string;

    const participantId =
      req.params.participantId as string;

    const participant =
  await prisma.$transaction(
    (tx) =>
      AgreementParticipantService.remove(
        tx,
        projectId,
        participantId,
        req.user.id
      )
  );

  const sockets =
  await getIO()
    .in(`user:${participant.userId}`)
    .fetchSockets();

for (const socket of sockets) {
  socket.leave(
    `project:${projectId}`
  );
}

getIO()
  .to(`user:${participant.userId}`)
  .emit(
    SocketEvents.AGREEMENT_PARTICIPANT_REMOVED,
    {
      participantId:
        participant.id,
      agreementId:
        participant.agreementId,
      projectId,
      userId:
        participant.userId,
      removedBy:
        req.user.id,
    }
  );

    return res.status(200).json({
      success: true,
      message:
        "Professional removed successfully.",
    });
  }

  // ==================================================
// Withdraw Invitation
// ==================================================

static async withdrawInvitation(
  req: AuthenticatedRequest,
  res: Response
) {
  const projectId =
    req.params.projectId as string;

  const participantId =
    req.params.participantId as string;

  const participant =
    await prisma.$transaction(
      (tx) =>
        AgreementParticipantService.withdrawInvitation(
          tx,
          projectId,
          participantId,
          req.user.id
        )
    );

  getIO()
    .to(`user:${participant.userId}`)
    .emit(
      SocketEvents.AGREEMENT_INVITATION_WITHDRAWN,
      {
        participantId: participant.id,
        agreementId: participant.agreementId,
        projectId,
        userId: participant.userId,
        withdrawnBy: req.user.id,
      }
    );

  return res.status(200).json({
    success: true,

    message:
      "Invitation withdrawn successfully.",

    data:
      AgreementParticipantMapper.toResponse(
        participant
      ),
  });
}
}