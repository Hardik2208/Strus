export type MilestoneStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'REVISION_REQUESTED'
  | 'REVISION_LIMIT_REACHED'
  | 'NEGOTIATION'
  | 'UNDER_DISPUTE'
  | 'COMPLETED';

export interface MilestoneRequirement {
  id: string;
  milestoneId: string;
  content: string;
}

export interface MilestoneDeliverable {
  id: string;
  milestoneId: string;
  content: string;
  isMandatory: boolean;
}

export interface MilestoneAcceptanceCriteria {
  id: string;
  milestoneId: string;
  content: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  agreementParticipantId: string;
  order: number;
  allocatedDays: number;
  paymentAllocation: number;
  revisionLimit: number;
  revisionCount: number;
  status: MilestoneStatus;
  startedAt?: string | null;
  submittedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  requirements?: MilestoneRequirement[];
  deliverables?: MilestoneDeliverable[];
  acceptanceCriteria?: MilestoneAcceptanceCriteria[];
}

export interface CreateMilestoneRequirementDto {
  content: string;
}

export interface CreateMilestoneDeliverableDto {
  content: string;
  isMandatory?: boolean;
}

export interface CreateMilestoneAcceptanceCriteriaDto {
  content: string;
}

export interface CreateMilestoneDto {
  allocatedDays: number;
  paymentAllocation: number;
  revisionLimit: number;
  dependencies?: number[];
  requirements: CreateMilestoneRequirementDto[];
  deliverables: CreateMilestoneDeliverableDto[];
  acceptanceCriteria: CreateMilestoneAcceptanceCriteriaDto[];
}

export interface ProfessionalExecutionPlanDto {
  agreementParticipantId: string;
  milestones: CreateMilestoneDto[];
}

export interface CreateExecutionPlanDto {
  professionals: ProfessionalExecutionPlanDto[];
}

export interface ExecutionPlanResponse {
  success: boolean;
  message?: string;
  data: Milestone[];
}

export interface ProjectAssetFile {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
}

export interface ProjectAsset {
  id: string;
  projectId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  files: ProjectAssetFile[];
  visibleToParticipants?: Array<{ agreementParticipantId: string }>;
}

export interface SubmissionAttachment {
  id: string;
  originalName: string;
  url: string;
  mimeType: string;
  extension: string;
  size: number;
}

export interface Submission {
  id: string;
  submissionNumber: number;
  content: string | null;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  attachments: SubmissionAttachment[];
  submittedBy?: { id: string; firstName?: string; lastName?: string; username?: string } | null;
  reviewedBy?: { id: string; firstName?: string; lastName?: string; username?: string } | null;
}

export interface ExecutionAudit {
  id: string;
  action: string;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
  actor?: { profile?: { firstName?: string; lastName?: string } | null } | null;
}
