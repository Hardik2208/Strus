import type { WorkspaceCreatedJobData } from "../types/notification.types.js";
import { EventHelperRepository } from "../repositories/workspace-event.repository.js";

export class WorkspaceRecipientResolver {
  /**
   * Resolve recipients for the Workspace Created notification.
   *
   * Recipient IDs are provided by the Workspace module when
   * publishing the event, so no database lookup is required.
   */
  static async resolveWorkspaceCreated(
    data: WorkspaceCreatedJobData
  ): Promise<string[]> {
    return data.recipientIds;
  }

  static async resolveWorkspaceMemberJoined(
    workspaceId: string,
    joinedUserId: string
  ) {

    return EventHelperRepository.getWorkspaceMemberJoinedContext(
      workspaceId,
      joinedUserId
    );

  }
  
  static async resolveWorkspaceMemberRemoved(
    workspaceId: string,
    removedUserId: string
  ) {
    return EventHelperRepository.getWorkspaceMemberRemovedContext(
      workspaceId,
      removedUserId
    );
  }

  static async resolveWorkspaceOwnershipTransferred(
  workspaceId: string,
  previousOwnerId: string,
  newOwnerId: string
) {
  return EventHelperRepository.getWorkspaceOwnershipTransferredContext(
    workspaceId,
    previousOwnerId,
    newOwnerId
  );
}
}