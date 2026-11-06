
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import {
  COUNTRY_OPTIONS,
  TIMEZONE_OPTIONS,
} from '../constants/user.constants';

import {
  profileUpdateSchema,
  type ProfileUpdateFormData,
} from '../schemas/profile.schemas';

import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { ProfileCardSkeleton } from '../components/ProfileSkeletons';
import { AvatarUpload } from '../components/AvatarUpload';
import { Card } from '../../../components/ui/Card';
import { UsernameEditor } from '../components/UsernameEditor';

export const SettingsProfilePage: React.FC = () => {
  const { data: profile, isLoading, isError } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
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
      await updateProfile.mutateAsync(data);

      reset(data);

      toast.success('Profile updated successfully!');
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile',
      );
    }
  };

  if (isLoading) {
    return <ProfileCardSkeleton />;
  }

  if (isError || !profile) {
    return (
      <Card style={{ maxWidth: '600px', width: '100%' }}>
        <p style={{ color: 'var(--color-error)' }}>
          Unable to load your profile. Refresh the page and try again.
        </p>
      </Card>
    );
  }

  return (
    <Card style={{ maxWidth: '600px', width: '100%' }}>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-24)',
          marginTop: 0,
        }}
      >
        Public Profile
      </h2>

      {/* Avatar Management */}
      <div style={{ marginBottom: 'var(--space-32)' }}>
        <AvatarUpload
          currentAvatarUrl={profile.avatarUrl}
          firstName={profile.firstName}
          lastName={profile.lastName}
        />
      </div>

      {/* Username Management */}
      <div style={{ marginBottom: 'var(--space-24)' }}>
        <UsernameEditor currentUsername={profile.username} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-16)',
        }}
      >
        {/* First Name and Last Name */}
        <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <label
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
              }}
            >
              First Name
            </label>

            <input
              {...register('firstName')}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
              }}
            />

            {errors.firstName && (
              <span style={{ color: 'var(--color-error)', fontSize: '11px' }}>
                {errors.firstName.message}
              </span>
            )}
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <label
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
              }}
            >
              Last Name
            </label>

            <input
              {...register('lastName')}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
              }}
            />

            {errors.lastName && (
              <span style={{ color: 'var(--color-error)', fontSize: '11px' }}>
                {errors.lastName.message}
              </span>
            )}
          </div>
        </div>

        {/* Country and Timezone */}
        <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <label
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
              }}
            >
              Country
            </label>

            <select
              {...register('countryCode')}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}
            >
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </select>

            {errors.countryCode && (
              <span style={{ color: 'var(--color-error)', fontSize: '11px' }}>
                {errors.countryCode.message}
              </span>
            )}
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <label
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
              }}
            >
              Timezone
            </label>

            <select
              {...register('timezone')}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}
            >
              {TIMEZONE_OPTIONS.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
              ))}
            </select>

            {errors.timezone && (
              <span style={{ color: 'var(--color-error)', fontSize: '11px' }}>
                {errors.timezone.message}
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <label
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
            }}
          >
            Bio
          </label>

          <textarea
            {...register('bio')}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              minHeight: '80px',
              fontFamily: 'inherit',
            }}
          />

          {errors.bio && (
            <span style={{ color: 'var(--color-error)', fontSize: '11px' }}>
              {errors.bio.message}
            </span>
          )}
        </div>

        {/* Save */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 'var(--space-16)',
          }}
        >
          <button
            type="submit"
            disabled={updateProfile.isPending || !isDirty}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor:
                updateProfile.isPending || !isDirty
                  ? 'not-allowed'
                  : 'pointer',
              opacity: updateProfile.isPending || !isDirty ? 0.7 : 1,
            }}
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </Card>
  );
};
