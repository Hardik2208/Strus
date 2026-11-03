
import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { authService } from '../../features/auth/services/auth.service';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { useProfile } from '../../features/user/hooks/useProfile';
import { UserAvatar } from '../../features/user/components/UserAvatar';

import styles from './HeaderAccountMenu.module.css';

export const HeaderAccountMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const authUser = useAuthStore((state) => state.user);
  const { data: profile, isLoading } = useProfile();

  const firstName = profile?.firstName?.trim() || '';
  const lastName = profile?.lastName?.trim() || '';

  const fullName =
    [firstName, lastName].filter(Boolean).join(' ') || 'Your account';

  const email = authUser?.email || '';

  // Close dropdown when clicking outside or pressing Escape.
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Navigate to the existing profile settings route.
  const handleProfileNavigation = () => {
    setIsOpen(false);

    const isProfessional = location.pathname.includes('/professional');

    navigate(
      isProfessional
        ? '/dashboard/professional/settings/profile'
        : '/dashboard/client/settings/profile'
    );
  };

  // Reuse the existing authentication logout implementation.
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setIsOpen(false);

    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // authService.logout clears local authentication,
      // tokens and React Query cache in its finally block.
      navigate('/login', { replace: true });
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={styles.account} ref={menuRef}>

      {/* User identity */}
      <div className={styles.identity}>
        <span className={styles.greeting}>
          {isLoading
            ? 'Welcome'
            : `Hi${firstName ? `, ${firstName}` : ''}`}
        </span>
      </div>

      {/* Profile trigger */}
      <button
        type="button"
        className={styles.trigger}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <UserAvatar
          src={profile?.avatarUrl}
          firstName={firstName}
          lastName={lastName}
          size="sm"
        />

        <ChevronDown
          size={15}
          className={isOpen ? styles.chevronOpen : styles.chevron}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={styles.dropdown}
          role="menu"
          aria-label="Account menu"
        >

          {/* User information */}
          <div className={styles.userSummary}>
            <UserAvatar
              src={profile?.avatarUrl}
              firstName={firstName}
              lastName={lastName}
              size="md"
            />

            <div className={styles.userText}>
              <span className={styles.fullName}>
                {fullName}
              </span>

              <span className={styles.email}>
                {email || 'Email unavailable'}
              </span>
            </div>
          </div>

          <div className={styles.separator} />

          {/* My Profile */}
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={handleProfileNavigation}
          >
            <UserRound size={17} aria-hidden="true" />
            <span>My Profile</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            role="menuitem"
            className={`${styles.menuItem} ${styles.logout}`}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut size={17} aria-hidden="true" />

            <span>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
