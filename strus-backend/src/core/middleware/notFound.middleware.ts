import type { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../errors/ErrorFactory.js";

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(
    ErrorFactory.notFound(
      `Route ${req.method} ${req.originalUrl} not found`
    )
  );
};