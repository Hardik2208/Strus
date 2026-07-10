import type { Response } from "express";

import { prisma } from "../../../core/database/prisma.js";

import { AgreementService } from "../services/agreement.service.js";
import { AgreementMapper } from "../mappers/agreement.mapper.js";
import { getIO } from "../../../core/socket/socket.js";
import { SocketEvents } from "../../../core/socket/socket-events.js";
import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";

import type { CreateAgreementDto } from "../dtos/create-agreement.dto.js";
import type { UpdateAgreementDto } from "../dtos/update-agreement.dto.js";

export class AgreementController {
  // ==================================================
  // Create Agreement
  // ==================================================

  static async create(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const projectId = req.params.projectId as string;

    const dto = req.body as CreateAgreementDto;

    const agreement = await prisma.$transaction(
      async (tx) =>
        AgreementService.create(
          tx,
          projectId,
          req.user.id,
          dto
        )
    );


    return res.status(201).json({
      success: true,
      message: "Agreement created successfully.",
      data: AgreementMapper.toResponse(agreement),
    });
  }

  // ==================================================
  // Get Agreement
  // ==================================================

  static async get(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const projectId = req.params.projectId as string;

    const agreement =
      await AgreementService.get(
        projectId,
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: AgreementMapper.toResponse(agreement),
    });
  }

  // ==================================================
  // Update Agreement
  // ==================================================

  static async update(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const projectId = req.params.projectId as string;

    const dto = req.body as UpdateAgreementDto;

    const agreement = await prisma.$transaction(
      async (tx) =>
        AgreementService.update(
          tx,
          projectId,
          req.user.id,
          dto
        )
    );

    return res.status(200).json({
      success: true,
      message: "Agreement updated successfully.",
      data: AgreementMapper.toResponse(agreement),
    });
  }
}