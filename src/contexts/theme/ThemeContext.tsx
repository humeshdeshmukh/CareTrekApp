import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  notification: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  error: string;
  success: string;
  warning: string;
  isDark: boolean;
}

const LIGHT_THEME: ThemeColors = {
  background: '#F8F9FC',
  card: '#FFFFFF',
  text: '#1A202C',
  textSecondary: '#4A5568',
  textTertiary: '#718096',
  border: '#E2E8F0',
  notification: '#E53E3E',
  primary: '#2F855A',
  primaryLight: '#48BB78',
  primaryDark: '#276749',
  secondary: '#4299E1',
  error: '#E53E3E',
  success: '#38A169',
  warning: '#DD6B20',
  isDark: false,
};

const DARK_THEME: ThemeColors = {
  background: '#171923',
  card: '#2D3748',
  text: '#F7FAFC',
  textSecondary: '#A0AEC0',
  textTertiary: '#718096',
  border: '#4A5568',
  notification: '#FC8181',
  primary: '#48BB78',
  primaryLight: '#68D391',
  primaryDark: '#2F855A',
  secondary: '#4299E1',
  error: '#FC8181',
  success: '#48BB78',
  warning: '#F6AD55',
  isDark: true,
};

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  
  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  const colors = isDark ? DARK_THEME : LIGHT_THEME;

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const toggleTheme = () => {
    setTheme(themeMode === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme: themeMode,
    isDark,
    colors,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
