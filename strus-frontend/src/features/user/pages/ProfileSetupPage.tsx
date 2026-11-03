import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { profileSetupSchema, type ProfileSetupFormData } from '../schemas/profile.schemas';
import { profileService } from '../services/profile.service';
import { usernameService } from '../services/username.service';
import { useAuthStore } from '../../auth/store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEYS } from '../constants/user.constants';

export const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore(state => state.setAuth);
  const authState = useAuthStore(state => state);
  
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSetupFormData>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      countryCode: 'US',
      timezone: 'America/New_York',
      bio: '',
    }
  });

  const usernameValue = watch('username');

  // Extremely basic debounce effect (a real implementation might use a custom hook)
  React.useEffect(() => {
    if (!usernameValue || usernameValue.length < 3) return;

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await usernameService.checkAvailability(usernameValue);
        if (!res.data.available) {
          setUsernameError('Username is already taken');
        } else {
          setUsernameError(null);
        }
      } catch (err) {
        setUsernameError('Could not verify username availability');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [usernameValue]);

  const onSubmit = async (data: ProfileSetupFormData) => {
    if (usernameError) return; // Don't submit if username is invalid
    
    try {
      await profileService.createProfile(data);
      
      // Update auth store to indicate profile is completed
      if (authState.user && authState.accessToken) {
        const updatedUser = { ...authState.user, profileCompleted: true };
        setAuth(updatedUser, authState.accessToken, true);
      }

      // Invalidate the profile query so next fetch grabs the fresh created one
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile });
      
      toast.success('Profile created successfully!');
      navigate('/dashboard/client', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete profile setup');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
      <div style={{ 
        width: '100%', maxWidth: '480px', padding: 'var(--space-32)', 
        backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--color-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' 
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          Complete Your Profile
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-24)', fontSize: '14px' }}>
          Please set up your identity to access Strus.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>First Name</label>
              <input 
                {...register('firstName')} 
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border)' }} 
                placeholder="Jane"
              />
              {errors.firstName && <span style={{ color: 'red', fontSize: '11px' }}>{errors.firstName.message}</span>}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Last Name</label>
              <input 
                {...register('lastName')} 
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border)' }} 
                placeholder="Doe"
              />
              {errors.lastName && <span style={{ color: 'red', fontSize: '11px' }}>{errors.lastName.message}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Username</label>
            <input 
              {...register('username')} 
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border)' }} 
              placeholder="jane_doe"
            />
            {isCheckingUsername && <span style={{ fontSize: '11px', color: 'var(--color-primary)' }}>Checking availability...</span>}
            {usernameError && <span style={{ color: 'red', fontSize: '11px' }}>{usernameError}</span>}
            {errors.username && <span style={{ color: 'red', fontSize: '11px' }}>{errors.username.message}</span>}
            {!isCheckingUsername && !usernameError && usernameValue?.length >= 3 && !errors.username && (
              <span style={{ color: 'green', fontSize: '11px' }}>Username is available</span>
            )}
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
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Bio (Optional)</label>
            <textarea 
              {...register('bio')} 
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border)', minHeight: '80px', fontFamily: 'inherit' }} 
              placeholder="Tell us a little about yourself"
            />
            {errors.bio && <span style={{ color: 'red', fontSize: '11px' }}>{errors.bio.message}</span>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !!usernameError || isCheckingUsername}
            style={{ 
              marginTop: 'var(--space-8)',
              padding: '12px', 
              backgroundColor: 'var(--color-primary)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px',
              fontWeight: 600,
              cursor: (isSubmitting || !!usernameError || isCheckingUsername) ? 'not-allowed' : 'pointer',
              opacity: (isSubmitting || !!usernameError || isCheckingUsername) ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};
