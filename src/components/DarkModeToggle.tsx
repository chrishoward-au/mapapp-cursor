import { useTheme } from '../contexts/ThemeContext';
import styles from './Map/Map.module.css';
import { Sun, Moon } from 'lucide-react';

export const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      className={`${styles.actionButton}`}
      onClick={toggleTheme}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? (
        <Sun size={20} />
      ) : (
        <Moon size={20} />
      )}
    </button>
  );
}; 