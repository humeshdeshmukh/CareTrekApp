import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/theme/ThemeContext';
import { useAuth, AuthProvider } from '../contexts/auth/AuthContext';

// Import screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LanguageScreen from '../screens/LanguageScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import MainApp from '../screens/MainApp';
import { AuthNavigator } from './AuthNavigator';

// Import new screens
import SeniorDashboard from '../screens/Senior/SeniorDashboard';
import SeniorIdShare from '../screens/Senior/SeniorIdShare';
import SeniorMap from '../screens/Senior/SeniorMap';
import FamilyDashboard from '../screens/family/FamilyDashboard';
import ConnectSeniorScreen from '../screens/family/ConnectSeniorScreen';

export type RootStackParamList = {
  // Auth Stack
  Auth: undefined;
  // App Screens
  MainApp: { isGuest?: boolean } | undefined;
  // Onboarding Flow
  Welcome: undefined;
  Language: undefined;
  Onboarding: undefined;
  RoleSelection: undefined;
  // Senior Screens
  SeniorDashboard: undefined;
  SeniorIdShare: undefined;
  SeniorMap: undefined;
  // Family Screens
  FamilyDashboard: undefined;
  ConnectSenior: undefined;
  // Shared Screens
  HealthHistory: { seniorId?: string };
  MedicationReminder: undefined;
  ActivityTracker: undefined;
  Settings: undefined;
  Messages: { recipientId: string };
  TrackSenior: { seniorId: string };
  AddSenior: undefined;
  ScanQRCode: undefined;
  AddFamilyMember: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// This component will handle the authentication state and render the appropriate navigator
const AppNavigator = () => {
  const { isDark } = useTheme();
  const authContext = useAuth();
  
  // Local state for onboarding
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  
  // For development, you can set this to true to bypass auth
  const __DEV_MODE__ = true;
  
  // For development - set initial states
  useEffect(() => {
    if (__DEV_MODE__) {
      // Uncomment these for development
      // setHasCompletedOnboarding(true);
      // authContext.login('dev@example.com', 'password');
    }
  }, []);
  
  // For development, you can force certain states here
  React.useEffect(() => {
    if (__DEV_MODE__) {
      // Uncomment these for development
      // setHasCompletedOnboarding(true);
      // setIsAuthenticated(true);
      // setIsGuest(false);
    }
  }, []);

  // Determine initial route based on auth and onboarding state
  const getInitialRoute = (): keyof RootStackParamList => {
    if (authContext?.isAuthenticated || authContext?.isGuest) {
      if (authContext?.isGuest) {
        return 'SeniorDashboard'; // Changed from SeniorIdSetup to SeniorDashboard
      }
      // For now, default to FamilyDashboard for authenticated users
      // You can add role-based routing here later
      return 'FamilyDashboard';
    }
    return hasCompletedOnboarding ? 'Auth' : 'Welcome';
  };

  // Render the appropriate navigator based on auth state
  const renderContent = () => {
    return (
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
          gestureEnabled: true,
          cardOverlayEnabled: true,
        }}
      >
        {/* Onboarding Flow */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        
        {/* Senior Flow */}
        <Stack.Screen 
          name="SeniorDashboard" 
          component={SeniorDashboard} 
          options={{
            gestureEnabled: false, // Prevent swipe back to auth
          }}
        />
        <Stack.Screen 
          name="SeniorIdShare" 
          component={SeniorIdShare} 
          options={{
            title: 'Share Your ID',
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="SeniorMap" 
          component={SeniorMap} 
          options={{
            title: 'Live Location',
            headerShown: true,
          }}
        />
        
        {/* Family Flow */}
        <Stack.Screen 
          name="FamilyDashboard" 
          component={FamilyDashboard} 
        />
        <Stack.Screen 
          name="ConnectSenior" 
          component={ConnectSeniorScreen}
          options={{
            title: 'Connect to Senior',
            headerShown: true,
          }}
        />
        
        {/* Auth Flow */}
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator} 
          options={{
            headerShown: false,
          }}
        />
        
        {/* Fallback Main App */}
        <Stack.Screen name="MainApp" component={MainApp} />
      </Stack.Navigator>
    );
  };

  return renderContent();
};

// Create a wrapper component to provide auth context
export const RootNavigator = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};
