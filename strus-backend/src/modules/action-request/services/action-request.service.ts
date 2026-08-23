import { prisma } from "../../../core/database/prisma.js";

import {
  ActionParticipantStatus,
  ActionRequestStatus,
  ActionRequestType,
} from "../../../generated/prisma/enums.js";

import type {
  CreateActionRequestInput,
  RespondActionRequestInput,
} from "../types/action-request.types.js";

import {
  ActionRequestRepository,
} from "../repositories/action-request.repository.js";

import {
  ActionRequestParticipantRepository,
} from "../repositories/action-request-participant.repository.js";

export class ActionRequestService {

  // ==================================================
  // Create Action Request
  // ==================================================

  static async create(
    tx: Parameters<
      typeof ActionRequestRepository.create
    >[0],
    input: CreateActionRequestInput
  ) {

    // ================================================
    // Validate Participants
    // ================================================

    const [
      firstParticipantId,
      secondParticipantId,
    ] = input.participantIds;

    if (
      !firstParticipantId ||
      !secondParticipantId
    ) {

      throw new Error(
        "An action request requires exactly two participants."
      );

    }

    if (
      firstParticipantId ===
      secondParticipantId
    ) {

      throw new Error(
        "Action request participants must be different users."
      );

    }

    // ================================================
    // Validate Deadline
    // ================================================

    if (
      input.deadline.getTime() <=
      Date.now()
    ) {

      throw new Error(
        "Action request deadline must be in the future."
      );

    }

    // ================================================
    // Validate Domain Association
    // ================================================

    if (
      input.type ===
      ActionRequestType.NEGOTIATION_CONTINUATION
    ) {

      if (!input.negotiationId) {

        throw new Error(
          "Negotiation continuation requires negotiationId."
        );

      }

      if (input.disputeResultId) {

        throw new Error(
          "Negotiation continuation cannot contain disputeResultId."
        );

      }

    }

    if (
      input.type ===
      ActionRequestType.DISPUTE_CONTINUATION
    ) {

      if (!input.disputeResultId) {

        throw new Error(
          "Dispute continuation requires disputeResultId."
        );

      }

      if (input.negotiationId) {

        throw new Error(
          "Dispute continuation cannot contain negotiationId."
        );

      }

    }

    // ================================================
    // Create Request
    // ================================================

    const actionRequest =
      await ActionRequestRepository.create(
        tx,
        {

          type:
            input.type,

          deadline:
            input.deadline,

          negotiation:
            input.negotiationId
              ? {
                  connect: {
                    id:
                      input.negotiationId,
                  },
                }
              : undefined,

          disputeResult:
            input.disputeResultId
              ? {
                  connect: {
                    id:
                      input.disputeResultId,
                  },
                }
              : undefined,

        }
      );

    // ================================================
    // Create Participants
    // ================================================

    await ActionRequestParticipantRepository.createMany(
      tx,
      [

        {
          actionRequestId:
            actionRequest.id,

          userId:
            firstParticipantId,
        },

        {
          actionRequestId:
            actionRequest.id,

          userId:
            secondParticipantId,
        },

      ]
    );

    // ================================================
    // Return Complete Request
    // ================================================

    const createdRequest =
      await ActionRequestRepository.findByIdTx(
        tx,
        actionRequest.id
      );

    if (!createdRequest) {

      throw new Error(
        "Failed to load created action request."
      );

    }

    return createdRequest;

  }

  // ==================================================
  // Find By Id
  // ==================================================

  static async findById(
    actionRequestId: string
  ) {

    const actionRequest =
      await ActionRequestRepository.findById(
        actionRequestId
      );

    if (!actionRequest) {

      throw new Error(
        "Action request not found."
      );

    }

    return actionRequest;

  }

  // ==================================================
  // Respond
  // ==================================================

  static async respond(
    request: RespondActionRequestInput
  ) {

    return prisma.$transaction(
      async (tx) => {

        // ============================================
        // Load Request
        // ============================================

        const actionRequest =
          await ActionRequestRepository.findByIdTx(
            tx,
            request.actionRequestId
          );

        if (!actionRequest) {

          throw new Error(
            "Action request not found."
          );

        }

        // ============================================
        // Validate Request Status
        // ============================================

        if (
          actionRequest.status !==
          ActionRequestStatus.PENDING
        ) {

          throw new Error(
            "Action request is no longer pending."
          );

        }

        // ============================================
        // Validate Deadline
        // ============================================

        if (
          actionRequest.deadline.getTime() <=
          Date.now()
        ) {

          throw new Error(
            "Action request has expired."
          );

        }

        // ============================================
        // Find Participant
        // ============================================

        const participant =
          await ActionRequestParticipantRepository
            .findParticipantTx(
              tx,
              request.actionRequestId,
              request.userId
            );

        if (!participant) {

          throw new Error(
            "You are not a participant of this action request."
          );

        }

        // ============================================
        // Prevent Duplicate Response
        // ============================================

        if (
          participant.status !==
          ActionParticipantStatus.PENDING
        ) {

          throw new Error(
            "You have already responded to this action request."
          );

        }

        // ============================================
        // Update Participant
        // ============================================

        await ActionRequestParticipantRepository.update(
          tx,
          participant.id,
          {

            decision:
              request.decision,

            status:
              ActionParticipantStatus.RESPONDED,

            respondedAt:
              new Date(),

          }
        );

        // ============================================
        // Check All Participants
        // ============================================

        const participants =
          await ActionRequestParticipantRepository
            .findByRequestTx(
              tx,
              request.actionRequestId
            );

        const allResponded =
          participants.length === 2 &&
          participants.every(
            (item) =>
              item.status ===
              ActionParticipantStatus.RESPONDED
          );

        // ============================================
        // Complete Request
        // ============================================

        if (allResponded) {

          await ActionRequestRepository.complete(
            tx,
            request.actionRequestId
          );

        }

        // ============================================
        // Return Updated Request
        // ============================================

        const updatedRequest =
          await ActionRequestRepository.findByIdTx(
            tx,
            request.actionRequestId
          );

        if (!updatedRequest) {

          throw new Error(
            "Failed to load updated action request."
          );

        }

        return updatedRequest;

      }
    );

  }

  // ==================================================
  // Expire
  // ==================================================

  static async expire(
    actionRequestId: string
  ) {

    return prisma.$transaction(
      async (tx) => {

        // ============================================
        // Load Request
        // ============================================

        const actionRequest =
          await ActionRequestRepository.findByIdTx(
            tx,
            actionRequestId
          );

        if (!actionRequest) {

          throw new Error(
            "Action request not found."
          );

        }

        // ============================================
        // Already Processed
        // ============================================

        if (
          actionRequest.status !==
          ActionRequestStatus.PENDING
        ) {

          return actionRequest;

        }

        // ============================================
        // Verify Deadline
        // ============================================

        if (
          actionRequest.deadline.getTime() >
          Date.now()
        ) {

          throw new Error(
            "Action request has not expired yet."
          );

        }

        // ============================================
        // Expire Request
        // ============================================

        await ActionRequestRepository.expire(
          tx,
          actionRequestId
        );

        // ============================================
        // Expire Pending Participants
        // ============================================

        await ActionRequestParticipantRepository
          .expirePending(
            tx,
            actionRequestId
          );

        // ============================================
        // Return Updated Request
        // ============================================

        const expiredRequest =
          await ActionRequestRepository.findByIdTx(
            tx,
            actionRequestId
          );

        if (!expiredRequest) {

          throw new Error(
            "Failed to load expired action request."
          );

        }

        return expiredRequest;

      }
    );

  }

}