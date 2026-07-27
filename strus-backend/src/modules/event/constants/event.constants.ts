/**
 * Event Module Constants
 *
 * Shared constants used across the Event module.
 */

export const EVENT_CONSTANTS = {
  /**
   * Dashboard pagination
   */
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  /**
   * Event content limits
   */
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,

  DESCRIPTION_MIN_LENGTH: 1,
  DESCRIPTION_MAX_LENGTH: 1000,
} as const;

export default EVENT_CONSTANTS;