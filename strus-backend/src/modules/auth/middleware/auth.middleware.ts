import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { JwtUtil } from "../utils/jwt.util.js";

import { AuthRepository } from "../repositories/auth.repository.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

declare global {
  namespace Express {
    interface Request {
      user: Awaited<
        ReturnType<typeof AuthRepository.findUserById>
      >;
    }
  }
}

export class AuthMiddleware {
  static async authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
  ) {
    try {
      const header =
        req.headers.authorization;

      if (
        !header ||
        !header.startsWith("Bearer ")
      ) {
        throw new AppError(
          "Authentication required.",
          401,
          ErrorCode.UNAUTHORIZED
        );
      }

      const token =
        header.substring(7);

      const payload =
        JwtUtil.verifyAccessToken(
          token
        );

      const user =
        await AuthRepository.findUserById(
          payload.userId
        );

      if (!user) {
        throw new AppError(
          "User not found.",
          401,
          ErrorCode.UNAUTHORIZED
        );
      }

      req.user = user;

      next();
    } catch {
      next(
        new AppError(
          "Invalid access token.",
          401,
          ErrorCode.UNAUTHORIZED
        )
      );
    }
  }
}