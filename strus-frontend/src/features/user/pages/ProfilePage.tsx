
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useProfile } from '../hooks/useProfile';
import { ProfileCardSkeleton } from '../components/ProfileSkeletons';
import { UserAvatar } from '../components/UserAvatar';

export const ProfilePage: React.FC = () => {
  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div
        style={{
          padding: 'var(--space-32)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <ProfileCardSkeleton />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div
        style={{
          padding: 'var(--space-32)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-12)',
        }}
      >
        <p style={{ color: 'var(--color-error)' }}>
          {error instanceof Error ? error.message : 'Failed to load profile.'}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          style={{
            padding: '8px 20px',
            border: '1px solid var(--color-border)',
            borderRadius: '100px',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 'var(--space-32)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-48) var(--space-32)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
        }}
      >
        <UserAvatar
          src={profile.avatarUrl}
          firstName={profile.firstName}
          lastName={profile.lastName}
          size="xl"
        />

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginTop: 'var(--space-16)',
            marginBottom: '4px',
          }}
        >
          {profile.firstName} {profile.lastName}
        </h1>

        <p
          style={{
            color: 'var(--color-primary)',
            fontWeight: 500,
            marginBottom: 'var(--space-16)',
          }}
        >
          @{profile.username}
        </p>

        {profile.bio && (
          <p
            style={{
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              marginBottom: 'var(--space-24)',
              lineHeight: 1.6,
            }}
          >
            {profile.bio}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-16)',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
            marginBottom: 'var(--space-32)',
          }}
        >
          <span>📍 {profile.countryCode}</span>
          <span>🕒 {profile.timezone}</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/settings/profile')}
          style={{
            padding: '8px 24px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '100px',
            color: 'var(--color-text-primary)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(event) => {
            event.currentTarget.style.backgroundColor =
              'var(--color-surface-hover)';
          }}
          onMouseOut={(event) => {
            event.currentTarget.style.backgroundColor = 'var(--color-surface)';
          }}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};
