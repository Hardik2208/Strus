import { RESERVED_USERNAMES } from "../constants/reserved-usernames.js";
import { PROHIBITED_USERNAMES } from "../constants/prohibited-usernames.js";

export class ProfileValidator {
  static isReservedUsername(username: string): boolean {
    return RESERVED_USERNAMES.has(username);
  }

  static isValidCountryCode(countryCode: string): boolean {
    try {
      return new Intl.DisplayNames(["en"], { type: "region" }).of(
        countryCode.toUpperCase()
      ) !== undefined;
    } catch {
      return false;
    }
  }

  static isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  static containsProhibitedWord(username: string): boolean {
  const normalized = username.toLowerCase();

  for (const word of PROHIBITED_USERNAMES) {
    if (normalized.includes(word)) {
      return true;
    }
  }

  return false;
}
}