import React from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useProjectDetail } from '../hooks/useProjectQueries';
import { useUpdateProjectStatus } from '../hooks/useProjectMutations';
import { useWorkspaceDetail } from '../../workspace/hooks/useWorkspace';
import { useAuthStore } from '../../auth/store/auth.store';
import { ProjectSetupProgress } from '../components/ProjectSetupProgress';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ArrowLeft, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProjectDetailPage: React.FC = () => {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const { data: project, isLoading: isProjectLoading, isError } = useProjectDetail(projectId!);
  const { isLoading: isWorkspaceLoading } = useWorkspaceDetail(workspaceId!);
  
  const statusMutation = useUpdateProjectStatus();

  if (isProjectLoading || isWorkspaceLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-24)' }}>
        <div style={{ height: '200px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-24)', textAlign: 'center' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-8)' }}>Project not found.</h3>
        <Button variant="outline" onClick={() => navigate(`/workspaces/${workspaceId}`)}>Return to Workspace</Button>
      </div>
    );
  }

  const isCreator = user?.id === project.createdById;
  const isDraft = project.status === 'DRAFT';
  // The activation endpoint performs the final readiness validation and moves
  // MILESTONES_CREATED -> READY_TO_START within the same transaction. Showing
  // the CTA only at READY_TO_START made that transition unreachable from UI.
  const canStart =
    isDraft &&
    (project.setupStage === 'MILESTONES_CREATED' ||
      project.setupStage === 'READY_TO_START');

  const handleStartProject = async () => {
    try {
      await statusMutation.mutateAsync({ projectId: project.id, status: 'ACTIVE' });
      toast.success('Project started successfully! Status is now ACTIVE.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to start project');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-24)' }}>
        <div>
          <button 
            onClick={() => navigate(`/workspaces/${workspaceId}`)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 'var(--space-4)', 
              color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 'var(--space-12)'
            }}
          >
            <ArrowLeft size={16} /> Back to Workspace
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              {project.title}
            </h1>
            <div style={{
              padding: 'var(--space-4) var(--space-8)',
              backgroundColor: project.status === 'ACTIVE' ? 'var(--color-success-light)' : 'var(--color-surface-subtle)',
              color: project.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-text-secondary)',
              borderRadius: '4px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600
            }}>
              Status: {project.status}
            </div>
          </div>
        </div>
      </div>

      {/* Setup Progress */}
      {isDraft && <ProjectSetupProgress currentStage={project.setupStage} />}

      {/* Tabs Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-24)', 
        borderBottom: '1px solid var(--color-border)', 
        marginBottom: 'var(--space-24)',
        overflowX: 'auto'
      }}>
        {['overview', 'agreement', 'execution', 'communication', 'activity', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/${tab}`)}
            style={{
              padding: 'var(--space-12) 0',
              background: 'none',
              border: 'none',
              borderBottom: location.pathname.includes(`/${tab}`) ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: location.pathname.includes(`/${tab}`) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: location.pathname.includes(`/${tab}`) ? 600 : 500,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Start Project CTA (if creator and draft and ready) */}
      {isCreator && isDraft && canStart && (
        <Card style={{ padding: 'var(--space-24)', marginBottom: 'var(--space-24)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-primary-light)' }}>
          <div>
            <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
              Ready to start
            </h4>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
              All setup requirements are complete. You can now activate this project.
            </p>
          </div>
          <Button 
            onClick={handleStartProject}
            disabled={statusMutation.isPending}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}
          >
            <Play size={16} /> {statusMutation.isPending ? 'Activating...' : 'Activate Project'}
          </Button>
        </Card>
      )}

      {/* Outlet for Tab Content */}
      <div style={{ marginTop: 'var(--space-24)' }}>
        <Outlet />
      </div>
    </div>
  );
};
