import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/theme/ThemeContext';

// Import screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LanguageScreen from '../screens/LanguageScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Language: undefined;
  Onboarding: undefined;
  RoleSelection: undefined;
  // Add other screen types here
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isDark } = useTheme();
  
  // Development mode - set to true to bypass auth
  const __DEV_MODE__ = true;
  
  // In a real app, you would check if the user is authenticated and has completed onboarding
  const isFirstLaunch = true; // Replace with your logic
  const isAuthenticated = false; // Set to false to always show Onboarding first

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: isDark ? '#171923' : '#FFFBEF' },
      }}
      initialRouteName="Welcome"
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
    </Stack.Navigator>
  );
};
