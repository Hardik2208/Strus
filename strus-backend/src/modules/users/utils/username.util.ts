import {
  USERNAME_REGEX,
} from "../constants/username.constants.js";

import {
  RESERVED_USERNAMES,
} from "../constants/reserved-usernames.js";

import {
  PROHIBITED_USERNAMES,
} from "../constants/prohibited-usernames.js";

export class UsernameUtil {
  static normalize(username: string): string {
    return username.trim().toLowerCase();
  }

  static isValid(username: string): boolean {
    return USERNAME_REGEX.test(username);
  }

  static isReserved(username: string): boolean {
    return RESERVED_USERNAMES.has(username);
  }

  static containsProhibitedWord(username: string): boolean {
  for (const word of PROHIBITED_USERNAMES) {
    if (username.includes(word)) {
      return true;
    }
  }

  return false;
}
}