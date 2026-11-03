import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import type { DashboardPerspective } from '../../features/navigation/navigation.types';
import styles from '../../app/layouts/DashboardLayout.module.css';
import { useLocation } from 'react-router-dom';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  perspective: DashboardPerspective;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, perspective }) => {
  const location = useLocation();

  // Close drawer automatically on navigation
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  return (
    <>
      <div 
        className={`${styles.mobileDrawerOverlay} ${isOpen ? styles.open : ''}`} 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`${styles.mobileSidebarContainer} ${isOpen ? styles.open : ''}`}>
        <Sidebar perspective={perspective} />
      </div>
    </>
  );
};
