export interface JwtPayload {
  userId: string;

  sessionId: string;

  deviceId: string;

  iat?: number;

  exp?: number;
  
}