import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateAgreement, useUpdateAgreement } from '../hooks/useAgreementMutations';
import type { Agreement, CreateAgreementRequest } from '../types/agreement.types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import toast from 'react-hot-toast';

interface AgreementFormProps {
  projectId: string;
  agreement?: Agreement;
  isOpen: boolean;
  onClose: () => void;
}

export const AgreementForm: React.FC<AgreementFormProps> = ({ projectId, agreement, isOpen, onClose }) => {
  const isEditing = !!agreement;
  const createMutation = useCreateAgreement(projectId);
  const updateMutation = useUpdateAgreement(projectId);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateAgreementRequest>({
    defaultValues: {
  title: agreement?.title || '',
  description: agreement?.description || '',
  scope: agreement?.scope || '',
  outOfScope: agreement?.outOfScope || '',
  budget: agreement?.budget ? Number(agreement.budget) : undefined,
  expectedDuration: agreement?.expectedDuration || undefined,
}
  });

  const onSubmit = async (data: CreateAgreementRequest) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data);
        toast.success('Agreement updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Agreement created successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} agreement`);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Agreement' : 'Create Agreement'}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-4)' }}>
            Agreement Title *
          </label>
          <Input 
            {...register('title', { required: 'Title is required' })} 
            placeholder="e.g. Backend Development Agreement" 
            style={{ width: '100%' }}
          />
          {errors.title && <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)' }}>{errors.title.message}</span>}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-4)' }}>
            Description *
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            placeholder="Provide a general overview of the agreement..."
            style={{ 
              width: '100%', 
              minHeight: '100px', 
              padding: 'var(--space-8) var(--space-12)', 
              borderRadius: '6px', 
              border: '1px solid var(--color-border)',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          {errors.description && <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)' }}>{errors.description.message}</span>}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-4)' }}>
            Scope of Work *
          </label>
          <textarea
            {...register('scope', { required: 'Scope is required' })}
            placeholder="List what is included in this agreement..."
            style={{ 
              width: '100%', 
              minHeight: '100px', 
              padding: 'var(--space-8) var(--space-12)', 
              borderRadius: '6px', 
              border: '1px solid var(--color-border)',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          {errors.scope && <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)' }}>{errors.scope.message}</span>}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-4)' }}>
            Out of Scope (Optional)
          </label>
          <textarea
            {...register('outOfScope')}
            placeholder="List what is explicitly NOT included..."
            style={{ 
              width: '100%', 
              minHeight: '80px', 
              padding: 'var(--space-8) var(--space-12)', 
              borderRadius: '6px', 
              border: '1px solid var(--color-border)',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-4)' }}>
              Budget (₹) *
            </label>
            <Input 
              type="number"
              {...register('budget', { 
                required: 'Budget is required',
                valueAsNumber: true,
                min: { value: 1, message: 'Budget must be greater than 0' }
              })} 
              placeholder="e.g. 25000" 
              style={{ width: '100%' }}
            />
            {errors.budget && <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)' }}>{errors.budget.message}</span>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-4)' }}>
              Expected Duration (Days) *
            </label>
            <Input 
              type="number"
              {...register('expectedDuration', { 
                required: 'Duration is required',
                valueAsNumber: true,
                min: { value: 1, message: 'Duration must be at least 1 day' }
              })} 
              placeholder="e.g. 30" 
              style={{ width: '100%' }}
            />
            {errors.expectedDuration && <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)' }}>{errors.expectedDuration.message}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Agreement')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
