import { apiClient } from "../../../lib/api/api-client";
import type { ApiSuccess } from "../../../lib/api/api-error";

import type {
  ClientDashboardOverview,
  RequiresAttentionItem,
  ProfessionalDashboardOverview,
  ActiveProject,
  QuickAction,
} from "../types/dashboard.types";

import type { EventListResponse } from "../../events/types/event.types";

export const dashboardService = {
  // CLIENT DASHBOARD

  getClientOverview() {
    return apiClient.get<unknown, ApiSuccess<ClientDashboardOverview>>(
      "/dashboard/client/client-dashboard/overview"
    );
  },

  getClientAttention() {
    return apiClient.get<unknown, ApiSuccess<RequiresAttentionItem[]>>(
      "/dashboard/client/client-dashboard/requires-attention"
    );
  },

  // PROFESSIONAL DASHBOARD

  getProfessionalOverview() {
    return apiClient.get<unknown, ApiSuccess<ProfessionalDashboardOverview>>(
      "/dashboard/professional/overview"
    );
  },

  getProfessionalActiveProjects() {
    return apiClient.get<unknown, ApiSuccess<ActiveProject[]>>(
      "/dashboard/professional/active-projects"
    );
  },

  getProfessionalQuickActions() {
    return apiClient.get<unknown, ApiSuccess<QuickAction[]>>(
      "/dashboard/professional/quick-actions"
    );
  },

  // EVENTS MODULE INTEGRATION
  // These are not Dashboard module endpoints.

  getClientActivities(limit = 5) {
    return apiClient.get<unknown, ApiSuccess<EventListResponse>>(
      `/events/dashboard/client?limit=${limit}`
    );
  },

  getProfessionalActivities(limit = 5) {
    return apiClient.get<unknown, ApiSuccess<EventListResponse>>(
      `/events/dashboard/professional?limit=${limit}`
    );
  },
};