import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './TopHeader.module.css';

export const DashboardRoleToggle: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isClientPath = location.pathname.includes('/client');
  const isProfessionalPath = location.pathname.includes('/professional');

  // Determine active role based on path, falling back to localStorage or default 'client'
  const activeRole = isClientPath ? 'client' : isProfessionalPath ? 'professional' : (localStorage.getItem('strus_dashboard_role') || 'client');

  const handleToggle = (role: 'client' | 'professional') => {
    localStorage.setItem('strus_dashboard_role', role);
    navigate(`/dashboard/${role}`);
  };

  return (
    <div 
      className={`${styles.toggleContainer} ${activeRole === 'client' ? styles.isClient : styles.isProfessional}`} 
      role="group" 
      aria-label="Dashboard perspective"
    >
      <div className={styles.toggleIndicator} />
      <button
        type="button"
        className={styles.toggleButton}
        aria-pressed={activeRole === 'client'}
        onClick={() => handleToggle('client')}
      >
        Client
      </button>
      <button
        type="button"
        className={styles.toggleButton}
        aria-pressed={activeRole === 'professional'}
        onClick={() => handleToggle('professional')}
      >
        Professional
      </button>
    </div>
  );
};
