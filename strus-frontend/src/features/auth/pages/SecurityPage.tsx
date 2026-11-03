import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { authService } from '../services/auth.service';
import { mapAuthError } from '../../../lib/api/api-error';
import type { Session } from '../types/auth.types';
import { SessionCard } from '../components/SessionCard';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const SecurityPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [revokingAll, setRevokingAll] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const fetchSessions = async () => {
    try {
      const res = await authService.getSessions();
      setSessions(res.data.sessions);
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const onPasswordSubmit = async (data: any) => {
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password changed successfully. Other active sessions have been signed out.');
      reset();
      fetchSessions();
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await authService.revokeSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
      toast.success('Session logged out.');
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    }
  };

  const handleRevokeOthers = async () => {
    if (!window.confirm('Log out from all other devices?')) return;
    setRevokingAll(true);
    try {
      await authService.revokeOtherSessions();
      setSessions(sessions.filter((s) => s.isCurrent));
      toast.success('Logged out from all other devices.');
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    } finally {
      setRevokingAll(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Log out from all devices? You will be signed out everywhere.')) return;
    setRevokingAll(true);
    try {
      await authService.logoutAll();
      toast.success('Logged out from all devices.');
      window.location.href = '/login';
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)', width: '100%', maxWidth: '600px' }}>
      
      {/* Password Management */}
      <Card>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-24)', marginTop: 0 }}>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-8)' }}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Session Management */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-24)' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              Active Sessions
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Manage your signed-in devices.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
            {sessions.length > 1 && (
              <Button variant="outline" onClick={handleRevokeOthers} disabled={revokingAll}>
                Log out other devices
              </Button>
            )}
            <Button variant="outline" onClick={handleLogoutAll} disabled={revokingAll} style={{ color: 'var(--color-error)' }}>
              Log out all devices
            </Button>
          </div>
        </div>

        {loadingSessions ? (
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Loading sessions...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} onRevoke={handleRevokeSession} />
            ))}
          </div>
        )}
      </Card>

    </div>
  );
};
