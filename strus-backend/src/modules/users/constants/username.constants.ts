export const USERNAME_MIN_LENGTH = 3;

export const USERNAME_MAX_LENGTH = 30;

/**
 * Rules:
 * - lowercase letters
 * - numbers
 * - underscore
 * - period
 * - no leading/trailing '.' or '_'
 * - no consecutive '.' or '_'
 */
export const USERNAME_REGEX =
  /^(?![._])(?!.*[._]{2})[a-z0-9._]{3,30}(?<![._])$/;