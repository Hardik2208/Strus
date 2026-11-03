import React from 'react';
import { Building2, Clock, Check, X } from 'lucide-react';
import { 
  usePendingWorkspaceInvitations, 
  useAcceptWorkspaceInvitation, 
  useDeclineWorkspaceInvitation 
} from '../../../workspace/hooks/useWorkspace';
import styles from './WorkspaceInvitationsWidget.module.css';

export const WorkspaceInvitationsWidget: React.FC = () => {
  const { data: invitesData, isLoading, isError } = usePendingWorkspaceInvitations();
  const acceptMutation = useAcceptWorkspaceInvitation();
  const declineMutation = useDeclineWorkspaceInvitation();

  if (isLoading) {
    return (
      <div className={styles.widget}>
        <div className={styles.header}>
          <h3 className={styles.title}>Workspace Invitations</h3>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.shimmer}></div>
          <div className={styles.shimmer} style={{ width: '80%' }}></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return null; // Fail gracefully
  }

  const invitations = invitesData?.invitations || [];

  if (invitations.length === 0) {
    return null; // Don't show the widget if there are no invitations
  }

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h3 className={styles.title}>Workspace Invitations</h3>
        <span className={styles.badge}>{invitations.length}</span>
      </div>
      
      <div className={styles.list}>
        {invitations.map((invite: any) => (
          <div key={invite.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}>
                <Building2 size={20} />
              </div>
              <div className={styles.cardContent}>
                <h4 className={styles.workspaceName}>{invite.workspace?.name || 'Workspace'}</h4>
                <p className={styles.inviter}>
                  Invited by {invite.invitedBy?.firstName} {invite.invitedBy?.lastName}
                </p>
                <div className={styles.meta}>
                  <Clock size={12} />
                  <span>Expires {new Date(invite.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.actions}>
              <button 
                className={styles.declineBtn}
                onClick={() => declineMutation.mutate(invite.id)}
                disabled={declineMutation.isPending || acceptMutation.isPending}
              >
                <X size={16} />
                Decline
              </button>
              <button 
                className={styles.acceptBtn}
                onClick={() => acceptMutation.mutate(invite.id)}
                disabled={acceptMutation.isPending || declineMutation.isPending}
              >
                <Check size={16} />
                Join Workspace
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
