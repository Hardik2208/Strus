import React from 'react';
import { Button } from '../../../../components/ui/Button';
import { useRemoveMember } from '../../hooks/useWorkspace';
import toast from 'react-hot-toast';

export const RemoveMemberModal: React.FC<{ 
  workspaceId: string;
  memberId: string;
  memberName: string;
  isOpen: boolean; 
  onClose: () => void;
}> = ({ workspaceId, memberId, memberName, isOpen, onClose }) => {
  const removeMutation = useRemoveMember(workspaceId);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await removeMutation.mutateAsync(memberId);
      toast.success('Member removed');
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-24)',
        width: '100%',
        maxWidth: '450px',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--color-text-primary)'
      }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-error)', marginBottom: 'var(--space-8)' }}>Remove Member?</h2>
        
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-24)', lineHeight: 1.5 }}>
          <p style={{ marginBottom: 'var(--space-12)' }}>
            Remove <strong style={{ color: 'var(--color-text-primary)' }}>{memberName}</strong>?
          </p>
          <p>They will immediately lose access to this workspace.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)', marginTop: 'var(--space-8)' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={removeMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={removeMutation.isPending}
            style={{ backgroundColor: 'var(--color-error)', color: 'white', border: 'none' }}
          >
            {removeMutation.isPending ? 'Removing...' : 'Remove Member'}
          </Button>
        </div>
      </div>
    </div>
  );
};
