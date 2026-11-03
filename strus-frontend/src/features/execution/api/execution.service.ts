import { apiClient } from '../../../lib/api/api-client';
import type { ApiSuccess } from '../../../lib/api/api-error';
import type {
  Milestone,
  CreateExecutionPlanDto,
  ExecutionPlanResponse,
  ProjectAsset,
  Submission,
  ExecutionAudit,
} from '../types/execution.types';

export const executionService = {
  async getExecutionPlan(projectId: string) {
    try {
      return await apiClient.get<any, ApiSuccess<{ data: Milestone[] }>>(
        `/execution/projects/${projectId}/execution-plan`
      );
    } catch (error: any) {
      if (error?.status === 404 || error?.response?.status === 404) {
        return { data: { data: [] } } as unknown as ApiSuccess<{ data: Milestone[] }>;
      }
      throw error;
    }
  },

  async createExecutionPlan(projectId: string, dto: CreateExecutionPlanDto) {
    return apiClient.post<any, ApiSuccess<ExecutionPlanResponse>>(
      `/execution/projects/${projectId}/execution-plan`,
      dto
    );
  },

  async updateExecutionPlan(projectId: string, dto: CreateExecutionPlanDto) {
    return apiClient.patch<any, ApiSuccess<ExecutionPlanResponse>>(
      `/execution/projects/${projectId}/execution-plan`,
      dto
    );
  },

  async deleteExecutionPlan(projectId: string) {
    return apiClient.delete<any, ApiSuccess<{ message: string }>>(
      `/execution/projects/${projectId}/execution-plan`
    );
  },

  async getAssets(projectId: string) {
    return apiClient.get<any, ApiSuccess<ProjectAsset[]>>(`/execution/projects/${projectId}/assets`);
  },

  async createAsset(projectId: string, files: File[], participantIds: string[]) {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    participantIds.forEach((id) => form.append('visibleToParticipants', id));
    return apiClient.post<any, ApiSuccess<ProjectAsset>>(`/execution/projects/${projectId}/assets`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async addAssetFiles(projectId: string, assetId: string, files: File[]) {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    return apiClient.post(`/execution/projects/${projectId}/assets/${assetId}/files`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async deleteAsset(projectId: string, assetId: string) {
    return apiClient.delete(`/execution/projects/${projectId}/assets/${assetId}`);
  },

  async getMilestoneSubmissions(milestoneId: string) {
    return apiClient.get<any, ApiSuccess<Submission[]>>(`/execution/milestones/${milestoneId}/submissions`);
  },

  async submitWork(milestoneId: string, content: string, files: File[]) {
    const form = new FormData();
    if (content.trim()) form.append('content', content.trim());
    files.forEach((file) => form.append('files', file));
    return apiClient.post(`/execution/milestones/${milestoneId}/submissions`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async approveSubmission(submissionId: string, content?: string) {
    return apiClient.patch(`/execution/submissions/${submissionId}/approve`, { content });
  },

  async requestRevision(submissionId: string, content: string) {
    return apiClient.patch(`/execution/submissions/${submissionId}/request-revision`, { content });
  },

  async grantExtension(projectId: string, milestoneId: string, daysAdded: number, reason: string) {
    return apiClient.post(`/execution/projects/${projectId}/milestone-extensions`, { milestoneId, daysAdded, reason });
  },

  async getAudits(projectId: string) {
    return apiClient.get<any, ApiSuccess<ExecutionAudit[]>>(`/execution/projects/${projectId}/audits`);
  },
};
