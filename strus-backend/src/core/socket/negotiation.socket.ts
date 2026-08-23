import { getIO } from "./socket.js";

import {
  SocketEvents,
} from "./socket-events.js";

import type {
  NegotiationActionRequestCreatedEvent,
  NegotiationAcceptedEvent,
  NegotiationDeclinedEvent,
  NegotiationExpiredEvent,
} from "../../modules/negotiation/types/socket-events.types.js";

export class NegotiationSocket {

  // ==================================================
  // Action Request Created
  // ==================================================

  static emitActionRequestCreated(
    recipientId: string,
    payload: NegotiationActionRequestCreatedEvent
  ): void {

    getIO()
      .to(
        `user:${recipientId}`
      )
      .emit(
        SocketEvents.NEGOTIATION_ACTION_REQUEST_CREATED,
        payload
      );

  }

  // ==================================================
  // Negotiation Accepted
  // ==================================================

  static emitNegotiationAccepted(
    recipientId: string,
    payload: NegotiationAcceptedEvent
  ): void {

    getIO()
      .to(
        `user:${recipientId}`
      )
      .emit(
        SocketEvents.NEGOTIATION_ACCEPTED,
        payload
      );

  }

  // ==================================================
  // Negotiation Declined
  // ==================================================

  static emitNegotiationDeclined(
    recipientId: string,
    payload: NegotiationDeclinedEvent
  ): void {

    getIO()
      .to(
        `user:${recipientId}`
      )
      .emit(
        SocketEvents.NEGOTIATION_DECLINED,
        payload
      );

  }

  // ==================================================
  // Negotiation Expired
  // ==================================================

  static emitNegotiationExpired(
    recipientId: string,
    payload: NegotiationExpiredEvent
  ): void {

    getIO()
      .to(
        `user:${recipientId}`
      )
      .emit(
        SocketEvents.NEGOTIATION_EXPIRED,
        payload
      );

  }

}