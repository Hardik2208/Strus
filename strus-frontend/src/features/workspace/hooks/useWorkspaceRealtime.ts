import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { socketManager } from "../../../core/realtime/socket-manager";
import { SOCKET_EVENTS } from "../../../core/realtime/socket-events";
import { workspaceKeys } from "./useWorkspace";
import type { RealtimeEvent } from "../../../core/realtime/socket-types";
import { useAuthStore } from "../../auth/store/auth.store";

export const useWorkspaceRealtime = (workspaceId?: string) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Ensure the socket is connected when a workspace page mounts.
    socketManager.connect();

    // Reconcile REST data after initial connection or reconnection.
    const unsubscribeStatus = socketManager.onStatusChange((status) => {
      if (status !== "connected") return;

      queryClient.invalidateQueries({
        queryKey: workspaceKeys.pendingInvitations(),
      });

      if (workspaceId) {
        queryClient.invalidateQueries({
          queryKey: workspaceKeys.detail(workspaceId),
        });

        queryClient.invalidateQueries({
          queryKey: workspaceKeys.members(workspaceId),
        });

        queryClient.invalidateQueries({
          queryKey: workspaceKeys.invitations(workspaceId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: workspaceKeys.lists(),
        });
      }
    });

    // This hook can be mounted on the workspace list page.
    if (!workspaceId) {
      return () => {
        unsubscribeStatus();
      };
    }

    const matchesWorkspace = (event: RealtimeEvent): boolean =>
      event.data?.workspaceId === workspaceId;

    const refreshWorkspaceMembers = () => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(workspaceId),
      });

      // Workspace detail can contain the member count and current role.
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.detail(workspaceId),
      });

      queryClient.invalidateQueries({
        queryKey: workspaceKeys.lists(),
      });
    };

    const unsubscribeMemberJoined = socketManager.subscribe(
      SOCKET_EVENTS.MEMBER_JOINED,
      (event: RealtimeEvent) => {
        if (!matchesWorkspace(event)) return;

        // Backend payload: { workspaceId, userId }
        refreshWorkspaceMembers();
      }
    );

    const unsubscribeMemberRemoved = socketManager.subscribe(
      SOCKET_EVENTS.MEMBER_REMOVED,
      (event: RealtimeEvent) => {
        if (!matchesWorkspace(event)) return;

        // Backend payload: { workspaceId, memberId }
        refreshWorkspaceMembers();

        // If the current user was removed, they no longer have access.
        if (event.data?.memberId === user?.id) {
          queryClient.removeQueries({
            queryKey: workspaceKeys.detail(workspaceId),
          });

          queryClient.removeQueries({
            queryKey: workspaceKeys.members(workspaceId),
          });

          queryClient.removeQueries({
            queryKey: workspaceKeys.invitations(workspaceId),
          });

          queryClient.invalidateQueries({
            queryKey: workspaceKeys.lists(),
          });

          window.location.assign("/workspaces");
        }
      }
    );

    const unsubscribeMemberRoleUpdated = socketManager.subscribe(
      SOCKET_EVENTS.MEMBER_ROLE_UPDATED,
      (event: RealtimeEvent) => {
        if (!matchesWorkspace(event)) return;

        // Backend payload: { workspaceId, memberId, role }
        refreshWorkspaceMembers();
      }
    );

    const unsubscribeOwnershipTransferred = socketManager.subscribe(
      SOCKET_EVENTS.OWNERSHIP_TRANSFERRED,
      (event: RealtimeEvent) => {
        if (!matchesWorkspace(event)) return;

        // Backend payload:
        // { workspaceId, previousOwnerId, newOwnerId }
        refreshWorkspaceMembers();
      }
    );

    const unsubscribeInvitationDeclined = socketManager.subscribe(
      SOCKET_EVENTS.INVITATION_DECLINED,
      () => {
        /*
         * Backend payload: { invitationId }
         *
         * It does not contain workspaceId. Therefore, we cannot safely
         * invalidate only this workspace's invitation query.
         * Invalidate cached workspace invitation queries instead.
         */
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "workspaces" &&
            query.queryKey[1] === "detail" &&
            query.queryKey[3] === "invitations",
        });
      }
    );

    return () => {
      unsubscribeStatus();
      unsubscribeMemberJoined();
      unsubscribeMemberRemoved();
      unsubscribeMemberRoleUpdated();
      unsubscribeOwnershipTransferred();
      unsubscribeInvitationDeclined();
    };
  }, [queryClient, workspaceId, user?.id]);
};