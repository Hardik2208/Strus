import React from 'react';
import type { WorkspaceDetail } from '../../types/workspace.types';
import { useWorkspaceMembers, useWorkspaceInvitations, useWorkspaceAudit } from '../../hooks/useWorkspace';
import { workspacePermissions } from '../../utils/workspace-permissions';
import { Button } from '../../../../components/ui/Button';

export const OverviewTab: React.FC<{ 
  workspace: WorkspaceDetail;
  memberRole: string;
  onNavigate: (tab: any) => void;
}> = ({ workspace, memberRole, onNavigate }) => {
  const isPersonal = workspace.workspaceType === 'PERSONAL';
  
  const { data: membersData } = useWorkspaceMembers(workspace.id, 1, 1);
  const { data: auditData } = useWorkspaceAudit(workspace.id, 1, 5);
  
  const canSeeInvitations = workspacePermissions.canInviteMembers(workspace, memberRole);
  // Optional chaining is fine, we just use the length
  const { data: invitationsData } = useWorkspaceInvitations(workspace.id); 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)', maxWidth: '1000px' }}>
      
      {/* Top summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-24)' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-24)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 'var(--space-8)' }}>Workspace Name</h3>
          <p style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{workspace.name}</p>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-24)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 'var(--space-8)' }}>Type & Role</h3>
          <p style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {workspace.workspaceType} <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-md)', fontWeight: 400 }}>· {memberRole}</span>
          </p>
        </div>

        {!isPersonal && (
          <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-24)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 'var(--space-8)' }}>Members</h3>
            <p style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {membersData?.pagination?.total || 0}
            </p>
          </div>
        )}

        {canSeeInvitations && (
          <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-24)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 'var(--space-8)' }}>Pending Invitations</h3>
            <p style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {invitationsData?.invitations?.length || 0}
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-24)' }}>
        
        {/* Description & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
          <section>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-12)' }}>Description</h3>
            <p style={{ fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {workspace.description || 'No description provided.'}
            </p>
          </section>

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Recent Activity</h3>
              <Button variant="outline" onClick={() => onNavigate('activity')} style={{ padding: '6px 12px', fontSize: '12px' }}>View All</Button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
              {auditData?.logs?.length ? auditData.logs.map((log) => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-12)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', marginTop: '6px' }} />
                  <div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                      <span style={{ fontWeight: 600 }}>{log.actor?.firstName}</span> {log.action.toLowerCase().replace(/_/g, ' ')}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>No recent activity.</p>
              )}
            </div>
          </section>
        </div>

        {/* Quick Actions Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Quick Actions</h3>
          
          {!isPersonal && (
            <Button variant="outline" onClick={() => onNavigate('members')} style={{ justifyContent: 'flex-start', width: '100%' }}>
              View Members
            </Button>
          )}
          {canSeeInvitations && (
            <Button variant="outline" onClick={() => onNavigate('invitations')} style={{ justifyContent: 'flex-start', width: '100%' }}>
              Manage Invitations
            </Button>
          )}
          <Button variant="outline" onClick={() => onNavigate('settings')} style={{ justifyContent: 'flex-start', width: '100%' }}>
            Workspace Settings
          </Button>
          
          <div style={{ marginTop: 'var(--space-16)', padding: 'var(--space-16)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Created on</p>
            <p style={{ fontSize: 'var(--text-md)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {new Date(workspace.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + new Date(workspace.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'})}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
