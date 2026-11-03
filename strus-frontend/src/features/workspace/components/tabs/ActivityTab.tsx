

import React, { useState } from 'react';
import { useWorkspaceAudit } from '../../hooks/useWorkspace';
import type {
  WorkspaceDetail,
  WorkspaceAuditLog,
} from '../../types/workspace.types';
import { Button } from '../../../../components/ui/Button';

const formatActionText = (action: string, log: WorkspaceAuditLog) => {
  const meta = log.metadata || {};

  switch (action) {
    case 'WORKSPACE_CREATED':
      return 'created this workspace';
    case 'WORKSPACE_UPDATED':
      return 'updated workspace settings';
    case 'MEMBER_INVITED':
      return `invited ${meta.identifier || 'a member'}`;
    case 'INVITATION_ACCEPTED':
      return 'accepted an invitation';
    case 'INVITATION_DECLINED':
      return 'declined an invitation';
    case 'INVITATION_CANCELLED':
      return 'cancelled an invitation';
    case 'MEMBER_JOINED':
      return `${meta.username || 'A member'} joined the workspace`;
    case 'MEMBER_LEFT':
      return `${meta.username || 'A member'} left the workspace`;
    case 'MEMBER_REMOVED':
      return `${meta.username || 'A member'} was removed from the workspace`;
    case 'MEMBER_ROLE_UPDATED': {
      const user = meta.username || 'A member';
      const from = meta.previousRole || 'unknown';
      const to = meta.newRole || 'unknown';
      return `${user}'s role changed from ${from} to ${to}`;
    }
    case 'OWNERSHIP_TRANSFERRED':
      return `transferred workspace ownership to ${
        meta.newOwnerUsername || 'a member'
      }`;
    case 'WORKSPACE_DELETED':
      return 'deleted the workspace';
    default:
      return action.replace(/_/g, ' ').toLowerCase();
  }
};

const formatMetadataValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const getMetadataEntries = (metadata: unknown) => {
  if (
    !metadata ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata)
  ) {
    return [];
  }

  return Object.entries(metadata as Record<string, unknown>).filter(
    ([, value]) => value !== null && value !== undefined
  );
};

const formatMetadataLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (char) => char.toUpperCase());

export const ActivityTab: React.FC<{ workspace: WorkspaceDetail }> = ({
  workspace,
}) => {
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useWorkspaceAudit(workspace.id, page, 20);

  if (isLoading) {
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

  if (isError) {
    const errorMessage =
      (error as any)?.response?.data?.message ||
      (error as any)?.message ||
      'There was a problem communicating with the server.';

    return (
      <div
        style={{
          padding: 'var(--space-32)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          textAlign: 'center',
        }}
      >
        <h3
          style={{
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-8)',
          }}
        >
          Unable to load activity history.
        </h3>

        <p
          style={{
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-16)',
          }}
        >
          {errorMessage}
        </p>

        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const logs = data?.logs || [];
  const pagination = data?.pagination;

  if (logs.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--space-32)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '8px',
          border: '1px dashed var(--color-border)',
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--color-text-secondary)' }}>
          No activity found.
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
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-20)',
          borderLeft: '2px solid var(--color-border)',
          marginLeft: '12px',
          paddingLeft: 'var(--space-24)',
        }}
      >
        {logs.map((log) => {
          const actorName = log.actor
            ? `${log.actor.firstName || ''} ${
                log.actor.lastName || ''
              }`.trim() || log.actor.username
            : 'System';

          const timestamp = new Date(log.createdAt);
          const validTimestamp = !Number.isNaN(timestamp.getTime());

          const metadataEntries = getMetadataEntries(log.metadata);

          return (
            <div key={log.id} style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 'calc(-1 * var(--space-24) - 9px)',
                  top: '4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-surface)',
                  border: '2px solid var(--color-primary)',
                }}
              />

              <p
                style={{
                  fontSize: 'var(--text-md)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <span style={{ fontWeight: 600 }}>{actorName}</span>{' '}
                {formatActionText(log.action, log)}
              </p>

              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  marginTop: '2px',
                }}
              >
                {validTimestamp
                  ? timestamp.toLocaleString()
                  : 'Unknown date'}
              </p>

              {metadataEntries.length > 0 && (
                <div
                  style={{
                    marginTop: 'var(--space-8)',
                    padding: 'var(--space-12)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 'var(--space-8)',
                  }}
                >
                  {metadataEntries.map(([key, value]) => (
                    <div key={key} style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-secondary)',
                          marginBottom: '2px',
                        }}
                      >
                        {formatMetadataLabel(key)}
                      </p>

                      <p
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-primary)',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {formatMetadataValue(value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--space-16)',
            marginTop: 'var(--space-16)',
          }}
        >
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>

          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            disabled={!pagination.hasNext}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
