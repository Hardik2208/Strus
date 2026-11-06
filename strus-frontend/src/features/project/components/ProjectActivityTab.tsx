
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectAudits } from '../hooks/useProjectQueries';
import type { ProjectAudit } from '../types/project.types';
import { Button } from '../../../components/ui/Button';

const actionLabels: Record<string, string> = {
  CREATED: 'created this project',
  UPDATED: 'updated project details',
  STATUS_CHANGED: 'changed the project status',
  ACTIVATED: 'activated this project',
  COMPLETED: 'marked this project as completed',
  CANCELLED: 'cancelled this project',
  MUTUALLY_TERMINATED: 'mutually terminated this project',
  DELETED: 'deleted this project',
};

const getActorName = (audit: ProjectAudit): string => {
  if (!audit.actor) return 'System';

  const fullName = [
    audit.actor.firstName,
    audit.actor.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || audit.actor.username || 'Unknown user';
};

const formatAction = (action: string): string => {
  return (
    actionLabels[action] ||
    action.replace(/_/g, ' ').toLowerCase()
  );
};

const formatMetadataValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const formatMetadataLabel = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (character) => character.toUpperCase());
};

export const ProjectActivityTab: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useProjectAudits(
    projectId || '',
    { page, limit: 20, order: 'desc' },
    !!projectId
  );

  if (isLoading) {
    return (
      <div
        style={{
          padding: 'var(--space-24)',
          color: 'var(--color-text-secondary)',
        }}
      >
        Loading project activity...
      </div>
    );
  }

  if (isError) {
    const message =
      (error as any)?.response?.data?.message ||
      (error as any)?.message ||
      'Unable to load project activity.';

    return (
      <div
        style={{
          padding: 'var(--space-24)',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
        }}
      >
        <h3
          style={{
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-8)',
          }}
        >
          Unable to load activity
        </h3>

        <p
          style={{
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-16)',
          }}
        >
          {message}
        </p>

        <Button onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const audits: ProjectAudit[] = data?.audits ?? [];
  const pagination = data?.pagination;

  if (audits.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--space-32)',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface)',
          border: '1px dashed var(--color-border)',
          borderRadius: '8px',
        }}
      >
        <h3
          style={{
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-8)',
          }}
        >
          No project activity yet
        </h3>

        <p style={{ color: 'var(--color-text-secondary)' }}>
          Project changes and lifecycle events will appear here.
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
      <div>
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          Project Activity
        </h2>

        <p
          style={{
            marginTop: 'var(--space-4)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          A history of important changes made to this project.
        </p>
      </div>

      <div
        style={{
          borderLeft: '2px solid var(--color-border)',
          marginLeft: '10px',
          paddingLeft: 'var(--space-24)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-24)',
        }}
      >
        {audits.map((audit: ProjectAudit) => {
          const timestamp = new Date(audit.createdAt);

          const metadataEntries = Object.entries(
            audit.metadata || {}
          ).filter(([, value]) => value !== null && value !== undefined);

          return (
            <div
              key={audit.id}
              style={{ position: 'relative' }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '-33px',
                  top: '4px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  border: '3px solid var(--color-surface)',
                  boxShadow: '0 0 0 1px var(--color-border)',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                }}
              >
                <p
                  style={{
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  <strong>{getActorName(audit)}</strong>{' '}
                  {formatAction(audit.action)}
                </p>

                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  {Number.isNaN(timestamp.getTime())
                    ? 'Unknown date'
                    : timestamp.toLocaleString()}
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
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: 'var(--space-12)',
                    }}
                  >
                    {metadataEntries.map(([key, value]) => (
                      <div key={key} style={{ minWidth: 0 }}>
                        <p
                          style={{
                            color: 'var(--color-text-secondary)',
                            fontSize: 'var(--text-xs)',
                            marginBottom: 'var(--space-4)',
                          }}
                        >
                          {formatMetadataLabel(key)}
                        </p>

                        <p
                          style={{
                            color: 'var(--color-text-primary)',
                            fontSize: 'var(--text-sm)',
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
          }}
        >
          <Button
            variant="outline"
            disabled={page <= 1 || isFetching}
            onClick={() =>
              setPage((current) => Math.max(1, current - 1))
            }
          >
            Previous
          </Button>

          <span
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
            }}
          >
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            disabled={!pagination.hasNext || isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
