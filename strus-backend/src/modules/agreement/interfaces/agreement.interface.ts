import type {
  AgreementInvitationStatus,
  AgreementParticipantRole,
} from "../../../generated/prisma/enums.js";

export interface AgreementResponse {
  id: string;

  projectId: string;

  title: string;

  description: string | null;

  scope: string | null;

  outOfScope: string | null;

  budget: string;

  expectedDuration: number;

  createdById: string;

  lastUpdatedById: string;

  createdAt: Date;

  updatedAt: Date;
}

export interface AgreementParticipantResponse {
  id: string;

  agreementId: string;

  userId: string;

  role: AgreementParticipantRole;

  invitationStatus: AgreementInvitationStatus;

  invitedAt: Date;

  joinedAt: Date | null;

  createdAt: Date;

  updatedAt: Date;
}

export interface AgreementWithParticipantsResponse
  extends AgreementResponse {
  participants: AgreementParticipantResponse[];
}

export interface AgreementAuditResponse {
  id: string;

  action: string;

  metadata: unknown;

  createdAt: Date;

  actor: {
    id: string;

    username: string | null;

    firstName: string | null;

    lastName: string | null;

    avatarUrl: string | null;
  } | null;
}