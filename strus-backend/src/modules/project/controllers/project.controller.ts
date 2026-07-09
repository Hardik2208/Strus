import type { NextFunction,Response } from "express";
import { prisma } from "../../../core/database/prisma.js";
import { ProjectAuditCache } from "../cache/project-audit.cache.js";
import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";
import { listProjectsQuerySchema } from "../dtos/list-projects.dto.js";
import type { WorkspaceIdParamDto } from "../../workspace/dtos/workspace-id-param.dto.js";
import type { UpdateProjectStatusDto } from "../dtos/update-project-status.dto.js";
import type { UpdateProjectDto } from "../dtos/update-project.dto.js";
import type { CreateProjectDto } from "../dtos/create-project.dto.js";
import { ProjectService } from "../services/project.service.js";
import { ProjectMapper } from "../mappers/project.mapper.js";
import { ProjectCache } from "../cache/project.cache.js";
import type { TransferProjectDto } from "../dtos/transfer-project.dto.js";
import { transferProjectSchema } from "../dtos/transfer-project.dto.js";


export class ProjectController {
  // ==================================================
  // Create Project
  // ==================================================

  static async create(
    req: AuthenticatedRequest<
      WorkspaceIdParamDto,
      unknown,
      CreateProjectDto
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user.id;

      const { workspaceId } = req.params;

      const dto =
        req.body as CreateProjectDto;

      const project =
        await prisma.$transaction(
          async (tx) =>
            ProjectService.create(
              tx,
              workspaceId,
              userId,
              dto
            )
        );

      await ProjectCache.invalidateWorkspace(
  workspaceId
);

      res.status(201).json({
        success: true,

        message:
          "Project created successfully.",

        data:
          ProjectMapper.toResponse(
            project
          ),
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
// Get Workspace Projects
// ==================================================

static async getAll(
  req: AuthenticatedRequest<WorkspaceIdParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { workspaceId } = req.params;

    const query =
      listProjectsQuerySchema.parse(req.query);

    const cacheKey = JSON.stringify(query);

    const cached =
      await ProjectCache.getWorkspaceProjects(
        workspaceId,
        cacheKey
      );

    if (cached) {
      res.status(200).json({
        success: true,
        data: cached,
      });

      return;
    }

    const {
      projects,
      total,
    } =
      await ProjectService.getWorkspaceProjects(
        workspaceId,
        userId,
        query
      );

    const response = {
      projects:
        ProjectMapper.toResponseList(
          projects
        ),

      pagination: {
        page: query.page,

        limit: query.limit,

        total,

        totalPages: Math.ceil(
          total / query.limit
        ),

        hasNext:
          query.page * query.limit <
          total,
      },
    };

    await ProjectCache.setWorkspaceProjects(
      workspaceId,
      cacheKey,
      response
    );

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

static async getById(
  req: AuthenticatedRequest<
    { projectId: string }
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { projectId } = req.params;

    const cached =
      await ProjectCache.get(projectId);

    if (cached) {
      res.status(200).json({
        success: true,
        data: cached,
      });

      return;
    }

    const project =
      await ProjectService.getProject(
        projectId,
        userId
      );

    const response =
      ProjectMapper.toResponse(
        project
      );

    await ProjectCache.set(
      projectId,
      response
    );

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

static async update(
  req: AuthenticatedRequest<
    { projectId: string },
    unknown,
    UpdateProjectDto
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { projectId } = req.params;

    const dto =
      req.body as UpdateProjectDto;

    const project =
      await prisma.$transaction(
        (tx) =>
          ProjectService.update(
            tx,
            projectId,
            userId,
            dto
          )
      );

    await Promise.all([
  ProjectCache.invalidate(
    projectId
  ),

  ProjectCache.invalidateWorkspace(
    project.workspaceId
  ),

  ProjectAuditCache.invalidate(
    projectId
  ),
]);

    res.status(200).json({
      success: true,

      message:
        "Project updated successfully.",

      data:
        ProjectMapper.toResponse(
          project
        ),
    });
  } catch (error) {
    next(error);
  }
}

static async delete(
  req: AuthenticatedRequest<{
    projectId: string;
  }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { projectId } =
      req.params;

    const workspaceId =
      await prisma.$transaction(
        (tx) =>
          ProjectService.delete(
            tx,
            projectId,
            userId
          )
      );

    await Promise.all([
  ProjectCache.invalidate(
    projectId
  ),

    ProjectCache.invalidateWorkspace(
      workspaceId
    ),

    ProjectAuditCache.invalidate(
      projectId
    ),
]);

    res.status(200).json({
      success: true,

      message:
        "Project deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

// ==================================================
// Update Project Status
// ==================================================

static async updateStatus(
  req: AuthenticatedRequest<
    { projectId: string },
    unknown,
    UpdateProjectStatusDto
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { projectId } = req.params;

    const dto =
      req.body as UpdateProjectStatusDto;

    const project =
      await prisma.$transaction(
        (tx) =>
          ProjectService.updateStatus(
            tx,
            projectId,
            userId,
            dto.status
          )
      );

    await Promise.all([
  ProjectCache.invalidate(
    projectId
  ),

  ProjectCache.invalidateWorkspace(
    project.workspaceId
  ),

  ProjectAuditCache.invalidate(
    projectId
  ),
]);

    res.status(200).json({
      success: true,

      message:
        "Project status updated successfully.",

      data:
        ProjectMapper.toResponse(
          project
        ),
    });
  } catch (error) {
    next(error);
  }
}

// ==================================================
// Transfer Project
// ==================================================

// ==================================================
// Transfer Project
// ==================================================

static async transfer(
  req: AuthenticatedRequest<
    { projectId: string },
    unknown,
    TransferProjectDto
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { projectId } =
      req.params;

    const dto =
      transferProjectSchema.parse(
        req.body
      );

    const {
      project,
      previousWorkspaceId,
    } =
      await prisma.$transaction(
        (tx) =>
          ProjectService.transfer(
            tx,
            projectId,
            dto.destinationWorkspaceId,
            userId
          )
      );

    await Promise.all([
      ProjectCache.invalidate(
        projectId
      ),

      ProjectCache.invalidateWorkspace(
        previousWorkspaceId
      ),

      ProjectCache.invalidateWorkspace(
        dto.destinationWorkspaceId
      ),

      ProjectAuditCache.invalidate(
        projectId
      ),
    ]);

    res.status(200).json({
      success: true,

      message:
        "Project transferred successfully.",

      data:
        ProjectMapper.toResponse(
          project
        ),
    });
  } catch (error) {
    next(error);
  }
}
}