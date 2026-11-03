import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectDetail } from '../../project/hooks/useProjectQueries';
import { useAuthStore } from '../../auth/store/auth.store';
import { useExecutionPlan } from '../hooks/useExecutionQueries';
import {
  useCreateExecutionPlan,
  useUpdateExecutionPlan,
  useDeleteExecutionPlan,
} from '../hooks/useExecutionMutations';
import { ExecutionPlanBuilder } from '../components/ExecutionPlanBuilder';
import { ExecutionPlanViewer } from '../components/ExecutionPlanViewer';
import { ProjectAssetsPanel } from '../components/ProjectAssetsPanel';
import { type CreateExecutionPlanDto, type Milestone } from '../types/execution.types';
import toast from 'react-hot-toast';
import { LayoutTemplate } from 'lucide-react';

export const ProjectExecutionTab: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthStore();

  const { data: project, isLoading: isProjectLoading } = useProjectDetail(projectId!);
  const { data: milestonesData = [], isLoading: isPlanLoading } = useExecutionPlan(
    projectId!,
    project?.setupStage
  );

  const createMutation = useCreateExecutionPlan(projectId!);
  const updateMutation = useUpdateExecutionPlan(projectId!);
  const deleteMutation = useDeleteExecutionPlan(projectId!);
  const milestones = milestonesData as Milestone[];

  // isEditing means we are showing the Builder over an existing plan (for updates)
  const [isEditing, setIsEditing] = useState(false);

  if (isProjectLoading || isPlanLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: '72px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-surface-subtle)',
              animation: 'pulse 1.5s infinite ease-in-out',
            }}
          />
        ))}
      </div>
    );
  }

  if (!project) return null;

  const isCreator = user?.id === project.createdById;
  const hasPlan = milestones.length > 0;
  const existingPlan: CreateExecutionPlanDto = {
    professionals: Object.values(
      milestones.reduce<Record<string, typeof milestones>>((groups, milestone) => {
        (groups[milestone.agreementParticipantId] ??= []).push(milestone);
        return groups;
      }, {})
    ).map((participantMilestones) => ({
      agreementParticipantId: participantMilestones[0]!.agreementParticipantId,
      milestones: participantMilestones
        .sort((a, b) => a.order - b.order)
        .map((milestone) => ({
          allocatedDays: milestone.allocatedDays,
          paymentAllocation: Number(milestone.paymentAllocation),
          revisionLimit: milestone.revisionLimit,
          dependencies: [],
          requirements: (milestone.requirements ?? []).map(({ content }) => ({ content })),
          deliverables: (milestone.deliverables ?? []).map(({ content, isMandatory }) => ({ content, isMandatory })),
          acceptanceCriteria: (milestone.acceptanceCriteria ?? []).map(({ content }) => ({ content })),
        })),
    })),
  };

  // --- Not yet reached the milestone creation stage ---
  if (
    project.setupStage === 'PROJECT_CREATED' ||
    project.setupStage === 'AGREEMENT_COMPLETED'
  ) {
    return (
      <div
        style={{
          padding: 'var(--space-32)',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface-subtle)',
          borderRadius: '12px',
        }}
      >
        <LayoutTemplate size={48} style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-16)' }} />
        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-8)' }}>
          Execution Plan Not Available Yet
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
          An execution plan can only be created after the agreement is finalised and professionals
          have been assigned to this project.
        </p>
      </div>
    );
  }

  // --- BUILDER: create mode (no plan exists) ---
  if (!hasPlan && !isEditing) {
    if (!isCreator) {
      return (
        <div
          style={{
            padding: 'var(--space-32)',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: '12px',
          }}
        >
          <LayoutTemplate size={48} style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-16)' }} />
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-8)' }}>
            No Execution Plan Yet
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            The project owner hasn't created the execution plan yet.
          </p>
        </div>
      );
    }

    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '6px' }}>
            Create Execution Plan
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Define milestones for each professional. The total payment allocation across all milestones
            must equal the agreement budget.
          </p>
        </div>
        <ExecutionPlanBuilder
          projectId={projectId!}
          onSubmit={async (dto: CreateExecutionPlanDto) => {
            try {
              await createMutation.mutateAsync(dto);
              toast.success('Execution plan created successfully!');
            } catch (error: any) {
              toast.error(error?.message ?? 'Unable to create the execution plan.');
            }
          }}
          onCancel={() => {}}
          isSubmitting={createMutation.isPending}
        />
      </div>
    );
  }

  // --- BUILDER: edit mode (plan exists, user clicked "Edit") ---
  if (isEditing && isCreator) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '6px' }}>
            Update Execution Plan
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Editing will replace the current execution plan. All existing milestone data will be
            overwritten.
          </p>
        </div>
        <ExecutionPlanBuilder
          projectId={projectId!}
          onSubmit={async (dto: CreateExecutionPlanDto) => {
            try {
              await updateMutation.mutateAsync(dto);
              toast.success('Execution plan updated successfully!');
              setIsEditing(false);
            } catch (error: any) {
              toast.error(error?.message ?? 'Unable to update the execution plan.');
            }
          }}
          onCancel={() => setIsEditing(false)}
          isSubmitting={updateMutation.isPending}
          initialData={existingPlan}
        />
      </div>
    );
  }

  // --- VIEWER: plan exists ---
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
    <ExecutionPlanViewer
        projectId={projectId!}
        milestones={milestones}
        isCreator={isCreator}
        onEdit={() => setIsEditing(true)}
        onDelete={async () => {
          if (!window.confirm('Are you sure you want to delete the entire execution plan?')) return;
          try {
            await deleteMutation.mutateAsync();
            toast.success('Execution plan deleted.');
          } catch {
            toast.error('Failed to delete execution plan.');
          }
        }}
        isDeleting={deleteMutation.isPending}
      />
    <ProjectAssetsPanel projectId={projectId!} isCreator={isCreator} />
  </div>;
};
