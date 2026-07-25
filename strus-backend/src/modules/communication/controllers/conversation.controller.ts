import type {
  NextFunction,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";

import { ConversationService } from "../services/conversation.service.js";

export class ConversationController {
  // ==================================================
  // Get Workspace Conversation
  // ==================================================

  static async getWorkspaceConversation(
    req: AuthenticatedRequest<{
      workspaceId: string;
    }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { workspaceId } = req.params;

      const response =
        await ConversationService.getWorkspaceConversation(
          workspaceId,
          req.user.id
        );

      res.status(200).json({
        success: true,

        message:
          "Workspace conversation retrieved successfully.",

        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Get Project Conversation
  // ==================================================

  static async getProjectConversation(
    req: AuthenticatedRequest<{
      projectId: string;
    }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { projectId } = req.params;

      const response =
        await ConversationService.getProjectConversation(
          projectId,
          req.user.id
        );

      res.status(200).json({
        success: true,

        message:
          "Project conversation retrieved successfully.",

        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
}