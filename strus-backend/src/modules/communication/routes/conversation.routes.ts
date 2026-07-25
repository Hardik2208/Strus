import { Router } from "express";

import { authenticate } from "../../auth/middleware/auth.middleware.js";

import { ConversationController } from "../controllers/conversation.controller.js";
import { MessageController } from "../controllers/message.controller.js";

import { uploadMessageAttachments } from "../middleware/upload-message-attachments.middleware.js";

import { rateLimit } from "../../../core/rate-limit/rate-limit.middleware.js";
import { RATE_LIMITS } from "../../../core/rate-limit/rate-limit.config.js";

const router = Router();

// ==================================================
// Workspace Conversations
// ==================================================

router.get(
  "/workspaces/:workspaceId/conversation",
  authenticate,
  rateLimit(RATE_LIMITS.GET_WORKSPACE_CONVERSATION),
  ConversationController.getWorkspaceConversation
);

// ==================================================
// Project Conversations
// ==================================================

router.get(
  "/projects/:projectId/conversation",
  authenticate,
  rateLimit(RATE_LIMITS.GET_PROJECT_CONVERSATION),
  ConversationController.getProjectConversation
);

// ==================================================
// Messages
// ==================================================

router.get(
  "/conversations/:conversationId/messages",
  authenticate,
  rateLimit(RATE_LIMITS.GET_MESSAGES),
  MessageController.getConversationMessages
);

router.get(
  "/messages/:messageId",
  authenticate,
  rateLimit(RATE_LIMITS.GET_MESSAGES),
  MessageController.getMessage
);

router.post(
  "/conversations/:conversationId/messages",
  authenticate,
  rateLimit(RATE_LIMITS.SEND_MESSAGE),
  uploadMessageAttachments,
  MessageController.sendMessage
);

router.patch(
  "/messages/:messageId",
  authenticate,
  rateLimit(RATE_LIMITS.EDIT_MESSAGE),
  MessageController.updateMessage
);

router.delete(
  "/messages/:messageId",
  authenticate,
  rateLimit(RATE_LIMITS.DELETE_MESSAGE),
  MessageController.deleteMessage
);

router.patch(
  "/conversations/:conversationId/read",
  authenticate,
  rateLimit(RATE_LIMITS.MARK_AS_READ),
  MessageController.markConversationAsRead
);

router.get(
  "/messages/:messageId/read-receipts",
  authenticate,
  rateLimit(RATE_LIMITS.GET_MESSAGES),
  MessageController.getReadReceipts
);

export default router;