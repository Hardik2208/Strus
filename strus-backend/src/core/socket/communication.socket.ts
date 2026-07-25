import { getIO } from "./socket.js";
import { SocketEvents } from "./socket-events.js";

import type {
  MessageSentEvent,
  MessageUpdatedEvent,
  MessageDeletedEvent,
  ConversationReadEvent,
} from "../../modules/communication/types/socket-events.types.js";

export class CommunicationSocket {
  static emitMessageSent(
    conversationId: string,
    payload: MessageSentEvent
  ): void {
    getIO()
      .to(`conversation:${conversationId}`)
      .emit(
        SocketEvents.MESSAGE_SENT,
        payload
      );
  }

  static emitMessageUpdated(
    conversationId: string,
    payload: MessageUpdatedEvent
  ): void {
    getIO()
      .to(`conversation:${conversationId}`)
      .emit(
        SocketEvents.MESSAGE_UPDATED,
        payload
      );
  }

  static emitMessageDeleted(
    conversationId: string,
    payload: MessageDeletedEvent
  ): void {
    getIO()
      .to(`conversation:${conversationId}`)
      .emit(
        SocketEvents.MESSAGE_DELETED,
        payload
      );
  }

  static emitConversationRead(
    conversationId: string,
    payload: ConversationReadEvent
  ): void {
    getIO()
      .to(`conversation:${conversationId}`)
      .emit(
        SocketEvents.MESSAGE_READ,
        payload
      );
  }
}