
import React, { useEffect, useState } from 'react';
import { Loader2, Search, Mail, X } from 'lucide-react';

import { useUserSearch } from '../hooks/useUserSearch';
import { UserAvatar } from './UserAvatar';
import type { PublicUserIdentity } from '../types/user.types';

export interface UserSearchSelection {
  identifier: string;
  type: 'USER' | 'EMAIL';
  user: PublicUserIdentity | null;
}

interface UserSearchAutocompleteProps {
  onSelect: (selection: UserSearchSelection) => void;
  onClear?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const UserSearchAutocomplete: React.FC<
  UserSearchAutocompleteProps
> = ({
  onSelect,
  onClear,
  disabled = false,
  placeholder = 'Search by name or username...',
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loadedUsers, setLoadedUsers] = useState<PublicUserIdentity[]>([]);
  const [selected, setSelected] = useState<UserSearchSelection | null>(null);

  const normalizedQuery = query.trim();
  const isEmail = EMAIL_REGEX.test(normalizedQuery);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(normalizedQuery);
      setPage(1);
      setLoadedUsers([]);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [normalizedQuery]);

  const searchQuery = useUserSearch(debouncedQuery, page);
  const searchResponse = searchQuery.data;

  useEffect(() => {
    const users = searchResponse?.data;
    if (!users) return;

    setLoadedUsers((previous) => {
      if (page === 1) return users;

      const existingIds = new Set(previous.map((user) => user.id));

      return [
        ...previous,
        ...users.filter((user) => !existingIds.has(user.id)),
      ];
    });
  }, [searchResponse, page]);

  const hasNextPage = searchResponse?.pagination?.hasNext ?? false;

  const isSearching =
    normalizedQuery.length >= 2 &&
    !isEmail &&
    (normalizedQuery !== debouncedQuery || searchQuery.isFetching);

  const showResults =
    isOpen &&
    !selected &&
    !disabled &&
    normalizedQuery.length >= 2 &&
    !isEmail;

  const showEmailOption =
    isOpen &&
    !selected &&
    !disabled &&
    isEmail;

  const handleSelectUser = (user: PublicUserIdentity) => {
    const selection: UserSearchSelection = {
      identifier: user.username,
      type: 'USER',
      user,
    };

    setSelected(selection);
    setQuery(user.username);
    setIsOpen(false);
    onSelect(selection);
  };

  const handleSelectEmail = () => {
    const selection: UserSearchSelection = {
      identifier: normalizedQuery,
      type: 'EMAIL',
      user: null,
    };

    setSelected(selection);
    setQuery(normalizedQuery);
    setIsOpen(false);
    onSelect(selection);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    setDebouncedQuery('');
    setLoadedUsers([]);
    setPage(1);
    setIsOpen(false);
    onClear?.();
  };

  const handleLoadMore = () => {
    if (!searchQuery.isFetching && hasNextPage) {
      setPage((previous) => previous + 1);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--color-text-muted)',
            display: 'flex',
          }}
        >
          {isSearching ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Search size={17} />
          )}
        </span>

        <input
          type="text"
          value={query}
          disabled={disabled || !!selected}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(null);
            setIsOpen(true);
            onClear?.();
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsOpen(false);
          }}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search users by name, username, or email"
          aria-expanded={showResults || showEmailOption}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px 40px 10px 38px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            outline: 'none',
          }}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Clear selection"
            style={{
              position: 'absolute',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <X size={17} />
          </button>
        )}
      </div>

      {selected && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)',
            marginTop: '8px',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          {selected.type === 'USER' && selected.user ? (
            <>
              <UserAvatar
                src={selected.user.avatarUrl}
                firstName={selected.user.firstName}
                lastName={selected.user.lastName}
                size="sm"
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
                  {selected.user.firstName} {selected.user.lastName}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  @{selected.user.username}
                </p>
              </div>
            </>
          ) : (
            <>
              <Mail size={20} color="var(--color-text-secondary)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
                  {selected.identifier}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Email identifier
                </p>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Remove selected user"
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {showResults && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 1100,
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {normalizedQuery !== debouncedQuery || searchQuery.isLoading ? (
            <div
              style={{
                padding: '14px',
                color: 'var(--color-text-secondary)',
                fontSize: '13px',
                textAlign: 'center',
              }}
            >
              Searching users...
            </div>
          ) : searchQuery.isError ? (
            <div
              style={{
                padding: '14px',
                color: 'var(--color-error)',
                fontSize: '13px',
              }}
            >
              Could not search users. Try again.
            </div>
          ) : loadedUsers.length === 0 ? (
            <div
              style={{
                padding: '14px',
                color: 'var(--color-text-secondary)',
                fontSize: '13px',
                textAlign: 'center',
              }}
            >
              No users found for "{normalizedQuery}".
            </div>
          ) : (
            <>
              {loadedUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  role="option"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelectUser(user)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-12)',
                    padding: '10px 12px',
                    border: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor =
                      'var(--color-surface-hover)';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <UserAvatar
                    src={user.avatarUrl}
                    firstName={user.firstName}
                    lastName={user.lastName}
                    size="sm"
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
                      {user.firstName} {user.lastName}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      @{user.username}
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                    }}
                  >
                    Select
                  </span>
                </button>
              ))}

              {hasNextPage && (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleLoadMore}
                  disabled={searchQuery.isFetching}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--color-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {searchQuery.isFetching
                    ? 'Loading...'
                    : 'Load more results'}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {showEmailOption && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 1100,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleSelectEmail}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-12)',
              padding: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <Mail size={20} color="var(--color-text-secondary)" />

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
                Use this email address
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  overflowWrap: 'anywhere',
                }}
              >
                {normalizedQuery}
              </p>
            </div>

            <span
              style={{
                fontSize: '12px',
                color: 'var(--color-primary)',
                fontWeight: 600,
              }}
            >
              Select
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
