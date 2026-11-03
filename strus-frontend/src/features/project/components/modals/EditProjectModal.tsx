import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useUpdateProject } from '../../hooks/useProjectMutations';
import type { Project, UpdateProjectDTO } from '../../types/project.types';

const updateProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().nullable(),
});

type UpdateProjectForm = z.infer<typeof updateProjectSchema>;

interface EditProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, isOpen, onClose }) => {
  const updateMutation = useUpdateProject();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateProjectForm>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      title: project.title,
      description: project.description
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({ title: project.title, description: project.description });
    }
  }, [isOpen, project, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: UpdateProjectForm) => {
    try {
      const payload: UpdateProjectDTO = {
        title: data.title,
        description: data.description ?? undefined,
      };
      await updateMutation.mutateAsync({ projectId: project.id, data: payload });
      toast.success('Project updated successfully.');
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update project.');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 'var(--space-16)'
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-24)',
        width: '100%',
        maxWidth: '500px',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--color-text-primary)'
      }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-24)', marginTop: 0 }}>Edit Project</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <Input 
            label="Project Title"
            error={errors.title?.message}
            {...register('title')}
          />
          
          <div className="input-group">
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
              Description
            </label>
            <textarea
              style={{
                width: '100%',
                padding: 'var(--space-12)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                minHeight: '100px',
                fontFamily: 'inherit',
                fontSize: '14px',
                resize: 'vertical'
              }}
              {...register('description')}
            />
            {errors.description?.message && (
              <span style={{ display: 'block', color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>
                {errors.description.message}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
            <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
