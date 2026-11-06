import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { socketManager } from '../../../core/realtime/socket-manager';
import { SOCKET_EVENTS } from '../../../core/realtime/socket-events';

import { agreementKeys } from './useAgreementQueries';
import { projectQueryKeys } from '../../project/hooks/useProjectQueries';

export const useAgreementRealtime = (projectId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) {
      return;
    }

    socketManager.connect();

    const invalidateAgreementDetails = () => {
      queryClient.invalidateQueries({
        queryKey: agreementKeys.details(projectId),
      });
    };

    const invalidateParticipants = () => {
      queryClient.invalidateQueries({
        queryKey: agreementKeys.participants(projectId),
      });
    };

    const invalidateAudits = () => {
      queryClient.invalidateQueries({
        queryKey: agreementKeys.audits(projectId),
      });
    };

    const invalidateProject = () => {
      queryClient.invalidateQueries({
        queryKey: projectQueryKeys.detail(projectId),
      });
    };

    const invalidateAgreementState = () => {
      invalidateAgreementDetails();
      invalidateParticipants();
      invalidateAudits();
      invalidateProject();
    };

    // Socket.IO does not replay events missed while disconnected.
    // Reconcile all project-level Agreement state through REST.
    const unsubscribeStatus = socketManager.onStatusChange((status) => {
      if (status === 'connected') {
        invalidateAgreementState();
      }
    });

    const unsubscribeCreated = socketManager.subscribe(
      SOCKET_EVENTS.AGREEMENT_CREATED,
      (event) => {
        if (event.data?.projectId !== projectId) {
          return;
        }

        invalidateAgreementState();
      },
    );

    const unsubscribeUpdated = socketManager.subscribe(
      SOCKET_EVENTS.AGREEMENT_UPDATED,
      (event) => {
        if (event.data?.projectId !== projectId) {
          return;
        }

        invalidateAgreementDetails();
        invalidateAudits();
        invalidateProject();
      },
    );

    const unsubscribeInvitationCreated = socketManager.subscribe(
      SOCKET_EVENTS.AGREEMENT_INVITATION_CREATED,
      (event) => {
        if (event.data?.projectId !== projectId) {
          return;
        }

        invalidateParticipants();
        invalidateAudits();

        toast.success('You have a new agreement invitation!', {
          icon: '📫',
        });
      },
    );

    const unsubscribeInvitationAccepted = socketManager.subscribe(
      SOCKET_EVENTS.AGREEMENT_INVITATION_ACCEPTED,
      (event) => {
        if (event.data?.projectId !== projectId) {
          return;
        }

        invalidateParticipants();
        invalidateAudits();
        invalidateProject();
      },
    );

    const unsubscribeInvitationDeclined = socketManager.subscribe(
      SOCKET_EVENTS.AGREEMENT_INVITATION_DECLINED,
      (event) => {
        if (event.data?.projectId !== projectId) {
          return;
        }

        invalidateParticipants();
        invalidateAudits();
        invalidateProject();
      },
    );

    const unsubscribeInvitationWithdrawn = socketManager.subscribe(
      SOCKET_EVENTS.AGREEMENT_INVITATION_WITHDRAWN,
      (event) => {
        if (event.data?.projectId !== projectId) {
          return;
        }

        invalidateParticipants();
        invalidateAudits();
      },
    );

    const unsubscribeParticipantRemoved = socketManager.subscribe(
      SOCKET_EVENTS.AGREEMENT_PARTICIPANT_REMOVED,
      (event) => {
        if (event.data?.projectId !== projectId) {
          return;
        }

        invalidateParticipants();
        invalidateAudits();
        invalidateProject();
      },
    );

    return () => {
      unsubscribeStatus();
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeInvitationCreated();
      unsubscribeInvitationAccepted();
      unsubscribeInvitationDeclined();
      unsubscribeInvitationWithdrawn();
      unsubscribeParticipantRemoved();
    };
  }, [projectId, queryClient]);
};