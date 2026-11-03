export interface AuthenticatedUser {
  id: string;
  sessionId: string;
  deviceId: string;
  email: string;
  profileCompleted: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  profileCompleted: boolean;
}

export type DevicePlatform = "MACOS" | "WINDOWS" | "LINUX" | "IOS" | "ANDROID" | "UNKNOWN";

export interface CreateSessionRequest {
  userId: string;
  profileCompleted: boolean;
  deviceIdentifier: string;
  deviceName?: string;
  platform: DevicePlatform;
  browser?: string;
  operatingSystem?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceIdentifier: string;
  deviceName?: string;
  platform: string;
  browser?: string;
  operatingSystem?: string;
}

export interface GoogleLoginRequest {
  idToken: string;
  deviceIdentifier: string;
  deviceName?: string;
  platform: string;
  browser?: string;
  operatingSystem?: string;
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface Session {
  id: string;
  deviceId: string;
  deviceName: string;
  platform: string;
  browser: string;
  operatingSystem: string;
  lastActive: string;
  isCurrent: boolean;
}
