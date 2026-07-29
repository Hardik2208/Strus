import type {
  ProjectActivatedJobData,
  ProjectCompletedJobData,
  ProjectCreatedJobData,
  ProjectDeletedJobData,
  ProjectTransferredJobData,
  ProjectUpdatedJobData,
} from "../types/notification.types.js";

import { EventHelperRepository } from "../repositories/project-event.repository.js";

export class ProjectRecipientResolver {

  /**
   * Resolve recipients for the Project Created notification.
   */
  static async resolveProjectCreated(
    data: ProjectCreatedJobData
  ) {
    return EventHelperRepository.getProjectCreatedContext(
      data.projectId
    );
  }

  /**
   * Resolve recipients for the Project Updated notification.
   */
  static async resolveProjectUpdated(
    data: ProjectUpdatedJobData
  ) {
    return EventHelperRepository.getProjectUpdatedContext(
      data.projectId
    );
  }

  /**
   * Resolve recipients for the Project Activated notification.
   */
  static async resolveProjectActivated(
    data: ProjectActivatedJobData
  ) {
    return EventHelperRepository.getProjectActivatedContext(
      data.projectId
    );
  }

  /**
   * Resolve recipients for the Project Completed notification.
   */
  static async resolveProjectCompleted(
    data: ProjectCompletedJobData
  ) {
    return EventHelperRepository.getProjectCompletedContext(
      data.projectId
    );
  }

  /**
   * Resolve recipients for the Project Deleted notification.
   */
  static async resolveProjectDeleted(
    data: ProjectDeletedJobData
  ) {
    return EventHelperRepository.getProjectDeletedContext(
      data.projectId
    );
  }


static async resolveProjectTransferred(
  data: ProjectTransferredJobData
) {
  return EventHelperRepository.getProjectTransferredContext(
    data.projectId,
    data.destinationWorkspaceId
  );
}
}