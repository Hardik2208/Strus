
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Inbox } from 'lucide-react';

import {
  usePendingAgreementInvitations,
  useAcceptAgreementInvitation,
  useDeclineAgreementInvitation,
} from '../../features/agreement/hooks/useAgreementInvitations';

import {
  usePendingWorkspaceInvitations,
  useAcceptWorkspaceInvitation,
  useDeclineWorkspaceInvitation,
} from '../../features/workspace/hooks/useWorkspace';

import type { PendingWorkspaceInvitation } from '../../features/workspace/types/workspace.types';

import { useAuthStore } from '../../features/auth/store/auth.store';
import { useInvitationSockets } from '../../core/realtime/hooks/useInvitationSockets';

import styles from './InvitationsMenu.module.css';

export const InvitationsMenu: React.FC = () => {
  useInvitationSockets();

  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((state) => state.user);

  const { data: agreementInvitesData } =
    usePendingAgreementInvitations();

  const { data: workspaceInvitesData } =
    usePendingWorkspaceInvitations();

  const acceptAgreement = useAcceptAgreementInvitation();
  const declineAgreement = useDeclineAgreementInvitation();

  const acceptWorkspace = useAcceptWorkspaceInvitation();
  const declineWorkspace = useDeclineWorkspaceInvitation();

  const agreementInvites =
    agreementInvitesData?.invitations || [];

  const workspaceInvites: PendingWorkspaceInvitation[] =
    Array.isArray(workspaceInvitesData)
      ? workspaceInvitesData
      : workspaceInvitesData?.invitations || [];

  const totalInvites =
    agreementInvites.length + workspaceInvites.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className={styles.container} ref={menuRef}>
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label="View Invitations"
      >
        <Bell size={20} />

        {totalInvites > 0 && (
          <span className={styles.badge}>
            {totalInvites > 9 ? '9+' : totalInvites}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3 className={styles.title}>Invitations</h3>
          </div>

          <div className={styles.list}>
            {totalInvites === 0 ? (
              <div className={styles.emptyState}>
                <Inbox
                  size={32}
                  style={{ opacity: 0.5, marginBottom: '12px' }}
                />
                <p>No pending invitations</p>
              </div>
            ) : (
              <>
                {/* Workspace invitations */}
                {workspaceInvites.map((invite) => (
                  <div key={invite.id} className={styles.item}>
                    <div className={styles.itemHeader}>
                      <div>
                        <span
                          className={styles.itemType}
                          style={{
                            backgroundColor: 'var(--color-primary-light)',
                            color: 'var(--color-primary)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            marginBottom: '4px',
                            display: 'inline-block',
                          }}
                        >
                          Workspace
                        </span>

                        <h4 className={styles.itemTitle}>
                          {invite.workspace?.name || 'Workspace invitation'}
                        </h4>

                        {invite.workspace?.description && (
                          <p className={styles.itemSubtitle}>
                            {invite.workspace.description}
                          </p>
                        )}

                        <p className={styles.itemSubtitle}>
                          Invited by:{' '}
                          {invite.invitedBy
                            ? `${invite.invitedBy.firstName} ${invite.invitedBy.lastName}`
                            : 'Unknown'}
                        </p>

                        {invite.workspace?.owner && (
                          <p className={styles.itemSubtitle}>
                            Workspace owner:{' '}
                            {invite.workspace.owner.firstName}{' '}
                            {invite.workspace.owner.lastName}
                          </p>
                        )}

                        <p className={styles.itemSubtitle}>
                          Expires:{' '}
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <button
                        className={styles.acceptBtn}
                        onClick={() => acceptWorkspace.mutate(invite.id)}
                        disabled={
                          acceptWorkspace.isPending ||
                          declineWorkspace.isPending
                        }
                      >
                        Accept
                      </button>

                      <button
                        className={styles.declineBtn}
                        onClick={() => declineWorkspace.mutate(invite.id)}
                        disabled={
                          acceptWorkspace.isPending ||
                          declineWorkspace.isPending
                        }
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}

                {/* Agreement invitations */}
                {agreementInvites.map((invite: any) => (
                  <div key={invite.id} className={styles.item}>
                    <div className={styles.itemHeader}>
                      <div>
                        <span
                          className={`${styles.itemType} ${styles.typeAgreement}`}
                        >
                          Agreement
                        </span>

                        <h4 className={styles.itemTitle}>
                          {invite.agreement?.title}
                        </h4>

                        <p className={styles.itemSubtitle}>
                          Project: {invite.project?.title}
                        </p>

                        <p className={styles.itemSubtitle}>
                          Invited by:{' '}
                          {invite.invitedBy?.firstName}{' '}
                          {invite.invitedBy?.lastName}
                        </p>
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <button
                        className={styles.acceptBtn}
                        onClick={() =>
                          acceptAgreement.mutate({
                            projectId: invite.project?.id,
                            participantId: invite.id,
                          })
                        }
                        disabled={
                          acceptAgreement.isPending ||
                          declineAgreement.isPending
                        }
                      >
                        Accept
                      </button>

                      <button
                        className={styles.declineBtn}
                        onClick={() =>
                          declineAgreement.mutate({
                            projectId: invite.project?.id,
                            participantId: invite.id,
                          })
                        }
                        disabled={
                          acceptAgreement.isPending ||
                          declineAgreement.isPending
                        }
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
