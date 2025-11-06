import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'caretrek_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeMode>('light'); // Default to light theme
  const [isDark, setIsDark] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync(THEME_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };

    loadThemePreference();
  }, []);

  // Update isDark based on theme and system preference
  useEffect(() => {
    const dark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
    setIsDark(dark);
    
    // Only run web-specific code in web environment
    if (Platform.OS === 'web') {
      // Use optional chaining and type checking to be extra safe
      const doc = typeof document !== 'undefined' ? document : null;
      if (doc?.documentElement) {
        const root = doc.documentElement;
        if (dark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        const themeValue = theme === 'system' ? systemColorScheme || 'light' : theme;
        root.setAttribute('data-theme', themeValue);
      }
    }
  }, [theme, systemColorScheme]);

  const handleSetTheme = async (newTheme: ThemeMode) => {
    try {
      await SecureStore.setItemAsync(THEME_KEY, newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  const toggleTheme = () => {
    handleSetTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        setTheme: handleSetTheme,
        toggleTheme,
      }}
    >
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
