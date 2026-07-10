import type { Project } from "../../../generated/prisma/client.js";
import type { ProjectResponse } from "../interfaces/project.interface.js";

export class ProjectMapper {
  static toResponse(
    project: Project
  ): ProjectResponse {
    return {
      id: project.id,

      workspaceId: project.workspaceId,

      createdById: project.createdById,

      title: project.title,

      description: project.description,

      status: project.status,

      setupStage: project.setupStage,

      createdAt: project.createdAt,

      updatedAt: project.updatedAt,

    };
  }

  static toResponseList(
    projects: Project[]
  ): ProjectResponse[] {
    return projects.map((project) =>
      this.toResponse(project)
    );
  }
}