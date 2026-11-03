import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import type { Project, ProjectStatus, ProjectSetupStage } from '../types/project.types';
import { format, parseISO } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  workspaceId: string;
  creatorName: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, workspaceId, creatorName }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'DRAFT': return { bg: 'var(--color-surface-subtle)', color: 'var(--color-text-secondary)' };
      case 'ACTIVE': return { bg: 'var(--color-success-light)', color: 'var(--color-success)' };
      case 'COMPLETED': return { bg: 'var(--color-info-light)', color: 'var(--color-info)' };
      case 'CANCELLED': return { bg: 'var(--color-error-light)', color: 'var(--color-error)' };
      case 'MUTUALLY_TERMINATED': return { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' };
      default: return { bg: 'var(--color-surface-subtle)', color: 'var(--color-text-secondary)' };
    }
  };

  const getSetupStageLabel = (stage: ProjectSetupStage) => {
    switch (stage) {
      case 'PROJECT_CREATED': return 'Project Created';
      case 'AGREEMENT_COMPLETED': return 'Agreement Completed';
      case 'PROFESSIONALS_ASSIGNED': return 'Professionals Added';
      case 'MILESTONES_CREATED': return 'Execution Plan Created';
      case 'READY_TO_START': return 'Ready to Start';
      default: return stage;
    }
  };

  const statusColors = getStatusColor(project.status);

  return (
    <Card style={{ padding: 'var(--space-16)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-16)' }}>
        <div style={{ flex: 1 }}>
          <button 
            onClick={() => navigate(`/workspaces/${workspaceId}/projects/${project.id}`)}
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: 0, 
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit'
            }}
          >
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              color: 'var(--color-primary)', 
              margin: '0 0 4px 0',
              textDecoration: 'none'
            }}>
              {project.title}
            </h3>
          </button>
          {project.description && (
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--color-text-secondary)', 
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {project.description}
            </p>
          )}
        </div>

        <span style={{
          backgroundColor: statusColors.bg,
          color: statusColors.color,
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 600,
          whiteSpace: 'nowrap'
        }}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {getSetupStageLabel(project.setupStage)}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
            Created by {creatorName}
          </span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
          {format(parseISO(project.createdAt), 'MMM d, yyyy')}
        </span>
      </div>
    </Card>
  );
};
