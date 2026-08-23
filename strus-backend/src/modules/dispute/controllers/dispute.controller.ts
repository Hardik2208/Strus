import type {
  NextFunction,
  Response,
} from "express";

import { prisma } from "../../../core/database/prisma.js";

import type {
  AuthenticatedRequest,
} from "../../auth/interfaces/auth.interface.js";

import {
  DisputeService,
} from "../services/dispute.service.js";

import {
  DisputeCache,
} from "../cache/dispute.cache.js";

import {
  DisputeMapper,
} from "../mappers/dispute.mapper.js";

import type {
  MilestoneIdParamDto,
} from "../dtos/milestone-id-param.dto.js";

import type {
  DisputeIdParamDto,
} from "../dtos/dispute-id-param.dto.js";

import type {
  CreateDisputeDto,
} from "../dtos/create-dispute.dto.js";

import { DisputePublisher } from "../../event/publishers/dispute.publisher.js";

export class DisputeController {

  // ==================================================
  // Create Dispute
  // ==================================================

  static async create(
    req: AuthenticatedRequest<
      MilestoneIdParamDto,
      unknown,
      CreateDisputeDto
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    try {

      const userId =
        req.user.id;

      const {
        milestoneId,
      } = req.params;

      const dto =
        req.body as CreateDisputeDto;

      const result =
  await prisma.$transaction(
    (tx) =>
      DisputeService.createDispute(
        tx,
        {
          milestoneId,

          userId,

          reason:
            dto.reason,

          requestedResolution:
            dto.requestedResolution,
        }
      )
  );

const dispute =
  result.response;

await DisputePublisher.publishDisputeCreated({

  disputeId:
    result.event.disputeId,

  projectId:
    result.event.projectId,

  createdById:
    result.event.createdById,

});

      
      await Promise.all([

        DisputeCache.invalidateMilestone(
          milestoneId
        ),

        DisputeCache.invalidateDispute(
          dispute.id
        ),

      ]);

      res.status(201).json({

        success: true,

        message:
          "Dispute created successfully.",

        data:
            dispute
      });

    } catch (error) {

      next(error);

    }

  }

  // ==================================================
// Get Dispute
// ==================================================

static async getById(
  req: AuthenticatedRequest<
    DisputeIdParamDto
  >,
  res: Response,
  next: NextFunction
): Promise<void> {

  try {

    const {
      disputeId,
    } = req.params;

    const cached =
      await DisputeCache.getDispute(
        disputeId
      );

    if (cached) {

      res.status(200).json({

        success: true,

        data:
          cached,

      });

      return;

    }

    const dispute =
      await DisputeService.getDispute(
        disputeId
      );

    await DisputeCache.setDispute(
      disputeId,
      dispute
    );

    res.status(200).json({

      success: true,

      data:
        dispute,

    });

  } catch (error) {

    next(error);

  }

}

// ==================================================
// Get Milestone Dispute
// ==================================================

static async getByMilestone(
  req: AuthenticatedRequest<
    MilestoneIdParamDto
  >,
  res: Response,
  next: NextFunction
): Promise<void> {

  try {

    const {
      milestoneId,
    } = req.params;

    const page =
      Number(
        req.query.page ?? 1
      );

    const limit =
      Number(
        req.query.limit ?? 10
      );

    const cached =
      await DisputeCache.get(
        milestoneId,
        page,
        limit
      );

    if (cached) {

      res.status(200).json({

        success: true,

        data:
          cached,

      });

      return;

    }

    const disputes =
      await DisputeService.getDisputes(
        milestoneId,
        page,
        limit
      );

    await DisputeCache.set(
      milestoneId,
      page,
      limit,
      disputes
    );

    res.status(200).json({

      success: true,

      data:
        disputes,

    });

  } catch (error) {

    next(error);

  }

}
}