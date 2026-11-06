export type ParticipantRole = 'CONTRACTOR' | 'PROFESSIONAL';

export type InvitationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'WITHDRAWN'
  | 'REMOVED';

export type AgreementAuditAction =
  | 'CREATED'
  | 'UPDATED'
  | 'PROFESSIONAL_INVITED'
  | 'INVITATION_ACCEPTED'
  | 'INVITATION_DECLINED'
  | 'INVITATION_WITHDRAWN'
  | 'PROFESSIONAL_REMOVED';

export type AuditOrder = 'asc' | 'desc';

/**
 * Backend AgreementMapper.toResponse()
 */
export interface Agreement {
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
  createdAt: string;
  updatedAt: string;
}

/**
 * Backend AgreementParticipantMapper.toResponse()
 *
 * userId is optional because the current mapper does not include it
 * in its response, although the backend interface declares it.
 */
export interface AgreementParticipant {
  id: string;
  agreementId?: string;
  userId?: string;
  role: ParticipantRole;
  invitationStatus: InvitationStatus;
  invitedAt: string | null;
  respondedAt?: string | null;
  joinedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    email?: string;
    profile: {
      username: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    } | null;
  } | null;
  profile?: {
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  } | null;
}

export interface AgreementParticipantsResponse {
  participants: AgreementParticipant[];
}

/**
 * Create DTO:
 * title, budget and expectedDuration are required by backend.
 * description, scope and outOfScope are optional.
 */
export interface CreateAgreementRequest {
  title: string;
  description?: string;
  scope?: string;
  outOfScope?: string;
  budget: number;
  expectedDuration: number;
}

/**
 * Update DTO:
 * Every field is optional.
 * Null is not accepted for budget or expectedDuration.
 */
export interface UpdateAgreementRequest {
  title?: string;
  description?: string;
  scope?: string;
  outOfScope?: string;
  budget?: number;
  expectedDuration?: number;
}

export interface InviteParticipantRequest {
  userId: string;
}

export interface UpdateInvitationRequest {
  status: 'ACCEPTED' | 'DECLINED';
}

export interface AgreementAuditActorProfile {
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

export interface AgreementAuditLog {
  id: string;
  agreementId: string;
  actorId: string;
  action: AgreementAuditAction;
  metadata: unknown;
  createdAt: string;
  actor: {
    id: string;
    profile: AgreementAuditActorProfile | null;
  } | null;
}

export interface AgreementAuditPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export interface AgreementAuditResponse {
  audits: AgreementAuditLog[];
  pagination: AgreementAuditPagination;
}

/**
 * Backend AgreementParticipantMapper.toInvitationResponse()
 */
export interface PendingAgreementInvitation {
  id: string;
  role: ParticipantRole;
  invitationStatus: InvitationStatus;
  invitedAt: string;
  respondedAt: string | null;
  joinedAt: string | null;

  agreement: {
    id: string;
    title: string;
    description: string | null;
    scope: string | null;
    outOfScope: string | null;
    budget: number | string;
    expectedDuration: number;
  };

  project: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    setupStage: string;
    workspaceId: string;
  };

  invitedBy: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
}

export interface PendingAgreementInvitationsResponse {
  invitations: PendingAgreementInvitation[];
  pagination: AgreementAuditPagination;
}