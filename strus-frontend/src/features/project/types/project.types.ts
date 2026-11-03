export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'MUTUALLY_TERMINATED';

export type ProjectSetupStage = 
  | 'PROJECT_CREATED' 
  | 'AGREEMENT_COMPLETED' 
  | 'PROFESSIONALS_ASSIGNED' 
  | 'MILESTONES_CREATED'
  | 'READY_TO_START';

export type ProjectAuditAction = 
  | 'CREATED' 
  | 'UPDATED' 
  | 'STATUS_CHANGED' 
  | 'DELETED';

export interface Project {
  id: string;
  workspaceId: string;
  createdById: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  setupStage: ProjectSetupStage;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  workspace?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProjectAudit {
  id: string;
  projectId: string;
  actorId: string;
  action: ProjectAuditAction;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  sort?: 'createdAt' | 'updatedAt' | 'title' | 'status';
  order?: 'asc' | 'desc';
}

export interface CreateProjectDTO {
  title: string;
  description?: string;
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export interface PaginatedProjectResponse {
  projects: Project[];
  pagination: PaginationMeta;
}

export interface PaginatedAuditResponse {
  audits: ProjectAudit[];
  pagination: PaginationMeta;
}
