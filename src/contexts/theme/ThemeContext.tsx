import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Theme, ThemeColors } from '../../types/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  themeColors: ThemeColors; // For backward compatibility
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

interface ThemeColors {
  // Base colors
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  
  // Brand colors - CareTrek colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Accent colors
  secondary: string;
  tertiary: string;
  
  // Status colors
  success: string;
  warning: string;
  danger: string;
  info: string;
  
  // Grayscale
  white: string;
  lightGray: string;
  gray: string;
  darkGray: string;
  black: string;
  
  // UI elements
  separator: string;
  disabled: string;
  placeholder: string;
  backdrop: string;
  
  // Transparent
  transparent: string;
  overlay: string;
  
  // Additional
  surface: string;
  
  // Additional theme properties
  isDark: boolean;
  button: {
    primary: {
      background: string;
      text: string;
    };
    secondary: {
      background: string;
      text: string;
      border: string;
    };
    success: {
      background: string;
      text: string;
    };
    danger: {
      background: string;
      text: string;
    };
  };
}

const THEME = {
  light: {
    // Base colors
    background: '#F8F9FC',
    card: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#4A4A68',
    textTertiary: '#7A7A9D',
    border: '#E6E6F0',
    
    // Brand colors - CareTrek colors
    primary: '#5E72E4',
    primaryLight: '#7B8CFF',
    primaryDark: '#4B56B6',
    
    // Accent colors
    secondary: '#2DCE89',
    tertiary: '#11CDEF',
    
    // Status colors
    success: '#2DCE89',
    warning: '#FB6340',
    danger: '#F5365C',
    info: '#11CDEF',
    
    // Grayscale
    white: '#FFFFFF',
    lightGray: '#F8F9FC',
    gray: '#A0AEC0',
    darkGray: '#4A5568',
    black: '#1A202C',
    
    // UI elements
    separator: '#E2E8F0',
    disabled: '#CBD5E0',
    placeholder: '#A0AEC0',
    backdrop: 'rgba(26, 32, 44, 0.8)',
    
    // Transparent
    transparent: 'transparent',
    overlay: 'rgba(26, 32, 44, 0.8)',
    
    // Additional
    surface: '#FFFFFF',
    
    // Additional theme properties
    isDark: false,
    button: {
      primary: {
        background: '#5E72E4',
        text: '#FFFFFF'
      },
      secondary: {
        background: '#F7FAFC',
        text: '#4A5568',
        border: '#E2E8F0'
      },
      success: {
        background: '#2DCE89',
        text: '#FFFFFF'
      },
      danger: {
        background: '#F5365C',
        text: '#FFFFFF'
      }
    }
  },
  dark: {
    // Base colors
    background: '#1A202C',
    card: '#2D3748',
    text: '#F7FAFC',
    textSecondary: '#CBD5E0',
    textTertiary: '#A0AEC0',
    border: '#4A5568',
    
    // Brand colors - CareTrek colors (darker for dark mode)
    primary: '#667EEA',
    primaryLight: '#7F9CF5',
    primaryDark: '#4C51BF',
    
    // Accent colors
    secondary: '#38B2AC',
    tertiary: '#0BC5EA',
    
    // Status colors
    success: '#38B2AC',
    warning: '#ED8936',
    danger: '#FC8181',
    info: '#0BC5EA',
    
    // Grayscale
    white: '#FFFFFF',
    lightGray: '#2D3748',
    gray: '#718096',
    darkGray: '#E2E8F0',
    black: '#000000',
    
    // UI elements
    separator: '#4A5568',
    disabled: '#4A5568',
    placeholder: '#718096',
    backdrop: 'rgba(0, 0, 0, 0.9)',
    
    // Transparent
    transparent: 'transparent',
    overlay: 'rgba(0, 0, 0, 0.9)',
    
    // Additional
    surface: '#2D3748',
    
    // Additional theme properties
    isDark: true,
    button: {
      primary: {
        background: '#667EEA',
        text: '#FFFFFF'
      },
      secondary: {
        background: '#2D3748',
        text: '#E2E8F0',
        border: '#4A5568'
      },
      success: {
        background: '#38B2AC',
        text: '#FFFFFF'
      },
      danger: {
        background: '#FC8181',
        text: '#FFFFFF'
      }
    }
  }
} as const;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'caretrek_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeMode>('light'); // Default to light theme
  const [isDark, setIsDark] = useState(false);
  
  // Get the current theme colors based on dark mode
  const themeColors = useMemo(() => {
    const colors = isDark ? THEME.dark : THEME.light;
    return colors;
  }, [isDark]);

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

  const value = useMemo(
    () => ({
      theme,
      isDark,
      colors: themeColors,
      themeColors, // For backward compatibility
      setTheme,
      toggleTheme,
    }),
    [theme, isDark, themeColors]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ... (rest of the code remains the same)
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  // Return both the theme context and a helper to get theme colors
  return {
    ...context,
    // For backward compatibility, spread theme colors at the root level
    ...context.themeColors,
  };
};
