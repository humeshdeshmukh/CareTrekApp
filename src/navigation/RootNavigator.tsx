import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/theme/ThemeContext';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LanguageScreen from '../screens/LanguageScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';

// Import main app screens
import SeniorDashboard from '../screens/Senior/HomeScreen';
import HealthScreen from '../screens/Senior/HealthScreen';
import MapScreen from '../screens/Senior/MapScreen';
import RemindersScreen from '../screens/Senior/RemindersScreen';
import IdShareScreen from '../screens/Senior/IdShareScreen';
import FamilyDashboard from '../screens/family/FamilyDashboard';
import ConnectSeniorScreen from '../screens/family/ConnectSeniorScreen';

export type RootStackParamList = {
  // Initial flow
  Welcome: undefined;
  Language: undefined;
  Onboarding: undefined;
  RoleSelection: undefined;
  
  // Senior Screens
  SeniorDashboard: undefined;
  Health: undefined;
  Reminders: undefined;
  Map: undefined;
  IdShare: undefined;
  
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

const RootNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
        gestureEnabled: true,
        cardOverlayEnabled: true,
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
      }}
    >
      {/* Initial Flow */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      
      {/* Senior Screens */}
      <Stack.Screen name="SeniorDashboard" component={SeniorDashboard} />
      <Stack.Screen 
        name="Health" 
        component={HealthScreen} 
        options={{ title: 'Health Metrics' }}
      />
      <Stack.Screen 
        name="Reminders" 
        component={RemindersScreen} 
        options={{ title: 'My Reminders' }}
      />
      <Stack.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ title: 'My Location' }}
      />
      <Stack.Screen 
        name="IdShare" 
        component={IdShareScreen} 
        options={{ title: 'Share My ID' }}
      />
      
      {/* Family Screens */}
      <Stack.Screen name="FamilyDashboard" component={FamilyDashboard} />
      <Stack.Screen 
        name="ConnectSenior" 
        component={ConnectSeniorScreen}
        options={{
          title: 'Connect to Senior',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
