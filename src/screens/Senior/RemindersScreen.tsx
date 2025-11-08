// RemindersScreen.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
  Vibration,
  Platform,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../contexts/translation/TranslationContext';
import { useCachedTranslation } from '../../hooks/useCachedTranslation';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
// Audio import removed as we're using system sounds
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler with recommended properties
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type Reminder = {
  id: string;
  title: string;
  time: string;
  date: Date;
  type: 'medication' | 'activity';
  enabled: boolean;
  notificationId?: string | null;
};

type RemindersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Reminders'>;

const STORAGE_KEY = '@CareTrek/reminders';

// Trigger haptic feedback for notifications
const triggerNotificationFeedback = async () => {
  console.log('Triggering haptic feedback...');
  try {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Add a small delay and try impact feedback as well
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(console.warn);
      }, 100);
    } else {
      // Use a more reliable vibration pattern for Android
      Vibration.vibrate([0, 300, 200, 300, 200, 300], false);
    }
  } catch (error) {
    console.warn('Haptic feedback error:', error);
    Vibration.vibrate(500, false);
  }
};


const RemindersScreen: React.FC = () => {
  // Move action handlers inside the component to access state and props
  const showReminderActions = useCallback((reminderId: string) => {
    Alert.alert(
      'Reminder',
      'What would you like to do?',
      [
        {
          text: 'Stop Reminder',
          style: 'destructive',
          onPress: () => handleStopReminder(reminderId),
        },
        {
          text: 'Snooze for 5 minutes',
          onPress: () => handleSnoozeReminder(reminderId, 5),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }, [reminders, saveReminders]);

  const handleStopReminder = useCallback((reminderId: string) => {
    setReminders((prevReminders: Reminder[]) => {
      const updated = prevReminders.map(r => 
        r.id === reminderId ? { ...r, enabled: false } : r
      );
      saveReminders(updated).catch(console.error);
      return updated;
    });
  }, [saveReminders]);

  const handleSnoozeReminder = useCallback(async (reminderId: string, minutes: number) => {
    const reminder = reminders.find(r => r.id === reminderId);
    if (!reminder) return;

    // Schedule a new notification with proper type
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Snoozed: ' + (reminder.title || 'Reminder'),
        body: `Snoozed for ${minutes} minutes`,
        sound: true,
        priority: 'high',
        data: { reminderId, isSnoozed: true },
        ...(Platform.OS === 'android' && { channelId: 'reminders' }),
      },
      trigger: {
        seconds: minutes * 60,
        repeats: false
      } as any, // Type assertion needed for the trigger type
    });
  }, [reminders]);
  const navigation = useNavigation<RemindersScreenNavigationProp>();
  const { isDark } = useTheme();
  const { currentLanguage } = useTranslation();

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  // newReminder serves as the form state for 'add' mode
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    title: '',
    time: '08:00 AM',
    date: new Date(),
    type: 'medication',
    enabled: true,
  });

  // Controls whether the add/edit form modal is visible
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Save to storage helper
  const saveReminders = useCallback(async (updatedReminders: Reminder[]) => {
    try {
      const jsonValue = JSON.stringify(updatedReminders);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  }, []);

  // Schedule a local notification for a reminder
  const scheduleNotification = useCallback(
    async (reminder: Reminder) => {
      try {
        // Check/request permissions
        const existing = await Notifications.getPermissionsAsync();
        if (!existing.granted) {
          const requested = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              allowDisplayInCarPlay: true,
              allowCriticalAlerts: true,
            },
          });
          if (!requested.granted) {
            console.warn('Notification permissions not granted');
            return null;
          }
        }
        
        // Create a notification channel for Android
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('reminders', {
            name: 'Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            enableVibrate: true,
            enableLights: true,
            lightColor: '#FFA500',
          });
        }

        // Cancel any existing notification for this reminder
        if (reminder.notificationId) {
          try {
            await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
          } catch (e) {
            console.warn('Failed to cancel existing notification', e);
          }
        }

        // Parse time from reminder
        const { hours, minutes } = parseTimeString(reminder.time || '08:00 AM');

        // Ensure time is in the future
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        // If the time has already passed today, schedule for tomorrow
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        // Schedule the notification with sound and vibration
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'CareTrek Reminder: ' + (reminder.title || 'Reminder'),
            body: 'Time to take your ' + (reminder.type === 'medication' ? 'medication' : 'activity'),
            sound: true,
            priority: 'high',
            vibrate: [0, 300, 200, 300],
            data: { 
              reminderId: reminder.id,
              type: reminder.type
            },
            // For Android 8.0+ we need to set the channelId
            ...(Platform.OS === 'android' && { channelId: 'reminders' }),
          },
          trigger: {
            hour: scheduledTime.getHours(),
            minute: scheduledTime.getMinutes(),
            repeats: true,
          } as any,
        });
        
        // Trigger haptic feedback when notification is scheduled
        triggerNotificationFeedback();

        // Update the reminder with the notification ID
        const updated = reminders.map(r =>
          r.id === reminder.id ? { ...r, notificationId } : r
        );
        setReminders(updated);
        await saveReminders(updated);

        return notificationId;
      } catch (error) {
        console.warn('Error scheduling notification:', error);
        return null;
      }
    },
    [reminders, saveReminders]
  );

  // Load reminders from storage and schedule enabled ones
  const loadReminders = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null) {
        const savedReminders = JSON.parse(jsonValue) as any[];
        const parsedReminders: Reminder[] = savedReminders.map(r => ({
          ...r,
          date: r.date ? new Date(r.date) : new Date(),
        }));
        setReminders(parsedReminders);

        // Schedule for enabled reminders (but don't re-schedule if they already have notificationId)
        parsedReminders.forEach(rem => {
          if (rem.enabled && !rem.notificationId) {
            scheduleNotification(rem).catch(e => console.warn('Failed to schedule on load', e));
          }
        });
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  }, [scheduleNotification]);

  // Setup notification listeners for foreground and responses
  const setupNotificationListeners = useCallback(() => {
    // Foreground received - handle notification when app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      
      // Only process if it's a valid notification
      if (notification.request.content.title || notification.request.content.body) {
        console.log('Processing notification with content:', {
          title: notification.request.content.title,
          body: notification.request.content.body,
          trigger: notification.request.trigger
        });

        // For Android, we'll use the notification's built-in vibration
        if (Platform.OS === 'android') {
          console.log('Android: Using notification channel vibration');
          // The vibration is handled by the notification channel
          // We'll add a small delay to ensure the notification is shown
          setTimeout(() => {
            Vibration.vibrate([0, 300, 200, 300]);
          }, 200);
        } else {
          // For iOS, use haptics
          console.log('iOS: Triggering haptic feedback');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            .catch(e => console.warn('Haptics error:', e));
        }
      }
    });

    // Response (user tapped notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {
      console.log('Notification tapped:', response);
      
      const { reminderId } = response.notification.request.content.data;
      
      // Trigger haptic feedback
      await triggerNotificationFeedback();
      
      // Show action sheet if this is a reminder notification
      if (reminderId) {
        showReminderActions(reminderId.toString());
      }
      // Optionally navigate to detail screen using response.notification.request.content.data
    });
  }, []);

  // Clean up listeners
  const cleanupNotificationListeners = useCallback(() => {
    try {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    } catch (e) {
      // ignore
    } finally {
      notificationListener.current = null;
      responseListener.current = null;
    }
  }, []);

  // Focus effect: load reminders & setup listeners, cleanup on blur
  useFocusEffect(
    useCallback(() => {
      loadReminders();
      setupNotificationListeners();

      return () => {
        cleanupNotificationListeners();
      };
    }, [loadReminders, setupNotificationListeners, cleanupNotificationListeners])
  );

  // Navigation back
  const handleBack = () => navigation.goBack();

  // Translations (assume useCachedTranslation returns { translatedText })
  const { translatedText: remindersText } = useCachedTranslation('Reminders', currentLanguage);
  const { translatedText: backText } = useCachedTranslation('Back', currentLanguage);
  const { translatedText: addReminderText } = useCachedTranslation('Add Reminder', currentLanguage);
  const { translatedText: editReminderText } = useCachedTranslation('Edit Reminder', currentLanguage);
  const { translatedText: deleteText } = useCachedTranslation('Delete', currentLanguage);
  const { translatedText: cancelText } = useCachedTranslation('Cancel', currentLanguage);
  const { translatedText: saveText } = useCachedTranslation('Save', currentLanguage);
  const { translatedText: titleText } = useCachedTranslation('Title', currentLanguage);
  const { translatedText: timeText } = useCachedTranslation('Time', currentLanguage);
  const { translatedText: typeText } = useCachedTranslation('Type', currentLanguage);
  const { translatedText: medicationText } = useCachedTranslation('Medication', currentLanguage);
  const { translatedText: activityText } = useCachedTranslation('Activity', currentLanguage);
  const { translatedText: confirmDeleteText } = useCachedTranslation('Are you sure you want to delete this reminder?', currentLanguage);
  const { translatedText: reminderAddedText } = useCachedTranslation('Reminder added', currentLanguage);
  const { translatedText: reminderUpdatedText } = useCachedTranslation('Reminder updated', currentLanguage);
  const { translatedText: reminderDeletedText } = useCachedTranslation('Reminder deleted', currentLanguage);

  // Toggle reminder enabled/disabled
  const toggleReminder = async (id: string) => {
    const updated = reminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    
    setReminders(updated);
    await saveReminders(updated);

    const toggled = updated.find(r => r.id === id);
    if (toggled) {
      if (toggled.enabled) {
        await scheduleNotification(toggled);
      } else if (toggled.notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(toggled.notificationId);
          // clear id in state & storage
          setReminders(prev => {
            const cleared = prev.map(r => (r.id === id ? { ...r, notificationId: null } : r));
            saveReminders(cleared).catch(() => {});
            return cleared;
          });
        } catch (e) {
          console.warn('Cancel scheduled notification failed', e);
        }
      }
    }
  };

  // Add new reminder
  const addReminder = async () => {
    if (!newReminder.title || !newReminder.title.trim()) {
      Alert.alert('Error', 'Please enter a title for the reminder');
      return;
    }

    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title!.trim(),
      time: newReminder.time || '08:00 AM',
      date: newReminder.date || new Date(),
      type: (newReminder.type as 'medication' | 'activity') || 'medication',
      enabled: newReminder.enabled ?? true,
      notificationId: null,
    };

    // persist immediate
    setReminders(prev => {
      const updated = [...prev, reminder];
      saveReminders(updated).catch(() => {});
      return updated;
    });

    // schedule notification (this will update notificationId in state/storage)
    await scheduleNotification(reminder);

    // reset form & close
    setNewReminder({
      title: '',
      time: '08:00 AM',
      date: new Date(),
      type: 'medication',
      enabled: true,
    });
    setIsFormVisible(false);

    Alert.alert('Success', reminderAddedText);
  };

  // Update editing reminder
  const updateReminder = async () => {
    if (!editingReminder) return;
    if (!editingReminder.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    // Create a new reminder object with updated time
    const updatedReminder = {
      ...editingReminder,
      // Ensure we have the latest time from the time picker
      time: editingReminder.time,
      // Ensure we have a proper date object
      date: editingReminder.date ? new Date(editingReminder.date) : timeStringToDate(editingReminder.time)
    };

    // update state & persist
    setReminders(prev => {
      const updated = prev.map(r => (r.id === updatedReminder.id ? updatedReminder : r));
      saveReminders(updated).catch(console.error);
      return updated;
    });

    // update notification if enabled
    if (updatedReminder.enabled) {
      await scheduleNotification(updatedReminder);
    } else if (updatedReminder.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(updatedReminder.notificationId);
        // clear id
        setReminders(prev => {
          const cleared = prev.map(r => (r.id === updatedReminder.id ? { ...r, notificationId: null } : r));
          saveReminders(cleared).catch(console.error);
          return cleared;
        });
      } catch (e) {
        console.warn('Cancel scheduled notification failed', e);
      }
    }

    setEditingReminder(null);
    setIsFormVisible(false);
    Alert.alert('Success', reminderUpdatedText);
  };

  // Delete reminder with confirmation
  const deleteReminder = (id: string) => {
    Alert.alert(
      'Delete Reminder',
      confirmDeleteText,
      [
        { text: cancelText, style: 'cancel' },
        {
          text: deleteText,
          style: 'destructive',
          onPress: async () => {
            const target = reminders.find(r => r.id === id);
            if (target?.notificationId) {
              try {
                await Notifications.cancelScheduledNotificationAsync(target.notificationId);
              } catch (e) {
                console.warn('Cancel scheduled notification failed', e);
              }
            }
            const updated = reminders.filter(r => r.id !== id);
            setReminders(updated);
            await saveReminders(updated);
            Alert.alert('Success', reminderDeletedText);
          },
        },
      ]
    );
  };

  // Time picker handlers
  const showTimePickerDialog = () => setShowTimePicker(true);

  const onTimeChange = (event: any, selectedDate?: Date) => {
    // On Android, when dismissed selectedDate will be undefined
    if (Platform.OS !== 'ios') {
      setShowTimePicker(false);
    }

    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedTime = `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
      
      // Create a new date object to ensure we don't have reference issues
      const newDate = new Date(selectedDate);
      
      if (editingReminder) {
        setEditingReminder(prev => ({
          ...prev!,
          time: formattedTime,
          date: newDate
        }));
      } else {
        setNewReminder(prev => ({
          ...prev,
          time: formattedTime,
          date: newDate
        }));
      }
    }
  };

  const openEditModal = (reminder: Reminder) => {
    // Create a new object to avoid reference issues
    const reminderWithDate = {
      ...reminder,
      date: reminder.date ? new Date(reminder.date) : timeStringToDate(reminder.time)
    };
    setEditingReminder(reminderWithDate);
    setIsFormVisible(true);
  };
  const closeEditModal = () => {
    setEditingReminder(null);
    setIsFormVisible(false);
  };

  // Render functions
  const renderReminder = ({ item }: { item: Reminder }) => (
    <TouchableOpacity
      style={[styles.reminderCard, { backgroundColor: isDark ? '#2D3748' : '#FFFFFF' }]}
      onPress={() => openEditModal(item)}
      activeOpacity={0.8}
    >
      <View style={styles.reminderLeft}>
        <View
          style={[
            styles.reminderIconContainer,
            {
              backgroundColor:
                item.type === 'medication'
                  ? isDark
                    ? '#FEB2B233'
                    : '#FED7D7'
                  : isDark
                  ? '#9AE6B433'
                  : '#C6F6D5',
            },
          ]}
        >
          <Ionicons
            name={item.type === 'medication' ? 'medkit' : 'walk'}
            size={20}
            color={
              item.type === 'medication'
                ? isDark
                  ? '#FC8181'
                  : '#E53E3E'
                : isDark
                ? '#68D391'
                : '#38A169'
            }
          />
        </View>
        <View style={styles.reminderTextContainer}>
          <Text style={[styles.reminderTitle, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>
            {item.title}
          </Text>
          <View style={styles.reminderTimeContainer}>
            <Ionicons name="time-outline" size={14} color={isDark ? '#A0AEC0' : '#4A5568'} style={styles.timeIcon} />
            <Text style={[styles.reminderTime, { color: isDark ? '#A0AEC0' : '#4A5568' }]}>{item.time}</Text>
          </View>
        </View>
      </View>
      <View style={styles.reminderActions}>
        <Switch
          value={item.enabled}
          onValueChange={() => toggleReminder(item.id)}
          trackColor={{ false: isDark ? '#4A5568' : '#E2E8F0', true: isDark ? '#48BB78' : '#38A169' }}
          thumbColor="#FFFFFF"
        />
        <TouchableOpacity onPress={() => deleteReminder(item.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color={isDark ? '#FC8181' : '#E53E3E'} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderReminderForm = () => {
    const isEditing = !!editingReminder;
    const formData = (isEditing ? editingReminder : newReminder) as Partial<Reminder>;

    return (
      <View style={[styles.formContainer, { backgroundColor: isDark ? '#1A202C' : '#FFFFFF' }]}>
        <Text style={[styles.formTitle, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>{isEditing ? editReminderText : addReminderText}</Text>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#E2E8F0' : '#4A5568' }]}>{titleText}</Text>
          <View style={[styles.input, { backgroundColor: isDark ? '#2D3748' : '#EDF2F7' }]}>
            <TextInput
              style={[styles.textInput, { color: isDark ? '#E2E8F0' : '#1A202C' }]}
              value={formData.title || ''}
              onChangeText={(text) =>
                isEditing ? setEditingReminder({ ...editingReminder!, title: text }) : setNewReminder({ ...newReminder, title: text })
              }
              placeholder="Enter reminder title"
              placeholderTextColor={isDark ? '#718096' : '#A0AEC0'}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#E2E8F0' : '#4A5568' }]}>{timeText}</Text>
          <TouchableOpacity
            style={[styles.input, styles.timePickerButton, { backgroundColor: isDark ? '#2D3748' : '#EDF2F7' }]}
            onPress={showTimePickerDialog}
          >
            <Ionicons name="time-outline" size={20} color={isDark ? '#E2E8F0' : '#4A5568'} style={styles.timeIcon} />
            <Text style={[styles.timeText, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>{formData.time || '08:00 AM'}</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={formData.date || new Date()}
              mode="time"
              display="spinner"
              onChange={onTimeChange}
              textColor={isDark ? '#E2E8F0' : '#1A202C'}
              themeVariant={isDark ? 'dark' : 'light'}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#E2E8F0' : '#4A5568' }]}>{typeText}</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === 'medication' ? { backgroundColor: isDark ? '#2F855A' : '#38A169' } : { backgroundColor: isDark ? '#2D3748' : '#EDF2F7' },
              ]}
              onPress={() => (isEditing ? setEditingReminder({ ...editingReminder!, type: 'medication' }) : setNewReminder({ ...newReminder, type: 'medication' }))}
            >
              <Ionicons name="medkit" size={18} color={formData.type === 'medication' ? '#FFFFFF' : isDark ? '#E2E8F0' : '#4A5568'} />
              <Text style={[styles.typeButtonText, { color: formData.type === 'medication' ? '#FFFFFF' : isDark ? '#E2E8F0' : '#4A5568' }]}>{medicationText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === 'activity' ? { backgroundColor: isDark ? '#2F855A' : '#38A169' } : { backgroundColor: isDark ? '#2D3748' : '#EDF2F7' },
              ]}
              onPress={() => (isEditing ? setEditingReminder({ ...editingReminder!, type: 'activity' }) : setNewReminder({ ...newReminder, type: 'activity' }))}
            >
              <Ionicons name="walk" size={18} color={formData.type === 'activity' ? '#FFFFFF' : isDark ? '#E2E8F0' : '#4A5568'} />
              <Text style={[styles.typeButtonText, { color: formData.type === 'activity' ? '#FFFFFF' : isDark ? '#E2E8F0' : '#4A5568' }]}>{activityText}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formButtons}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: isDark ? '#4A5568' : '#E2E8F0' }]}
            onPress={() => {
              if (isEditing) closeEditModal();
              else {
                setNewReminder({ title: '', time: '08:00 AM', date: new Date(), type: 'medication', enabled: true });
                setIsFormVisible(false);
              }
            }}
          >
            <Text style={[styles.cancelButtonText, { color: isDark ? '#E2E8F0' : '#4A5568' }]}>{cancelText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: isDark ? '#2F855A' : '#38A169' }]}
            onPress={isEditing ? updateReminder : addReminder}
          >
            <Text style={styles.saveButtonText}>{isEditing ? saveText : addReminderText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#171923' : '#FFFBEF' }]}>
      <TouchableOpacity style={[styles.backButton, { borderColor: isDark ? '#4A5568' : '#E2E8F0' }]} onPress={handleBack} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={20} color={isDark ? '#E2E8F0' : '#4A5568'} />
        <Text style={[styles.backButtonText, { color: isDark ? '#E2E8F0' : '#4A5568' }]}>{backText}</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#2F855A' : '#2F855A' }]}>{remindersText}</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: isDark ? '#2F855A' : '#38A169' }]}
          onPress={() => {
            setNewReminder({
              title: '',
              time: '08:00 AM',
              date: new Date(),
              type: 'medication',
              enabled: true,
            });
            setEditingReminder(null);
            setIsFormVisible(true); // <-- show form even when title is empty
          }}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>{addReminderText}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reminders}
        renderItem={renderReminder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.reminderList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={48} color={isDark ? '#4A5568' : '#A0AEC0'} />
            <Text style={[styles.emptyText, { color: isDark ? '#A0AEC0' : '#4A5568' }]}>No reminders set up yet</Text>
          </View>
        }
      />

      {/* Form modal visible when adding or editing */}
      {(isFormVisible || editingReminder) && <View style={styles.modalOverlay}>{renderReminderForm()}</View>}
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 14,
  },
  reminderList: {
    padding: 16,
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
    flex: 1,
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeIcon: {
    marginRight: 4,
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
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 12,
    padding: 6,
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
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    maxHeight: '90%',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  textInput: {
    fontSize: 16,
    padding: 0,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 10,
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RemindersScreen;
