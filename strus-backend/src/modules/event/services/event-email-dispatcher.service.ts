import {
  EventType,
} from "../../../generated/prisma/enums.js";

import type {
  CreateEventDto,
} from "../dtos/create-event.dto.js";

import { EventEmailService } from "./event-email.service.js";

export class EventEmailDispatcher {

  /**
   * ==================================================
   * Dispatch Email
   * ==================================================
   */
  static async dispatch(
    dto: CreateEventDto
  ): Promise<void> {

    switch (dto.type) {

      // ==================================================
      // Project
      // ==================================================

      case EventType.PROJECT_ACTIVATED:
        return;

      case EventType.SUBMISSION_UNDER_REVIEW:
        return;

      case EventType.PROJECT_COMPLETED:
        return;

      // ==================================================
      // Negotiation
      // ==================================================

      case EventType.NEGOTIATION_CREATED:
        return await this.dispatchNegotiationCreated(dto);

      case EventType.NEGOTIATION_ACCEPTED:
        return await this.dispatchNegotiationAccepted(dto);

      case EventType.NEGOTIATION_DECLINED:
        return await this.dispatchNegotiationDeclined(dto);

      case EventType.NEGOTIATION_EXPIRED:
        return await this.dispatchNegotiationExpired(dto);

      // ==================================================
      // Dispute
      // ==================================================

      case EventType.DISPUTE_CREATED:
        return await this.dispatchDisputeCreated(dto);

      case EventType.DISPUTE_RESOLUTION_PROPOSED:
        return await this.dispatchResolutionProposed(dto);

      case EventType.DISPUTE_RESOLVED:
        return await this.dispatchDisputeResolved(dto);

      case EventType.DISPUTE_CLOSED:
        return await this.dispatchDisputeClosed(dto);

      default:
        return;

    }

  }

    // ==================================================
  // Negotiation
  // ==================================================

  private static async dispatchNegotiationCreated(
    dto: CreateEventDto
  ): Promise<void> {

    // TODO:
    // Load recipient
    // Load project
    // Load milestone
    // Call EventEmailService.sendNegotiationCreatedEmail()

    return;

  }

  private static async dispatchNegotiationAccepted(
    dto: CreateEventDto
  ): Promise<void> {

    return;

  }

  private static async dispatchNegotiationDeclined(
    dto: CreateEventDto
  ): Promise<void> {

    return;

  }

  private static async dispatchNegotiationExpired(
    dto: CreateEventDto
  ): Promise<void> {

    return;

  }

  // ==================================================
  // Dispute
  // ==================================================

  private static async dispatchDisputeCreated(
    dto: CreateEventDto
  ): Promise<void> {

    return;

  }

  private static async dispatchResolutionProposed(
    dto: CreateEventDto
  ): Promise<void> {

    return;

  }

  private static async dispatchDisputeResolved(
    dto: CreateEventDto
  ): Promise<void> {

    return;

  }

  private static async dispatchDisputeClosed(
    dto: CreateEventDto
  ): Promise<void> {

    return;

  }

}