import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WorkspaceDetail } from '../types/workspace.types';
import { MoreHorizontal } from 'lucide-react';
import { workspacePermissions } from '../utils/workspace-permissions';
import { TransferOwnershipModal } from './modals/TransferOwnershipModal';
import { LeaveWorkspaceModal } from './modals/LeaveWorkspaceModal';
import { DeleteWorkspaceModal } from './modals/DeleteWorkspaceModal';

export const WorkspaceHeader: React.FC<{ 
  workspace: WorkspaceDetail;
  memberRole?: string;
  isPersonal: boolean;
}> = ({ workspace, memberRole = 'MEMBER', isPersonal }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showTransfer = !isPersonal && workspacePermissions.canTransferOwnership(workspace, memberRole);
  const showLeave = !isPersonal && workspacePermissions.canLeaveWorkspace(workspace, memberRole);
  const showDelete = !isPersonal && workspacePermissions.canDeleteWorkspace(workspace, memberRole);
  
  const hasActions = showTransfer || showLeave || showDelete;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)', marginBottom: 'var(--space-32)' }}>
      <button 
        onClick={() => navigate('/workspaces')}
        style={{ 
          background: 'none', border: 'none', color: 'var(--color-text-secondary)', 
          cursor: 'pointer', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: '4px',
          width: 'fit-content', padding: 0
        }}
      >
        ← Back to Workspaces
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {workspace.name}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-4)', maxWidth: '600px' }}>
            {workspace.description || (isPersonal ? 'Your private workspace.' : 'Collaborative team workspace.')}
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-12)' }}>
            <span style={{ 
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', padding: '2px 8px', borderRadius: '12px', 
              backgroundColor: isPersonal ? 'var(--color-surface-subtle)' : 'var(--color-primary-light)',
              color: isPersonal ? 'var(--color-text-secondary)' : 'var(--color-primary)'
            }}>
              {workspace.workspaceType}
            </span>
            {memberRole && (
              <span style={{ 
                fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', 
                backgroundColor: 'var(--color-surface-subtle)', color: 'var(--color-text-secondary)'
              }}>
                👤 {memberRole}
              </span>
            )}
          </div>
        </div>

        {hasActions && (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '4px',
                padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-secondary)'
              }}
            >
              <MoreHorizontal size={20} />
            </button>

            {isMenuOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
                minWidth: '180px', zIndex: 50, padding: '4px 0'
              }}>
                {showTransfer && (
                  <button 
                    onClick={() => { setIsTransferModalOpen(true); setIsMenuOpen(false); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}
                  >
                    Transfer Ownership
                  </button>
                )}
                {showLeave && (
                  <button 
                    onClick={() => { setIsLeaveModalOpen(true); setIsMenuOpen(false); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}
                  >
                    Leave Workspace
                  </button>
                )}
                {showDelete && (
                  <button 
                    onClick={() => { setIsDeleteModalOpen(true); setIsMenuOpen(false); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}
                  >
                    Delete Workspace
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

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
