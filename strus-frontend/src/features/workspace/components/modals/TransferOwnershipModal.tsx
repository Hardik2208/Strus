
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '../../../../components/ui/Button';
import {
  useTransferOwnership,
  useAllWorkspaceMembers,
} from '../../hooks/useWorkspace';

export const TransferOwnershipModal: React.FC<{
  workspaceId: string;
  workspaceName: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ workspaceId, workspaceName, isOpen, onClose }) => {
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const {
    data: members = [],
    isLoading,
    isError,
    refetch,
  } = useAllWorkspaceMembers(workspaceId, isOpen);

  const transferMutation = useTransferOwnership(workspaceId);

  if (!isOpen) return null;

  // Exclude the current owner from eligible ownership candidates.
  const selectableMembers = members.filter(
    (member) => member.role !== 'OWNER'
  );

  const selectedMember = selectableMembers.find(
    (member) => member.id === selectedMemberId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMemberId) {
      toast.error('Please select a member');
      return;
    }

    try {
      await transferMutation.mutateAsync({
        newOwnerId: selectedMemberId,
      });

      toast.success('Ownership transferred successfully');
      setSelectedMemberId('');
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to transfer ownership'
      );
    }
  };

  const handleClose = () => {
    if (transferMutation.isPending) return;

    setSelectedMemberId('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
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
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 600,
            marginBottom: 'var(--space-8)',
          }}
        >
          Transfer Workspace Ownership
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-16)',
          }}
        >
          <div
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <p style={{ marginBottom: 'var(--space-12)' }}>
              You are about to transfer ownership of:
            </p>

            <p
              style={{
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-12)',
              }}
            >
              {workspaceName}
            </p>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                marginBottom: 'var(--space-4)',
              }}
            >
              Select a current workspace member:
            </label>

            {isLoading && (
              <p style={{ fontSize: 'var(--text-sm)' }}>
                Loading workspace members...
              </p>
            )}

            {isError && (
              <div>
                <p
                  style={{
                    color: 'var(--color-error)',
                    fontSize: 'var(--text-sm)',
                    marginBottom: 'var(--space-8)',
                  }}
                >
                  Failed to load workspace members.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </div>
            )}

            {!isLoading && !isError && (
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                disabled={
                  transferMutation.isPending ||
                  selectableMembers.length === 0
                }
                style={{
                  width: '100%',
                  padding: 'var(--space-8) var(--space-12)',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--text-md)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="" disabled>
                  Select member
                </option>

                {selectableMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName} (@
                    {member.username})
                  </option>
                ))}
              </select>
            )}

            {!isLoading &&
              !isError &&
              selectableMembers.length === 0 && (
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    marginTop: 'var(--space-8)',
                  }}
                >
                  No eligible members available for ownership transfer.
                </p>
              )}
          </div>

          {selectedMember && (
            <div
              style={{
                padding: 'var(--space-12)',
                backgroundColor: 'var(--color-warning-light)',
                borderRadius: '6px',
                marginTop: 'var(--space-8)',
              }}
            >
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-warning)',
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                After transfer:
              </p>

              <ul
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-warning)',
                  marginLeft: 'var(--space-24)',
                  marginTop: 'var(--space-4)',
                }}
              >
                <li>You will become ADMIN.</li>
                <li>The selected member will become OWNER.</li>
              </ul>
            </div>
          )}

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
              onClick={handleClose}
              disabled={transferMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                transferMutation.isPending ||
                isLoading ||
                isError ||
                !selectedMemberId
              }
              style={{
                backgroundColor: 'var(--color-error)',
                color: 'white',
                border: 'none',
              }}
            >
              {transferMutation.isPending
                ? 'Transferring...'
                : 'Transfer Ownership'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
