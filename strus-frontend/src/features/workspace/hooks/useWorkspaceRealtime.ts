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
    socketManager.connect();

    const invalidateWorkspaceLists = () => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.lists(),
      });
    };

    const invalidateWorkspaceDetail = () => {
      if (!workspaceId) return;

      queryClient.invalidateQueries({
        queryKey: workspaceKeys.detail(workspaceId),
      });

      invalidateWorkspaceLists();
    };

    const invalidateWorkspaceMembers = () => {
      if (!workspaceId) return;

      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(workspaceId),
      });

      invalidateWorkspaceDetail();
    };

    const unsubscribeStatus = socketManager.onStatusChange((status) => {
      if (status !== "connected") return;

      queryClient.invalidateQueries({
        queryKey: workspaceKeys.pendingInvitations(),
      });

      invalidateWorkspaceLists();

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
      }
    });

    if (!workspaceId) {
      return () => {
        unsubscribeStatus();
      };
    }

    const matchesWorkspace = (event: RealtimeEvent) =>
      event.data?.workspaceId === workspaceId;

    // Member joined: { workspaceId, userId }
    const unsubscribeMemberJoined = socketManager.subscribe(
      SOCKET_EVENTS.MEMBER_JOINED,
      (event) => {
        if (!matchesWorkspace(event)) return;
        invalidateWorkspaceMembers();
      }
    );

    // Member removed: { workspaceId, memberId }
    const unsubscribeMemberRemoved = socketManager.subscribe(
      SOCKET_EVENTS.MEMBER_REMOVED,
      (event) => {
        if (!matchesWorkspace(event)) return;

        invalidateWorkspaceMembers();

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

          invalidateWorkspaceLists();
          window.location.assign("/workspaces");
        }
      }
    );

    // Member left: { workspaceId, userId }
    const unsubscribeMemberLeft = socketManager.subscribe(
      SOCKET_EVENTS.MEMBER_LEFT,
      (event) => {
        if (!matchesWorkspace(event)) return;

        invalidateWorkspaceMembers();

        if (event.data?.userId === user?.id) {
          queryClient.removeQueries({
            queryKey: workspaceKeys.detail(workspaceId),
          });

          queryClient.removeQueries({
            queryKey: workspaceKeys.members(workspaceId),
          });

          queryClient.removeQueries({
            queryKey: workspaceKeys.invitations(workspaceId),
          });

          invalidateWorkspaceLists();
          window.location.assign("/workspaces");
        }
      }
    );

    // Member role changed: { workspaceId, memberId, role }
    const unsubscribeMemberRoleUpdated = socketManager.subscribe(
      SOCKET_EVENTS.MEMBER_ROLE_UPDATED,
      (event) => {
        if (!matchesWorkspace(event)) return;
        invalidateWorkspaceMembers();
      }
    );

    // Ownership transferred:
    // { workspaceId, previousOwnerId, newOwnerId }
    const unsubscribeOwnershipTransferred = socketManager.subscribe(
      SOCKET_EVENTS.OWNERSHIP_TRANSFERRED,
      (event) => {
        if (!matchesWorkspace(event)) return;
        invalidateWorkspaceMembers();

        queryClient.invalidateQueries({
          queryKey: workspaceKeys.invitations(workspaceId),
        });
      }
    );

    // Workspace metadata changed: { workspaceId }
    const unsubscribeWorkspaceUpdated = socketManager.subscribe(
      SOCKET_EVENTS.WORKSPACE_UPDATED,
      (event) => {
        if (!matchesWorkspace(event)) return;
        invalidateWorkspaceDetail();
      }
    );

    // Workspace deleted: { workspaceId }
    const unsubscribeWorkspaceDeleted = socketManager.subscribe(
      SOCKET_EVENTS.WORKSPACE_DELETED,
      (event) => {
        if (!matchesWorkspace(event)) return;

        queryClient.removeQueries({
          queryKey: workspaceKeys.detail(workspaceId),
        });

        queryClient.removeQueries({
          queryKey: workspaceKeys.members(workspaceId),
        });

        queryClient.removeQueries({
          queryKey: workspaceKeys.invitations(workspaceId),
        });

        queryClient.removeQueries({
          queryKey: workspaceKeys.audit(workspaceId),
        });

        invalidateWorkspaceLists();
        window.location.assign("/workspaces");
      }
    );

    return () => {
      unsubscribeStatus();
      unsubscribeMemberJoined();
      unsubscribeMemberRemoved();
      unsubscribeMemberLeft();
      unsubscribeMemberRoleUpdated();
      unsubscribeOwnershipTransferred();
      unsubscribeWorkspaceUpdated();
      unsubscribeWorkspaceDeleted();
    };
  }, [queryClient, workspaceId, user?.id]);
};