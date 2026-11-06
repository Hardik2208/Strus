import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { EmptyState } from './EmptyStates';
import type { ActiveProject } from '../../types/dashboard.types';
import { useNavigate } from 'react-router-dom';

export const ActiveProjectsWidget: React.FC<{ projects: ActiveProject[] }> = ({ projects }) => {
  const navigate = useNavigate();

  if (projects.length === 0) {
    return (
      <EmptyState 
        title="No active projects" 
        description="Your active projects will appear here once you begin working on a project." 
        action={
  <Button
    variant="outline"
    onClick={() => navigate('/dashboard/professional/projects')}
  >
    View Projects
  </Button>
}
      />
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-16)' }}>
      {projects.map((p) => (
        <Card key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              {/* Fallback to something if project name isn't directly on model, wait, id is there, but typically it has a name. Let's use workspace/client as requested, or assume the project has a name or we use ID. */}
              {p.workspaceName || `Project ${p.id.substring(0, 4)}`}
            </h4>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span>{p.workspaceName ? `${p.workspaceName} Workspace` : 'Workspace'}</span>
              <span>Client: {p.clientName || 'Unknown'}</span>
            </div>
          </div>
          
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Current milestone
            </span>
            <div style={{ fontSize: '14px', color: 'var(--color-text-primary)', marginTop: '2px' }}>
              {p.currentMilestoneName || 'No active milestone'}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Progress
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.progress}%</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${p.progress}%`, height: '100%', backgroundColor: 'var(--color-primary)' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 'var(--space-8)' }}>
             <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-success)' }}>
               {p.status || 'ACTIVE'}
             </span>
             <Button
  variant="outline"
  onClick={() =>
    navigate(`/dashboard/professional/projects/${p.id}/overview`)
  }
>
  Open Project
</Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
