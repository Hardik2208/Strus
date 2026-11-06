
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '../../../../components/ui/Button';
import {
  UserSearchAutocomplete,
  type UserSearchSelection,
} from '../../../user/components/UserSearchAutocomplete';
import { useInviteMember } from '../../hooks/useWorkspace';

interface InviteMemberModalProps {
  workspaceId: string;
  workspaceName: string;
  isOpen: boolean;
  onClose: () => void;
}

const getInvitationErrorMessage = (error: unknown): string => {
  const apiError =
    typeof error === 'object' && error !== null
      ? (error as { code?: string; message?: string })
      : {};

  switch (apiError.code || apiError.message) {
    case 'USER_NOT_FOUND':
      return 'No Strus account was found for this username or email.';
    case 'MEMBER_ALREADY_EXISTS':
      return 'This user is already a workspace member.';
    case 'INVITATION_ALREADY_EXISTS':
      return 'A pending invitation already exists for this user.';
    case 'PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED':
      return 'Invitations are not available for Personal Workspaces.';
    case 'INSUFFICIENT_PERMISSIONS':
      return 'You do not have permission to invite members.';
    default:
      return apiError.message || 'Failed to send invitation. Please try again.';
  }
};

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  workspaceId,
  workspaceName,
  isOpen,
  onClose,
}) => {
  const [selection, setSelection] = useState<UserSearchSelection | null>(null);

  const inviteMutation = useInviteMember(workspaceId);

  if (!isOpen) return null;

  const resetAndClose = () => {
    if (inviteMutation.isPending) return;

    setSelection(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selection?.identifier) {
      toast.error('Search for and select a user or enter a valid email.');
      return;
    }

    try {
      await inviteMutation.mutateAsync({
        identifier: selection.identifier,
      });

      toast.success('Workspace invitation sent successfully.');
      setSelection(null);
      onClose();
    } catch (error: unknown) {
      toast.error(getInvitationErrorMessage(error));
    }
  };

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          resetAndClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-16)',
        zIndex: 1000,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-member-title"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-24)',
          width: '100%',
          maxWidth: '450px',
          boxShadow: 'var(--shadow-lg)',
          color: 'var(--color-text-primary)',
        }}
      >
        <h2
          id="invite-member-title"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 600,
            marginTop: 0,
            marginBottom: 'var(--space-8)',
          }}
        >
          Invite to {workspaceName}
        </h2>

        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-24)',
          }}
        >
          Search by name or username, or enter the email address of an existing
          Strus user. They will be invited as a MEMBER.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-16)',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                marginBottom: 'var(--space-8)',
              }}
            >
              Find a Strus user
            </label>

            <UserSearchAutocomplete
              onSelect={setSelection}
              onClear={() => setSelection(null)}
              disabled={inviteMutation.isPending}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-12)',
              marginTop: 'var(--space-8)',
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              disabled={inviteMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!selection || inviteMutation.isPending}
            >
              {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
