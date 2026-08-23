import type {
  DisputeResponse,
} from "./dispute-response.interface.js";

// ==================================================
// Dispute List Response
// ==================================================

export interface DisputeListResponse {

  disputes: DisputeResponse[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;

}