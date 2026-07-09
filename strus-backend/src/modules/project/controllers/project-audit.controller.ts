import type { NextFunction,Response } from "express";
import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";
import { ProjectAuditMapper } from "../mappers/project-audit.mapper.js";
import { ProjectAuditService } from "../services/project-audit.service.js";
import { ProjectAuditCache } from "../cache/project-audit.cache.js";

import {
  listProjectAuditsQuerySchema,
} from "../dtos/list-project-audits.dto.js";

export class ProjectAuditController {
  // ==================================================
  // Get Project Audit Logs
  // ==================================================

  static async getByProject(
    req: AuthenticatedRequest<
      { projectId: string }
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user.id;

      const { projectId } = req.params;

      const query =
        listProjectAuditsQuerySchema.parse(
          req.query
        );

      const cacheKey =
        JSON.stringify(query);

      const cached =
        await ProjectAuditCache.get(
          projectId,
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
        logs,
        total,
      } =
        await ProjectAuditService.getProjectAudits(
          projectId,
          userId,
          query
        );

      const response = {
        audits: ProjectAuditMapper.toResponseList(
      logs
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

      await ProjectAuditCache.set(
        projectId,
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
}