import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '../../contexts/translation/TranslationContext';
import { useCachedTranslation } from '../../hooks/useCachedTranslation';

type IdShareScreenNavigationProp = StackNavigationProp<RootStackParamList, 'IdShare'>;

const IdShareScreen = () => {
  const navigation = useNavigation<IdShareScreenNavigationProp>();
  const { isDark } = useTheme();
  const { currentLanguage } = useTranslation();
  
  // Translations
  const { translatedText: backText } = useCachedTranslation('Back', currentLanguage);
  const { translatedText: shareIdText } = useCachedTranslation('Share Your ID', currentLanguage);
  const { translatedText: shareIdInstructions } = useCachedTranslation('Share this ID with your family members so they can connect with you.', currentLanguage);
  const { translatedText: shareViaEmailText } = useCachedTranslation('Share via Email', currentLanguage);
  const { translatedText: enterEmailText } = useCachedTranslation('Enter email address', currentLanguage);
  const { translatedText: connectedFamilyText } = useCachedTranslation('Connected Family Members', currentLanguage);
  const { translatedText: noConnectionsText } = useCachedTranslation('No family members connected yet', currentLanguage);
  const { translatedText: copiedText } = useCachedTranslation('Copied!', currentLanguage);
  const { translatedText: copiedMessage } = useCachedTranslation('Your Senior ID has been copied to clipboard.', currentLanguage);
  const { translatedText: emailSentText } = useCachedTranslation('Email sent with your Senior ID.', currentLanguage);
  
  const [seniorId] = useState('ABCD'); // This would come from your app state
  const [email, setEmail] = useState('');
  
  const handleBack = () => {
    navigation.goBack();
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(seniorId);
    Alert.alert(copiedText, copiedMessage);
  };

  const shareViaEmail = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    // This would integrate with your email service
    Alert.alert(shareViaEmailText, emailSentText);
    setEmail('');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
    },
    backButtonText: {
      marginLeft: 8,
      fontSize: 16,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    card: {
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      color: '#2F855A',
    },
    idContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderRadius: 8,
      marginBottom: 20,
    },
    idText: {
      fontSize: 28,
      fontWeight: 'bold',
      letterSpacing: 2,
      color: isDark ? '#E2E8F0' : '#1A202C',
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderRadius: 6,
    },
    copyText: {
      marginLeft: 4,
      fontWeight: '600',
      color: isDark ? '#63B3ED' : '#3182CE',
    },
    instructions: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 20,
    },
    divider: {
      height: 1,
      marginVertical: 16,
    },
    emailContainer: {
      flexDirection: 'row',
      marginBottom: 8,
      alignItems: 'center',
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginRight: 8,
      fontSize: 16,
    },
    shareButton: {
      width: 50,
      height: 50,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    connectedContainer: {
      flex: 1,
      borderRadius: 12,
      padding: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    connectedTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      color: '#2F855A',
    },
    connectedList: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noConnections: {
      fontSize: 14,
      textAlign: 'center',
      opacity: 0.8,
      color: isDark ? '#A0AEC0' : '#4A5568',
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#171923' : '#FFFBEF' }]}>
      {/* Back Button */}
      <TouchableOpacity 
        style={[styles.backButton, { borderColor: isDark ? '#4A5568' : '#E2E8F0' }]}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={20} color={isDark ? '#E2E8F0' : '#4A5568'} />
        <Text style={[styles.backButtonText, { color: isDark ? '#E2E8F0' : '#4A5568' }]}>
          {backText}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: isDark ? '#2D3748' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>
            {shareIdText}
          </Text>
          
          <View style={[styles.idContainer, { backgroundColor: isDark ? '#2D3748' : '#E2E8F0' }]}>
            <Text style={[styles.idText, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>{seniorId}</Text>
            <TouchableOpacity 
              onPress={copyToClipboard} 
              style={styles.copyButton}
              activeOpacity={0.7}
            >
              <Ionicons name="copy" size={20} color={isDark ? '#63B3ED' : '#3182CE'} />
              <Text style={[styles.copyText, { color: isDark ? '#63B3ED' : '#3182CE' }]}>Copy</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.instructions, { color: isDark ? '#A0AEC0' : '#4A5568' }]}>
            {shareIdInstructions}
          </Text>
          
          <View style={[styles.divider, { backgroundColor: isDark ? '#4A5568' : '#E2E8F0' }]} />
          
          <Text style={[styles.sectionTitle, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>
            {shareViaEmailText}
          </Text>
          
          <View style={styles.emailContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDark ? '#2D3748' : '#FFFFFF',
                color: isDark ? '#E2E8F0' : '#1A202C',
                borderColor: isDark ? '#4A5568' : '#E2E8F0'
              }]}
              placeholder={enterEmailText}
              placeholderTextColor={isDark ? '#718096' : '#A0AEC0'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={[styles.shareButton, { backgroundColor: isDark ? '#4299E1' : '#3182CE' }]}
              onPress={shareViaEmail}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.connectedContainer, { backgroundColor: isDark ? '#2D3748' : '#FFFFFF' }]}>
          <Text style={[styles.connectedTitle, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>
            {connectedFamilyText}
          </Text>
          <View style={styles.connectedList}>
            <Text style={[styles.noConnections, { color: isDark ? '#A0AEC0' : '#4A5568' }]}>
              {noConnectionsText}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default IdShareScreen;