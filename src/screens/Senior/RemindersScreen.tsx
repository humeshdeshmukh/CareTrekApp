import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../contexts/translation/TranslationContext';
import { useCachedTranslation } from '../../hooks/useCachedTranslation';

type Reminder = {
  id: string;
  title: string;
  time: string;
  type: 'medication' | 'activity';
  enabled: boolean;
};

type RemindersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Reminders'>;

const RemindersScreen = () => {
  const navigation = useNavigation<RemindersScreenNavigationProp>();
  const { isDark } = useTheme();
  const { currentLanguage } = useTranslation();
  
  // Translations
  const { translatedText: remindersText } = useCachedTranslation('Reminders', currentLanguage);
  const { translatedText: backText } = useCachedTranslation('Back', currentLanguage);
  const { translatedText: addReminderText } = useCachedTranslation('Add Reminder', currentLanguage);
  const { translatedText: morningMedicationText } = useCachedTranslation('Morning Medication', currentLanguage);
  const { translatedText: afternoonWalkText } = useCachedTranslation('Afternoon Walk', currentLanguage);
  const { translatedText: eveningMedicationText } = useCachedTranslation('Evening Medication', currentLanguage);
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: morningMedicationText,
      time: '08:00 AM',
      type: 'medication',
      enabled: true,
    },
    {
      id: '2',
      title: afternoonWalkText,
      time: '02:30 PM',
      type: 'activity',
      enabled: true,
    },
    {
      id: '3',
      title: eveningMedicationText,
      time: '08:00 PM',
      type: 'medication',
      enabled: false,
    },
  ]);

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id 
        ? { ...reminder, enabled: !reminder.enabled } 
        : reminder
    ));
  };

  const renderReminder = ({ item }: { item: Reminder }) => (
    <View style={[styles.reminderCard, { backgroundColor: isDark ? '#2D3748' : '#FFFFFF' }]}>
      <View style={styles.reminderLeft}>
        <View 
          style={[
            styles.reminderIconContainer, 
            { 
              backgroundColor: item.type === 'medication' 
                ? (isDark ? '#FEB2B233' : '#FED7D7') 
                : (isDark ? '#9AE6B433' : '#C6F6D5')
            }
          ]}
        >
          <Ionicons 
            name={item.type === 'medication' ? 'medkit' : 'walk'} 
            size={20} 
            color={item.type === 'medication' ? (isDark ? '#FC8181' : '#E53E3E') : (isDark ? '#68D391' : '#38A169')} 
          />
        </View>
        <View>
          <Text style={[styles.reminderTitle, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>
            {item.title}
          </Text>
          <Text style={[styles.reminderTime, { color: isDark ? '#A0AEC0' : '#4A5568' }]}>
            {item.time}
          </Text>
        </View>
      </View>
      <Switch
        value={item.enabled}
        onValueChange={() => toggleReminder(item.id)}
        trackColor={{ false: isDark ? '#4A5568' : '#E2E8F0', true: isDark ? '#48BB78' : '#38A169' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

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
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#2F855A' : '#2F855A' }]}>{remindersText}</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: isDark ? '#2F855A' : '#38A169' }]}
          onPress={() => {/* Handle add reminder */}}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>{addReminderText}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reminders}
        renderItem={renderReminder}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.reminderList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="notifications-off" 
              size={48} 
              color={isDark ? '#4A5568' : '#A0AEC0'} 
            />
            <Text style={[styles.emptyText, { color: isDark ? '#A0AEC0' : '#4A5568' }]}>
              No reminders set up yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2F855A',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  reminderList: {
    paddingBottom: 24,
  },
  reminderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 14,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default RemindersScreen;
