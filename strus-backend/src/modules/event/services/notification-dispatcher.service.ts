import {
  EventType,
} from "../../../generated/prisma/enums.js";

import type {
  CreateEventDto,
} from "../dtos/create-event.dto.js";

import { EventEmailDispatcher } from "./event-email-dispatcher.service.js";

export class NotificationDispatcherService {

  // ==================================================
  // Dispatch Notification
  // ==================================================

  static async dispatch(
    dto: CreateEventDto
  ): Promise<void> {

    await this.dispatchEmail(dto);

    // Future
    // await this.dispatchSocket(dto);

    // Future
    // await this.dispatchPush(dto);

  }

  // ==================================================
  // Email Dispatch
  // ==================================================

  private static async dispatchEmail(
    dto: CreateEventDto
  ): Promise<void> {

    switch (dto.type) {

      //
      // Execution
      //

      case EventType.PROJECT_ACTIVATED:

      case EventType.SUBMISSION_UNDER_REVIEW:

      case EventType.PROJECT_COMPLETED:

      //
      // Negotiation
      //

      case EventType.NEGOTIATION_CREATED:

      case EventType.NEGOTIATION_ACCEPTED:

      case EventType.NEGOTIATION_DECLINED:

      case EventType.NEGOTIATION_EXPIRED:

      //
      // Dispute
      //

      case EventType.DISPUTE_CREATED:

      case EventType.DISPUTE_RESOLUTION_PROPOSED:

      case EventType.DISPUTE_RESOLVED:

      case EventType.DISPUTE_CLOSED:

        await EventEmailDispatcher.dispatch(dto);

        return;

      default:
        // This event has no email implementation.
        return;

    }

  }

}