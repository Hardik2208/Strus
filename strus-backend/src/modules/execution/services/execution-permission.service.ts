import {
  ProjectSetupStage,
  ProjectStatus,
} from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";
import { prisma } from "../../../core/database/prisma.js";
import { ProjectRepository } from "../../project/repositories/project.repository.js";
import { ExecutionRepository } from "../repositories/execution.repository.js";
import { ProjectPermissionService } from "../../project/services/project-permission.service.js";

export class ExecutionPermissionService {

  private static async ensureExecutionStage(
  projectId: string,
  userId: string,
  options: {
    allowedStatuses: ProjectStatus[];
    allowedStages: ProjectSetupStage[];
    errorMessage?: string;
  }
) {
  const project =
    await ProjectPermissionService.ensureProjectAccess(
      projectId,
      userId
    );

    console.log({
  projectId,
  status: project.status,
  setupStage: project.setupStage,
  allowedStages: options.allowedStages,
});
  if (
    !options.allowedStatuses.includes(
      project.status
    )
  ) {
    throw new AppError(
      "Execution operation is not allowed in the current project status.",
      400,
      ErrorCode.PROJECT_NOT_EDITABLE
    );
  }

  if (
    !options.allowedStages.includes(
      project.setupStage
    )
  ) {
    throw new AppError(
      options.errorMessage ??
        "Execution planning is not available at the current project stage.",
      400,
      ErrorCode.INVALID_PROJECT_SETUP_STAGE
    );
  }

  return project;
}
  static async ensureExecutionPlanCreatable(
  projectId: string,
  userId: string
) {
  return this.ensureExecutionStage(
    projectId,
    userId,
    {
      allowedStatuses: [
        ProjectStatus.DRAFT,
      ],

      allowedStages: [
        ProjectSetupStage.PROFESSIONALS_ASSIGNED,
      ],
    }
  );
}
  
  // ==================================================
  // Execution Plan Edit
  // ==================================================

  static async ensureExecutionPlanEditable(
  projectId: string,
  userId: string
) {
  return this.ensureExecutionStage(
    projectId,
    userId,
    {
      allowedStatuses: [
        ProjectStatus.DRAFT,
      ],

      allowedStages: [
        ProjectSetupStage.MILESTONES_CREATED,
        ProjectSetupStage.READY_TO_START,
      ],
    }
  );
}

  // ==================================================
  // Execution View
  // ==================================================

  static async ensureExecutionAccess(
  projectId: string,
  userId: string
) {
  const project =
    await ProjectPermissionService.ensureProjectExists(
      projectId
    );

  const workspaceMember =
    await ProjectRepository.findWorkspaceMembership(
      project.workspaceId,
      userId
    );

  if (workspaceMember) {
    return project;
  }

  const isParticipant =
    await prisma.$transaction((tx) =>
      ExecutionRepository.isAgreementParticipant(
        tx,
        projectId,
        userId
      )
    );

  if (isParticipant) {
    return project;
  }

  throw new AppError(
    "Access denied.",
    403,
    ErrorCode.INSUFFICIENT_PERMISSIONS
  );
}

// ==================================================
// Project Asset Management
// ==================================================

static async ensureProjectAssetManagement(
  projectId: string,
  userId: string
) {
  const project =
    await ProjectPermissionService.ensureProjectAccess(
      projectId,
      userId
    );

  if (project.createdById !== userId) {
    throw new AppError(
      "Only the project creator can manage project assets.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  const terminalStatuses: ProjectStatus[] = [
  ProjectStatus.COMPLETED,
  ProjectStatus.CANCELLED,
  ProjectStatus.MUTUALLY_TERMINATED,
];

  if (terminalStatuses.includes(project.status)) {
    throw new AppError(
      "Project assets cannot be modified.",
      400,
      ErrorCode.PROJECT_NOT_EDITABLE
    );
  }

  return project;
}
}