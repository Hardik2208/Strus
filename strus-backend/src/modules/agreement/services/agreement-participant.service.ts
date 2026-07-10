import type { Prisma } from "../../../generated/prisma/client.js";
import {
  AgreementAuditAction,
  AgreementInvitationStatus,
  AgreementParticipantRole,
  ProjectSetupStage,
  ProjectStatus,
} from "../../../generated/prisma/enums.js";
import { ProjectRepository } from "../../project/repositories/project.repository.js";
import { AgreementCache } from "../cache/agreement.cache.js";
import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { AgreementRepository } from "../repositories/agreement.repository.js";
import { AgreementAuditRepository } from "../repositories/agreement-audit.repository.js";
import { AgreementPermissionService } from "../services/agreement-permission.service.js";

import { AgreementParticipantCache } from "../cache/agreement-participant.cache.js";
import { AgreementAuditCache } from "../cache/agreement-audit.cache.js";
import { AgreementParticipantRepository } from "../repositories/agreement-participant.repository.js"
import type { InviteProfessionalDto } from "../dtos/invite-professional.dto.js";
import type { UpdateInvitationStatusDto } from "../dtos/update-invitation-status.dto.js";

export class AgreementParticipantService {
  // ==================================================
  // Get Participants
  // ==================================================

  static async getAll(
    projectId: string,
    userId: string
  ) {
    const agreement =
      await AgreementRepository.findByProjectId(
        projectId
      );

    if (!agreement) {
      throw new AppError(
        "Agreement not found.",
        404,
        ErrorCode.AGREEMENT_NOT_FOUND
      );
    }

    AgreementPermissionService.ensureAgreementAccess(
      agreement,
      userId
    );

    const cached =
      await AgreementParticipantCache.get(
        agreement.id
      );

    if (cached) {
      return cached;
    }

    const participants =
      await AgreementParticipantRepository.findByAgreement(
        agreement.id
      );

    await AgreementParticipantCache.set(
      agreement.id,
      participants
    );

    return participants;
  }

  // ==================================================
  // Invite Professional
  // ==================================================

  static async invite(
  tx: Prisma.TransactionClient,
  projectId: string,
  userId: string,
  dto: InviteProfessionalDto
) {
  // ==================================================
  // Load Agreement
  // ==================================================

  const agreement =
    await AgreementRepository.findByProjectId(
      projectId
    );

  if (!agreement) {
    throw new AppError(
      "Agreement not found.",
      404,
      ErrorCode.AGREEMENT_NOT_FOUND
    );
  }

  // ==================================================
  // Permission
  // ==================================================

  AgreementPermissionService.ensureAgreementEditable(
    agreement,
    userId
  );

  // ==================================================
  // Project State
  // ==================================================

  if (
    agreement.project.status !==
    ProjectStatus.DRAFT
  ) {
    throw new AppError(
      "Professionals can only be invited while the project is in draft.",
      400,
      ErrorCode.AGREEMENT_LOCKED
    );
  }

  // ==================================================
  // Cannot Invite Yourself
  // ==================================================

  if (dto.userId === userId) {
    throw new AppError(
      "You cannot invite yourself.",
      400,
      ErrorCode.INVALID_REQUEST
    );
  }

  // ==================================================
  // Pending Invitation
  // ==================================================

  const pendingInvitation =
    await AgreementParticipantRepository.findPendingInvitation(
      agreement.id,
      dto.userId
    );

  if (pendingInvitation) {
    throw new AppError(
      "An invitation is already pending.",
      409,
      ErrorCode.CONFLICT
    );
  }

  // ==================================================
  // Already Accepted
  // ==================================================

  const acceptedProfessional =
    await AgreementParticipantRepository.findAcceptedProfessional(
      agreement.id,
      dto.userId
    );

  if (acceptedProfessional) {
    throw new AppError(
      "Professional already assigned.",
      409,
      ErrorCode.CONFLICT
    );
  }

  // ==================================================
  // Cooldown Check
  // ==================================================

  const latestInvitation =
    await AgreementParticipantRepository.findLatestInvitation(
      agreement.id,
      dto.userId
    );

  if (
    latestInvitation &&
    latestInvitation.invitationStatus ===
      AgreementInvitationStatus.DECLINED &&
    latestInvitation.respondedAt
  ) {
    const cooldownEnds =
      new Date(
        latestInvitation.respondedAt
      );

    cooldownEnds.setDate(
      cooldownEnds.getDate() + 3
    );

    if (
      cooldownEnds > new Date()
    ) {
      throw new AppError(
        "Professional cannot be invited for 3 days after declining.",
        400,
        ErrorCode.CONFLICT
      );
    }
  }

  // ==================================================
  // Create Invitation
  // ==================================================

  const participant =
    await AgreementParticipantRepository.create(
      tx,
      {
        agreement: {
          connect: {
            id: agreement.id,
          },
        },

        user: {
          connect: {
            id: dto.userId,
          },
        },

        role:
          AgreementParticipantRole.PROFESSIONAL,

        invitationStatus:
          AgreementInvitationStatus.PENDING,
      }
    );

  // ==================================================
  // Audit
  // ==================================================

  await AgreementAuditRepository.create(
    tx,
    {
      agreementId:
        agreement.id,

      actorId: userId,

      action:
        AgreementAuditAction.PROFESSIONAL_INVITED,

      metadata: {
        invitedUserId:
          dto.userId,
      },
    }
  );

  // ==================================================
  // Cache
  // ==================================================

  await Promise.all([
    AgreementParticipantCache.invalidate(
      agreement.id
    ),
    AgreementAuditCache.invalidate(
      agreement.id
    ),
  ]);

  return participant;
}

  // ==================================================
  // Update Invitation
  // ==================================================

  static async updateInvitationStatus(
  tx: Prisma.TransactionClient,
  projectId: string,
  participantId: string,
  userId: string,
  dto: UpdateInvitationStatusDto
) {
  // ==================================================
  // Load Agreement
  // ==================================================

  const agreement =
    await AgreementRepository.findByProjectId(
      projectId
    );

  if (!agreement) {
    throw new AppError(
      "Agreement not found.",
      404,
      ErrorCode.AGREEMENT_NOT_FOUND
    );
  }

  // ==================================================
  // Load Participant
  // ==================================================

  const participant =
    await AgreementParticipantRepository.findById(
      participantId
    );

  if (
    !participant ||
    participant.agreementId !==
      agreement.id
  ) {
    throw new AppError(
      "Invitation not found.",
      404,
      ErrorCode.NOT_FOUND
    );
  }

  // ==================================================
  // Only Invitee Can Respond
  // ==================================================

  if (
    participant.userId !== userId
  ) {
    throw new AppError(
      "You cannot respond to this invitation.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  // ==================================================
  // Pending Only
  // ==================================================

  if (
    participant.invitationStatus !==
    AgreementInvitationStatus.PENDING
  ) {
    throw new AppError(
      "Invitation has already been processed.",
      400,
      ErrorCode.CONFLICT
    );
  }

  // ==================================================
  // Determine New Status
  // ==================================================

  const accepted =
    dto.status ===
    AgreementInvitationStatus.ACCEPTED;

  const updatedParticipant =
    await AgreementParticipantRepository.update(
      tx,
      participant.id,
      {
        invitationStatus:
          dto.status,

        respondedAt:
          new Date(),

        ...(accepted && {
          joinedAt:
            new Date(),
        }),
      }
    );

  // ==================================================
  // Audit
  // ==================================================

  await AgreementAuditRepository.create(
    tx,
    {
      agreementId:
        agreement.id,

      actorId: userId,

      action: accepted
        ? AgreementAuditAction.INVITATION_ACCEPTED
        : AgreementAuditAction.INVITATION_DECLINED,

      metadata: {
        participantId:
          participant.id,
      },
    }
  );

  // ==================================================
  // Update Project Stage
  // ==================================================

  if (accepted) {
    const acceptedCount =
      await AgreementParticipantRepository.countAcceptedProfessionals(
        agreement.id
      );

    if (
      acceptedCount > 0 &&
      agreement.project
        .setupStage ===
        ProjectSetupStage.AGREEMENT_COMPLETED
    ) {
      await ProjectRepository.updateSetupStage(
        tx,
        agreement.projectId,
        ProjectSetupStage.PROFESSIONALS_ASSIGNED
      );
    }
  }

  // ==================================================
  // Cache
  // ==================================================

  await Promise.all([
    AgreementParticipantCache.invalidate(
      agreement.id
    ),

    AgreementAuditCache.invalidate(
      agreement.id
    ),

    AgreementCache.invalidate(
      projectId
    ),
  ]);

  const participantWithAgreement =
  await AgreementParticipantRepository.findById(
    updatedParticipant.id
  );

if (!participantWithAgreement) {
  throw new AppError(
    "Participant not found.",
    404,
    ErrorCode.NOT_FOUND
  );
}

return participantWithAgreement;
}

  // ==================================================
  // Remove Professional
  // ==================================================

  static async remove(
  tx: Prisma.TransactionClient,
  projectId: string,
  participantId: string,
  userId: string
) {
  // ==================================================
  // Load Agreement
  // ==================================================

  const agreement =
    await AgreementRepository.findByProjectId(
      projectId
    );

  if (!agreement) {
    throw new AppError(
      "Agreement not found.",
      404,
      ErrorCode.AGREEMENT_NOT_FOUND
    );
  }

  // ==================================================
  // Contractor Only
  // ==================================================

  AgreementPermissionService.ensureAgreementEditable(
    agreement,
    userId
  );

  // ==================================================
  // Load Participant
  // ==================================================

  const participant =
    await AgreementParticipantRepository.findById(
      participantId
    );

  if (
    !participant ||
    participant.agreementId !==
      agreement.id
  ) {
    throw new AppError(
      "Professional not found.",
      404,
      ErrorCode.NOT_FOUND
    );
  }

  // ==================================================
  // Cannot Remove Pending Invitation
  // ==================================================

  if (
    participant.invitationStatus ===
    AgreementInvitationStatus.PENDING
  ) {
    throw new AppError(
      "Pending invitations should be withdrawn instead.",
      400,
      ErrorCode.INVALID_REQUEST
    );
  }

  // ==================================================
  // Delete Participant
  // ==================================================

  await AgreementParticipantRepository.delete(
    tx,
    participant.id
  );

  // ==================================================
  // Audit
  // ==================================================

  await AgreementAuditRepository.create(
    tx,
    {
      agreementId:
        agreement.id,

      actorId: userId,

      action:
        AgreementAuditAction.PROFESSIONAL_REMOVED,

      metadata: {
        participantId:
          participant.id,

        userId:
          participant.userId,
      },
    }
  );

  // ==================================================
  // Update Setup Stage
  // ==================================================

  const acceptedCount =
    await AgreementParticipantRepository.countAcceptedProfessionals(
      agreement.id
    );

  if (
    acceptedCount === 0 &&
    agreement.project.setupStage ===
      ProjectSetupStage.PROFESSIONALS_ASSIGNED
  ) {
    await ProjectRepository.updateSetupStage(
      tx,
      agreement.projectId,
      ProjectSetupStage.AGREEMENT_COMPLETED
    );
  }

  // ==================================================
  // Cache
  // ==================================================

  await Promise.all([
  AgreementCache.invalidate(projectId),

  AgreementParticipantCache.invalidate(
    agreement.id
  ),

  AgreementAuditCache.invalidate(
    agreement.id
  ),
]);

return participant;
}

static async withdrawInvitation(
  tx: Prisma.TransactionClient,
  projectId: string,
  participantId: string,
  userId: string
) {
  // ==================================================
  // Load Agreement
  // ==================================================

  const agreement =
    await AgreementRepository.findByProjectId(
      projectId
    );

  if (!agreement) {
    throw new AppError(
      "Agreement not found.",
      404,
      ErrorCode.AGREEMENT_NOT_FOUND
    );
  }

  // ==================================================
  // Contractor Only
  // ==================================================

  AgreementPermissionService.ensureAgreementEditable(
    agreement,
    userId
  );

  // ==================================================
  // Load Invitation
  // ==================================================

  const participant =
    await AgreementParticipantRepository.findById(
      participantId
    );

  if (
    !participant ||
    participant.agreementId !== agreement.id
  ) {
    throw new AppError(
      "Invitation not found.",
      404,
      ErrorCode.NOT_FOUND
    );
  }

  // ==================================================
  // Pending Only
  // ==================================================

  if (
    participant.invitationStatus !==
    AgreementInvitationStatus.PENDING
  ) {
    throw new AppError(
      "Only pending invitations can be withdrawn.",
      400,
      ErrorCode.INVALID_REQUEST
    );
  }

  // ==================================================
  // Withdraw Invitation
  // ==================================================

  const updatedParticipant =
    await AgreementParticipantRepository.update(
      tx,
      participant.id,
      {
        invitationStatus:
          AgreementInvitationStatus.WITHDRAWN,

        respondedAt: new Date(),
      }
    );

  // ==================================================
  // Audit
  // ==================================================

  await AgreementAuditRepository.create(
    tx,
    {
      agreementId: agreement.id,

      actorId: userId,

      action:
        AgreementAuditAction.INVITATION_WITHDRAWN,

      metadata: {
        participantId: participant.id,
        userId: participant.userId,
      },
    }
  );

  // ==================================================
  // Cache
  // ==================================================

  await Promise.all([
    AgreementCache.invalidate(
      projectId
    ),

    AgreementParticipantCache.invalidate(
      agreement.id
    ),

    AgreementAuditCache.invalidate(
      agreement.id
    ),
  ]);

  return updatedParticipant;
}

}