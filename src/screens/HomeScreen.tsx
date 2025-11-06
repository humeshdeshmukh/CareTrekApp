import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { isDark } = useTheme();
  const pan = useRef(new Animated.ValueXY()).current;
  
  // Development mode navigation
  const goToScreen = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName);
  };

  // Set up pan responder for swipe back gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow right swipe to go back
        if (gestureState.dx > 0) {
          pan.setValue({ x: gestureState.dx, y: 0 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100) {
          // Swipe right to go back
          navigation.goBack();
        } else {
          // Reset position if swipe wasn't significant
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <SafeAreaView 
      style={[
        styles.container,
        { backgroundColor: isDark ? '#171923' : '#FFFBEF' }
      ]}
    >
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { borderColor: isDark ? '#4A5568' : '#E2E8F0' }]}
        >
          <Text style={[styles.backButtonText, { color: isDark ? '#E2E8F0' : '#4A5568' }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#F7FAFC' : '#1A202C' }]}>
          CareTrek
        </Text>
      </View>

      {/* Main Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text style={[
          styles.title,
          { color: isDark ? '#F7FAFC' : '#1A202C' }
        ]}>
          Welcome to CareTrek
        </Text>
        <Text style={[
          styles.subtitle,
          { color: isDark ? '#CBD5E0' : '#4A5568' }
        ]}>
          Your health companion
        </Text>

        {/* Development Navigation */}
        <View style={styles.devMenu}>
          <Text style={[styles.devMenuTitle, { color: isDark ? '#48BB78' : '#2F855A' }]}>
            Development Menu
          </Text>
          <TouchableOpacity 
            style={[styles.devButton, { backgroundColor: isDark ? '#2D3748' : '#E2E8F0' }]}
            onPress={() => goToScreen('Onboarding')}
          >
            <Text style={[styles.devButtonText, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>
              Go to Onboarding
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.devButton, { backgroundColor: isDark ? '#2D3748' : '#E2E8F0' }]}
            onPress={() => goToScreen('Auth')}
          >
            <Text style={[styles.devButtonText, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>
              Go to Auth
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
    marginBottom: 40,
    textAlign: 'center',
    color: '#718096',
  },
  devMenu: {
    width: '100%',
    marginTop: 40,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  devMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  devButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  devButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
});
