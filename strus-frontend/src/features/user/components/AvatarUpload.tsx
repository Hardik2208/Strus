import React, { useRef, useState } from 'react';
import { UserAvatar } from './UserAvatar';
import { avatarService } from '../services/avatar.service';
import { AVATAR_CONSTRAINTS, USER_QUERY_KEYS } from '../constants/user.constants';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  currentAvatarUrl, 
  firstName = '', 
  lastName = '' 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > AVATAR_CONSTRAINTS.MAX_SIZE_BYTES) {
      toast.error(`Image must be smaller than ${AVATAR_CONSTRAINTS.MAX_SIZE_MB}MB`);
      return;
    }

    if (!AVATAR_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are supported');
      return;
    }

    try {
      setIsUploading(true);
      await avatarService.uploadAvatar(file);
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile });
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    try {
      setIsUploading(true);
      await avatarService.deleteAvatar();
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile });
      toast.success('Avatar removed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-12)' }}>
      <div style={{ position: 'relative' }}>
        <UserAvatar 
          src={currentAvatarUrl} 
          firstName={firstName} 
          lastName={lastName} 
          size="xl" 
          className={isUploading ? 'opacity-50' : ''}
        />
        {isUploading && (
          <div style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '50%'
          }}>
            <span style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Uploading...</span>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          style={{
            padding: '6px 12px', fontSize: '12px', fontWeight: 600,
            backgroundColor: 'var(--color-surface-hover)', border: 'none', borderRadius: '100px',
            color: 'var(--color-text-primary)', cursor: isUploading ? 'not-allowed' : 'pointer'
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
              padding: '6px 12px', fontSize: '12px', fontWeight: 600,
              backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: '100px',
              color: 'var(--color-text-secondary)', cursor: isUploading ? 'not-allowed' : 'pointer'
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
      />
    </div>
  );
};
