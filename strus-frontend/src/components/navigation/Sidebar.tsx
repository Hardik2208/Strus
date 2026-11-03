import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getNavigation, isRouteActive } from '../../features/navigation/navigation.utils';
import type { DashboardPerspective } from '../../features/navigation/navigation.types';
import styles from './Sidebar.module.css';
import { UserMenu } from './UserMenu';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { ProjectSwitcher } from './ProjectSwitcher';

interface SidebarProps {
  perspective: DashboardPerspective;
}

export const Sidebar: React.FC<SidebarProps> = ({ perspective }) => {
  const location = useLocation();
  const navigationItems = getNavigation(perspective);

  const workspaceItems = navigationItems.filter(i => i.section === 'WORKSPACE');
  const accountItems = navigationItems.filter(i => i.section === 'ACCOUNT');

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>STRUS</div>
      
      {perspective === 'professional' ? <ProjectSwitcher /> : <WorkspaceSwitcher />}
      
      <nav className={styles.nav}>
        {workspaceItems.length > 0 && (
          <div className={styles.section}>
            {workspaceItems.map(item => (
              <NavLink 
                key={item.id} 
                to={item.route}
                className={() => 
                  isRouteActive(location.pathname, item.route) 
                    ? `${styles.navLink} ${styles.navLinkActive}` 
                    : styles.navLink
                }
              >
                <item.icon className={styles.icon} size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}

        {navigationItems.filter(i => i.section === 'QUICK_ACTIONS').length > 0 && (
          <div className={styles.section}>
            <hr className={styles.separator} />
            {navigationItems.filter(i => i.section === 'QUICK_ACTIONS').map(item => (
              <NavLink 
                key={item.id} 
                to={item.route}
                className={() => 
                  isRouteActive(location.pathname, item.route) 
                    ? `${styles.navLink} ${styles.navLinkActive}` 
                    : styles.navLink
                }
              >
                <item.icon className={styles.icon} size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}

        {accountItems.length > 0 && (
          <div className={styles.section}>
            <hr className={styles.separator} />
            {accountItems.map(item => (
              <NavLink 
                key={item.id} 
                to={item.route}
                className={() => 
                  isRouteActive(location.pathname, item.route) 
                    ? `${styles.navLink} ${styles.navLinkActive}` 
                    : styles.navLink
                }
              >
                <item.icon className={styles.icon} size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-24)' }}>
        <UserMenu />
      </div>
    </aside>
  );
};
