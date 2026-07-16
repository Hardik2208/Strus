import {
  ProjectStatus,
  WorkspaceRole,
} from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";
import { WorkspaceType } from "../../../generated/prisma/enums.js";
import { WorkspaceRepository } from "../../workspace/repositories/workspace.repository.js";
import { ProjectRepository } from "../repositories/project.repository.js";

export class ProjectPermissionService {
  // ==================================================
  // Workspace Membership
  // ==================================================

  static async ensureWorkspaceMember(
    workspaceId: string,
    userId: string
  ) {
    const membership =
      await ProjectRepository.findWorkspaceMembership(
        workspaceId,
        userId
      );

    if (!membership) {
      throw new AppError(
        "Workspace not found.",
        404,
        ErrorCode.WORKSPACE_NOT_FOUND
      );
    }

    return membership;
  }

  // ==================================================
  // Project Access
  // ==================================================

  static async ensureProjectAccess(
    projectId: string,
    userId: string
  ) {
    const project =
      await ProjectRepository.findProjectById(
        projectId
      );

    if (!project) {
      throw new AppError(
        "Project not found.",
        404,
        ErrorCode.PROJECT_NOT_FOUND
      );
    }

    const membership =
      await this.ensureWorkspaceMember(
        project.workspaceId,
        userId
      );

    // Owner/Admin can view every project.
    // Members can only view projects they created.
    if (
      membership.role === WorkspaceRole.MEMBER &&
      project.createdById !== userId
    ) {
      throw new AppError(
        "Project not found.",
        404,
        ErrorCode.PROJECT_NOT_FOUND
      );
    }

    return project;
  }

  // ==================================================
  // Edit Permission
  // ==================================================

  static async ensureProjectEditable(
    projectId: string,
    userId: string
  ) {
    const project =
      await this.ensureProjectAccess(
        projectId,
        userId
      );

    if (project.createdById !== userId) {
      throw new AppError(
        "Only the project creator can edit this project.",
        403,
        ErrorCode.INSUFFICIENT_PERMISSIONS
      );
    }

    if (project.status !== ProjectStatus.DRAFT) {
      throw new AppError(
        "Project cannot be edited.",
        400,
        ErrorCode.PROJECT_NOT_EDITABLE
      );
    }

    return project;
  }

  // ==================================================
  // Delete Permission
  // ==================================================

  static async ensureProjectDeletable(
    projectId: string,
    userId: string
  ) {
    const project =
      await this.ensureProjectEditable(
        projectId,
        userId
      );

    return project;
  }

  // ==================================================
  // Status Permission (Temporary)
  // ==================================================

  static async ensureProjectStatusChange(
    projectId: string,
    userId: string
  ) {
    const project =
      await this.ensureProjectAccess(
        projectId,
        userId
      );

    if (project.createdById !== userId) {
      throw new AppError(
        "Only the project creator can change the project status.",
        403,
        ErrorCode.INSUFFICIENT_PERMISSIONS
      );
    }

    return project;
  }

  static async ensureProjectTransferable(
  projectId: string,
  destinationWorkspaceId: string,
  userId: string
) {
  const project =
    await this.ensureProjectDeletable(
      projectId,
      userId
    );

  if (
    project.status !==
    ProjectStatus.DRAFT
  ) {
    throw new Error(
      "Only draft projects can be transferred."
    );
  }

  const sourceWorkspace =
    await WorkspaceRepository.findWorkspaceById(
      project.workspaceId
    );

  if (!sourceWorkspace) {
    throw new Error(
      "Source workspace not found."
    );
  }

  if (
    sourceWorkspace.workspaceType !==
    WorkspaceType.PERSONAL
  ) {
    throw new Error(
      "Only projects from personal workspaces can be transferred."
    );
  }

  const destinationWorkspace =
    await WorkspaceRepository.findWorkspaceById(
      destinationWorkspaceId
    );

  if (!destinationWorkspace) {
    throw new Error(
      "Destination workspace not found."
    );
  }

  if (
    destinationWorkspace.workspaceType !==
    WorkspaceType.TEAM
  ) {
    throw new Error(
      "Projects can only be transferred to team workspaces."
    );
  }

  const membership =
    await WorkspaceRepository.findMember(
      destinationWorkspaceId,
      userId
    );

  if (!membership) {
    throw new Error(
      "You must be a member of the destination workspace."
    );
  }

  return {
    project,
    sourceWorkspace,
    destinationWorkspace,
  };
}

static async ensureProjectExists(
  projectId: string
) {
  const project =
    await ProjectRepository.findProjectById(
      projectId
    );

  if (!project) {
    throw new AppError(
      "Project not found.",
      404,
      ErrorCode.PROJECT_NOT_FOUND
    );
  }

  return project;
}
}