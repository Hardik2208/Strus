import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = randomUUID();

  req.headers["x-request-id"] = requestId;

  res.setHeader("x-request-id", requestId);

  next();
};