
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useProjectDetail } from '../hooks/useProjectQueries';
import { useDeleteProject } from '../hooks/useProjectMutations';
import { useAuthStore } from '../../auth/store/auth.store';

import { EditProjectModal } from '../components/modals/EditProjectModal';
import { TransferProjectModal } from '../components/modals/TransferProjectModal';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

import {
  Edit2,
  Trash2,
  Send,
  AlertTriangle,
} from 'lucide-react';

import toast from 'react-hot-toast';
import { useWorkspaceDetail } from '../../workspace/hooks/useWorkspace';

export const ProjectSettingsTab: React.FC = () => {
  const { workspaceId, projectId } = useParams<{
    workspaceId: string;
    projectId: string;
  }>();

  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Project details
  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useProjectDetail(projectId || '');

  // Source workspace details
  // This hook must remain above all conditional returns.
  const {
    data: sourceWorkspace,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
  } = useWorkspaceDetail(workspaceId || '');

  const deleteMutation = useDeleteProject();

  // Loading state
  if (isProjectLoading || isWorkspaceLoading) {
    return (
      <div
        style={{
          height: '200px',
          backgroundColor: 'var(--color-surface-subtle)',
          borderRadius: '8px',
          animation: 'pulse 1.5s infinite ease-in-out',
        }}
      />
    );
  }

  // Error and missing-data states
  if (isProjectError || !project) {
    return (
      <Card style={{ padding: 'var(--space-24)' }}>
        <p style={{ color: 'var(--color-error)' }}>
          Unable to load project settings. Please try again.
        </p>
      </Card>
    );
  }

  if (isWorkspaceError || !sourceWorkspace) {
    return (
      <Card style={{ padding: 'var(--space-24)' }}>
        <p style={{ color: 'var(--color-error)' }}>
          Unable to load workspace information. Project settings cannot be displayed.
        </p>
      </Card>
    );
  }

  const isCreator = user?.id === project.createdById;
  const isDraft = project.status === 'DRAFT';

  // Transfer is permitted only from a PERSONAL workspace.
  const canTransfer =
    isCreator &&
    isDraft &&
    sourceWorkspace.workspaceType === 'PERSONAL';

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this project? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(project.id);

      toast.success('Project deleted successfully');

      navigate(`/workspaces/${workspaceId}`);
    } catch (error: unknown) {
      const message =
        (error as any)?.response?.data?.message ||
        'Failed to delete project';

      toast.error(message);
    }
  };

  // Only the creator can modify project settings.
  if (!isCreator) {
    return (
      <div
        style={{
          padding: 'var(--space-32)',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface-subtle)',
          borderRadius: '8px',
        }}
      >
        <p style={{ color: 'var(--color-text-tertiary)' }}>
          Only the project creator can view or modify project settings.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-24)',
        maxWidth: '800px',
      }}
    >
      {/* Edit Project Details */}
      <Card style={{ padding: 'var(--space-24)' }}>
        <h3
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            marginBottom: 'var(--space-8)',
          }}
        >
          Project Details
        </h3>

        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-16)',
          }}
        >
          Update the title and description of your project.
        </p>

        <Button
          onClick={() => setIsEditModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)',
          }}
        >
          <Edit2 size={16} />
          Edit Details
        </Button>
      </Card>

      {/* Transfer Project */}
      {canTransfer && (
        <Card style={{ padding: 'var(--space-24)' }}>
          <h3
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              marginBottom: 'var(--space-8)',
            }}
          >
            Transfer Project
          </h3>

          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--space-16)',
            }}
          >
            Transfer this draft project from your personal workspace
            to a team workspace where you are a member.
          </p>

          <Button
            variant="outline"
            onClick={() => setIsTransferModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-8)',
            }}
          >
            <Send size={16} />
            Transfer Project
          </Button>
        </Card>
      )}

      {/* Danger Zone */}
      <Card
        style={{
          padding: 'var(--space-24)',
          border: '1px solid var(--color-error-light)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-8)',
          }}
        >
          <AlertTriangle
            size={18}
            style={{ color: 'var(--color-error)' }}
          />

          <h3
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              color: 'var(--color-error)',
            }}
          >
            Danger Zone
          </h3>
        </div>

        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-16)',
          }}
        >
          Once you delete a project, there is no going back. Please be certain.
        </p>

        <Button
          variant="outline"
          disabled={deleteMutation.isPending}
          style={{
            color: 'var(--color-error)',
            borderColor: 'var(--color-error-light)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)',
          }}
          onClick={handleDelete}
        >
          <Trash2 size={16} />
          {deleteMutation.isPending ? 'Deleting...' : 'Delete Project'}
        </Button>
      </Card>

      {/* Edit Modal */}
      <EditProjectModal
        project={project}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Transfer Modal */}
      {canTransfer && (
        <TransferProjectModal
          projectId={project.id}
          projectTitle={project.title}
          currentWorkspaceId={workspaceId!}
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          onSuccess={() => navigate(`/workspaces/${workspaceId}`)}
        />
      )}
    </div>
  );
};
