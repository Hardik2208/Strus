import {
  AgreementAuditAction,
  ProjectAuditAction,
} from "../../../generated/prisma/client.js";

import type {
  DashboardActivityItem,
} from "../types/dashboard-activity.type.js";

type ActivityMetadata = {
  title: string;

  description: (projectTitle: string) => string;
};

const PROJECT_ACTIVITY_METADATA: Record<
  ProjectAuditAction,
  ActivityMetadata
> = {
  [ProjectAuditAction.CREATED]: {
    title: "Project Created",

    description: (projectTitle) =>
      `Project "${projectTitle}" was created.`,
  },

  [ProjectAuditAction.UPDATED]: {
    title: "Project Updated",

    description: (projectTitle) =>
      `Project "${projectTitle}" was updated.`,
  },

  [ProjectAuditAction.STATUS_CHANGED]: {
    title: "Project Status Changed",

    description: (projectTitle) =>
      `Project "${projectTitle}" status was changed.`,
  },

  [ProjectAuditAction.ACTIVATED]: {
    title: "Project Activated",

    description: (projectTitle) =>
      `Project "${projectTitle}" is now active.`,
  },

  [ProjectAuditAction.COMPLETED]: {
    title: "Project Completed",

    description: (projectTitle) =>
      `Project "${projectTitle}" has been completed.`,
  },

  [ProjectAuditAction.CANCELLED]: {
    title: "Project Cancelled",

    description: (projectTitle) =>
      `Project "${projectTitle}" has been cancelled.`,
  },

  [ProjectAuditAction.MUTUALLY_TERMINATED]: {
    title: "Project Mutually Terminated",

    description: (projectTitle) =>
      `Project "${projectTitle}" was mutually terminated.`,
  },

  [ProjectAuditAction.DELETED]: {
    title: "Project Deleted",

    description: (projectTitle) =>
      `Project "${projectTitle}" was deleted.`,
  },
};

const AGREEMENT_ACTIVITY_METADATA: Record<
  AgreementAuditAction,
  ActivityMetadata
> = {
  [AgreementAuditAction.CREATED]: {
    title: "Agreement Created",

    description: (projectTitle) =>
      `Agreement created for "${projectTitle}".`,
  },

  [AgreementAuditAction.UPDATED]: {
    title: "Agreement Updated",

    description: (projectTitle) =>
      `Agreement updated for "${projectTitle}".`,
  },

  [AgreementAuditAction.PROFESSIONAL_INVITED]: {
    title: "Professional Invited",

    description: (projectTitle) =>
      `A professional was invited to "${projectTitle}".`,
  },

  [AgreementAuditAction.INVITATION_ACCEPTED]: {
    title: "Invitation Accepted",

    description: (projectTitle) =>
      `A professional accepted the invitation for "${projectTitle}".`,
  },

  [AgreementAuditAction.INVITATION_DECLINED]: {
    title: "Invitation Declined",

    description: (projectTitle) =>
      `A professional declined the invitation for "${projectTitle}".`,
  },

  [AgreementAuditAction.INVITATION_WITHDRAWN]: {
    title: "Invitation Withdrawn",

    description: (projectTitle) =>
      `An invitation was withdrawn for "${projectTitle}".`,
  },

  [AgreementAuditAction.PROFESSIONAL_REMOVED]: {
    title: "Professional Removed",

    description: (projectTitle) =>
      `A professional was removed from "${projectTitle}".`,
  },
};

export class DashboardActivityMapper {
  static fromProjectAudit(audit: {
    id: string;

    action: ProjectAuditAction;

    createdAt: Date;

    project: {
      id: string;

      title: string;
    };
  }): DashboardActivityItem {
    const metadata =
      PROJECT_ACTIVITY_METADATA[audit.action];

    return {
      id: audit.id,

      source: "PROJECT",

      action: audit.action,

      title: metadata.title,

      description: metadata.description(
        audit.project.title
      ),

      projectId: audit.project.id,

      projectTitle: audit.project.title,

      createdAt: audit.createdAt,
    };
  }

  static fromAgreementAudit(audit: {
    id: string;

    action: AgreementAuditAction;

    createdAt: Date;

    agreement: {
      project: {
        id: string;

        title: string;
      };
    };
  }): DashboardActivityItem {
    const metadata =
      AGREEMENT_ACTIVITY_METADATA[audit.action];

    return {
      id: audit.id,

      source: "AGREEMENT",

      action: audit.action,

      title: metadata.title,

      description: metadata.description(
        audit.agreement.project.title
      ),

      projectId:
        audit.agreement.project.id,

      projectTitle:
        audit.agreement.project.title,

      createdAt: audit.createdAt,
    };
  }
}