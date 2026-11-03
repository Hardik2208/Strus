import React from 'react';
import { useParams } from 'react-router-dom';
import { useProjectDetail } from '../hooks/useProjectQueries';
import { useWorkspaceDetail } from '../../workspace/hooks/useWorkspace';
import { Card } from '../../../components/ui/Card';
import { format, parseISO } from 'date-fns';

export const ProjectOverviewTab: React.FC = () => {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  
  const { data: project, isLoading: isProjectLoading } = useProjectDetail(projectId!);
  const { data: workspace, isLoading: isWorkspaceLoading } = useWorkspaceDetail(workspaceId!);
  
  if (isProjectLoading || isWorkspaceLoading || !project) {
    return (
      <div style={{ height: '200px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-24)', alignItems: 'start' }}>
      {/* Left Column - Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
        <Card style={{ padding: 'var(--space-24)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-16)', color: 'var(--color-text-primary)' }}>
            Project Description
          </h3>
          <div style={{ 
            fontSize: 'var(--text-md)', 
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}>
            {project.description || <span style={{ fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}>No description provided.</span>}
          </div>
        </Card>
      </div>

      {/* Right Column - Meta Information */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
        <Card style={{ padding: 'var(--space-24)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-16)', color: 'var(--color-text-primary)' }}>
            Project Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>Workspace</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{workspace?.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>Created</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{format(parseISO(project.createdAt), 'MMM d, yyyy')}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>Status</div>
              <div style={{ 
                display: 'inline-block',
                padding: 'var(--space-4) var(--space-8)',
                backgroundColor: project.status === 'ACTIVE' ? 'var(--color-success-light)' : 'var(--color-surface-subtle)',
                color: project.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-text-secondary)',
                borderRadius: '4px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600
              }}>
                {project.status}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
