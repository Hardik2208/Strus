import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { socketManager } from "../socket-manager";
import { SOCKET_EVENTS } from "../socket-events";
import { workspaceKeys } from "../../../features/workspace/hooks/useWorkspace";
import { agreementInvitationKeys } from "../../../features/agreement/hooks/useAgreementInvitations";

export const useInvitationSockets = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socketManager.connect();

    // Workspace invitation created or cancelled.
    // These events are sent to the invited user's personal room.
    const unsubscribeWorkspaceCreated = socketManager.subscribe(
      SOCKET_EVENTS.INVITATION_CREATED,
      () => {
        queryClient.invalidateQueries({
          queryKey: workspaceKeys.pendingInvitations(),
        });
      }
    );

    const unsubscribeWorkspaceCancelled = socketManager.subscribe(
      SOCKET_EVENTS.INVITATION_CANCELLED,
      () => {
        queryClient.invalidateQueries({
          queryKey: workspaceKeys.pendingInvitations(),
        });
      }
    );

    // Workspace invitation declined.
    // Backend emits this to the workspace room with { invitationId }.
    const unsubscribeWorkspaceDeclined = socketManager.subscribe(
      SOCKET_EVENTS.INVITATION_DECLINED,
      () => {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "workspaces" &&
            query.queryKey[1] === "detail" &&
            query.queryKey[3] === "invitations",
        });
      }
    );

    // Agreement invitation created.
    const unsubscribeAgreementCreated = socketManager.subscribe(
      SOCKET_EVENTS.AGREEMENT_INVITATION_CREATED,
      () => {
        queryClient.invalidateQueries({
          queryKey: agreementInvitationKeys.all,
        });
      }
    );

    return () => {
      unsubscribeWorkspaceCreated();
      unsubscribeWorkspaceCancelled();
      unsubscribeWorkspaceDeclined();
      unsubscribeAgreementCreated();
    };
  }, [queryClient]);
};