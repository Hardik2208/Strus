
import React from 'react';
import toast from 'react-hot-toast';

import {
  useWorkspaceInvitations,
  useCancelInvitation,
} from '../../hooks/useWorkspace';

import type {
  WorkspaceDetail,
  WorkspaceInvitation,
} from '../../types/workspace.types';

import { Button } from '../../../../components/ui/Button';

interface InvitationsTabProps {
  workspace: WorkspaceDetail;
}

export const InvitationsTab: React.FC<InvitationsTabProps> = ({
  workspace,
}) => {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useWorkspaceInvitations(workspace.id);

  const cancelMutation = useCancelInvitation(workspace.id);

  const handleCancel = async (invitation: WorkspaceInvitation) => {
    const identifier = invitation.invitedUserId;

    if (
      !window.confirm(
        `Cancel invitation sent to user ${identifier}?`
      )
    ) {
      return;
    }

    try {
      await cancelMutation.mutateAsync(invitation.id);
      toast.success('Invitation cancelled successfully');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to cancel invitation'
      );
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          height: '200px',
          backgroundColor: 'var(--color-surface-subtle)',
          borderRadius: '8px',
          animation: 'pulse 1.5s infinite ease-in-out',
        }}
      />
    );
  }

  if (isError) {
    return (
      <div
        style={{
          padding: 'var(--space-24)',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
        }}
      >
        <p style={{ marginBottom: 'var(--space-12)' }}>
          Failed to load workspace invitations.
        </p>

        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const invitations = data?.invitations || [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-24)',
      }}
    >
      <div>
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
          }}
        >
          Pending Invitations
        </h2>

        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--space-4)',
          }}
        >
          Manage invitations sent to join this workspace.
        </p>
      </div>

      {invitations.length === 0 ? (
        <div
          style={{
            padding: 'var(--space-32)',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '8px',
            border: '1px dashed var(--color-border)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>
            There are no pending invitations for this workspace.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-16)',
          }}
        >
          {invitations.map((invitation: WorkspaceInvitation) => (
            <div
              key={invitation.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 'var(--space-16)',
                padding: 'var(--space-16)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
              }}
            >
              <div>
                <h4
                  style={{
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  User ID: {invitation.invitedUserId}
                </h4>

                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    marginTop: 'var(--space-4)',
                  }}
                >
                  Invited by:{' '}
                  {invitation.invitedBy
                    ? `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`
                    : 'Workspace owner'}
                </p>

                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    marginTop: 'var(--space-4)',
                  }}
                >
                  Expires:{' '}
                  {new Date(invitation.expiresAt).toLocaleDateString()}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-16)',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--color-warning-light)',
                    color: 'var(--color-warning)',
                  }}
                >
                  {invitation.status || 'PENDING'}
                </span>

                <button
                  onClick={() => handleCancel(invitation)}
                  disabled={cancelMutation.isPending}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-error)',
                    cursor: cancelMutation.isPending
                      ? 'not-allowed'
                      : 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
