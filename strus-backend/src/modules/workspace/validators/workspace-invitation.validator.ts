export class WorkspaceInvitationValidator {
  static validateIdentifier(
  identifier: string
): string {
  return identifier.trim();
}
}