import type { UserProfile } from "../../../generated/prisma/client.js";

export class ProfileCompletionUtil {
  static isComplete(profile: UserProfile): boolean {
    return Boolean(
      profile.username &&
        profile.firstName &&
        profile.lastName &&
        profile.countryCode &&
        profile.timezone
    );
  }
}