import React, { useState, useRef, useEffect } from 'react';
import { authService } from '../../features/auth/services/auth.service';
import { LogOut, User, Key, MonitorSmartphone, Sun, Moon } from 'lucide-react';
import { useProfile } from '../../features/user/hooks/useProfile';
import { UserAvatar } from '../../features/user/components/UserAvatar';
import { UserIdentitySkeleton } from '../../features/user/components/ProfileSkeletons';
import { useNavigate } from 'react-router-dom';
import { ChangePasswordModal } from '../../features/auth/components/modals/ChangePasswordModal';
import { ManageSessionsModal } from '../../features/auth/components/modals/ManageSessionsModal';
import { useThemeStore } from '../../core/theme/theme.store';

export const UserMenu: React.FC = () => {
  const { data: profile, isLoading } = useProfile();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isSessionsModalOpen, setSessionsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Log out from all devices? You will be signed out everywhere.')) return;
    try {
      await authService.logoutAll();
    } catch (error) {
      console.error('Logout all failed:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-12) var(--space-8)', borderTop: '1px solid var(--color-border)' }}>
        <UserIdentitySkeleton />
      </div>
    );
  }

  const dropdownButtonStyle = {
    display: 'flex', alignItems: 'center', gap: 'var(--space-8)', width: '100%',
    padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--color-text-primary)', textAlign: 'left' as const, borderRadius: '4px',
    fontSize: '13px', fontWeight: 500
  };

  return (
    <>
      <div 
        ref={menuRef}
        style={{ 
          position: 'relative',
          padding: 'var(--space-12) var(--space-8)',
          borderTop: '1px solid var(--color-border)'
        }}
      >
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isOpen ? 'var(--color-surface-hover)' : 'transparent',
          }}
          onClick={() => setIsOpen(!isOpen)}
          title="Account Menu"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
            <UserAvatar 
              src={profile?.avatarUrl} 
              firstName={profile?.firstName} 
              lastName={profile?.lastName}
              size="sm"
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {profile?.firstName} {profile?.lastName}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                @{profile?.username}
              </span>
            </div>
          </div>
        </div>

        {isOpen && (
          <div style={{ 
            position: 'absolute',
            bottom: '100%',
            left: 'var(--space-8)',
            right: 'var(--space-8)',
            marginBottom: 'var(--space-8)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            padding: 'var(--space-8)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <button 
              onClick={() => { setIsOpen(false); navigate('/settings/profile'); }}
              style={dropdownButtonStyle}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <User size={16} /> Account Settings
            </button>

            <button 
              onClick={() => { setIsOpen(false); setPasswordModalOpen(true); }}
              style={dropdownButtonStyle}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Key size={16} /> Change Password
            </button>

            <button 
              onClick={() => { setIsOpen(false); setSessionsModalOpen(true); }}
              style={dropdownButtonStyle}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <MonitorSmartphone size={16} /> Active Sessions
            </button>

            <button 
              onClick={toggleTheme}
              style={dropdownButtonStyle}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
            
            <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />
            
            <button 
              onClick={handleLogout}
              style={{ ...dropdownButtonStyle, color: 'var(--color-error)' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={16} /> Log out
            </button>

            <button 
              onClick={handleLogoutAll}
              style={{ ...dropdownButtonStyle, color: 'var(--color-error)' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={16} /> Log out from all devices
            </button>
          </div>
        )}
      </div>

      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setPasswordModalOpen(false)} />
      <ManageSessionsModal isOpen={isSessionsModalOpen} onClose={() => setSessionsModalOpen(false)} />
    </>
  );
};
