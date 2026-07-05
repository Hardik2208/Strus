/**
 * Generates a URL-safe workspace slug.
 *
 * Current Usage:
 * - Personal Workspace → username
 *
 * Future Usage:
 * - Team Workspace → workspace name
 *   (with duplicate handling)
 */
export class WorkspaceSlugUtil {
  static generate(slugSource: string): string {
    return slugSource
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
  }
}