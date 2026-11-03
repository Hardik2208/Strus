import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { authService } from '../../services/auth.service';
import { mapAuthError } from '../../../../lib/api/api-error';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const ChangePasswordModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  if (!isOpen) return null;

  const onPasswordSubmit = async (data: any) => {
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password changed successfully. Other active sessions have been signed out.');
      reset();
      onClose();
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-24)',
        width: '100%',
        maxWidth: '450px',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--color-text-primary)'
      }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-24)', marginTop: 0 }}>
          Change Password
        </h2>
        <form onSubmit={handleSubmit(onPasswordSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <Input 
            label="Current password"
            type="password"
            error={errors.currentPassword?.message as string} 
            {...register("currentPassword")} 
          />
          <Input 
            label="New password"
            type="password"
            error={errors.newPassword?.message as string} 
            {...register("newPassword")} 
          />
          <Input 
            label="Confirm new password"
            type="password"
            error={errors.confirmPassword?.message as string} 
            {...register("confirmPassword")} 
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)', marginTop: 'var(--space-8)' }}>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
