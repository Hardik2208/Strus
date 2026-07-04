export class TimezoneUtil {
  /**
   * Validate an IANA timezone.
   *
   * Examples:
   * Asia/Kolkata
   * Europe/London
   * America/New_York
   */
  static isValid(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Normalize timezone.
   */
  static normalize(timezone: string): string {
    return timezone.trim();
  }
}