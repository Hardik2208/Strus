import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../core/theme/theme.store';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  className?: string;
  size?: number;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, size = 18 }) => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`${styles.toggleButton} ${className || ''}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={styles.icon}>
        {isDark ? <Sun size={size} /> : <Moon size={size} />}
      </span>
    </button>
  );
};
