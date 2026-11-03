import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { EmptyState } from './EmptyStates';
import { useNavigate } from 'react-router-dom';

export const PendingInvitationsWidget: React.FC<{ invitations: any[] }> = ({ invitations }) => {
  const navigate = useNavigate();

  if (invitations.length === 0) {
    return (
      <EmptyState 
        title="No pending invitations" 
        description="You're all caught up." 
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
      {invitations.map((inv) => (
        <Card key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-16)' }}>
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{inv.agreement?.title}</h4>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-4)' }}>Client: {inv.invitedBy?.firstName} {inv.invitedBy?.lastName}</p>
          </div>
          <Button variant="outline" onClick={() => navigate(`/agreements/invitations/${inv.id}`)}>
            View Invitation
          </Button>
        </Card>
      ))}
    </div>
  );
};
