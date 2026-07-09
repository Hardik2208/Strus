import { ProjectAuditRepository } from "../repositories/project-audit.repository.js";
import { ProjectPermissionService } from "./project-permission.service.js";

import type { ListProjectAuditsDto } from "../dtos/list-project-audits.dto.js";

export class ProjectAuditService {
  static async getProjectAudits(
    projectId: string,
    userId: string,
    query: ListProjectAuditsDto
  ) {
    await ProjectPermissionService.ensureProjectAccess(
      projectId,
      userId
    );

    return ProjectAuditRepository.findByProject(
      projectId,
      query
    );
  }
}