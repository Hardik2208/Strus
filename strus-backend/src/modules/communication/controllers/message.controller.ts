import type {
  Express,
  NextFunction,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";
import type { MarkConversationReadDto } from "../dtos/mark-conversation-read.dto.js";
import { MarkConversationReadSchema } from "../dtos/mark-conversation-read.dto.js";
import type { SendMessageDto } from "../dtos/send-message.dto.js";
import { getMessageSchema } from "../dtos/get-message.dto.js"
import { MessageService } from "../services/message.service.js";
import { MessageMapper } from "../mappers/message.mapper.js";
import { getConversationMessagesSchema } from "../dtos/get-conversation-messages.dto.js"
import { deleteMessageSchema } from "../dtos/delete-message.dto.js";
import type { UpdateMessageDto } from "../dtos/update-message.dto.js";
import { updateMessageSchema } from "../dtos/update-message.dto.js";
import type { GetReadReceiptsDto } from "../dtos/get-read-receipts.dto.js";
import { getReadReceiptsSchema } from "../dtos/get-read-receipts.dto.js";
import { ReadReceiptMapper } from "../mappers/read-receipt.mapper.js";

export class MessageController {
// ==================================================
// Send Message
// ==================================================

static async sendMessage(
  req: AuthenticatedRequest<
    { conversationId: string },
    unknown,
    Omit<SendMessageDto, "conversationId">
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const files =
      (req.files as Express.Multer.File[]) ?? [];

    const dto: SendMessageDto = {
      conversationId: req.params.conversationId,
      ...req.body,
    };

    const message =
      await MessageService.sendMessage(
        dto,
        files,
        userId
      );

    const response =
      MessageMapper.toMessageResponse(message);

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

  // ==================================================
// Get Conversation Messages
// ==================================================

static async getConversationMessages(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const dto =
      getConversationMessagesSchema.parse({
        conversationId: req.params.conversationId,
        cursor: req.query.cursor,
        limit: req.query.limit,
      });

    const result =
      await MessageService.getConversationMessages(
        dto,
        userId
      );

    res.status(200).json({
      success: true,

      message:
        "Messages retrieved successfully.",

      data: {
        messages: result.messages.map(
          MessageMapper.toMessageResponse
        ),

        pagination: {
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================================================
// Get Message
// ==================================================

static async getMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dto =
      getMessageSchema.parse({
        messageId: req.params.messageId,
      });

    const message =
      await MessageService.getMessage(
        dto,
        req.user.id
      );

    res.status(200).json({
      success: true,
      message: "Message retrieved successfully.",
      data: MessageMapper.toMessageResponse(
        message
      ),
    });
  } catch (error) {
    next(error);
  }
}

// ==================================================
// Delete Message
// ==================================================

static async deleteMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dto =
      deleteMessageSchema.parse({
        messageId: req.params.messageId,
      });

    await MessageService.deleteMessage(
      dto,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

// ==================================================
// Update Message
// ==================================================

static async updateMessage(
  req: AuthenticatedRequest<
    { messageId: string },
    unknown,
    Omit<UpdateMessageDto, "messageId">
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const dto = updateMessageSchema.parse({
      messageId: req.params.messageId,
      ...req.body,
    });

    const updatedMessage =
      await MessageService.updateMessage(
        dto,
        userId
      );

    const response =
      MessageMapper.toMessageResponse(
        updatedMessage
      );

    res.status(200).json({
      success: true,
      message: "Message updated successfully.",
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

// ==================================================
// Mark Conversation As Read
// ==================================================

static async markConversationAsRead(
  req: AuthenticatedRequest<
    { conversationId: string },
    unknown,
    Omit<MarkConversationReadDto, "conversationId">
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const dto = MarkConversationReadSchema.parse({
      conversationId: req.params.conversationId,
      ...req.body,
    });

    await MessageService.markConversationAsRead(
      dto,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Conversation marked as read successfully.",
    });
  } catch (error) {
    next(error);
  }
}

// ==================================================
// Get Read Receipts
// ==================================================

static async getReadReceipts(
  req: AuthenticatedRequest<
    { messageId: string }
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const dto: GetReadReceiptsDto =
      getReadReceiptsSchema.parse({
        messageId: req.params.messageId,
      });

    const receipts =
      await MessageService.getReadReceipts(
        dto,
        userId
      );

    res.status(200).json({
      success: true,
      message:
        "Read receipts retrieved successfully.",
      data:
        ReadReceiptMapper.toResponseList(
          receipts
        ),
    });
  } catch (error) {
    next(error);
  }
}
}