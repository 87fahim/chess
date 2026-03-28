import React from 'react';
import './ThemeOption.css';
import { useTheme } from '../context/ThemeProvider';

const ThemeOption = ({ theme }) => {
  const { setTheme, theme: currentTheme } = useTheme();
  const onSelect = () => setTheme(theme);
  const active = theme === currentTheme ? 'theme-option-active' : '';

  return (
    <div
      onClick={onSelect}
      className={`theme-option ${active}`}
      id={`theme-${theme}`}
      aria-label={`Set ${theme} theme`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    />
  );
};

export default ThemeOption;