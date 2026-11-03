export type ParticipantRole = 'CONTRACTOR' | 'PROFESSIONAL';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN' | 'REMOVED';

export interface Agreement {
  id: string;
  projectId: string;
  title: string;
  description: string;
  scope: string;
  outOfScope: string | null;
  budget: number | null;
  expectedDuration: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgreementParticipant {
  id: string;
  userId: string;
  role: ParticipantRole;
  invitationStatus: InvitationStatus;
  invitedAt: string | null;
  respondedAt: string | null;
  joinedAt: string | null;
  user?: {
    profile: {
      username: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
  };
  profile?: {
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export interface AgreementParticipantsResponse {
  participants: AgreementParticipant[];
}

export interface CreateAgreementRequest {
  title: string;
  description: string;
  scope: string;
  outOfScope?: string;
  budget?: number;
  expectedDuration?: number;
}

export interface UpdateAgreementRequest {
  title?: string;
  description?: string;
  scope?: string;
  outOfScope?: string | null;
  budget?: number | null;
  expectedDuration?: number | null;
}

export interface InviteParticipantRequest {
  userId: string;
}

export interface UpdateInvitationRequest {
  status: 'ACCEPTED' | 'DECLINED';
}

export interface AgreementAuditLog {
  id: string;
  agreementId: string;
  actorId: string;
  action: string;
  metadata: Record<string, any>;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export interface AgreementAuditResponse {
  logs: AgreementAuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
  };
}
