export const RATE_LIMITS = {
  SEND_MESSAGE: {
    key: "send-message",
    maxRequests: 20,
    windowSeconds: 60,
  },

  EDIT_MESSAGE: {
    key: "edit-message",
    maxRequests: 20,
    windowSeconds: 60,
  },

  DELETE_MESSAGE: {
    key: "delete-message",
    maxRequests: 20,
    windowSeconds: 60,
  },

  MARK_AS_READ: {
    key: "mark-read",
    maxRequests: 20,
    windowSeconds: 60,
  },

  UPLOAD_ATTACHMENTS: {
    key: "upload-attachments",
    maxRequests: 20,
    windowSeconds: 60,
  },

  GET_MESSAGES: {
    key: "get-messages",
    maxRequests: 60,
    windowSeconds: 60,
  },

  GET_WORKSPACE_CONVERSATION: {
    key: "workspace-conversation",
    maxRequests: 60,
    windowSeconds: 60,
  },

  GET_PROJECT_CONVERSATION: {
    key: "project-conversation",
    maxRequests: 60,
    windowSeconds: 60,
  },
} as const;

export type RateLimitConfig =
  (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS];