import type { NextFunction, Request, Response } from "express";
import { logger } from "../logger/logger.js";

export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  res.on("finish", () => {
    logger.info({
      requestId: req.headers["x-request-id"],
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
      ip: req.ip,
    });
  });

  next();
};