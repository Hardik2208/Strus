
import React from 'react';
import {
  useParams,
  useNavigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { useProjectDetail } from '../../project/hooks/useProjectQueries';
import { ProjectSetupProgress } from '../../project/components/ProjectSetupProgress';

export const ProfessionalProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: project,
    isLoading,
    isError,
  } = useProjectDetail(projectId || '');

  if (isLoading) {
    return (
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'var(--space-24)',
        }}
      >
        <div
          style={{
            height: '200px',
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: '8px',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'var(--space-24)',
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
          {isError
            ? "You don't have permission to access this project."
            : 'Project not found.'}
        </h3>

        <button
          onClick={() => navigate('/dashboard/professional/projects')}
          style={{
            padding: 'var(--space-8) var(--space-16)',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Return to Projects
        </button>
      </div>
    );
  }

  const tabs = [
    'overview',
    'agreement',
    'execution',
    'communication',
    'activity',
  ];

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-24)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 'var(--space-24)',
        }}
      >
        <div style={{ minWidth: 0, width: '100%' }}>
          <button
            onClick={() =>
              navigate('/dashboard/professional/projects')
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginBottom: 'var(--space-12)',
            }}
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-16)',
              flexWrap: 'wrap',
            }}
          >
            <h1
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {project.title}
            </h1>

            <div
              style={{
                padding: 'var(--space-4) var(--space-8)',
                backgroundColor:
                  project.status === 'ACTIVE'
                    ? 'var(--color-success-light)'
                    : 'var(--color-surface-subtle)',
                color:
                  project.status === 'ACTIVE'
                    ? 'var(--color-success)'
                    : 'var(--color-text-secondary)',
                borderRadius: '4px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
              }}
            >
              Status: {project.status}
            </div>
          </div>

          <p
            style={{
              marginTop: 'var(--space-8)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              overflowWrap: 'anywhere',
            }}
          >
            Workspace ID: {project.workspaceId}
          </p>
        </div>
      </div>

      {project.status === 'DRAFT' && (
        <div style={{ marginBottom: 'var(--space-24)' }}>
          <ProjectSetupProgress currentStage={project.setupStage} />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-24)',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: 'var(--space-24)',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => {
          const isActive =
            location.pathname.endsWith(`/${tab}`);

          return (
            <button
              key={tab}
              onClick={() =>
                navigate(
                  `/dashboard/professional/projects/${projectId}/${tab}`
                )
              }
              style={{
                padding: 'var(--space-12) 0',
                background: 'none',
                border: 'none',
                borderBottom: isActive
                  ? '2px solid var(--color-primary)'
                  : '2px solid transparent',
                color: isActive
                  ? 'var(--color-primary)'
                  : 'var(--color-text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 'var(--space-24)' }}>
        <Outlet />
      </div>
    </div>
  );
};
