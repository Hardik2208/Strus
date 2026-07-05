import { DevicePlatform } from "../../../generated/prisma/enums.js";

export interface CreateSessionRequest {
  userId: string;

  profileCompleted: boolean;

  deviceIdentifier: string;

  deviceName?: string;

  platform: DevicePlatform;

  browser?: string;

  operatingSystem?: string;
}