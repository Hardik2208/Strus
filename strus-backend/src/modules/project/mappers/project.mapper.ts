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

      estimatedBudget: project.estimatedBudget
        ? Number(project.estimatedBudget)
        : null,

      estimatedDuration:
        project.estimatedDuration,

      expectedStartDate:
        project.expectedStartDate,

      expectedCompletionDate:
        project.expectedCompletionDate,

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