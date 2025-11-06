import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../contexts/theme/ThemeContext';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

const AuthScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDark } = useTheme();

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) return;
    
    try {
      setIsLoading(true);
      // TODO: Implement OTP sending logic
      // await sendOTP(phoneNumber);
      // Navigate to OTP verification screen
      // navigation.navigate('VerifyOTP', { phoneNumber });
    } catch (error) {
      console.error('Error sending OTP:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView 
      style={[
        styles.container,
        { backgroundColor: isDark ? '#171923' : '#FFFBEF' }
      ]}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[
              styles.title,
              { color: isDark ? '#F7FAFC' : '#1A202C' }
            ]}>
              Welcome Back
            </Text>
            <Text style={[
              styles.subtitle,
              { color: isDark ? '#CBD5E0' : '#4A5568' }
            ]}>
              Sign in with your phone number
            </Text>
          </View>

          <View style={styles.form}>
            <View style={[
              styles.inputContainer,
              { 
                borderColor: isDark ? '#4A5568' : '#E5E5E5',
                backgroundColor: isDark ? '#2D3748' : '#FFFFFF',
              }
            ]}>
              <Text style={[
                styles.countryCode,
                { color: isDark ? '#CBD5E0' : '#4A5568' }
              ]}>
                +91
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: isDark ? '#F7FAFC' : '#1A202C',
                    backgroundColor: isDark ? '#2D3748' : '#FFFFFF',
                  }
                ]}
                placeholder="Enter phone number"
                placeholderTextColor={isDark ? '#718096' : '#A0AEC0'}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={10}
                autoFocus
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.button,
                { 
                  backgroundColor: '#2F855A',
                  opacity: phoneNumber.length === 10 ? 1 : 0.7,
                },
                (isLoading || phoneNumber.length !== 10) && styles.disabledButton
              ]}
              onPress={handleSendOTP}
              disabled={isLoading || phoneNumber.length !== 10}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[
              styles.footerText,
              { color: isDark ? '#718096' : '#A0AEC0' }
            ]}>
              By continuing, you agree to our{`\n`}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  countryCode: {
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    marginBottom: 20,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  link: {
    color: '#2F855A',
    textDecorationLine: 'underline',
  },
});
