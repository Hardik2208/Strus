import {
  ProjectSetupStage,
  ProjectStatus,
  WorkspaceRole,
} from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { ProjectPermissionService } from "../../project/services/project-permission.service.js";

export class ExecutionPermissionService {
  // ==================================================
  // Execution Plan Edit
  // ==================================================

  static async ensureExecutionPlanEditable(
    projectId: string,
    userId: string
  ) {
    const project =
      await ProjectPermissionService.ensureProjectAccess(
        projectId,
        userId
      );

    if (
      project.status !==
      ProjectStatus.DRAFT
    ) {
      throw new AppError(
        "Execution plan cannot be modified after the project has started.",
        400,
        ErrorCode.PROJECT_NOT_EDITABLE
      );
    }

    if (
      project.setupStage !==
        ProjectSetupStage.PROFESSIONALS_ASSIGNED &&
      project.setupStage !==
        ProjectSetupStage.MILESTONES_CREATED
    ) {
      throw new AppError(
        "Execution planning is not available at the current project stage.",
        400,
        ErrorCode.INVALID_PROJECT_SETUP_STAGE
      );
    }

    return project;
  }

  // ==================================================
  // Execution View
  // ==================================================

  static async ensureExecutionAccess(
    projectId: string,
    userId: string
  ) {
    return ProjectPermissionService.ensureProjectAccess(
      projectId,
      userId
    );
  }
}