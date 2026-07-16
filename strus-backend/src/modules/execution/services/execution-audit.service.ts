import { ExecutionPermissionService } from "./execution-permission.service.js";

import { ExecutionAuditRepository } from "../repositories/execution-audit.repository.js";

export class ExecutionAuditService {
  static async getProjectAudits(
    projectId: string,
    userId: string
  ) {
    await ExecutionPermissionService.ensureExecutionAccess(
      projectId,
      userId
    );

    return ExecutionAuditRepository.findByProjectId(
      projectId
    );
  }
}