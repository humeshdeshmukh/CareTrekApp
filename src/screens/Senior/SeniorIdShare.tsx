import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/theme/ThemeContext';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const SeniorIdShare = () => {
  const [seniorId, setSeniorId] = useState('');
  const { theme } = useTheme();
  const navigation = useNavigation();

  // Generate a unique 4-digit ID (in a real app, this would come from your backend)
  useEffect(() => {
    // Generate a random 4-digit number
    const id = Math.floor(1000 + Math.random() * 9000).toString();
    setSeniorId(id);
    // TODO: Save this ID to your backend/database
  }, []);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(seniorId);
    Alert.alert('Copied!', 'Senior ID copied to clipboard.');
  };

  const shareId = async () => {
    try {
      await Share.share({
        message: `Please connect with me on CareTrek using this ID: ${seniorId}`,
        title: 'CareTrek Connection ID',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share ID');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Senior ID</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>Your Senior ID</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Share this ID with your family members to connect with you
          </Text>
          
          <View style={styles.idContainer}>
            <Text style={[styles.idText, { color: theme.primary }]}>{seniorId}</Text>
            <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
              <Ionicons name="copy-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.qrContainer}>
            <QRCode
              value={seniorId}
              size={200}
              color={theme.text}
              backgroundColor={theme.card}
            />
          </View>

          <TouchableOpacity 
            style={[styles.shareButton, { backgroundColor: theme.primary }]}
            onPress={shareId}
          >
            <Ionicons name="share-social" size={20} color="white" />
            <Text style={styles.shareButtonText}>Share ID</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Ionicons name="information-circle" size={24} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.text }]}>
            Family members can add you by entering this ID in their app or scanning the QR code
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  idText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginRight: 8,
  },
  copyButton: {
    padding: 8,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 24,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
});

export default SeniorIdShare;
