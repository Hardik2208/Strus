import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import type { Agreement } from "../../../generated/prisma/client.js";
import {
  AgreementInvitationStatus,
  ProjectStatus,
} from "../../../generated/prisma/enums.js";

export class AgreementPermissionService {
  // ==================================================
  // View Permission
  // ==================================================

  static ensureAgreementAccess(
  agreement: Agreement & {
    participants: {
      userId: string;
      invitationStatus: AgreementInvitationStatus;
    }[];
    project: {
      status: ProjectStatus;
    };
  },
  userId: string
) {
  // Contractor always has access
  if (agreement.createdById === userId) {
    return agreement;
  }

  const participant =
    agreement.participants.find(
      (participant) =>
        participant.userId === userId &&
        participant.invitationStatus ===
          AgreementInvitationStatus.ACCEPTED
    );

  if (!participant) {
    throw new AppError(
      "You do not have permission to access this agreement.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  return agreement;
}

  // ==================================================
  // Edit Permission
  // ==================================================

  static ensureAgreementEditable(
  agreement: Agreement & {
    participants: {
      userId: string;
      invitationStatus: AgreementInvitationStatus;
    }[];
    project: {
      status: ProjectStatus;
    };
  },
  userId: string
) {
  if (agreement.createdById !== userId) {
    throw new AppError(
      "Only the contractor can modify this agreement.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  if (
    agreement.project.status !==
    ProjectStatus.DRAFT
  ) {
    throw new AppError(
      "Agreement is locked.",
      400,
      ErrorCode.AGREEMENT_LOCKED
    );
  }

  return agreement;
}
}