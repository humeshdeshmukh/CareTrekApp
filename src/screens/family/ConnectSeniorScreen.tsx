import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../types/theme';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { RootStackParamList } from '../../navigation/RootNavigator';

type ConnectSeniorScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ConnectSenior'>;

const ConnectSeniorScreen = () => {
  const navigation = useNavigation<ConnectSeniorScreenNavigationProp>();
  const { themeColors, isDark } = useTheme();
  const [seniorId, setSeniorId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!seniorId || seniorId.length !== 4) {
      Alert.alert('Invalid ID', 'Please enter a valid 4-digit ID');
      return;
    }

    setIsConnecting(true);
    
    // Simulate API call to connect to senior
    try {
      // In a real app, you would verify the ID with your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // On success
      Alert.alert(
        'Connection Request Sent',
        'A connection request has been sent to the senior. You will be notified when they accept.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('FamilyDashboard')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to connect. Please try again.');
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Connect to Senior</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.content}>
          <View style={[styles.illustration, { backgroundColor: `${theme.primary}20` }]}>
            <Ionicons name="person-add" size={60} color={theme.primary} />
          </View>
          
          <Text style={[styles.title, { color: theme.text }]}>
            Connect to a Senior
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Enter the 4-digit ID provided by the senior to send a connection request.
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { 
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                }
              ]}
              placeholder="Enter 4-digit ID"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              maxLength={4}
              value={seniorId}
              onChangeText={setSeniorId}
              autoFocus
            />
            {seniorId.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setSeniorId('')}
              >
                <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.connectButton,
              { 
                backgroundColor: theme.primary,
                opacity: seniorId.length === 4 ? 1 : 0.6,
              }
            ]}
            onPress={handleConnect}
            disabled={seniorId.length !== 4 || isConnecting}
          >
            {isConnecting ? (
              <Text style={styles.buttonText}>Connecting...</Text>
            ) : (
              <Text style={styles.buttonText}>Send Connection Request</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or</Text>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </View>
          
          <TouchableOpacity
            style={[styles.scanButton, { borderColor: theme.primary }]}
            onPress={() => navigation.navigate('ScanQRCode')}
          >
            <Ionicons name="qr-code" size={20} color={theme.primary} />
            <Text style={[styles.scanButtonText, { color: theme.primary }]}>
              Scan QR Code
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            The senior can find their 4-digit ID in their profile settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  connectButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  scanButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ConnectSeniorScreen;
