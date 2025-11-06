import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import { useTheme } from './src/contexts/theme/ThemeContext';
import { AppProvider } from './src/providers/AppProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  const { isDark } = useTheme();
  const systemColorScheme = useColorScheme();
  
  // Determine status bar style based on theme
  const statusBarStyle = isDark ? 'light' : 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={isDark ? darkTheme : lightTheme}>
          <StatusBar style={statusBarStyle} />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


// Light theme colors
const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2F855A',
    background: '#FFFBEF',
    card: '#FFFFFF',
    text: '#1A202C',
    border: '#E5E5E5',
    notification: '#E53E3E',
  },
};

// Dark theme colors
const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#48BB78',
    background: '#171923',
    card: '#2D3748',
    text: '#F7FAFC',
    border: '#4A5568',
    notification: '#FC8181',
  },
};
