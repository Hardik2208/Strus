import React, { useState, useEffect } from 'react';
import { useUpdateWorkspace } from '../../hooks/useWorkspace';
import type { WorkspaceDetail } from '../../types/workspace.types';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import toast from 'react-hot-toast';
import { TransferOwnershipModal } from '../modals/TransferOwnershipModal';
import { LeaveWorkspaceModal } from '../modals/LeaveWorkspaceModal';
import { DeleteWorkspaceModal } from '../modals/DeleteWorkspaceModal';
import { workspacePermissions } from '../../utils/workspace-permissions';

export const SettingsTab: React.FC<{ workspace: WorkspaceDetail; memberRole: string }> = ({ workspace, memberRole }) => {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || '');
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const updateMutation = useUpdateWorkspace(workspace.id);

  const isPersonal = workspace.workspaceType === 'PERSONAL';

  useEffect(() => {
    setName(workspace.name);
    setDescription(workspace.description || '');
  }, [workspace]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      toast.error('Name must be at least 3 characters');
      return;
    }
    try {
      await updateMutation.mutateAsync({
  name: name.trim(),
  description: description.trim(),
});
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update workspace');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-48)', maxWidth: '800px' }}>
      
      {!isPersonal && workspacePermissions.canEditWorkspace(workspace, memberRole) && (
        <section>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-16)' }}>Workspace Information</h2>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-4)' }}>Workspace name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} disabled={updateMutation.isPending} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-4)' }}>Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={updateMutation.isPending}
                style={{ width: '100%', padding: 'var(--space-8) var(--space-12)', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: 'var(--text-md)', minHeight: '80px', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Button type="submit" disabled={updateMutation.isPending || (name === workspace.name && description === (workspace.description || ''))}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </section>
      )}

      {isPersonal && (
        <section>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-16)' }}>Workspace Information</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>This workspace is automatically associated with your account and cannot be transferred or deleted.</p>
        </section>
      )}

      {!isPersonal && workspacePermissions.canTransferOwnership(workspace, memberRole) && (
        <section>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-16)' }}>Ownership</h2>
          <div style={{ padding: 'var(--space-24)', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-16)' }}>Transfer ownership of this workspace to another member.</p>
            <Button variant="outline" onClick={() => setIsTransferModalOpen(true)}>Transfer Ownership</Button>
          </div>
        </section>
      )}

      {!isPersonal && (
        <section>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-error)', marginBottom: 'var(--space-16)' }}>Danger Zone</h2>
          <div style={{ padding: 'var(--space-24)', backgroundColor: 'var(--color-error-light)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-error)' }}>
            {workspacePermissions.canDeleteWorkspace(workspace, memberRole) ? (
              <>
                <h4 style={{ fontWeight: 600, color: 'var(--color-error)', marginBottom: 'var(--space-8)' }}>Delete Workspace</h4>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-16)' }}>Permanently delete this Team Workspace and remove all associated members and invitations.</p>
                <button onClick={() => setIsDeleteModalOpen(true)} style={{ padding: '8px 16px', backgroundColor: 'var(--color-error)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  Delete Workspace
                </button>
              </>
            ) : workspacePermissions.canLeaveWorkspace(workspace, memberRole) ? (
              <>
                <h4 style={{ fontWeight: 600, color: 'var(--color-error)', marginBottom: 'var(--space-8)' }}>Leave Workspace</h4>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-16)' }}>You will lose access to this workspace and its resources.</p>
                <button onClick={() => setIsLeaveModalOpen(true)} style={{ padding: '8px 16px', backgroundColor: 'var(--color-error)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  Leave Workspace
                </button>
              </>
            ) : (
              <p style={{ color: 'var(--color-text-secondary)' }}>You must transfer ownership before leaving this workspace.</p>
            )}
          </div>
        </section>
      )}

      <TransferOwnershipModal 
        workspaceId={workspace.id}
        workspaceName={workspace.name}
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
      <LeaveWorkspaceModal 
        workspaceId={workspace.id}
        workspaceName={workspace.name}
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
      />
      <DeleteWorkspaceModal 
        workspaceId={workspace.id}
        workspaceName={workspace.name}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
