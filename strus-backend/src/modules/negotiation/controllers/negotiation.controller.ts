import type {
  NextFunction,
  Response,
} from "express";

import { prisma } from "../../../core/database/prisma.js";
import type { CreateNegotiationDto } from "../dtos/create-negotiation.dto.js";
import type {
  AuthenticatedRequest,
} from "../../auth/interfaces/auth.interface.js";

import type {
  NegotiationIdParamDto,
} from "../dtos/negotiation-id-param.dto.js";

import type {
  MilestoneIdParamDto,
} from "../dtos/milestone-id-param.dto.js";

import {
  NegotiationService,
} from "../services/negotiation.service.js";

import {
  NegotiationCache,
} from "../cache/negotiation.cache.js";

import type {
  CreateNegotiationRequest,
} from "../types/create-negotiation.types.js";
import { NegotiationPublisher } from "../../event/publishers/negotiation.publisher.js";
import { NegotiationSocket } from "../../../core/socket/negotiation.socket.js";

export class NegotiationController {

  // ==================================================
  // Get Negotiation
  // ==================================================

static async getNegotiation(
  req: AuthenticatedRequest<NegotiationIdParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {

  try {

    const negotiationId =
      req.params.negotiationId;

    const cached =
      await NegotiationCache.getNegotiation(
        negotiationId
      );

    if (cached) {

      res.status(200).json({

        success: true,

        data:
          cached,

      });

      return;

    }

    const negotiation =
      await NegotiationService.getNegotiation(
        negotiationId
      );

    await NegotiationCache.setNegotiation(
      negotiationId,
      negotiation
    );

    res.status(200).json({

      success: true,

      data:
        negotiation,

    });

  } catch (error) {

    next(error);

  }

}

  // ==================================================
  // Get Negotiations
  // ==================================================

static async getNegotiations(
  req: AuthenticatedRequest<MilestoneIdParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {

  try {

    const milestoneId =
      req.params.milestoneId;

    const page =
      Number(
        req.query.page ?? 1
      );

    const limit =
      Number(
        req.query.limit ?? 10
      );

    const cached =
      await NegotiationCache.get(
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

    const negotiations =
      await NegotiationService.getNegotiations(
        milestoneId,
        page,
        limit
      );

    await NegotiationCache.set(
      milestoneId,
      page,
      limit,
      negotiations
    );

    res.status(200).json({

      success: true,

      data:
        negotiations,

    });

  } catch (error) {

    next(error);

  }

}

  // ==================================================
// Create Negotiation
// ==================================================

static async createNegotiation(
  req: AuthenticatedRequest<
    MilestoneIdParamDto,
    unknown,
    CreateNegotiationDto
  >,
  res: Response,
  next: NextFunction
): Promise<void>{

  try {

    const request: CreateNegotiationRequest = {

      milestoneId:
        req.params.milestoneId,

      userId:
        req.user.id,

      proposedPercentage:
        req.body.proposedPercentage,

      proposedAmount:
        req.body.proposedAmount,

      reason:
        req.body.reason,

    };

    const result =
  await prisma.$transaction(
    async (tx) =>
      NegotiationService.createNegotiation(
        tx,
        request
      )
  );

const negotiation =
  result.response;

    // ==========================================
// Publish Event
// ==========================================

await NegotiationPublisher.publishNegotiationCreated({

  negotiationId:
    negotiation.id,

  projectId:
    negotiation.projectId,

  createdById:
    req.user.id,

});

// ==========================================
// Socket
// ==========================================

NegotiationSocket.emitActionRequestCreated(

  result.socket.recipientUserId,

  {

    negotiationId:
      result.socket.negotiationId,

    projectId:
      result.socket.projectId,

    milestoneId:
      result.socket.milestoneId,

    responseDeadline:
      result.socket.responseDeadline,

    status:
      result.socket.status,

  }

);
    

    await Promise.all([

  NegotiationCache.invalidateMilestone(
    request.milestoneId
  ),

  NegotiationCache.invalidateNegotiation(
    negotiation.id
  ),

]);

    res.status(201).json({

      success: true,

      message:
        "Negotiation created successfully.",

      data:
        negotiation,

    });

  } catch (error) {

    next(error);

  }

}

  // ==================================================
  // Accept Negotiation
  // ==================================================

static async acceptNegotiation(
  req: AuthenticatedRequest<NegotiationIdParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {

  try {

    const negotiationId =
      req.params.negotiationId;

    const negotiation =
      await prisma.$transaction(
        async (tx) =>
          NegotiationService.acceptNegotiation(
            tx,
            negotiationId,
            req.user.id
          )
      );

      // ==========================================
// Publish Event
// ==========================================

await NegotiationPublisher.publishNegotiationAccepted({

  negotiationId:
    negotiation.id,

  projectId:
    negotiation.projectId,

  createdById:
    req.user.id,

});

    NegotiationSocket.emitNegotiationAccepted(

  negotiation.initiatedById,

  {

    negotiationId:
      negotiation.id,

    projectId:
      negotiation.projectId,

    milestoneId:
      negotiation.milestoneId,

  }

);

    await Promise.all([

      NegotiationCache.invalidateNegotiation(
        negotiation.id
      ),

      NegotiationCache.invalidateMilestone(
        negotiation.milestoneId
      ),

    ]);

    res.status(200).json({

      success: true,

      message:
        "Negotiation accepted successfully.",

      data:
        negotiation,

    });

  } catch (error) {

    next(error);

  }

}

// ==================================================
// Decline Negotiation
// ==================================================

static async declineNegotiation(
  req: AuthenticatedRequest<NegotiationIdParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {

  try {

    const negotiationId =
      req.params.negotiationId;

    const negotiation =
      await prisma.$transaction(
        async (tx) =>
          NegotiationService.declineNegotiation(
            tx,
            negotiationId,
            req.user.id
          )
      );

    // ==========================================
// Publish Event
// ==========================================

await NegotiationPublisher.publishNegotiationDeclined({

  negotiationId:
    negotiation.id,

  projectId:
    negotiation.projectId,

  createdById:
    req.user.id,

});

NegotiationSocket.emitNegotiationDeclined(

  negotiation.initiatedById,

  {

    negotiationId:
      negotiation.id,

    projectId:
      negotiation.projectId,

    milestoneId:
      negotiation.milestoneId,

  }

);

    await Promise.all([

      NegotiationCache.invalidateNegotiation(
        negotiation.id
      ),

      NegotiationCache.invalidateMilestone(
        negotiation.milestoneId
      ),

    ]);

    res.status(200).json({

      success: true,

      message:
        "Negotiation declined successfully.",

      data:
        negotiation,

    });

  } catch (error) {

    next(error);

  }

}


}