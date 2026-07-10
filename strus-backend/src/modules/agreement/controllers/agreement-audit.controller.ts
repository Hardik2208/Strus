import type {
  NextFunction,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";

import { AgreementAuditService } from "../services/agreement-audit.service.js";

import { AgreementAuditMapper } from "../mappers/agreement-audit.mapper.js";

import { AgreementAuditCache } from "../cache/agreement-audit.cache.js";

import {
  listAgreementAuditsQuerySchema,
} from "../dtos/list-agreement-audits.dto.js";

export class AgreementAuditController {
  static async getByAgreement(
    req: AuthenticatedRequest<
      { projectId: string }
    >,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user.id;

      const { projectId } =
  req.params;

      const query =
        listAgreementAuditsQuerySchema.parse(
          req.query
        );

      const cacheKey =
        JSON.stringify(query);

      const cached =
        await AgreementAuditCache.get(
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
        await AgreementAuditService.getAgreementAudits(
          projectId,
          userId,
          query
        );

      const response = {
        audits:
          AgreementAuditMapper.toResponseList(
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

      await AgreementAuditCache.set(
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