import type {
  Prisma,
  Project,
} from "../../../generated/prisma/client.js";

import {
  ProjectAuditAction,
  ProjectStatus,
} from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { ProjectRepository } from "../repositories/project.repository.js";
import { ProjectAuditRepository } from "../repositories/project-audit.repository.js";

import type { ListProjectsDto } from "../dtos/list-projects.dto.js";
import type { CreateProjectDto } from "../dtos/create-project.dto.js";
import type { UpdateProjectDto } from "../dtos/update-project.dto.js";

import { ProjectValidator } from "../validators/project.validator.js";
import { ProjectPermissionService } from "./project-permission.service.js";

import { ProjectAuditCache } from "../cache/project-audit.cache.js";

export class ProjectService {
  // ==================================================
  // Create Project
  // ==================================================

  static async create(
    tx: Prisma.TransactionClient,
    workspaceId: string,
    userId: string,
    dto: CreateProjectDto
  ): Promise<Project> {
    await ProjectPermissionService.ensureWorkspaceMember(
      workspaceId,
      userId
    );

    ProjectValidator.validateTitle(dto.title);

    ProjectValidator.validateDescription(
      dto.description
    );

    const project =
      await ProjectRepository.create(tx, {
        workspace: {
          connect: {
            id: workspaceId,
          },
        },

        createdBy: {
          connect: {
            id: userId,
          },
        },

        title: dto.title.trim(),

        description:
          dto.description?.trim() ?? null,

        status: ProjectStatus.DRAFT,

      });

    await ProjectAuditRepository.create(tx, {
      projectId: project.id,

      actorId: userId,

      action: ProjectAuditAction.CREATED,

      metadata: {
        title: project.title,
        status: project.status,
      },
    });

    await ProjectAuditCache.invalidate(
      project.id
    );

    return project;
  }

  // ==================================================
  // Workspace Projects
  // ==================================================

  static async getWorkspaceProjects(
    workspaceId: string,
    userId: string,
    query: ListProjectsDto
  ) {
    const membership =
      await ProjectPermissionService.ensureWorkspaceMember(
        workspaceId,
        userId
      );

    return ProjectRepository.findWorkspaceProjects(
      workspaceId,
      userId,
      membership.role,
      query
    );
  }

  // ==================================================
  // Get Project
  // ==================================================

  static async getProject(
    projectId: string,
    userId: string
  ): Promise<Project> {
    return ProjectPermissionService.ensureProjectAccess(
      projectId,
      userId
    );
  }

  // ==================================================
  // Update Project
  // ==================================================

  static async update(
    tx: Prisma.TransactionClient,
    projectId: string,
    userId: string,
    dto: UpdateProjectDto
  ): Promise<Project> {
    await ProjectPermissionService.ensureProjectEditable(
      projectId,
      userId
    );

    if (dto.title !== undefined) {
      ProjectValidator.validateTitle(
        dto.title
      );
    }

    ProjectValidator.validateDescription(
      dto.description
    );

    const project =
      await ProjectRepository.update(
        tx,
        projectId,
        {
          ...(dto.title !==
            undefined && {
            title: dto.title.trim(),
          }),

          ...(dto.description !==
            undefined && {
            description:
              dto.description?.trim() ??
              null,
          }),
        }
      );

    await ProjectAuditRepository.create(tx, {
      projectId,

      actorId: userId,

      action: ProjectAuditAction.UPDATED,
    });

    await ProjectAuditCache.invalidate(
      projectId
    );

    return project;
  }

  // ==================================================
  // Delete Project
  // ==================================================

  static async delete(
    tx: Prisma.TransactionClient,
    projectId: string,
    userId: string
  ): Promise<string> {
    const project =
      await ProjectPermissionService.ensureProjectDeletable(
        projectId,
        userId
      );

    await ProjectAuditRepository.create(tx, {
      projectId,

      actorId: userId,

      action: ProjectAuditAction.DELETED,
    });

    await ProjectAuditCache.invalidate(
      projectId
    );

    await ProjectRepository.softDelete(
      tx,
      projectId
    );

    return project.workspaceId;
  }

  // ==================================================
  // Update Project Status
  // ==================================================

  static async updateStatus(
    tx: Prisma.TransactionClient,
    projectId: string,
    userId: string,
    status: ProjectStatus
  ): Promise<Project> {
    const project =
      await ProjectPermissionService.ensureProjectStatusChange(
        projectId,
        userId
      );

    switch (project.status) {
      case ProjectStatus.DRAFT:
        if (
          status !==
            ProjectStatus.ACTIVE &&
          status !==
            ProjectStatus.CANCELLED
        ) {
          throw new AppError(
            "Invalid project status transition.",
            400,
            ErrorCode.INVALID_PROJECT_STATUS_TRANSITION
          );
        }
        break;

      case ProjectStatus.ACTIVE:
        if (
          status !==
            ProjectStatus.COMPLETED &&
          status !==
            ProjectStatus.MUTUALLY_TERMINATED
        ) {
          throw new AppError(
            "Invalid project status transition.",
            400,
            ErrorCode.INVALID_PROJECT_STATUS_TRANSITION
          );
        }
        break;

      default:
        throw new AppError(
          "Project status cannot be changed.",
          400,
          ErrorCode.INVALID_PROJECT_STATUS_TRANSITION
        );
    }

    const updatedProject =
      await ProjectRepository.updateStatus(
        tx,
        projectId,
        status
      );

    await ProjectAuditRepository.create(tx, {
      projectId,

      actorId: userId,

      action:
        ProjectAuditAction.STATUS_CHANGED,

      metadata: {
        from: project.status,
        to: status,
      },
    });

    await ProjectAuditCache.invalidate(
      projectId
    );

    return updatedProject;
  }
}