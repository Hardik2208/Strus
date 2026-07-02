import jwt from "jsonwebtoken";

import { env } from "../../../core/config/env.js";

import type { JwtPayload } from "../types/jwt-payload.js";

export class JwtUtil {
  // ==================================================
  // Access Token
  // ==================================================

  static signAccessToken(
    payload: JwtPayload
  ): string {
    return jwt.sign(
      payload,
      env.JWT_ACCESS_SECRET,
      {
        expiresIn:
          env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
      }
    );
  }

  // ==================================================
  // Refresh Token
  // ==================================================

  static signRefreshToken(
    payload: JwtPayload
  ): string {
    return jwt.sign(
      payload,
      env.JWT_REFRESH_SECRET,
      {
        expiresIn:
          env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
      }
    );
  }

  // ==================================================
  // Verify Access Token
  // ==================================================

  static verifyAccessToken(
    token: string
  ): JwtPayload {
    return jwt.verify(
      token,
      env.JWT_ACCESS_SECRET
    ) as JwtPayload;
  }

  // ==================================================
  // Verify Refresh Token
  // ==================================================

  static verifyRefreshToken(
    token: string
  ): JwtPayload {
    return jwt.verify(
      token,
      env.JWT_REFRESH_SECRET
    ) as JwtPayload;
  }
}