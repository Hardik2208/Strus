import type {
  NextFunction,
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "../../auth/interfaces/auth.interface.js";

import type {
  RespondActionRequestDto,
} from "../dtos/respond-action-request.dto.js";

import {
  ActionRequestService,
} from "../services/action-request.service.js";

import type {
  RespondActionRequestInput,
} from "../types/action-request.types.js";

import {
  ActionRequestPublisher,
} from "../../event/publishers/action-request.publisher.js";

export class ActionRequestController {

  // ==================================================
  // Respond To Action Request
  // ==================================================

  static async respond(
    req: AuthenticatedRequest<
      {
        actionRequestId: string;
      },
      unknown,
      RespondActionRequestDto
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    try {

      const actionRequestId =
        req.params.actionRequestId;

      const userId =
        req.user.id;

      const dto =
        req.body;

      const input:
        RespondActionRequestInput = {

        actionRequestId,

        userId,

        decision:
          dto.decision,

      };

      // ------------------------------------------------
      // Respond
      // ------------------------------------------------

      const actionRequest =
        await ActionRequestService.respond(
          input
        );

      // ------------------------------------------------
      // Publish Event
      // ------------------------------------------------

      await ActionRequestPublisher
        .publishActionRequestResponded({

          actionRequestId:
            actionRequest.id,

          createdById:
            userId,

        });

      // ------------------------------------------------
      // Response
      // ------------------------------------------------

      res.status(200).json({

        success: true,

        message:
          "Action request response submitted successfully.",

        data:
          actionRequest,

      });

    } catch (error) {

      next(error);

    }

  }

}