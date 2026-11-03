
import React from 'react';
import { Menu } from 'lucide-react';

import { DashboardRoleToggle } from './DashboardRoleToggle';
import { HeaderAccountMenu } from './HeaderAccountMenu';

import { InvitationsMenu } from '../invitations/InvitationsMenu';
import { ThemeToggle } from '../theme/ThemeToggle';
import { NotificationBell } from '../../features/events/components/NotificationBell';

import styles from './TopHeader.module.css';

interface TopHeaderProps {
  onMenuClick: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onMenuClick,
}) => {
  return (
    <header className={styles.header}>

      {/* Left section */}
      <div className={styles.headerLeft}>
        <button
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          type="button"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Center section */}
      <div className={styles.headerCenter}>
        <DashboardRoleToggle />
      </div>

      {/* Right section */}
      <div className={styles.headerRight}>
        <ThemeToggle />

        <InvitationsMenu />

        <NotificationBell />

        <HeaderAccountMenu />
      </div>
    </header>
  );
};
