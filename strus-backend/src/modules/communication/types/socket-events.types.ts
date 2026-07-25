import { MessageMapper } from "../mappers/message.mapper.js";

export type MessageResponse =
  ReturnType<
    typeof MessageMapper.toMessageResponse
  >;

export interface MessageSentEvent {
  message: MessageResponse;
}

export interface MessageUpdatedEvent {
  message: MessageResponse;
}

export interface MessageDeletedEvent {
  messageId: string;
  conversationId: string;
  deletedAt: Date;
}

export interface ConversationReadEvent {
  conversationId: string;
  userId: string;
  lastReadSequence: number;
  readAt: Date;
}