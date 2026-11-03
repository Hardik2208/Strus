import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { type Project } from '../../project/types/project.types';

interface ProfessionalProjectCardProps {
  project: Project;
}

export const ProfessionalProjectCard: React.FC<ProfessionalProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  const handleViewProject = () => {
    navigate(`/dashboard/professional/projects/${project.id}`);
  };

  const statusColor = project.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-text-secondary)';
  const statusBg = project.status === 'ACTIVE' ? 'var(--color-success-light)' : 'var(--color-surface-subtle)';

  return (
    <Card style={{ padding: 'var(--space-16)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {project.title}
        </h3>
        <div style={{
          padding: 'var(--space-4) var(--space-8)',
          backgroundColor: statusBg,
          color: statusColor,
          borderRadius: '4px',
          fontSize: 'var(--text-xs)',
          fontWeight: 600
        }}>
          {project.status}
        </div>
      </div>
      
      {project.description && (
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.description}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', marginTop: 'var(--space-8)' }}>
        <div>
          <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Workspace</span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{project.workspace?.name || 'Unknown Workspace'}</span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Last Updated</span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Project ID</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{project.id}</span>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-16)' }}>
        <Button onClick={handleViewProject} variant="primary" style={{ width: '100%' }}>
          View Project
        </Button>
      </div>
    </Card>
  );
};
