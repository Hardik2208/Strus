import "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      sessionId: string;
      deviceId: string;
    }

    interface Request {
      user: User;
    }
  }
}

export {};