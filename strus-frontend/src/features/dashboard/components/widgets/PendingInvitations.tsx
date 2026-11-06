import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { EmptyState } from './EmptyStates';

interface PendingInvitation {
  id: string;
  agreement?: {
    title?: string;
  } | null;
  invitedBy?: {
    firstName?: string;
    lastName?: string;
  } | null;
}

interface PendingInvitationsWidgetProps {
  invitations: PendingInvitation[];
}

export const PendingInvitationsWidget: React.FC<
  PendingInvitationsWidgetProps
> = ({ invitations }) => {
  const navigate = useNavigate();

  if (invitations.length === 0) {
    return (
      <EmptyState
        title="No pending invitations"
        description="You're all caught up."
      />
    );
  }

  const handleViewInvitations = () => {
    navigate('/dashboard/professional/invitations');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-12)',
      }}
    >
      {invitations.map((invitation) => {
        const inviterName =
          `${invitation.invitedBy?.firstName ?? ''} ${
            invitation.invitedBy?.lastName ?? ''
          }`.trim() || 'Unknown client';

        return (
          <Card
            key={invitation.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--space-12)',
              padding: 'var(--space-16)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h4
                style={{
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                {invitation.agreement?.title ?? 'Agreement invitation'}
              </h4>

              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  marginTop: 'var(--space-4)',
                }}
              >
                Client: {inviterName}
              </p>
            </div>

            <Button variant="outline" onClick={handleViewInvitations}>
              View Invitations
            </Button>
          </Card>
        );
      })}
    </div>
  );
};