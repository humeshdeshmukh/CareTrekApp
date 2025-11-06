import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  StatusBar,
  Image,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');

type SeniorMember = {
  id: string;
  name: string;
  status: 'Connected' | 'Disconnected';
  lastActive: string;
  avatar: string;
  heartRate: string;
  oxygen: string;
  steps: string;
  location: string;
  battery: string;
};

type QuickAction = {
  id: string;
  icon: string;
  title: string;
  screen: keyof RootStackParamList;
};

type RootStackParamList = {
  TrackSenior: { seniorId: string };
  HealthHistory: { seniorId: string };
  Messages: { seniorId: string };
  Alerts: { seniorId: string };
};

type FamilyDashboardNavigationProp = StackNavigationProp<RootStackParamList>;

const seniorMembers: SeniorMember[] = [
  { 
    id: '1', 
    name: 'Ramesh Patel', 
    status: 'Connected', 
    lastActive: '2 mins ago',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    heartRate: '72',
    oxygen: '98',
    steps: '1,245',
    location: 'Home',
    battery: '85%'
  },
  { 
    id: '2', 
    name: 'Sunita Sharma', 
    status: 'Disconnected', 
    lastActive: '1 hour ago',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    heartRate: '--',
    oxygen: '--',
    steps: '--',
    location: 'Unknown',
    battery: '--'
  },
];

const quickActions: QuickAction[] = [
  { id: '1', icon: 'map-marker-radius', title: 'Track Location', screen: 'TrackSenior' },
  { id: '2', icon: 'history', title: 'Health History', screen: 'HealthHistory' },
  { id: '3', icon: 'message-text', title: 'Messages', screen: 'Messages' },
  { id: '4', icon: 'bell', title: 'Alerts', screen: 'Alerts' },
];

const FamilyDashboard: React.FC = () => {
  const [selectedSenior, setSelectedSenior] = useState<SeniorMember>(seniorMembers[0]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const navigation = useNavigation<FamilyDashboardNavigationProp>();
  const { colors, isDark } = useTheme();
  const theme = colors;

  const handleSeniorSelect = (senior: SeniorMember) => {
    setSelectedSenior(senior);
  };

  const handleActionPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen, { seniorId: selectedSenior.id });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderSeniorItem = ({ item }: { item: SeniorMember }) => (
    <TouchableOpacity
      style={[
        styles.seniorItem,
        {
          backgroundColor: theme.card,
          borderColor: selectedSenior?.id === item.id ? theme.primary : theme.border,
        }
      ]}
      onPress={() => handleSeniorSelect(item)}
    >
      <View style={styles.seniorInfo}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.seniorDetails}>
          <Text style={[styles.seniorName, { color: theme.text }]}>{item.name}</Text>
          <View style={styles.statusContainer}>
            <View 
              style={[
                styles.statusDot, 
                { 
                  backgroundColor: item.status === 'Connected' ? '#38A169' : '#E53E3E' 
                }
              ]} 
            />
            <Text 
              style={[
                styles.statusText, 
                { 
                  color: item.status === 'Connected' ? '#38A169' : '#E53E3E',
                  marginLeft: 4
                }
              ]}
            >
              {item.status}
            </Text>
          </View>
          <Text style={[styles.lastActive, { color: theme.textSecondary }]}>
            Last active: {item.lastActive}
          </Text>
        </View>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={theme.textSecondary} 
      />
    </TouchableOpacity>
  );

  const renderQuickAction = ({ item }: { item: QuickAction }) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: theme.card }]}
      onPress={() => handleActionPress(item.screen)}
    >
      <MaterialCommunityIcons 
        name={item.icon} 
        size={24} 
        color={theme.primary} 
        style={styles.actionIcon}
      />
      <Text style={[styles.actionTitle, { color: theme.text }]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderHealthMetric = (label: string, value: string, icon: string) => (
    <View style={styles.healthMetric}>
      <MaterialCommunityIcons 
        name={icon} 
        size={20} 
        color={theme.primary} 
        style={styles.metricIcon}
      />
      <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background} 
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Family Dashboard</Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Connected Seniors
        </Text>
        <FlatList
          data={seniorMembers}
          renderItem={renderSeniorItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.seniorList}
        />

        {selectedSenior && (
          <View style={[styles.seniorCard, { backgroundColor: theme.card }]}>
            <View style={styles.seniorHeader}>
              <Image 
                source={{ uri: selectedSenior.avatar }} 
                style={styles.seniorAvatar} 
              />
              <View>
                <Text style={[styles.seniorName, { color: theme.text }]}>
                  {selectedSenior.name}
                </Text>
                <View style={styles.statusContainer}>
                  <View 
                    style={[
                      styles.statusDot, 
                      { 
                        backgroundColor: selectedSenior.status === 'Connected' 
                          ? '#38A169' 
                          : '#E53E3E' 
                      }
                    ]} 
                  />
                  <Text 
                    style={[
                      styles.statusText, 
                      { 
                        color: selectedSenior.status === 'Connected' 
                          ? '#38A169' 
                          : '#E53E3E',
                        marginLeft: 4
                      }
                    ]}
                  >
                    {selectedSenior.status}
                  </Text>
                </View>
              </View>
              <View style={styles.batteryContainer}>
                <Ionicons 
                  name="battery-charging" 
                  size={20} 
                  color={
                    selectedSenior.battery === '--' 
                      ? theme.textSecondary 
                      : parseFloat(selectedSenior.battery) > 30 
                        ? '#38A169' 
                        : '#E53E3E'
                  } 
                />
                <Text 
                  style={[
                    styles.batteryText, 
                    { 
                      color: selectedSenior.battery === '--' 
                        ? theme.textSecondary 
                        : parseFloat(selectedSenior.battery) > 30 
                          ? '#38A169' 
                          : '#E53E3E'
                    }
                  ]}
                >
                  {selectedSenior.battery}
                </Text>
              </View>
            </View>

            <View style={styles.healthMetrics}>
              {renderHealthMetric('Heart Rate', `${selectedSenior.heartRate} bpm`, 'heart-pulse')}
              {renderHealthMetric('SpO₂', `${selectedSenior.oxygen}%`, 'water-percent')}
              {renderHealthMetric('Steps', selectedSenior.steps, 'walk')}
              {renderHealthMetric('Location', selectedSenior.location, 'map-marker')}
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Quick Actions
        </Text>
        <FlatList
          data={quickActions}
          renderItem={renderQuickAction}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.actionsRow}
          scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  seniorList: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  seniorItem: {
    width: width * 0.7,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  seniorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  seniorDetails: {
    flex: 1,
  },
  seniorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lastActive: {
    fontSize: 12,
    opacity: 0.7,
  },
  seniorCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  seniorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  seniorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  batteryContainer: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  healthMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  healthMetric: {
    width: '48%',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  metricIcon: {
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  actionsRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  quickAction: {
    width: width * 0.45,
    borderRadius: 12,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default FamilyDashboard;