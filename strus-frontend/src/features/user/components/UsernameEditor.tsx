
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { usernameService } from '../services/username.service';
import { useUpdateUsername } from '../hooks/useProfile';

interface UsernameEditorProps {
  currentUsername: string;
}

const USERNAME_REGEX =
  /^(?![._])(?!.*[._]{2})[a-z0-9._]{3,30}(?<![._])$/;

const getAvailabilityMessage = (reason?: string): string => {
  switch (reason) {
    case 'INVALID_USERNAME':
      return 'Username format is invalid';
    case 'USERNAME_UNAVAILABLE':
      return 'This username is unavailable';
    default:
      return 'This username is not available';
  }
};

export const UsernameEditor: React.FC<UsernameEditorProps> = ({
  currentUsername,
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [availability, setAvailability] = useState<
    'idle' | 'checking' | 'available' | 'unavailable' | 'invalid' | 'error'
  >('idle');
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  const updateUsername = useUpdateUsername();

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedCurrentUsername = currentUsername.toLowerCase();
  const isUnchanged = normalizedUsername === normalizedCurrentUsername;
  const isFormatValid = USERNAME_REGEX.test(normalizedUsername);

  useEffect(() => {
    setUsername(currentUsername);
  }, [currentUsername]);

  useEffect(() => {
    setAvailability('idle');
    setAvailabilityMessage('');

    if (!normalizedUsername || isUnchanged) {
      return;
    }

    if (!isFormatValid) {
      setAvailability('invalid');
      setAvailabilityMessage(
        'Use 3–30 lowercase letters, numbers, periods, or underscores. No leading, trailing, or consecutive periods/underscores.',
      );
      return;
    }

    let isActive = true;

    const timer = window.setTimeout(async () => {
      setAvailability('checking');

      try {
        const response =
          await usernameService.checkAvailability(normalizedUsername);

        if (!isActive) return;

        if (response.data.available) {
          setAvailability('available');
          setAvailabilityMessage('Username is available');
        } else {
          setAvailability('unavailable');
          setAvailabilityMessage(
            getAvailabilityMessage(response.data.reason),
          );
        }
      } catch (error: unknown) {
        if (!isActive) return;

        setAvailability('error');
        setAvailabilityMessage(
          error instanceof Error
            ? error.message
            : 'Could not check username availability',
        );
      }
    }, 500);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [
    normalizedUsername,
    normalizedCurrentUsername,
    isUnchanged,
    isFormatValid,
  ]);

  const handleSave = async () => {
    if (
      isUnchanged ||
      !isFormatValid ||
      availability !== 'available' ||
      updateUsername.isPending
    ) {
      return;
    }

    try {
      await updateUsername.mutateAsync(normalizedUsername);
      setUsername(normalizedUsername);
      setAvailability('idle');
      setAvailabilityMessage('');
      toast.success('Username updated successfully');
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update username',
      );
    }
  };

  const isSaveDisabled =
    isUnchanged ||
    !isFormatValid ||
    availability !== 'available' ||
    updateUsername.isPending;

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-12)',
        padding: 'var(--space-16)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          Username
        </h3>

        <p
          style={{
            margin: '4px 0 0',
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
          }}
        >
          Your unique public identity on Strus.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-8)',
          alignItems: 'center',
        }}
      >
        <span style={{ color: 'var(--color-text-muted)' }}>@</span>

        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          maxLength={30}
          autoComplete="off"
          spellCheck={false}
          placeholder="your_username"
          disabled={updateUsername.isPending}
          style={{
            flex: 1,
            minWidth: 0,
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
          }}
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaveDisabled}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 600,
            cursor: isSaveDisabled ? 'not-allowed' : 'pointer',
            opacity: isSaveDisabled ? 0.6 : 1,
          }}
        >
          {updateUsername.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>

      {availabilityMessage && !isUnchanged && (
        <p
          role="status"
          style={{
            margin: 0,
            fontSize: '12px',
            color:
              availability === 'available'
                ? 'var(--color-success)'
                : availability === 'checking'
                  ? 'var(--color-text-secondary)'
                  : 'var(--color-error)',
          }}
        >
          {availability === 'checking'
            ? 'Checking availability...'
            : availabilityMessage}
        </p>
      )}

      {isUnchanged && (
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: 'var(--color-text-muted)',
          }}
        >
          This is your current username.
        </p>
      )}
    </section>
  );
};
