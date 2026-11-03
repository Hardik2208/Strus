import React, { useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useInviteMember } from '../../hooks/useWorkspace';
import toast from 'react-hot-toast';

export const InviteMemberModal: React.FC<{ 
  workspaceId: string; 
  workspaceName: string;
  isOpen: boolean; 
  onClose: () => void 
}> = ({ workspaceId, workspaceName, isOpen, onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const inviteMutation = useInviteMember(workspaceId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter a username or email');
      return;
    }
    
    try {
      await inviteMutation.mutateAsync({ identifier: identifier.trim() });
      toast.success('Invitation sent');
      setIdentifier('');
      onClose();
    } catch (error: any) {
      const code = error?.response?.data?.code || error?.response?.data?.message || '';
      
      let message = 'Failed to send invitation';
      if (code.includes('USER_NOT_FOUND')) {
        message = 'User could not be found.';
      } else if (code.includes('MEMBER_ALREADY_EXISTS')) {
        message = 'This user is already a workspace member.';
      } else if (code.includes('INVITATION_ALREADY_EXISTS')) {
        message = 'A pending invitation already exists.';
      } else if (code.includes('PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED')) {
        message = 'Invitations are not available for Personal Workspace.';
      } else if (code.includes('INSUFFICIENT_PERMISSIONS')) {
        message = 'You are not allowed to invite members.';
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      }
      
      toast.error(message);
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
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-8)' }}>Invite to {workspaceName}</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-24)' }}>
          The person must already have a Strus account. They will be invited as a MEMBER.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-4)' }}>
              Username or email
            </label>
            <Input 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="workspaceuser1@example.com"
              disabled={inviteMutation.isPending}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)', marginTop: 'var(--space-8)' }}>
            <Button type="button" variant="outline" onClick={onClose} disabled={inviteMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
