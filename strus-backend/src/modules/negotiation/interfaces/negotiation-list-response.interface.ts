import type {
  NegotiationResponse,
} from "./negotiation-response.interface.js";

// ==================================================
// Negotiation List Response
// ==================================================

export interface NegotiationListResponse {

  negotiations:
    NegotiationResponse[];

  pagination: {

    page: number;

    limit: number;

    totalItems: number;

    totalPages: number;

    hasNextPage: boolean;

    hasPreviousPage: boolean;

  };

}