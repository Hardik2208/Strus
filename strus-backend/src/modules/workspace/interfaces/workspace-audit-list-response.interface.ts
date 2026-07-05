import type { PaginationResponse } from "./pagination.interface.js";
import type { WorkspaceAuditResponse } from "./workspace-audit-response.interface.js";

export interface WorkspaceAuditListResponse {
  logs: WorkspaceAuditResponse[];

  pagination: PaginationResponse;
}