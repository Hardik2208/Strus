import { DevicePlatform } from "../../../generated/prisma/enums.js";

export interface GoogleOAuthRequest {
  providerUserId: string;

  email: string;

  firstName: string;

  lastName: string;

  avatarUrl?: string;

  deviceIdentifier: string;

  deviceName?: string;

  platform: DevicePlatform;

  browser?: string;

  operatingSystem?: string;
}