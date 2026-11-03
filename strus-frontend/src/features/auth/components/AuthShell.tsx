import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '../../../components/theme/ThemeToggle';
import styles from './AuthShell.module.css';

export const AuthShell: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.themeToggleWrapper}>
        <ThemeToggle />
      </div>
      <main className={styles.content}>
        <div className={styles.logo}>STRUS</div>
        <div className={styles.cardWrapper}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
