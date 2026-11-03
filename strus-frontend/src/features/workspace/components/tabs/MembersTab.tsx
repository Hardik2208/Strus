
import React, { useEffect, useState } from 'react';

import { useWorkspaceMembers } from '../../hooks/useWorkspace';
import type {
  WorkspaceDetail,
  WorkspaceRole,
} from '../../types/workspace.types';

import { Button } from '../../../../components/ui/Button';

import { InviteMemberModal } from '../modals/InviteMemberModal';
import { RoleChangeModal } from '../modals/RoleChangeModal';
import { RemoveMemberModal } from '../modals/RemoveMemberModal';

import { MoreHorizontal } from 'lucide-react';

interface MembersTabProps {
  workspace: WorkspaceDetail;
  memberRole: WorkspaceRole;
}

export const MembersTab: React.FC<MembersTabProps> = ({
  workspace,
  memberRole,
}) => {
  const [page, setPage] = useState(1);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [roleChangeData, setRoleChangeData] = useState<{
    id: string;
    name: string;
    currentRole: string;
    newRole: 'ADMIN' | 'MEMBER';
  } | null>(null);

  const [removeMemberData, setRemoveMemberData] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useWorkspaceMembers(workspace.id, page, 10);

  // Use the role supplied by the workspace detail API.
  const currentRole = memberRole || workspace.myRole;

  const isOwner = currentRole === 'OWNER';
  const isTeamWorkspace = workspace.workspaceType === 'TEAM';

  const canInviteMembers = isTeamWorkspace && isOwner;
  const canChangeMemberRole = isTeamWorkspace && isOwner;
  const canRemoveMember = isTeamWorkspace && isOwner;

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuId(null);
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
        <p style={{ marginBottom: 'var(--space-12)' }}>
          Failed to load workspace members.
        </p>

        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const members = data?.members || [];
  const pagination = data?.pagination;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-24)',
      }}
    >
      {/* Header and invitation action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>
          {pagination?.total || 0} members
        </h2>

        {canInviteMembers && (
          <Button onClick={() => setIsInviteOpen(true)}>
            + Invite Member
          </Button>
        )}
      </div>

      {/* Members list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-16)',
        }}
      >
        {members.map((member) => {
          const isOwnerActionable =
            (canChangeMemberRole || canRemoveMember) &&
            member.role !== 'OWNER';

          return (
            <div
              key={member.id}
              onClick={() => {
                if (isOwnerActionable) {
                  setActiveMenuId(
                    activeMenuId === member.id ? null : member.id
                  );
                }
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-16)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                cursor: isOwnerActionable ? 'pointer' : 'default',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-16)',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                  }}
                >
                  {member.firstName.charAt(0)}
                  {member.lastName.charAt(0)}
                </div>

                <div>
                  <h4
                    style={{
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {member.firstName} {member.lastName}
                  </h4>

                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    @{member.username} · Joined{' '}
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-16)',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--color-surface-subtle)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {member.role}
                </span>

                {isOwnerActionable && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(
                          activeMenuId === member.id
                            ? null
                            : member.id
                        );
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {activeMenuId === member.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '4px',
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-md)',
                          minWidth: '150px',
                          zIndex: 50,
                          padding: '4px 0',
                        }}
                      >
                        {canChangeMemberRole && (
                          <button
                            onClick={() => {
                              setRoleChangeData({
                                id: member.id,
                                name: member.firstName,
                                currentRole: member.role,
                                newRole:
                                  member.role === 'ADMIN'
                                    ? 'MEMBER'
                                    : 'ADMIN',
                              });

                              setActiveMenuId(null);
                            }}
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 16px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 'var(--text-sm)',
                              color: 'var(--color-text-primary)',
                            }}
                          >
                            Change Role
                          </button>
                        )}

                        {canRemoveMember && (
                          <button
                            onClick={() => {
                              setRemoveMemberData({
                                id: member.id,
                                name: member.firstName,
                              });

                              setActiveMenuId(null);
                            }}
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 16px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 'var(--text-sm)',
                              color: 'var(--color-error)',
                            }}
                          >
                            Remove Member
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {members.length === 0 && (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              padding: 'var(--space-24)',
            }}
          >
            No workspace members found.
          </p>
        )}
      </div>

      {/* Member pagination */}
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
            onClick={() => setPage((p) => p - 1)}
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
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Invite member modal */}
      {canInviteMembers && (
        <InviteMemberModal
          workspaceId={workspace.id}
          workspaceName={workspace.name}
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
        />
      )}

      {/* Change member role modal */}
      {roleChangeData && (
        <RoleChangeModal
          workspaceId={workspace.id}
          memberId={roleChangeData.id}
          memberName={roleChangeData.name}
          currentRole={roleChangeData.currentRole}
          newRole={roleChangeData.newRole}
          isOpen={true}
          onClose={() => setRoleChangeData(null)}
        />
      )}

      {/* Remove member modal */}
      {removeMemberData && (
        <RemoveMemberModal
          workspaceId={workspace.id}
          memberId={removeMemberData.id}
          memberName={removeMemberData.name}
          isOpen={true}
          onClose={() => setRemoveMemberData(null)}
        />
      )}
    </div>
  );
};
