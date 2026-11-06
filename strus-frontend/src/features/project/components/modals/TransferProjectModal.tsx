import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../../../components/ui/Button';
import { useTransferProject } from '../../hooks/useProjectMutations';
import { useWorkspacesList } from '../../../workspace/hooks/useWorkspace';

interface TransferProjectModalProps {
  projectId: string;
  projectTitle: string;
  currentWorkspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TransferProjectModal: React.FC<TransferProjectModalProps> = ({ 
  projectId, projectTitle, currentWorkspaceId, isOpen, onClose, onSuccess 
}) => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  
  const { data: workspacesData, isLoading: isLoadingWorkspaces } = useWorkspacesList(1, 50);
  const transferMutation = useTransferProject();

  if (!isOpen) return null;

  // Filter workspaces: Must be TEAM workspace, user must have OWNER/ADMIN role, and cannot be the current workspace
  const eligibleWorkspaces =
  workspacesData?.workspaces?.filter(
    (workspace) =>
      workspace.workspaceType === 'TEAM' &&
      workspace.id !== currentWorkspaceId
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceId) {
      toast.error('Please select a destination workspace');
      return;
    }

    try {
      await transferMutation.mutateAsync({ projectId, destinationWorkspaceId: selectedWorkspaceId });
      toast.success('Project transferred successfully.');
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to transfer project.');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 'var(--space-16)'
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
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-8)' }}>Transfer Project</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            <p style={{ marginBottom: 'var(--space-12)' }}>You are about to transfer the project:</p>
            <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-12)' }}>{projectTitle}</p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-4)' }}>
              Select a destination Team Workspace:
            </label>
            <select 
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              disabled={transferMutation.isPending || isLoadingWorkspaces}
              style={{
                width: '100%',
                padding: 'var(--space-8) var(--space-12)',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-md)',
                backgroundColor: 'transparent'
              }}
            >
              <option value="" disabled>Select workspace ▼</option>
              {eligibleWorkspaces.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            {eligibleWorkspaces.length === 0 && !isLoadingWorkspaces && (
              <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>
                You don't have any eligible Team Workspaces to transfer to.
              </p>
            )}
          </div>

          <div style={{ padding: 'var(--space-12)', backgroundColor: 'var(--color-warning-light)', borderRadius: '6px', marginTop: 'var(--space-8)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning)', fontWeight: 500, lineHeight: 1.4 }}>
              Warning:
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning)', marginTop: 'var(--space-4)', lineHeight: 1.4 }}>
              Transferring this project will move it to the selected workspace. You must be the project creator and the project must be in DRAFT state.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)', marginTop: 'var(--space-8)' }}>
            <Button type="button" variant="outline" onClick={onClose} disabled={transferMutation.isPending}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={transferMutation.isPending || !selectedWorkspaceId || eligibleWorkspaces.length === 0}
              style={{ backgroundColor: 'var(--color-error)', color: 'white', border: 'none' }}
            >
              {transferMutation.isPending ? 'Transferring...' : 'Transfer Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
