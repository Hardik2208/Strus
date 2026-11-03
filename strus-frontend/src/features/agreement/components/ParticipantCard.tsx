import React from 'react';
import type { AgreementParticipant } from '../types/agreement.types';
import { 
  useUpdateInvitationStatus, 
  useWithdrawInvitation, 
  useRemoveParticipant 
} from '../hooks/useAgreementMutations';
import { useAuthStore } from '../../auth/store/auth.store';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

interface ParticipantCardProps {
  projectId: string;
  participant: AgreementParticipant;
  isCreator: boolean;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ projectId, participant, isCreator }) => {
  const { user } = useAuthStore();
  
  const updateStatusMutation = useUpdateInvitationStatus(projectId);
  const withdrawMutation = useWithdrawInvitation(projectId);
  const removeMutation = useRemoveParticipant(projectId);

  const isSelf = user?.id === participant.userId;
  const isProfessional = participant.role === 'PROFESSIONAL';
  const profile = participant.user?.profile || participant.profile || { firstName: 'Unknown', lastName: 'User', username: 'unknown', avatarUrl: null };

  const handleAccept = async () => {
    try {
      await updateStatusMutation.mutateAsync({ participantId: participant.id, data: { status: 'ACCEPTED' } });
      toast.success('Invitation accepted');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleDecline = async () => {
    if (window.confirm('Are you sure you want to decline this invitation?')) {
      try {
        await updateStatusMutation.mutateAsync({ participantId: participant.id, data: { status: 'DECLINED' } });
        toast.success('Invitation declined');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to decline invitation');
      }
    }
  };

  const handleWithdraw = async () => {
    if (window.confirm('Withdraw invitation? This professional will no longer have an active invitation.')) {
      try {
        await withdrawMutation.mutateAsync(participant.id);
        toast.success('Invitation withdrawn');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to withdraw invitation');
      }
    }
  };

  const handleRemove = async () => {
    if (window.confirm(`Remove professional? ${profile.firstName} will be removed from this project.`)) {
      try {
        await removeMutation.mutateAsync(participant.id);
        toast.success('Professional removed');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to remove professional');
      }
    }
  };

  const getStatusDisplay = () => {
    switch (participant.invitationStatus) {
      case 'PENDING':
        return { label: 'Pending', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' };
      case 'ACCEPTED':
        return { label: 'Active Professional', color: 'var(--color-success)', bg: 'var(--color-success-light)' };
      case 'DECLINED':
        return { label: 'Declined', color: 'var(--color-error)', bg: 'var(--color-error-light)' };
      case 'WITHDRAWN':
        return { label: 'Withdrawn', color: 'var(--color-text-tertiary)', bg: 'var(--color-surface-subtle)' };
      case 'REMOVED':
        return { label: 'Removed', color: 'var(--color-error)', bg: 'var(--color-error-light)' };
      default:
        return { label: participant.invitationStatus, color: 'var(--color-text-secondary)', bg: 'var(--color-surface-subtle)' };
    }
  };

  const statusDisplay = getStatusDisplay();
  const isPending = updateStatusMutation.isPending || withdrawMutation.isPending || removeMutation.isPending;

  return (
    <Card style={{ padding: 'var(--space-16)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-16)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: 'var(--text-lg)',
          overflow: 'hidden'
        }}>
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            profile.firstName[0].toUpperCase()
          )}
        </div>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-md)', color: 'var(--color-text-primary)' }}>
              {profile.firstName} {profile.lastName}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              @{profile.username}
            </span>
            {isSelf && (
              <span style={{ fontSize: 'var(--text-xs)', padding: '2px 6px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '4px', color: 'var(--color-text-secondary)' }}>
                You
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {participant.role === 'CONTRACTOR' ? 'Agreement Owner' : 'Professional'}
            </span>
            
            {isProfessional && (
              <span style={{ 
                fontSize: 'var(--text-xs)', 
                padding: '2px 8px', 
                backgroundColor: statusDisplay.bg, 
                color: statusDisplay.color, 
                borderRadius: '12px',
                fontWeight: 600
              }}>
                {statusDisplay.label}
              </span>
            )}
            
            {participant.invitedAt && participant.invitationStatus === 'PENDING' && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                Invited {format(parseISO(participant.invitedAt), 'MMM d')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
        {/* Professional Actions */}
        {isSelf && participant.invitationStatus === 'PENDING' && (
          <>
            <Button variant="outline" size="sm" onClick={handleDecline} disabled={isPending} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error-light)' }}>
              Decline
            </Button>
            <Button size="sm" onClick={handleAccept} disabled={isPending}>
              Accept Invitation
            </Button>
          </>
        )}

        {/* Contractor Actions */}
        {isCreator && isProfessional && !isSelf && (
          <>
            {participant.invitationStatus === 'PENDING' && (
              <Button variant="outline" size="sm" onClick={handleWithdraw} disabled={isPending}>
                Withdraw
              </Button>
            )}
            {participant.invitationStatus === 'ACCEPTED' && (
              <Button variant="outline" size="sm" onClick={handleRemove} disabled={isPending} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error-light)' }}>
                Remove
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
