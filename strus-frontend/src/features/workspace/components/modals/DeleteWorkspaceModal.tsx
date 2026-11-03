import React, { useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useDeleteWorkspace } from '../../hooks/useWorkspace';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const DeleteWorkspaceModal: React.FC<{ 
  workspaceId: string;
  workspaceName: string;
  isOpen: boolean; 
  onClose: () => void;
}> = ({ workspaceId, workspaceName, isOpen, onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const deleteMutation = useDeleteWorkspace(workspaceId);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== workspaceName) return;
    try {
      await deleteMutation.mutateAsync();
      toast.success('Workspace deleted');
      navigate('/workspaces');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete workspace');
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
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-error)', marginBottom: 'var(--space-8)' }}>Delete Workspace?</h2>
        
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-24)', lineHeight: 1.5 }}>
          <p style={{ marginBottom: 'var(--space-12)' }}>This permanently removes:</p>
          <ul style={{ marginLeft: 'var(--space-24)', marginBottom: 'var(--space-12)' }}>
            <li>workspace membership</li>
            <li>pending invitations</li>
            <li>workspace access</li>
          </ul>
          <p>This action cannot be undone.</p>
        </div>
        
        <div style={{ marginBottom: 'var(--space-16)' }}>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-4)' }}>
            Type the workspace name to confirm:
          </label>
          <Input 
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={workspaceName}
            disabled={deleteMutation.isPending}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)', marginTop: 'var(--space-8)' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            disabled={deleteMutation.isPending || confirmText !== workspaceName}
            style={{ backgroundColor: 'var(--color-error)', color: 'white', border: 'none' }}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Workspace'}
          </Button>
        </div>
      </div>
    </div>
  );
};
