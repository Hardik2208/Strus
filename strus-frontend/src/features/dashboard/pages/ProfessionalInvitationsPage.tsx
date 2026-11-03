import React from 'react';
import { usePendingAgreementInvitations, useAcceptAgreementInvitation, useDeclineAgreementInvitation } from '../../agreement/hooks/useAgreementInvitations';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../components/widgets/EmptyStates';
import { format, parseISO } from 'date-fns';

export const ProfessionalInvitationsPage: React.FC = () => {
  const { data: invitationsData, isLoading } = usePendingAgreementInvitations();
  const acceptMutation = useAcceptAgreementInvitation();
  const declineMutation = useDeclineAgreementInvitation();

  const invitations = invitationsData?.invitations || [];

  if (isLoading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-24)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-24)' }}>Pending Invitations</h2>
        <div style={{ height: '200px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-24)' }}>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-24)' }}>Pending Invitations</h2>
      
      {invitations.length === 0 ? (
        <EmptyState title="No pending invitations" description="You have no pending agreement invitations at the moment." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          {invitations.map((invite: any) => (
            <Card key={invite.id} style={{ padding: 'var(--space-24)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-16)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {invite.agreement?.title}
                  </h3>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-4)' }}>
                    {invite.project?.title}
                  </div>
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                  Invited {format(parseISO(invite.invitedAt), 'MMM d, yyyy')}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)', marginBottom: 'var(--space-24)', backgroundColor: 'var(--color-surface-subtle)', padding: 'var(--space-16)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>Invited By</div>
                  <div style={{ fontWeight: 500 }}>{invite.invitedBy?.firstName} {invite.invitedBy?.lastName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>Budget</div>
                  <div style={{ fontWeight: 500 }}>₹{invite.agreement?.budget?.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>Duration</div>
                  <div style={{ fontWeight: 500 }}>{invite.agreement?.expectedDuration} days</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)' }}>
                <Button 
                  variant="outline" 
                  onClick={() => declineMutation.mutate({ projectId: invite.project?.id, participantId: invite.id })}
                  disabled={declineMutation.isPending || acceptMutation.isPending}
                  style={{ color: 'var(--color-error)', borderColor: 'var(--color-error-light)' }}
                >
                  Decline
                </Button>
                <Button 
                  onClick={() => acceptMutation.mutate({ projectId: invite.project?.id, participantId: invite.id })}
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                >
                  Accept Invitation
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
