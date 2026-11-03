import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketManager } from '../../../core/realtime/socket-manager';
import { agreementKeys } from './useAgreementQueries';
import { projectQueryKeys } from '../../project/hooks/useProjectQueries';
import toast from 'react-hot-toast';

export const useAgreementRealtime = (projectId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    // Connect to socket if not already connected
    socketManager.connect();

    // Reconnection Reconciliation:
    // If the socket reconnects, we may have missed events. We must reconcile via REST.
    const unsubStatus = socketManager.onStatusChange((status) => {
      if (status === 'connected') {
        queryClient.invalidateQueries({ queryKey: agreementKeys.details(projectId) });
        queryClient.invalidateQueries({ queryKey: agreementKeys.participants(projectId) });
      }
    });

    // agreement:created
    const unsubCreated = socketManager.subscribe('agreement:created', (event) => {
      if (event.data.projectId === projectId) {
        queryClient.invalidateQueries({ queryKey: agreementKeys.details(projectId) });
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
      }
    });

    // agreement:updated
    const unsubUpdated = socketManager.subscribe('agreement:updated', (event) => {
      if (event.data.projectId === projectId) {
        queryClient.invalidateQueries({ queryKey: agreementKeys.details(projectId) });
      }
    });

    // agreement:invitation:created
    const unsubInvCreated = socketManager.subscribe('agreement:invitation:created', (event) => {
      if (event.data.projectId === projectId) {
        queryClient.invalidateQueries({ queryKey: agreementKeys.participants(projectId) });
        toast.success(`You have a new agreement invitation!`, {
          icon: '📫'
        });
      }
    });

    // agreement:invitation:accepted
    const unsubInvAccepted = socketManager.subscribe('agreement:invitation:accepted', (event) => {
      if (event.data.projectId === projectId) {
        queryClient.invalidateQueries({ queryKey: agreementKeys.participants(projectId) });
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
      }
    });

    // agreement:invitation:declined
    const unsubInvDeclined = socketManager.subscribe('agreement:invitation:declined', (event) => {
      if (event.data.projectId === projectId) {
        queryClient.invalidateQueries({ queryKey: agreementKeys.participants(projectId) });
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
      }
    });

    // agreement:invitation:withdrawn
    const unsubInvWithdrawn = socketManager.subscribe('agreement:invitation:withdrawn', (event) => {
      if (event.data.projectId === projectId) {
        queryClient.invalidateQueries({ queryKey: agreementKeys.participants(projectId) });
      }
    });

    // agreement:participant:removed
    const unsubPartRemoved = socketManager.subscribe('agreement:participant:removed', (event) => {
      if (event.data.projectId === projectId) {
        queryClient.invalidateQueries({ queryKey: agreementKeys.participants(projectId) });
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
      }
    });

    return () => {
      unsubStatus();
      unsubCreated();
      unsubUpdated();
      unsubInvCreated();
      unsubInvAccepted();
      unsubInvDeclined();
      unsubInvWithdrawn();
      unsubPartRemoved();
    };
  }, [projectId, queryClient]);
};
