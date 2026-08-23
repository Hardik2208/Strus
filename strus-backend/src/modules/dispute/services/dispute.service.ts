import {
  DisputeRepository,
} from "../repositories/dispute.repository.js";

import {
  DisputeMapper,
} from "../mappers/dispute.mapper.js";

import type {
  DisputeResponse,
} from "../interfaces/dispute-response.interface.js";

import type {
  DisputeListResponse,
} from "../interfaces/dispute-list-response.interface.js";

import {
  DisputeHelperRepository,
} from "../repositories/dispute-helper.repository.js";

import {
  ExecutionAuditRepository,
} from "../../execution/repositories/execution-audit.repository.js";

import {
  MilestoneStatus,
  DisputeStatus,
  DisputeOrigin,
  ExecutionAuditAction,
} from "../../../generated/prisma/enums.js";

import type {
  Prisma,
} from "../../../generated/prisma/client.js";

import type {
  CreateDisputeRequest,
  CreateDisputeResult,
} from "../types/create-dispute.types.js";

import {
  DisputeClassificationMiddleware,
} from "../middleware/dispute-classification.middleware.js";


export class DisputeService {

  // ==================================================
  // Get Dispute
  // ==================================================

  static async getDispute(
    disputeId: string
  ): Promise<DisputeResponse> {

    const dispute =
      await DisputeRepository.findDetails(
        disputeId
      );

    if (!dispute) {

      throw new Error(
        "Dispute not found."
      );

    }

    return DisputeMapper.toDisputeResponse(
      dispute
    );

  }

  // ==================================================
  // Get Disputes
  // ==================================================

  static async getDisputes(
    milestoneId: string,
    page: number,
    limit: number
  ): Promise<DisputeListResponse> {

    const existingDispute =
      await DisputeRepository.findByMilestone(
        milestoneId
      );

    if (!existingDispute) {

      return {

        disputes: [],

        total: 0,

        page,

        limit,

        totalPages: 0,

      };

    }

    return {

      disputes: [

        DisputeMapper.toDisputeResponse(
          existingDispute
        ),

      ],

      total: 1,

      page,

      limit,

      totalPages: 1,

    };

  }

  // ==================================================
  // Create Dispute
  // ==================================================

  static async createDispute(
    tx: Prisma.TransactionClient,
    request: CreateDisputeRequest
  ): Promise<CreateDisputeResult> {

    const disputeType =
      await DisputeClassificationMiddleware
        .determineDisputeType(
          request.milestoneId
        );

    switch (
      disputeType
    ) {

      case DisputeOrigin.PRE_SUBMISSION:

        return this.createPreSubmissionDispute(
          tx,
          request
        );

      case DisputeOrigin.POST_SUBMISSION:

        return this.createPostSubmissionDispute(
          tx,
          request
        );

      default:

        throw new Error(
          "Unsupported dispute type."
        );

    }

  }

  // ==================================================
  // Create Pre Submission Dispute
  // ==================================================

  private static async createPreSubmissionDispute(
    tx: Prisma.TransactionClient,
    request: CreateDisputeRequest
  ): Promise<CreateDisputeResult> {

    // ================================================
    // Load Milestone
    // ================================================

    const milestone =
      await DisputeHelperRepository.findMilestoneForDispute(
        request.milestoneId
      );

    if (!milestone) {

      throw new Error(
        "Milestone not found."
      );

    }

    // ================================================
    // Create Dispute
    // ================================================

    const dispute =
      await DisputeRepository.create(
        tx,
        {

          milestoneId:
            milestone.id,

          createdById:
            request.userId,

          origin:
            DisputeOrigin.PRE_SUBMISSION,

          status:
            DisputeStatus.OPEN,

          reason:
            request.reason,

          requestedResolution:
            request.requestedResolution,

          holdStartedAt:
            new Date(),

        }
      );

    // ================================================
    // Update Milestone
    // ================================================

    await DisputeHelperRepository.updateMilestoneStatus(
      tx,
      milestone.id,
      MilestoneStatus.UNDER_DISPUTE
    );

    // ================================================
    // Execution Audit
    // ================================================

    await ExecutionAuditRepository.create(
      tx,
      {

        action:
          ExecutionAuditAction.PRE_SUBMISSION_DISPUTE_CREATED,

        project: {

          connect: {

            id:
              milestone.project.id,

          },

        },

        milestone: {

          connect: {

            id:
              milestone.id,

          },

        },

        actor: {

          connect: {

            id:
              request.userId,

          },

        },

        metadata: {

          disputeId:
            dispute.id,

          milestoneId:
            milestone.id,

          projectId:
            milestone.project.id,

          origin:
            dispute.origin,

        },

      }
    );

    // ================================================
    // Response + Event Context
    // ================================================

    return {

      response:
        DisputeMapper.toDisputeResponse(
          dispute
        ),

      event: {

        disputeId:
          dispute.id,

        projectId:
          milestone.project.id,

        createdById:
          request.userId,

      },

    };

  }

  // ==================================================
  // Create Post Submission Dispute
  // ==================================================

  private static async createPostSubmissionDispute(
    tx: Prisma.TransactionClient,
    request: CreateDisputeRequest
  ): Promise<CreateDisputeResult> {

    // ================================================
    // Load Milestone
    // ================================================

    const milestone =
      await DisputeHelperRepository.findMilestoneForDispute(
        request.milestoneId
      );

    if (!milestone) {

      throw new Error(
        "Milestone not found."
      );

    }

    // ================================================
    // Create Dispute
    // ================================================

    const dispute =
      await DisputeRepository.create(
        tx,
        {

          milestoneId:
            milestone.id,

          createdById:
            request.userId,

          origin:
            DisputeOrigin.POST_SUBMISSION,

          status:
            DisputeStatus.OPEN,

          reason:
            request.reason,

          requestedResolution:
            request.requestedResolution,

          holdStartedAt:
            new Date(),

        }
      );

    // ================================================
    // Update Milestone
    // ================================================

    await DisputeHelperRepository.updateMilestoneStatus(
      tx,
      milestone.id,
      MilestoneStatus.NEGOTIATION
    );

    // ================================================
    // Execution Audit
    // ================================================

    await ExecutionAuditRepository.create(
      tx,
      {

        action:
          ExecutionAuditAction.POST_SUBMISSION_DISPUTE_CREATED,

        project: {

          connect: {

            id:
              milestone.project.id,

          },

        },

        milestone: {

          connect: {

            id:
              milestone.id,

          },

        },

        actor: {

          connect: {

            id:
              request.userId,

          },

        },

        metadata: {

          disputeId:
            dispute.id,

          milestoneId:
            milestone.id,

          projectId:
            milestone.project.id,

          origin:
            dispute.origin,

        },

      }
    );

    // ================================================
    // Response + Event Context
    // ================================================

    return {

      response:
        DisputeMapper.toDisputeResponse(
          dispute
        ),

      event: {

        disputeId:
          dispute.id,

        projectId:
          milestone.project.id,

        createdById:
          request.userId,

      },

    };

  }

}