import React, { useState } from 'react';
import { format, isValid, parseISO } from 'date-fns';

import {
  usePendingAgreementInvitations,
  useAcceptAgreementInvitation,
  useDeclineAgreementInvitation,
} from '../../agreement/hooks/useAgreementInvitations';

import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../components/widgets/EmptyStates';

const PAGE_SIZE = 10;

interface Invitation {
  id: string;
  invitedAt: string;
  project?: {
    id: string;
    title?: string;
  } | null;
  agreement?: {
    title?: string;
    budget?: number | string | null;
    expectedDuration?: number | null;
  } | null;
  invitedBy?: {
    firstName?: string;
    lastName?: string;
  } | null;
}

interface InvitationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

interface PendingInvitationsData {
  invitations: Invitation[];
  pagination: InvitationPagination;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

const formatInvitationDate = (value?: string): string => {
  if (!value) {
    return 'Date unavailable';
  }

  const date = parseISO(value);

  return isValid(date)
    ? format(date, 'MMM d, yyyy')
    : 'Date unavailable';
};

const formatBudget = (
  budget?: number | string | null,
): string => {
  if (budget === null || budget === undefined || budget === '') {
    return 'Not specified';
  }

  const amount = Number(budget);

  if (!Number.isFinite(amount)) {
    return 'Not specified';
  }

  return `₹${amount.toLocaleString('en-IN')}`;
};

export const ProfessionalInvitationsPage: React.FC = () => {
  const [page, setPage] = useState(1);

  const {
    data: invitationsData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = usePendingAgreementInvitations(page, PAGE_SIZE);

  const acceptMutation = useAcceptAgreementInvitation();
  const declineMutation = useDeclineAgreementInvitation();

  const response = invitationsData as PendingInvitationsData | undefined;

  const invitations = response?.invitations ?? [];
  const pagination = response?.pagination;

  const isActionPending =
    acceptMutation.isPending || declineMutation.isPending;

  const actionError =
    acceptMutation.isError
      ? getErrorMessage(acceptMutation.error)
      : declineMutation.isError
        ? getErrorMessage(declineMutation.error)
        : null;

  const handleAccept = (invite: Invitation) => {
    if (!invite.project?.id) {
      return;
    }

    acceptMutation.mutate({
      projectId: invite.project.id,
      participantId: invite.id,
    });
  };

  const handleDecline = (invite: Invitation) => {
    if (!invite.project?.id) {
      return;
    }

    declineMutation.mutate({
      projectId: invite.project.id,
      participantId: invite.id,
    });
  };

  if (isLoading) {
    return (
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: 'var(--space-24)',
        }}
      >
        <PageHeading />

        <div
          style={{
            height: '200px',
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: '8px',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: 'var(--space-24)',
      }}
    >
      <PageHeading />

      {isError ? (
        <EmptyState
          title="Unable to load invitations"
          description={getErrorMessage(error)}
          action={
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? 'Retrying...' : 'Retry'}
            </Button>
          }
        />
      ) : invitations.length === 0 ? (
        <EmptyState
          title="No pending invitations"
          description="You have no pending agreement invitations at the moment."
        />
      ) : (
        <>
          {actionError && (
            <div
              role="alert"
              style={{
                padding: 'var(--space-12) var(--space-16)',
                marginBottom: 'var(--space-16)',
                borderRadius: '8px',
                color: 'var(--color-error)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-error-light)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {actionError}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-16)',
              opacity: isFetching ? 0.7 : 1,
              transition: 'opacity 150ms ease',
            }}
          >
            {invitations.map((invite) => {
              const inviterName =
                `${invite.invitedBy?.firstName ?? ''} ${
                  invite.invitedBy?.lastName ?? ''
                }`.trim() || 'Unknown client';

              return (
                <Card
                  key={invite.id}
                  style={{ padding: 'var(--space-24)' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 'var(--space-16)',
                      flexWrap: 'wrap',
                      marginBottom: 'var(--space-16)',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: 'var(--text-lg)',
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {invite.agreement?.title ?? 'Agreement invitation'}
                      </h3>

                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-secondary)',
                          marginTop: 'var(--space-4)',
                        }}
                      >
                        {invite.project?.title ?? 'Project'}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-tertiary)',
                      }}
                    >
                      Invited {formatInvitationDate(invite.invitedAt)}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 'var(--space-16)',
                      marginBottom: 'var(--space-24)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      padding: 'var(--space-16)',
                      borderRadius: '8px',
                    }}
                  >
                    <InfoItem
                      label="Invited By"
                      value={inviterName}
                    />

                    <InfoItem
                      label="Budget"
                      value={formatBudget(invite.agreement?.budget)}
                    />

                    <InfoItem
                      label="Duration"
                      value={
                        invite.agreement?.expectedDuration != null
                          ? `${invite.agreement.expectedDuration} days`
                          : 'Not specified'
                      }
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 'var(--space-12)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => handleDecline(invite)}
                      disabled={isActionPending || !invite.project?.id}
                      style={{
                        color: 'var(--color-error)',
                        borderColor: 'var(--color-error-light)',
                      }}
                    >
                      {declineMutation.isPending &&
                      declineMutation.variables?.participantId === invite.id
                        ? 'Declining...'
                        : 'Decline'}
                    </Button>

                    <Button
                      onClick={() => handleAccept(invite)}
                      disabled={isActionPending || !invite.project?.id}
                    >
                      {acceptMutation.isPending &&
                      acceptMutation.variables?.participantId === invite.id
                        ? 'Accepting...'
                        : 'Accept Invitation'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 'var(--space-12)',
                marginTop: 'var(--space-24)',
              }}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching || isActionPending}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>

              <span style={{ fontSize: 'var(--text-sm)' }}>
                Page {pagination.page} of {pagination.totalPages}
                {' · '}
                {pagination.total} invitations
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={
                  !pagination.hasNext || isFetching || isActionPending
                }
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const PageHeading: React.FC = () => (
  <h2
    style={{
      fontSize: 'var(--text-xl)',
      fontWeight: 600,
      marginBottom: 'var(--space-24)',
    }}
  >
    Pending Invitations
  </h2>
);

const InfoItem: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div>
    <div
      style={{
        fontSize: 'var(--text-xs)',
        textTransform: 'uppercase',
        color: 'var(--color-text-tertiary)',
        marginBottom: 'var(--space-4)',
      }}
    >
      {label}
    </div>

    <div style={{ fontWeight: 500 }}>
      {value}
    </div>
  </div>
);