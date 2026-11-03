import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../../../components/ui/Button';
import { authService } from '../../services/auth.service';
import { mapAuthError } from '../../../../lib/api/api-error';
import type { Session } from '../../types/auth.types';
import { SessionCard } from '../SessionCard';

export const ManageSessionsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingSessions(true);
      authService.getSessions()
        .then(res => {
          setSessions(res.data.sessions);
        })
        .catch(error => {
          toast.error(mapAuthError(error.code));
        })
        .finally(() => {
          setLoadingSessions(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      onClose();
      window.location.href = '/login';
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    } finally {
      setRevokingAll(false);
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--color-text-primary)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-24)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              Active Sessions
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Manage your signed-in devices.
            </p>
          </div>
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div style={{ marginBottom: 'var(--space-16)', display: 'flex', gap: 'var(--space-8)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {sessions.length > 1 && (
            <Button variant="outline" onClick={handleRevokeOthers} disabled={revokingAll}>
              Log out other devices
            </Button>
          )}
          <Button variant="outline" onClick={handleLogoutAll} disabled={revokingAll} style={{ color: 'var(--color-error)' }}>
            Log out all devices
          </Button>
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
      </div>
    </div>
  );
};
