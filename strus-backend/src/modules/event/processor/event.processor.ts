import type {
  NotificationJob,
} from "../types/notification.types.js";

import {
  NotificationJobType,
} from "../types/notification.types.js";

import { WorkspaceNotificationFactory } from "../factories/workspace-event.factory.js";
import { ProjectNotificationFactory } from "../factories/project-event.factory.js";
import { AgreementNotificationFactory } from "../factories/agreement-event.factory.js";
import { ExecutionNotificationFactory } from "../factories/execution-event.factory.js";
import { NegotiationNotificationFactory } from "../factories/negotiation.notification.factory.js";
import { DisputeNotificationFactory } from "../factories/dispute.notification.factory.js";
import { ActionRequestNotificationFactory } from "../factories/action-request.notification.factory.js";

export class EventProcessor {
  /**
   * Process an incoming notification job.
   */
  static async process(
    job: NotificationJob
  ): Promise<void> {

    switch (job.type) {

      //
      // Workspace Notifications
      //

      case NotificationJobType.WORKSPACE_CREATED:{
        await WorkspaceNotificationFactory.workspaceCreated(
          job.payload
        );
        break;
}

      case NotificationJobType.WORKSPACE_DELETED:{
        await WorkspaceNotificationFactory.workspaceDeleted(
          job.payload
        );
        break;
}

      case NotificationJobType.WORKSPACE_MEMBER_JOINED:{
        await WorkspaceNotificationFactory.workspaceMemberJoined(
          job.payload
        );
        break;
}

      case NotificationJobType.WORKSPACE_MEMBER_REMOVED:{
        await WorkspaceNotificationFactory.workspaceMemberRemoved(
          job.payload
        );
        break;
}

      case NotificationJobType.WORKSPACE_OWNERSHIP_TRANSFERRED:{
        await WorkspaceNotificationFactory.workspaceOwnershipTransferred(
          job.payload
        );
        break;
}

      case NotificationJobType.WORKSPACE_MEMBER_LEFT:{
        await WorkspaceNotificationFactory.workspaceMemberLeft(
          job.payload
        );
        break;
}

      //
      // Project Notifications
      //

      case NotificationJobType.PROJECT_CREATED:{
        await ProjectNotificationFactory.projectCreated(
          job.payload
        );
        break;}

      case NotificationJobType.PROJECT_UPDATED:{
        await ProjectNotificationFactory.projectUpdated(
          job.payload
        );
        break;}

      case NotificationJobType.PROJECT_ACTIVATED:{
        await ProjectNotificationFactory.projectActivated(
          job.payload
        );
        break;}

      case NotificationJobType.PROJECT_COMPLETED:{
        await ProjectNotificationFactory.projectCompleted(
          job.payload
        );
        break;}

      case NotificationJobType.PROJECT_DELETED:{
        await ProjectNotificationFactory.projectDeleted(
          job.payload
        );
        break;}

      case NotificationJobType.PROJECT_TRANSFERRED:{
        await ProjectNotificationFactory.projectTransferred(
          job.payload
        );
        break;}
//
// Agreement Notifications
//

case NotificationJobType.AGREEMENT_CREATED:{
  await AgreementNotificationFactory.agreementCreated(
    job.payload
  );
  break;}

case NotificationJobType.AGREEMENT_UPDATED:{
  await AgreementNotificationFactory.agreementUpdated(
    job.payload
  );
  break;}

case NotificationJobType.AGREEMENT_PROFESSIONAL_INVITED:{
  await AgreementNotificationFactory.professionalInvited(
    job.payload
  );
  break;}

case NotificationJobType.AGREEMENT_INVITATION_ACCEPTED:{
  await AgreementNotificationFactory.invitationAccepted(
    job.payload
  );
  break;}

case NotificationJobType.AGREEMENT_INVITATION_DECLINED:{
  await AgreementNotificationFactory.invitationDeclined(
    job.payload
  );
  break;}

case NotificationJobType.AGREEMENT_INVITATION_WITHDRAWN:{
  await AgreementNotificationFactory.invitationWithdrawn(
    job.payload
  );
  break;}

case NotificationJobType.AGREEMENT_PROFESSIONAL_REMOVED:{
  await AgreementNotificationFactory.professionalRemoved(
    job.payload
  );
  break;}

// ======================================================
// Execution
// ======================================================

case NotificationJobType.EXECUTION_PLAN_CREATED: {

  await ExecutionNotificationFactory.executionPlanCreated(
    job.payload
  );

  break;

}

case NotificationJobType.EXECUTION_PLAN_UPDATED: {

  await ExecutionNotificationFactory.executionPlanUpdated(
    job.payload
  );

  break;

}

case NotificationJobType.PROJECT_ASSET_SHARED: {

  await ExecutionNotificationFactory.projectAssetShared(
    job.payload
  );

  break;

}

case NotificationJobType.MILESTONE_STARTED: {

  await ExecutionNotificationFactory.milestoneStarted(
    job.payload
  );

  break;

}

case NotificationJobType.SUBMISSION_CREATED: {

  await ExecutionNotificationFactory.submissionCreated(
    job.payload
  );

  break;

}

case NotificationJobType.REVISION_REQUESTED: {

  await ExecutionNotificationFactory.revisionRequested(
    job.payload
  );

  break;

}

case NotificationJobType.EXTENSION_GRANTED: {

  await ExecutionNotificationFactory.extensionGranted(
    job.payload
  );

  break;

}

case NotificationJobType.MILESTONE_COMPLETED: {

  await ExecutionNotificationFactory.milestoneCompleted(
    job.payload
  );

  break;

}

// ======================================================
// Negotiation
// ======================================================

case NotificationJobType.NEGOTIATION_CREATED: {

  await NegotiationNotificationFactory.negotiationCreated(
    job.payload
  );

  break;

}

case NotificationJobType.NEGOTIATION_ACCEPTED: {

  await NegotiationNotificationFactory.negotiationAccepted(
    job.payload
  );

  break;

}

case NotificationJobType.NEGOTIATION_DECLINED: {

  await NegotiationNotificationFactory.negotiationDeclined(
    job.payload
  );

  break;

}

case NotificationJobType.NEGOTIATION_EXPIRED: {

  await NegotiationNotificationFactory.negotiationExpired(
    job.payload
  );

  break;

}

// ======================================================
// Dispute
// ======================================================

case NotificationJobType.DISPUTE_CREATED: {

  await DisputeNotificationFactory.disputeCreated(
    job.payload
  );

  break;

}

case NotificationJobType.DISPUTE_RESOLUTION_PROPOSED: {

  await DisputeNotificationFactory.disputeResolutionProposed(
    job.payload
  );

  break;

}

case NotificationJobType.DISPUTE_RESOLVED: {

  await DisputeNotificationFactory.disputeResolved(
    job.payload
  );

  break;

}

case NotificationJobType.DISPUTE_CLOSED: {

  await DisputeNotificationFactory.disputeClosed(
    job.payload
  );

  break;

}

// ======================================================
// Action Request
// ======================================================

case NotificationJobType.ACTION_REQUEST_CREATED: {

  await ActionRequestNotificationFactory.actionRequestCreated(
    job.payload
  );

  break;

}

case NotificationJobType.ACTION_REQUEST_RESPONDED: {

  await ActionRequestNotificationFactory.actionRequestResponded(
    job.payload
  );

  break;

}

case NotificationJobType.ACTION_REQUEST_EXPIRED: {

  await ActionRequestNotificationFactory.actionRequestExpired(
    job.payload
  );

  break;

}

default:
        return;

    }

  }

}