import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { socketManager } from '../socket-manager';
import { SOCKET_EVENTS } from '../socket-events';

import { workspaceKeys } from '../../../features/workspace/hooks/useWorkspace';
import { agreementInvitationKeys } from '../../../features/agreement/hooks/useAgreementInvitations';

export const useInvitationSockets = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socketManager.connect();

    const invalidatePendingInvitations = () => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.pendingInvitations(),
      });

      queryClient.invalidateQueries({
        queryKey: agreementInvitationKeys.all,
      });
    };

    const invalidateWorkspaceInvitations = (workspaceId: string) => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.invitations(workspaceId),
      });
    };

    // Reconcile pending invitation lists after reconnecting.
    const unsubscribeStatus = socketManager.onStatusChange((status) => {
      if (status === 'connected') {
        invalidatePendingInvitations();
      }
    });

    // Workspace invitation created.
    const unsubscribeInvitationCreated = socketManager.subscribe(
      SOCKET_EVENTS.INVITATION_CREATED,
      (event) => {
        const workspaceId = event.data?.workspaceId;

        if (workspaceId) {
          invalidateWorkspaceInvitations(workspaceId);
        } else {
          invalidatePendingInvitations();
        }
      },
    );

    // Workspace invitation cancelled.
    const unsubscribeInvitationCancelled = socketManager.subscribe(
      SOCKET_EVENTS.INVITATION_CANCELLED,
      (event) => {
        const workspaceId = event.data?.workspaceId;

        if (workspaceId) {
          invalidateWorkspaceInvitations(workspaceId);
        } else {
          invalidatePendingInvitations();
        }
      },
    );

    // Workspace invitation declined.
    const unsubscribeInvitationDeclined = socketManager.subscribe(
      SOCKET_EVENTS.INVITATION_DECLINED,
      (event) => {
        const workspaceId = event.data?.workspaceId;

        if (workspaceId) {
          invalidateWorkspaceInvitations(workspaceId);
        }
      },
    );

    // Agreement invitation created: sent to the invited user's personal room.
    const unsubscribeAgreementInvitationCreated = socketManager.subscribe(
      SOCKET_EVENTS.AGREEMENT_INVITATION_CREATED,
      () => {
        queryClient.invalidateQueries({
          queryKey: agreementInvitationKeys.all,
        });
      },
    );

    // Agreement invitation withdrawn: sent to the invited user's personal room.
    const unsubscribeAgreementInvitationWithdrawn = socketManager.subscribe(
      SOCKET_EVENTS.AGREEMENT_INVITATION_WITHDRAWN,
      () => {
        queryClient.invalidateQueries({
          queryKey: agreementInvitationKeys.all,
        });
      },
    );

    return () => {
      unsubscribeStatus();
      unsubscribeInvitationCreated();
      unsubscribeInvitationCancelled();
      unsubscribeInvitationDeclined();
      unsubscribeAgreementInvitationCreated();
      unsubscribeAgreementInvitationWithdrawn();
    };
  }, [queryClient]);
};