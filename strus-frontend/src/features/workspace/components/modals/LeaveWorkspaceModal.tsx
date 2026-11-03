import React from 'react';
import { Button } from '../../../../components/ui/Button';
import { useLeaveWorkspace } from '../../hooks/useWorkspace';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const LeaveWorkspaceModal: React.FC<{ 
  workspaceId: string;
  workspaceName: string;
  isOpen: boolean; 
  onClose: () => void;
}> = ({ workspaceId, workspaceName, isOpen, onClose }) => {
  const leaveMutation = useLeaveWorkspace(workspaceId);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLeave = async () => {
    try {
      await leaveMutation.mutateAsync();
      toast.success('Left workspace');
      navigate('/workspaces');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to leave workspace');
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
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-error)', marginBottom: 'var(--space-8)' }}>Leave Workspace?</h2>
        
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-24)', lineHeight: 1.5 }}>
          <p style={{ marginBottom: 'var(--space-8)' }}>You will lose access to: <strong style={{ color: 'var(--color-text-primary)' }}>{workspaceName}</strong></p>
          <p>You will need another invitation to join again.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)', marginTop: 'var(--space-8)' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={leaveMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleLeave} 
            disabled={leaveMutation.isPending}
            style={{ backgroundColor: 'var(--color-error)', color: 'white', border: 'none' }}
          >
            {leaveMutation.isPending ? 'Leaving...' : 'Leave Workspace'}
          </Button>
        </div>
      </div>
    </div>
  );
};
