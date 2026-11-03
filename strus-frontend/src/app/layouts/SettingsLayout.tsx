import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { User, Shield } from 'lucide-react';
import styles from './SettingsLayout.module.css';

export const SettingsLayout: React.FC = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Account Settings</h1>
        <p className={styles.subtitle}>Manage your profile, security, and preferences.</p>
      </header>
      
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <NavLink 
            to="profile" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <User size={18} />
            Profile
          </NavLink>
          <NavLink 
            to="security" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <Shield size={18} />
            Security & Sessions
          </NavLink>
        </aside>
        
        <main className={styles.mainPanel}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
