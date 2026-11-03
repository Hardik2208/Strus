import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../../components/navigation/Sidebar';
import { TopHeader } from '../../components/navigation/TopHeader';
import { MobileSidebar } from '../../components/navigation/MobileSidebar';
import { useDashboardRealtime } from '../../features/dashboard/hooks/useDashboardRealtime';
import type { DashboardPerspective } from '../../features/navigation/navigation.types';
import styles from './DashboardLayout.module.css';

export const DashboardLayout: React.FC = () => {
  // Initialize realtime connection and event listeners at the layout level
  useDashboardRealtime();
  
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Derive perspective from URL, fallback to localStorage, then default to client
  const perspective: DashboardPerspective = location.pathname.includes('/professional') 
    ? 'professional' 
    : location.pathname.includes('/client') 
      ? 'client'
      : (localStorage.getItem('strus_dashboard_role') as DashboardPerspective) || 'client';

  return (
    <div className={styles.layout}>
      {/* Desktop Sidebar */}
      <div className={styles.sidebarWrapper}>
        <Sidebar perspective={perspective} />
      </div>

      {/* Mobile Drawer */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        perspective={perspective} 
      />

      <main className={styles.main}>
        <TopHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
