
import React, { useState, useEffect, useRef } from 'react';
import { useInviteProfessional } from '../hooks/useAgreementMutations';
import { useAgreementParticipants } from '../hooks/useAgreementQueries';
import { userSearchService } from '../../user/services/user-search.service';
import type { PublicUserIdentity } from '../../user/types/user.types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

interface InviteProfessionalModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const InviteProfessionalModal: React.FC<
  InviteProfessionalModalProps
> = ({ projectId, isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicUserIdentity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] =
    useState<PublicUserIdentity | null>(null);

  const requestIdRef = useRef(0);

  const inviteMutation = useInviteProfessional(projectId);

  const { data: participantsData } =
    useAgreementParticipants(projectId);

  // Keep the latest active participant IDs without making
  // the search effect depend on a newly created Set.
  const activeParticipantIdsRef = useRef<Set<string>>(new Set());

  activeParticipantIdsRef.current = new Set(
    (participantsData?.participants ?? [])
      .filter(
        (participant) =>
          participant.invitationStatus === 'PENDING' ||
          participant.invitationStatus === 'ACCEPTED',
      )
      .map(
        (participant) =>
          participant.userId ?? participant.user?.id,
      )
      .filter((id): id is string => Boolean(id)),
  );

  // Debounced search. Runs only when query or modal visibility changes.
  useEffect(() => {
    const trimmedQuery = query.trim();
    const requestId = ++requestIdRef.current;

    if (!isOpen || trimmedQuery.length < 2) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const response = await userSearchService.searchUsers(
          trimmedQuery,
          1,
        );

        if (requestId !== requestIdRef.current) return;

        const fetchedUsers = response.data ?? [];

        const filteredUsers = fetchedUsers.filter((user) => {
          const targetUserId =
            (user as any).userId || user.id;

          return !activeParticipantIdsRef.current.has(
            targetUserId,
          );
        });

        setResults(filteredUsers);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        console.error('Professional search failed:', err);
        setError('Unable to search professionals. Please try again.');
        setResults([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      requestIdRef.current++;
    };
  }, [query, isOpen]);

  const handleInvite = async () => {
    if (!selectedUser) return;

    try {
      const targetUserId =
        (selectedUser as any).userId || selectedUser.id;

      await inviteMutation.mutateAsync({
        userId: targetUserId,
      });

      toast.success('Professional invited successfully');
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          'Failed to send invitation',
      );
    }
  };

  const resetState = () => {
    setQuery('');
    setResults([]);
    setSelectedUser(null);
    setError(null);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  if (selectedUser) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Confirm Invitation"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-24)',
          }}
        >
          <p
            style={{
              margin: 0,
              color: 'var(--color-text-secondary)',
            }}
          >
            Are you sure you want to invite this professional
            to your project agreement?
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-16)',
              padding: 'var(--space-16)',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
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
                overflow: 'hidden',
              }}
            >
              {selectedUser.avatarUrl ? (
                <img
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.firstName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                selectedUser.firstName[0]?.toUpperCase()
              )}
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                {selectedUser.firstName} {selectedUser.lastName}
              </div>

              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                @{selectedUser.username}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-12)',
            }}
          >
            <Button
              variant="outline"
              onClick={() => setSelectedUser(null)}
              disabled={inviteMutation.isPending}
            >
              Back to Search
            </Button>

            <Button
              onClick={handleInvite}
              disabled={inviteMutation.isPending}
            >
              {inviteMutation.isPending
                ? 'Sending...'
                : 'Send Invitation'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Professional"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-16)',
          minHeight: '300px',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-tertiary)',
            }}
          />

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or username..."
            style={{
              width: '100%',
              paddingLeft: '36px',
            }}
            autoFocus
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isLoading && query.trim().length >= 2 && (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-24)',
                color: 'var(--color-text-tertiary)',
              }}
            >
              Searching professionals...
            </div>
          )}

          {!isLoading && error && (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-24)',
                color: 'var(--color-error)',
              }}
            >
              {error}
            </div>
          )}

          {!isLoading &&
            !error &&
            query.trim().length >= 2 &&
            results.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-24)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                No professionals found matching "{query.trim()}"
              </div>
            )}

          {!isLoading && !error && results.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-8)',
              }}
            >
              {results.map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-12)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-12)',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        overflow: 'hidden',
                      }}
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.firstName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        user.firstName[0]?.toUpperCase()
                      )}
                    </div>

                    <div>
                      <div
                        style={{
                          fontWeight: 500,
                          color: 'var(--color-text-primary)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        {user.firstName} {user.lastName}
                      </div>

                      <div
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        @{user.username}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUser(user)}
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}

          {query.trim().length > 0 &&
            query.trim().length < 2 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-24)',
                  color: 'var(--color-text-tertiary)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                Type at least 2 characters to search
              </div>
            )}
        </div>
      </div>
    </Modal>
  );
};
