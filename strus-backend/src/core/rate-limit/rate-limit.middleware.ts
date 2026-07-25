import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../errors/AppError.js";
import { ErrorCode } from "../errors/ErrorCodes.js";

import { RateLimitService } from "./rate-limit.service.js";

export function rateLimit(config: {
  key: string;
  maxRequests: number;
  windowSeconds: number;
}) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const result =
      await RateLimitService.check(
        req.user.id,
        config
      );

    if (!result.allowed) {
      throw new AppError(
        "Rate limit exceeded.",
        429,
        ErrorCode.RATE_LIMIT_EXCEEDED
      );
    }

    next();
  };
}