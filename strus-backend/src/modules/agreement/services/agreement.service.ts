import type {
  Agreement,
  Prisma,
} from "../../../generated/prisma/client.js";

import {
  AgreementAuditAction,
  AgreementInvitationStatus,
  ProjectSetupStage,
  ProjectStatus,
} from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { AgreementRepository } from "../repositories/agreement.repository.js";
import { AgreementAuditRepository } from "../repositories/agreement-audit.repository.js";

import { AgreementPermissionService } from "../services/agreement-permission.service.js";

import { AgreementValidator } from "../validators/agreement.validator.js";

import { AgreementCache } from "../cache/agreement.cache.js";
import { AgreementParticipantCache } from "../cache/agreement-participant.cache.js";
import { AgreementAuditCache } from "../cache/agreement-audit.cache.js";
import { ProjectRepository } from "../../project/repositories/project.repository.js";

import type { CreateAgreementDto } from "../dtos/create-agreement.dto.js";
import type { UpdateAgreementDto } from "../dtos/update-agreement.dto.js";



export class AgreementService {
    static async create(
  tx: Prisma.TransactionClient,
  projectId: string,
  userId: string,
  dto: CreateAgreementDto
): Promise<Agreement> {
  // ==================================================
  // Validate Input
  // ==================================================

  AgreementValidator.validateTitle(dto.title);
  AgreementValidator.validateDescription(dto.description);
  AgreementValidator.validateScope(dto.scope);
  AgreementValidator.validateOutOfScope(dto.outOfScope);
  AgreementValidator.validateBudget(dto.budget);
  AgreementValidator.validateExpectedDuration(
    dto.expectedDuration
  );

  // ==================================================
  // Load Project
  // ==================================================

  const project =
    await ProjectRepository.findProjectForAgreement(
      projectId
    );

  if (!project) {
    throw new AppError(
      "Project not found.",
      404,
      ErrorCode.PROJECT_NOT_FOUND
    );
  }

  if (project.createdById !== userId) {
    throw new AppError(
      "Only the project creator can create an agreement.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  if (project.status !== ProjectStatus.DRAFT) {
    throw new AppError(
      "Agreement can only be created while the project is in draft.",
      400,
      ErrorCode.AGREEMENT_LOCKED
    );
  }

  if (
    project.setupStage !==
    ProjectSetupStage.PROJECT_CREATED
  ) {
    throw new AppError(
      "Project is not ready for agreement creation.",
      400,
      ErrorCode.INVALID_PROJECT_SETUP_STAGE
    );
  }

  // ==================================================
  // Ensure Agreement Doesn't Exist
  // ==================================================

  const exists =
    await AgreementRepository.existsByProjectId(
      projectId
    );

  if (exists) {
    throw new AppError(
      "Agreement already exists.",
      409,
      ErrorCode.CONFLICT
    );
  }

  // ==================================================
  // Create Agreement
  // ==================================================

  const agreement =
    await AgreementRepository.create(tx, {
      project: {
        connect: {
          id: projectId,
        },
      },

      title: dto.title.trim(),

      description:
        dto.description?.trim() ?? null,

      scope:
        dto.scope?.trim() ?? null,

      outOfScope:
        dto.outOfScope?.trim() ?? null,

      budget: dto.budget,

      expectedDuration:
        dto.expectedDuration,

      createdBy: {
        connect: {
          id: userId,
        },
      },

      lastUpdatedBy: {
        connect: {
          id: userId,
        },
      },
    });

  // ==================================================
  // Audit
  // ==================================================

  await AgreementAuditRepository.create(tx, {
    agreementId: agreement.id,

    actorId: userId,

    action: AgreementAuditAction.CREATED,

    metadata: {
      projectId,
      title: agreement.title,
    },
  });

  // ==================================================
  // Update Project Setup Stage
  // ==================================================

  await ProjectRepository.updateSetupStage(
    tx,
    projectId,
    ProjectSetupStage.AGREEMENT_COMPLETED
  );

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

  return agreement;
}

static async get(
  projectId: string,
  userId: string
) {
  // ==================================================
  // Cache
  // ==================================================

  const cached =
    await AgreementCache.get(
      projectId
    );

  if (cached) {
    return cached;
  }

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

  AgreementPermissionService.ensureAgreementAccess(
    agreement,
    userId
  );

  // ==================================================
  // Cache
  // ==================================================

  await AgreementCache.set(
  projectId,
  agreement
);

  return agreement;
}

static async update(
  tx: Prisma.TransactionClient,
  projectId: string,
  userId: string,
  dto: UpdateAgreementDto
): Promise<Agreement> {
  // ==================================================
  // Load & Permission
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

  AgreementPermissionService.ensureAgreementEditable(
    agreement,
    userId
  );

  // ==================================================
  // Validate Updated Fields
  // ==================================================

  if (dto.title !== undefined) {
    AgreementValidator.validateTitle(
      dto.title
    );
  }

  AgreementValidator.validateDescription(
    dto.description
  );

  AgreementValidator.validateScope(
    dto.scope
  );

  AgreementValidator.validateOutOfScope(
    dto.outOfScope
  );

  if (dto.budget !== undefined) {
    AgreementValidator.validateBudget(
      dto.budget
    );
  }

  if (
    dto.expectedDuration !==
    undefined
  ) {
    AgreementValidator.validateExpectedDuration(
      dto.expectedDuration
    );
  }

  // ==================================================
  // Update Agreement
  // ==================================================

  const updatedAgreement =
    await AgreementRepository.update(
      tx,
      agreement.id,
      {
        ...(dto.title !==
          undefined && {
          title:
            dto.title.trim(),
        }),

        ...(dto.description !==
          undefined && {
          description:
            dto.description?.trim() ??
            null,
        }),

        ...(dto.scope !==
          undefined && {
          scope:
            dto.scope?.trim() ??
            null,
        }),

        ...(dto.outOfScope !==
          undefined && {
          outOfScope:
            dto.outOfScope?.trim() ??
            null,
        }),

        ...(dto.budget !==
          undefined && {
          budget:
            dto.budget,
        }),

        ...(dto.expectedDuration !==
          undefined && {
          expectedDuration:
            dto.expectedDuration,
        }),

        lastUpdatedBy: {
          connect: {
            id: userId,
          },
        },
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
        AgreementAuditAction.UPDATED,

      metadata: dto,
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

  return updatedAgreement;
}

static async ensureProjectCanBeActivated(
  projectId: string
): Promise<void> {
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

  const hasPendingInvitation =
    agreement.participants.some(
      (participant) =>
        participant.invitationStatus ===
        AgreementInvitationStatus.PENDING
    );

  if (hasPendingInvitation) {
    throw new AppError(
      "Project cannot be activated because invitation responses are still pending.",
      409,
      ErrorCode.CONFLICT
    );
  }
}
}