import { DevicePlatform } from "../../../generated/prisma/enums.js";

export interface GoogleLoginRequest {
  idToken: string;

  deviceIdentifier: string;

  deviceName?: string;

  platform: DevicePlatform;

  browser?: string;

  operatingSystem?: string;
}