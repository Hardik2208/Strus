import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { authService } from "../services/auth.service";
import type { Session } from "../types/auth.types";
import { mapAuthError } from "../../../lib/api/api-error";
import { SessionCard } from "../components/SessionCard";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import styles from "./RegisterPage.module.css";

export const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingAll, setRevokingAll] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await authService.getSessions();
      setSessions(res.data.sessions);
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id: string) => {
    try {
      await authService.revokeSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
      toast.success("Session logged out.");
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    }
  };

  const handleRevokeOthers = async () => {
    if (!window.confirm("Log out from all other devices?")) return;
    setRevokingAll(true);
    try {
      await authService.revokeOtherSessions();
      setSessions(sessions.filter((s) => s.isCurrent));
      toast.success("Logged out from all other devices.");
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    } finally {
      setRevokingAll(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm("Log out from all devices? You will be signed out everywhere.")) return;
    setRevokingAll(true);
    try {
      await authService.logoutAll();
      toast.success("Logged out from all devices.");
      window.location.href = "/login";
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <Card style={{ maxWidth: '600px' }}>
      <h2 className={styles.title} style={{ textAlign: 'left' }}>Security</h2>
      <p className={styles.subtitle} style={{ textAlign: 'left' }}>Active sessions</p>

      {loading ? (
        <p>Loading sessions...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} onRevoke={handleRevoke} />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {sessions.length > 1 && (
          <Button variant="outline" onClick={handleRevokeOthers} disabled={revokingAll}>
            Log out all other devices
          </Button>
        )}
        <Button variant="outline" onClick={handleLogoutAll} disabled={revokingAll} style={{ color: 'var(--color-error)' }}>
          Log out all devices
        </Button>
      </div>
    </Card>
  );
};
