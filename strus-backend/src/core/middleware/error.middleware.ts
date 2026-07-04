import type { NextFunction, Request, Response } from "express";

import { ZodError } from "zod";
import multer from "multer";
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
// Multer Errors
// --------------------------------------------------

if (error instanceof multer.MulterError) {
  logger.error(error);

  switch (error.code) {
    case "LIMIT_FILE_SIZE":
      res.status(400).json({
        success: false,
        message: "Avatar size must not exceed 2 MB.",
        code: ErrorCode.FILE_TOO_LARGE,
      });
      return;

    case "LIMIT_FILE_COUNT":
      res.status(400).json({
        success: false,
        message: "Only one avatar can be uploaded.",
        code: ErrorCode.INVALID_FILE_TYPE,
      });
      return;

    default:
      res.status(400).json({
        success: false,
        message: "Invalid avatar upload.",
        code: ErrorCode.INVALID_FILE_TYPE,
      });
      return;
  }
}
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