import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';

import { useWorkspaceDetail } from '../hooks/useWorkspace';
import { useWorkspaceRealtime } from '../hooks/useWorkspaceRealtime';

import { WorkspaceHeader } from '../components/WorkspaceHeader';
import { OverviewTab } from '../components/tabs/OverviewTab';
import { MembersTab } from '../components/tabs/MembersTab';
import { InvitationsTab } from '../components/tabs/InvitationsTab';
import { ActivityTab } from '../components/tabs/ActivityTab';
import { SettingsTab } from '../components/tabs/SettingsTab';
import { WorkspaceProjectsTab } from '../components/tabs/WorkspaceProjectsTab';

import { WorkspaceCommunicationTab } from '../../communication/pages/WorkspaceCommunicationTab';

import { Button } from '../../../components/ui/Button';

type WorkspaceTab =
  | 'overview'
  | 'projects'
  | 'communication'
  | 'members'
  | 'invitations'
  | 'activity'
  | 'settings';

export const WorkspaceDetailPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const [activeTab, setActiveTab] =
    useState<WorkspaceTab>('overview');

  const {
    data: workspace,
    isLoading,
    isError,
  } = useWorkspaceDetail(workspaceId || '');

  useWorkspaceRealtime(workspaceId);

  const isPersonal = workspace?.workspaceType === 'PERSONAL';
  const isOwner = workspace?.myRole === 'OWNER';
  const memberRole = workspace?.myRole;

  const tabs: { id: WorkspaceTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects' },
    { id: 'communication', label: 'Communication' },

    ...(!isPersonal
      ? [{ id: 'members' as const, label: 'Members' }]
      : []),

    ...(!isPersonal && isOwner
      ? [{ id: 'invitations' as const, label: 'Invitations' }]
      : []),

    { id: 'activity', label: 'Activity' },
    { id: 'settings', label: 'Settings' },
  ];

  useEffect(() => {
    const activeTabAvailable = tabs.some(
      (tab) => tab.id === activeTab
    );

    if (!activeTabAvailable) {
      setActiveTab('overview');
    }
  }, [activeTab, isPersonal, isOwner]);

  if (!workspaceId) {
    return <Navigate to="/workspaces" replace />;
  }

  if (isLoading) {
    return (
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'var(--space-24) 0',
        }}
      >
        <div
          style={{
            height: '120px',
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: '8px',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        />
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'var(--space-24) 0',
          textAlign: 'center',
        }}
      >
        <h3
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            marginBottom: 'var(--space-8)',
          }}
        >
          Workspace not found or you no longer have access to it.
        </h3>

        <Button
          variant="outline"
          onClick={() => {
            window.location.href = '/workspaces';
          }}
        >
          Return to Workspaces
        </Button>
      </div>
    );
  }

  if (!memberRole) {
    return (
      <div
        style={{
          padding: 'var(--space-24)',
          textAlign: 'center',
        }}
      >
        Unable to determine your workspace permissions. Please refresh.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <WorkspaceHeader
        workspace={workspace}
        memberRole={memberRole}
        isPersonal={isPersonal}
      />

      <div
        style={{
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          gap: 'var(--space-24)',
          marginBottom: 'var(--space-32)',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom:
                activeTab === tab.id
                  ? '2px solid var(--color-primary)'
                  : '2px solid transparent',
              padding: 'var(--space-12) 0',
              fontSize: 'var(--text-sm)',
              fontWeight: activeTab === tab.id ? 600 : 500,
              color:
                activeTab === tab.id
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'overview' && (
          <OverviewTab
            workspace={workspace}
            memberRole={memberRole}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'projects' && (
          <WorkspaceProjectsTab
            workspace={workspace}
            memberRole={memberRole}
          />
        )}

        {activeTab === 'communication' && (
          <WorkspaceCommunicationTab
            memberRole={memberRole}
          />
        )}

        {activeTab === 'members' && !isPersonal && (
          <MembersTab
            workspace={workspace}
            memberRole={memberRole}
          />
        )}

        {activeTab === 'invitations' && !isPersonal && isOwner && (
          <InvitationsTab workspace={workspace} />
        )}

        {activeTab === 'activity' && (
          <ActivityTab workspace={workspace} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            workspace={workspace}
            memberRole={memberRole}
          />
        )}
      </div>
    </div>
  );
};