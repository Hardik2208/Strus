import "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      sessionId: string;
      deviceId: string;
      profileCompleted: boolean;
    }

    interface Request {
      user: User;
    }
  }
}

export {};