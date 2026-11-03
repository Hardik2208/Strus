import React, { useState } from "react";
import type { Session } from "../types/auth.types";
import styles from "./SessionCard.module.css";
import { Button } from "../../../components/ui/Button";

interface SessionCardProps {
  session: Session;
  onRevoke: (id: string) => Promise<void>;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onRevoke }) => {
  const [loading, setLoading] = useState(false);

  const handleRevoke = async () => {
    if (!window.confirm("Are you sure you want to log out this session?")) return;
    setLoading(true);
    try {
      await onRevoke(session.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>{session.deviceName || session.platform}</div>
      <div className={styles.details}>
        {session.browser} · {session.operatingSystem}
      </div>
      <div className={styles.status}>
        {session.isCurrent ? (
          <span className={styles.active}>Current session</span>
        ) : (
          `Last active: ${new Date(session.lastActive).toLocaleString()}`
        )}
      </div>
      {!session.isCurrent && (
        <div className={styles.action}>
          <Button variant="outline" onClick={handleRevoke} disabled={loading} style={{ padding: '4px 12px', fontSize: '13px' }}>
            {loading ? "Logging out..." : "Log out"}
          </Button>
        </div>
      )}
    </div>
  );
};
