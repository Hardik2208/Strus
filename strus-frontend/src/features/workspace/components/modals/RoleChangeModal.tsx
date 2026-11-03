import React from 'react';
import { Button } from '../../../../components/ui/Button';
import { useUpdateMemberRole } from '../../hooks/useWorkspace';
import toast from 'react-hot-toast';

export const RoleChangeModal: React.FC<{ 
  workspaceId: string;
  memberId: string;
  memberName: string;
  currentRole: string;
  newRole: 'ADMIN' | 'MEMBER';
  isOpen: boolean; 
  onClose: () => void;
}> = ({ workspaceId, memberId, memberName, currentRole, newRole, isOpen, onClose }) => {
  const updateRoleMutation = useUpdateMemberRole(workspaceId);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await updateRoleMutation.mutateAsync({ memberId, data: { role: newRole } });
      toast.success('Role updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update role');
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
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-8)' }}>Change Workspace Role</h2>
        
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-24)', lineHeight: 1.5 }}>
          <p style={{ marginBottom: 'var(--space-12)' }}>
            Change <strong style={{ color: 'var(--color-text-primary)' }}>{memberName}</strong> from <strong style={{ color: 'var(--color-text-primary)' }}>{currentRole}</strong> to <strong style={{ color: 'var(--color-text-primary)' }}>{newRole}</strong>?
          </p>
          {newRole === 'ADMIN' && (
            <p>This gives the user administrative capabilities in this workspace.</p>
          )}
          {newRole === 'MEMBER' && (
            <p>This removes administrative capabilities for the user in this workspace.</p>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)', marginTop: 'var(--space-8)' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={updateRoleMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={updateRoleMutation.isPending}
          >
            {updateRoleMutation.isPending ? 'Saving...' : 'Confirm Change'}
          </Button>
        </div>
      </div>
    </div>
  );
};
