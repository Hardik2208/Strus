import type { MemberResponse } from "./member-response.interface.js";
import type { PaginationResponse } from "./pagination.interface.js";

export interface MemberListResponse {
  members: MemberResponse[];

  pagination: PaginationResponse;
}