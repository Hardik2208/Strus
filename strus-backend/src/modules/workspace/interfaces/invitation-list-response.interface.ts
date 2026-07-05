import type { WorkspaceInvitationResponse } from "./workspace-invitation-response.interface.js";
import type { PaginationResponse } from "./pagination.interface.js";

export interface InvitationListResponse {
  invitations: WorkspaceInvitationResponse[];

  pagination: PaginationResponse;
}