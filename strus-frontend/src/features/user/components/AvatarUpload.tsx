
import React, { useRef } from 'react';
import toast from 'react-hot-toast';

import { UserAvatar } from './UserAvatar';
import { AVATAR_CONSTRAINTS } from '../constants/user.constants';
import { useDeleteAvatar, useUploadAvatar } from '../hooks/useProfile';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return fallback;
};

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  firstName = '',
  lastName = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  const isUploading = uploadAvatar.isPending || deleteAvatar.isPending;

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      if (file.size > AVATAR_CONSTRAINTS.MAX_SIZE_BYTES) {
        toast.error(
          `Image must be smaller than ${AVATAR_CONSTRAINTS.MAX_SIZE_MB}MB`,
        );
        return;
      }

      if (!AVATAR_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)) {
        toast.error('Only JPEG, PNG, and WebP images are supported');
        return;
      }

      await uploadAvatar.mutateAsync(file);
      toast.success('Avatar updated successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to upload avatar'));
    } finally {
      // Allow selecting the same file again.
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAvatar.mutateAsync();
      toast.success('Avatar removed successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to remove avatar'));
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-12)',
      }}
    >
      <div style={{ position: 'relative' }}>
        <UserAvatar
          src={currentAvatarUrl}
          firstName={firstName}
          lastName={lastName}
          size="xl"
          className={isUploading ? 'opacity-50' : ''}
        />

        {isUploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '50%',
            }}
          >
            <span
              style={{
                color: 'white',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {uploadAvatar.isPending ? 'Uploading...' : 'Removing...'}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: 'var(--color-surface-hover)',
            border: 'none',
            borderRadius: '100px',
            color: 'var(--color-text-primary)',
            cursor: isUploading ? 'not-allowed' : 'pointer',
          }}
        >
          Change Avatar
        </button>

        {currentAvatarUrl && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isUploading}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '100px',
              color: 'var(--color-text-secondary)',
              cursor: isUploading ? 'not-allowed' : 'pointer',
            }}
          >
            Remove
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={AVATAR_CONSTRAINTS.ALLOWED_TYPES.join(',')}
        style={{ display: 'none' }}
        disabled={isUploading}
      />
    </div>
  );
};
