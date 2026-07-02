import type { NextFunction, Request, Response } from "express";

import { ZodError } from "zod";

import { AppError } from "../errors/AppError.js";
import { ErrorCode } from "../errors/ErrorCodes.js";
import { logger } from "../logger/index.js";

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // --------------------------------------------------
  // App Errors
  // --------------------------------------------------

  if (error instanceof AppError) {
    logger.error({
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
    });

    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });

    return;
  }

  // --------------------------------------------------
  // Zod Validation
  // --------------------------------------------------

  if (error instanceof ZodError) {
    logger.error(error);

    res.status(400).json({
      success: false,
      message: "Validation failed",
      code: ErrorCode.VALIDATION_ERROR,
      errors: error.flatten(),
    });

    return;
  }

  // --------------------------------------------------
  // Unknown Errors
  // --------------------------------------------------

  logger.error(error);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    code: ErrorCode.INTERNAL_SERVER_ERROR,
  });
};