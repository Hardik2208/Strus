import { DevicePlatform } from "../../../generated/prisma/enums.js";

export interface LoginRequest {
  email: string;

  password: string;

  deviceIdentifier: string;

  deviceName?: string;

  platform: DevicePlatform;

  browser?: string;

  operatingSystem?: string;
}