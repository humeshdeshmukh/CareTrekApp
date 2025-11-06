import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Image, 
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2 - 8;

type SeniorDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'SeniorDashboard'>;

// Sample data types
interface VitalSigns {
  heartRate: string;
  bloodPressure: string;
  oxygen: string;
  steps: string;
}

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  status: 'online' | 'offline';
  lastActive: string;
  avatar?: string;
}

const SeniorDashboard = () => {
  const navigation = useNavigation<SeniorDashboardNavigationProp>();
  const { colors, isDark } = useTheme();
  
  // Custom colors to match Onboarding page
  const customColors = {
    primary: isDark ? '#48BB78' : '#2F855A',
    background: isDark ? '#171923' : '#FFFBEF',
    text: isDark ? '#F8FAFC' : '#1E293B',
    textSecondary: isDark ? '#94A3B8' : '#64748B',
    card: isDark ? '#1E293B' : '#FFFFFF',
    border: isDark ? '#2D3748' : '#E2E8F0',
    danger: isDark ? '#F56565' : '#E53E3E',
  };
  
  // Handle back press
  const handleBack = () => {
    navigation.goBack();
  };
  
  const [isWatchConnected, setIsWatchConnected] = useState(false);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    heartRate: '--',
    bloodPressure: '--/--',
    oxygen: '--',
    steps: '--',
  });

  // Sample family members data
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { 
      id: '1', 
      name: 'John Doe', 
      relation: 'Son', 
      status: 'online', 
      lastActive: '2 min ago',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    { 
      id: '2', 
      name: 'Jane Smith', 
      relation: 'Daughter', 
      status: 'offline', 
      lastActive: '1 hour ago',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
  ]);

  // Quick actions with theme colors
  const quickActions = [
    { 
      id: 'location', 
      title: 'My Location', 
      icon: 'map-marker', 
      color: colors.primary,
      onPress: () => navigation.navigate('SeniorMap')
    },
    { 
      id: 'id', 
      title: 'My ID', 
      icon: 'id-card', 
      color: colors.secondary,
      onPress: () => navigation.navigate('SeniorIdShare')
    },
    { 
      id: 'emergency', 
      title: 'Emergency', 
      icon: 'alert-circle', 
      color: colors.danger,
      onPress: () => handleEmergency()
    },
    { 
      id: 'health', 
      title: 'Health Stats', 
      icon: 'heart-pulse', 
      color: colors.tertiary,
      onPress: () => {}
    },
  ];

  const handleConnectWatch = () => {
    setIsWatchConnected(prev => !prev);
    if (!isWatchConnected) {
      // Simulate receiving health data after connection
      setTimeout(() => {
        setVitalSigns({
          heartRate: '72',
          bloodPressure: '120/80',
          oxygen: '98',
          steps: '1,245',
        });
      }, 800);
    } else {
      setVitalSigns({
        heartRate: '--',
        bloodPressure: '--/--',
        oxygen: '--',
        steps: '--',
      });
    }
  };

  const handleEmergency = () => {
    Alert.alert(
      "Emergency Alert",
      "Are you sure you want to send an emergency alert to your family members?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Send Alert", 
          onPress: () => {
            // Send emergency alert
            Alert.alert("Alert Sent", "Help is on the way! Your family has been notified.");
          }
        }
      ]
    );
  };

  const handleEmergencyAlert = () => {
    Alert.alert(
      "Emergency Alert",
      "Sending emergency alert to your family members...",
      [{ text: "OK" }]
    );
  };

  const renderVitalCard = (icon: keyof typeof MaterialCommunityIcons.glyphMap, title: string, value: string, unit: string) => (
    <View style={[styles.vitalCard, { backgroundColor: colors.card }]}>
      <View style={[styles.vitalIcon, { backgroundColor: `${colors.primary}20` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.vitalValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.vitalTitle, { color: colors.textSecondary }]}>{title}</Text>
      {unit ? <Text style={[styles.vitalUnit, { color: colors.textTertiary }]}>{unit}</Text> : null}
    </View>
  );

  const renderQuickAction = (action: typeof quickActions[0]) => (
    <TouchableOpacity 
      key={action.id}
      style={[styles.quickAction, { backgroundColor: `${action.color}10` }]}
      onPress={action.onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
        <MaterialCommunityIcons name={action.icon as any} size={20} color="white" />
      </View>
      <Text style={[styles.actionText, { color: colors.text }]}>{action.title}</Text>
    </TouchableOpacity>
  );

  const renderFamilyMember = (member: FamilyMember) => {
    const statusStyle = [
      styles.memberStatus,
      { backgroundColor: member.status === 'online' ? '#4CAF50' : '#9E9E9E' }
    ];
    
    return (
    <TouchableOpacity 
      key={member.id} 
      style={[styles.familyMember, { 
        backgroundColor: customColors.card,
        borderWidth: 1,
        borderColor: customColors.border,
      }]}
      onPress={() => {}}
    >
      <View style={styles.memberInfo}>
        <Image 
          source={{ uri: member.avatar || 'https://via.placeholder.com/50' }} 
          style={styles.avatar} 
        />
        <View>
          <Text style={[styles.memberName, { color: customColors.text }]}>{member.name}</Text>
          <Text style={[styles.memberRelation, { color: customColors.textSecondary }]}>{member.relation}</Text>
        </View>
      </View>
      <View style={styles.memberStatus}>
        <View 
          style={statusStyle}
        />
        <Text style={[styles.lastSeen, { color: customColors.textSecondary }]}>
          {member.status === 'online' ? 'Online' : member.lastActive}
        </Text>
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: customColors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={customColors.primary} />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={[customColors.primary, `${customColors.primary}CC`]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={[styles.welcomeText, { color: 'white' }]}>Welcome back,</Text>
            <Text style={[styles.userName, { color: 'white' }]}>John Doe</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {}}
          >
            <Ionicons name="notifications-outline" size={24} color="white" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Connection Status */}
        <View style={[styles.connectionCard, { 
          backgroundColor: customColors.card,
          shadowColor: customColors.primary,
          elevation: 4,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          borderWidth: 1,
          borderColor: customColors.border,
        }]}>
          <View style={styles.connectionContent}>
            <View style={styles.connectionText}>
              <Text style={[styles.connectionTitle, { color: customColors.text }]}>
                {isWatchConnected ? 'Smartwatch Connected' : 'Smartwatch Not Connected'}
              </Text>
              <Text style={[styles.connectionSubtitle, { color: customColors.textSecondary }]}>
                {isWatchConnected ? 'Monitoring your health in real-time' : 'Connect your device to track health metrics'}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.connectButton, { 
                backgroundColor: isWatchConnected ? customColors.background : customColors.primary,
                borderColor: isWatchConnected ? customColors.primary : 'transparent',
                borderWidth: isWatchConnected ? 1 : 0,
              }]}
              onPress={handleConnectWatch}
            >
              <Text style={[styles.connectButtonText, { 
                color: isWatchConnected ? customColors.primary : 'white' 
              }]}>
                {isWatchConnected ? 'Connected' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>
          {isWatchConnected && (
            <View style={styles.vitalSigns}>
              <View style={styles.vitalSignItem}>
                <Text style={[styles.vitalSignValue, { color: customColors.primary }]}>{vitalSigns.heartRate}</Text>
                <Text style={[styles.vitalSignLabel, { color: customColors.textSecondary }]}>BPM</Text>
              </View>
              <View style={[styles.vitalSignDivider, { backgroundColor: customColors.border }]} />
              <View style={styles.vitalSignItem}>
                <Text style={[styles.vitalSignValue, { color: customColors.primary }]}>{vitalSigns.bloodPressure}</Text>
                <Text style={[styles.vitalSignLabel, { color: customColors.textSecondary }]}>BP</Text>
              </View>
              <View style={[styles.vitalSignDivider, { backgroundColor: customColors.border }]} />
              <View style={styles.vitalSignItem}>
                <Text style={[styles.vitalSignValue, { color: customColors.primary }]}>{vitalSigns.oxygen}%</Text>
                <Text style={[styles.vitalSignLabel, { color: customColors.textSecondary }]}>SpO2</Text>
              </View>
              <View style={[styles.vitalSignDivider, { backgroundColor: customColors.border }]} />
              <View style={styles.vitalSignItem}>
                <Text style={[styles.vitalSignValue, { color: customColors.primary }]}>{vitalSigns.steps}</Text>
                <Text style={[styles.vitalSignLabel, { color: customColors.textSecondary }]}>Steps</Text>
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: customColors.text }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickAction, { 
                  backgroundColor: `${action.color}10`,
                  borderWidth: 1,
                  borderColor: customColors.border,
                }]}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <MaterialCommunityIcons name={action.icon as any} size={24} color="white" />
                </View>
                <Text style={[styles.actionText, { color: customColors.text }]}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Family Members */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: customColors.text }]}>Family Members</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.actionText, { color: customColors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.familyList}>
            {familyMembers.map(renderFamilyMember)}
          </View>
        </View>

        {/* Emergency Button */}
        <LinearGradient
          colors={[customColors.danger, '#E53E3E']}
          style={[styles.emergencyButton, {
            shadowColor: customColors.danger,
            elevation: 6,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity 
            style={styles.emergencyButtonContent}
            onPress={handleEmergencyAlert}
          >
            <Ionicons name="alert-circle" size={24} color="white" />
            <Text style={styles.emergencyButtonText}>Emergency Alert</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerGradient: {
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: -20,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '400',
    opacity: 0.9,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    marginTop: 30,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  connectionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectionText: {
    flex: 1,
    marginLeft: 12,
  },
  connectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  connectionSubtitle: {
    fontSize: 13,
    opacity: 0.7,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  vitalSigns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E6F0',
  },
  vitalSignItem: {
    alignItems: 'center',
    flex: 1,
  },
  vitalSignValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  vitalSignLabel: {
    fontSize: 12,
    color: '#7A7A9D',
  },
  vitalSignDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E6E6F0',
  },
  section: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  quickAction: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 16,
    margin: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  vitalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  vitalCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    padding: 16,
    margin: 4,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  vitalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  vitalValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  vitalTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'center',
  },
  vitalUnit: {
    fontSize: 12,
    opacity: 0.7,
  },
  familyList: {
    marginBottom: 20,
  },
  familyMember: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberRelation: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  lastSeen: {
    fontSize: 12,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  emergencyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SeniorDashboard;
