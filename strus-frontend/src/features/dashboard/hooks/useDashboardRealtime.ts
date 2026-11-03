import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socketManager } from "../../../core/realtime/socket-manager";
import { SOCKET_EVENTS } from "../../../core/realtime/socket-events";

export function useDashboardRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only connect if not already connected
    socketManager.connect();

    const unsubscribes = [
      socketManager.subscribe(SOCKET_EVENTS.PROJECT_ACTIVATED, () => {
        queryClient.invalidateQueries({ queryKey: ["clientOverview"] });
        queryClient.invalidateQueries({ queryKey: ["professionalOverview"] });
        queryClient.invalidateQueries({ queryKey: ["professionalActiveProjects"] });
      }),
      socketManager.subscribe(SOCKET_EVENTS.PROJECT_COMPLETED, () => {
        queryClient.invalidateQueries({ queryKey: ["clientOverview"] });
        queryClient.invalidateQueries({ queryKey: ["professionalOverview"] });
        queryClient.invalidateQueries({ queryKey: ["professionalActiveProjects"] });
      }),
      socketManager.subscribe(SOCKET_EVENTS.SUBMISSION_CREATED, () => {
        queryClient.invalidateQueries({ queryKey: ["clientRequiresAttention"] });
      }),
      socketManager.subscribe(SOCKET_EVENTS.AGREEMENT_INVITATION_CREATED, () => {
        queryClient.invalidateQueries({ queryKey: ["professionalPendingInvitations"] });
        queryClient.invalidateQueries({ queryKey: ["clientRequiresAttention"] });
      }),
      socketManager.subscribe(SOCKET_EVENTS.NOTIFICATION_RECEIVED, () => {
        // Invalidate event lists and unread count to force a refresh,
        // or we could optimistically update the cache here if payload is full.
        queryClient.invalidateQueries({ queryKey: ["events"] });
        queryClient.invalidateQueries({ queryKey: ["clientActivities"] });
        queryClient.invalidateQueries({ queryKey: ["professionalActivities"] });
      }),
    ];

    return () => {
      unsubscribes.forEach((unsub) => unsub());
      // Note: We don't disconnect the socket here because it is a singleton for the whole authenticated session.
    };
  }, [queryClient]);
}
