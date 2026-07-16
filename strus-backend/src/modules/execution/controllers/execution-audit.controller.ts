import type {
  NextFunction,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";

import { ExecutionAuditService } from "../services/execution-audit.service.js";

export class ExecutionAuditController {
  static async getByProject(
    req: AuthenticatedRequest<{
      projectId: string;
    }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const audits =
        await ExecutionAuditService.getProjectAudits(
          req.params.projectId,
          req.user.id
        );

      res.status(200).json({
        success: true,
        data: audits,
      });
    } catch (error) {
      next(error);
    }
  }
}