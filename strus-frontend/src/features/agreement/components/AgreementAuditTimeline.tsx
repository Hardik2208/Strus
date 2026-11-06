import React, { useState } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { Filter, History } from 'lucide-react';

import { useAgreementAudits } from '../hooks/useAgreementQueries';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

import type {
  AgreementAuditAction,
  AuditOrder,
} from '../types/agreement.types';

interface AgreementAuditTimelineProps {
  projectId: string;
  setupStage?: string;
}

const auditFilters: {
  label: string;
  value: AgreementAuditAction | 'All';
}[] = [
  { label: 'All Activity', value: 'All' },
  { label: 'Created', value: 'CREATED' },
  { label: 'Updated', value: 'UPDATED' },
  { label: 'Professional Invited', value: 'PROFESSIONAL_INVITED' },
  { label: 'Invitation Accepted', value: 'INVITATION_ACCEPTED' },
  { label: 'Invitation Declined', value: 'INVITATION_DECLINED' },
  { label: 'Invitation Withdrawn', value: 'INVITATION_WITHDRAWN' },
  { label: 'Professional Removed', value: 'PROFESSIONAL_REMOVED' },
];

export const AgreementAuditTimeline: React.FC<
  AgreementAuditTimelineProps
> = ({ projectId, setupStage }) => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<
    AgreementAuditAction | 'All'
  >('All');

  const [order, setOrder] = useState<AuditOrder>('desc');

  const limit = 10;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useAgreementAudits(
    projectId,
    setupStage,
    page,
    limit,
    actionFilter === 'All' ? undefined : actionFilter,
    order,
  );

  const audits = data?.audits ?? [];
  const pagination = data?.pagination;

  const isProjectCreated = setupStage === 'PROJECT_CREATED';

  const handleActionChange = (
    value: AgreementAuditAction | 'All',
  ) => {
    setActionFilter(value);
    setPage(1);
  };

  const handleOrderChange = (value: AuditOrder) => {
    setOrder(value);
    setPage(1);
  };

  return (
    <Card style={{ padding: 'var(--space-24)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-12)',
          marginBottom: 'var(--space-24)',
        }}
      >
        <h3
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)',
            margin: 0,
          }}
        >
          <History size={18} />
          Activity
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)',
            flexWrap: 'wrap',
          }}
        >
          <Filter
            size={14}
            style={{ color: 'var(--color-text-tertiary)' }}
          />

          <select
            aria-label="Filter agreement activity"
            value={actionFilter}
            onChange={(event) =>
              handleActionChange(
                event.target.value as AgreementAuditAction | 'All',
              )
            }
            style={{
              padding: 'var(--space-4) var(--space-8)',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-sm)',
              backgroundColor: 'var(--color-surface)',
              cursor: 'pointer',
            }}
          >
            {auditFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort agreement activity"
            value={order}
            onChange={(event) =>
              handleOrderChange(event.target.value as AuditOrder)
            }
            style={{
              padding: 'var(--space-4) var(--space-8)',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-sm)',
              backgroundColor: 'var(--color-surface)',
              cursor: 'pointer',
            }}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
      </div>

      {isProjectCreated ? (
        <EmptyState message="Agreement activity will appear after an agreement is created." />
      ) : isLoading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-16)',
          }}
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                gap: 'var(--space-16)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-surface-subtle)',
                  flexShrink: 0,
                  animation: 'pulse 1.5s infinite',
                }}
              />

              <div
                style={{
                  flex: 1,
                  height: '24px',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: '4px',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-24)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <p style={{ marginBottom: 'var(--space-12)' }}>
            Failed to load Agreement activity.
            {error instanceof Error ? ` ${error.message}` : ''}
          </p>

          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : audits.length === 0 ? (
        <EmptyState message="No activity found." />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-24)',
          }}
        >
          {audits.map((audit, index) => {
            const profile = audit.actor?.profile;

            const firstName = profile?.firstName?.trim() ?? '';
            const lastName = profile?.lastName?.trim() ?? '';

            const actorName =
              `${firstName} ${lastName}`.trim() ||
              profile?.username ||
              'Unknown user';

            const initials =
              `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() ||
              actorName[0]?.toUpperCase() ||
              '?';

            const parsedDate = parseISO(audit.createdAt);
            const formattedDate = isValid(parsedDate)
              ? format(parsedDate, 'MMM d, yyyy h:mm a')
              : 'Date unavailable';

            return (
              <div
                key={audit.id}
                style={{
                  display: 'flex',
                  gap: 'var(--space-16)',
                  position: 'relative',
                }}
              >
                {index !== audits.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '32px',
                      bottom: '-24px',
                      width: '2px',
                      backgroundColor: 'var(--color-border)',
                    }}
                  />
                )}

                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 'var(--text-sm)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={actorName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div
                  style={{
                    flex: 1,
                    paddingBottom: 'var(--space-8)',
                  }}
                >
                  <div style={{ fontSize: 'var(--text-sm)' }}>
                    <span
                      style={{
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {actorName}
                    </span>{' '}
                    <span
                      style={{
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {getLogActionText(audit.action)}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-tertiary)',
                      marginTop: 'var(--space-4)',
                    }}
                  >
                    {formattedDate}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading &&
        !isError &&
        pagination &&
        pagination.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--space-8)',
              marginTop: 'var(--space-32)',
            }}
          >
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>

            <span
              style={{
                fontSize: 'var(--text-sm)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 var(--space-8)',
              }}
            >
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        )}
    </Card>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div
    style={{
      textAlign: 'center',
      padding: 'var(--space-24)',
      color: 'var(--color-text-secondary)',
    }}
  >
    {message}
  </div>
);

function getLogActionText(action: string): string {
  switch (action) {
    case 'CREATED':
      return 'created the agreement';

    case 'UPDATED':
      return 'updated the agreement details';

    case 'PROFESSIONAL_INVITED':
      return 'invited a professional';

    case 'INVITATION_ACCEPTED':
      return 'accepted the invitation';

    case 'INVITATION_DECLINED':
      return 'declined the invitation';

    case 'INVITATION_WITHDRAWN':
      return 'withdrew the invitation';

    case 'PROFESSIONAL_REMOVED':
      return 'removed a professional';

    default:
      return `performed action: ${action}`;
  }
}