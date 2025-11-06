import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../contexts/theme/ThemeContext';

type RoleSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RoleSelection'>;

const RoleSelectionScreen = ({ navigation }: { navigation: RoleSelectionScreenNavigationProp }) => {
  const { isDark } = useTheme();

  const handleRoleSelect = (role: 'senior' | 'family') => {
    console.log(`Selected role: ${role}`);
    navigation.navigate('Auth');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#171923' : '#FFFBEF' }]}>
      <View style={styles.content}>
        <TouchableOpacity 
          style={[styles.backButton, { borderColor: isDark ? '#4A5568' : '#E2E8F0' }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, { color: isDark ? '#E2E8F0' : '#4A5568' }]}>
            ← Back
          </Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.logo, { color: isDark ? '#48BB78' : '#2F855A' }]}>CareTrek</Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>
              I am a...
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Choose your role to get started
            </Text>
            <Text style={[styles.tagline, { color: isDark ? '#CBD5E1' : '#475569' }]}>
              This helps us personalize your experience
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton, { backgroundColor: isDark ? '#48BB78' : '#2F855A' }]}
              onPress={() => handleRoleSelect('senior')}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>I'm a Senior Citizen</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton, { borderColor: isDark ? '#48BB78' : '#2F855A' }]}
              onPress={() => handleRoleSelect('family')}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, { color: isDark ? '#48BB78' : '#2F855A' }]}>
                I'm a Family Member
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  textContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#2F855A',
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RoleSelectionScreen;
