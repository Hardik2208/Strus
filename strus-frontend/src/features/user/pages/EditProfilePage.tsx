import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { profileUpdateSchema, type ProfileUpdateFormData } from '../schemas/profile.schemas';
import { profileService } from '../services/profile.service';
import { useProfile } from '../hooks/useProfile';
import { useQueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEYS } from '../constants/user.constants';
import { ProfileCardSkeleton } from '../components/ProfileSkeletons';
import { AvatarUpload } from '../components/AvatarUpload';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema)
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        countryCode: profile.countryCode,
        timezone: profile.timezone,
        bio: profile.bio || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileUpdateFormData) => {
    try {
      await profileService.updateProfile(data);
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile });
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return <div style={{ padding: 'var(--space-32)', display: 'flex', justifyContent: 'center' }}><ProfileCardSkeleton /></div>;
  }

  return (
    <div style={{ padding: 'var(--space-32)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ 
        width: '100%', maxWidth: '480px', padding: 'var(--space-32)', 
        backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--color-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Edit Profile
          </h1>
        </div>

        <div style={{ marginBottom: 'var(--space-32)' }}>
          <AvatarUpload 
            currentAvatarUrl={profile?.avatarUrl} 
            firstName={profile?.firstName}
            lastName={profile?.lastName}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>First Name</label>
              <input 
                {...register('firstName')} 
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border)' }} 
              />
              {errors.firstName && <span style={{ color: 'red', fontSize: '11px' }}>{errors.firstName.message}</span>}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Last Name</label>
              <input 
                {...register('lastName')} 
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border)' }} 
              />
              {errors.lastName && <span style={{ color: 'red', fontSize: '11px' }}>{errors.lastName.message}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Country</label>
              <select {...register('countryCode')} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
                <option value="US">United States (US)</option>
                <option value="GB">United Kingdom (GB)</option>
                <option value="IN">India (IN)</option>
                <option value="CA">Canada (CA)</option>
                <option value="AU">Australia (AU)</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Timezone</label>
              <select {...register('timezone')} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Bio</label>
            <textarea 
              {...register('bio')} 
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border)', minHeight: '80px', fontFamily: 'inherit' }} 
            />
            {errors.bio && <span style={{ color: 'red', fontSize: '11px' }}>{errors.bio.message}</span>}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
            <button 
              type="button" 
              onClick={() => navigate('/profile')}
              style={{ 
                flex: 1, padding: '10px', backgroundColor: 'transparent', 
                color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', 
                borderRadius: '4px', fontWeight: 600, cursor: 'pointer' 
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !isDirty}
              style={{ 
                flex: 1, padding: '10px', backgroundColor: 'var(--color-primary)', 
                color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600,
                cursor: (isSubmitting || !isDirty) ? 'not-allowed' : 'pointer',
                opacity: (isSubmitting || !isDirty) ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
