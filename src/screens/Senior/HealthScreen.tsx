import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../contexts/translation/TranslationContext';
import { useCachedTranslation } from '../../hooks/useCachedTranslation';

type HealthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Health'>;

const HealthScreen = () => {
  const navigation = useNavigation<HealthScreenNavigationProp>();
  const { isDark } = useTheme();
  const { currentLanguage } = useTranslation();
  
  // Translations
  const { translatedText: healthOverviewText } = useCachedTranslation('Health Overview', currentLanguage);
  const { translatedText: backText } = useCachedTranslation('Back', currentLanguage);
  const { translatedText: heartRateText } = useCachedTranslation('Heart Rate', currentLanguage);
  const { translatedText: bloodPressureText } = useCachedTranslation('Blood Pressure', currentLanguage);
  const { translatedText: oxygenText } = useCachedTranslation('Oxygen Level', currentLanguage);
  const { translatedText: stepsText } = useCachedTranslation('Steps', currentLanguage);
  const { translatedText: bmiText } = useCachedTranslation('BMI', currentLanguage);
  const { translatedText: sleepText } = useCachedTranslation('Sleep', currentLanguage);
  
  const handleBack = () => {
    navigation.goBack();
  };

  interface HealthMetricProps {
    title: string;
    value: string;
    unit: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }

  const HealthMetric = ({ title, value, unit, icon, color }: HealthMetricProps) => (
    <View style={[styles.metricCard, { backgroundColor: isDark ? '#2D3748' : '#FFFFFF' }]}>
      <View style={[styles.metricIcon, { backgroundColor: color + (isDark ? '33' : '1A') }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.metricTextContainer}>
        <Text style={[styles.metricTitle, { color: isDark ? '#A0AEC0' : '#4A5568' }]}>
          {title}
        </Text>
        <Text style={[styles.metricValue, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>
          {value} <Text style={styles.metricUnit}>{unit}</Text>
        </Text>
      </View>
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
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#2F855A' : '#2F855A' }]}>
            {healthOverviewText}
          </Text>
        </View>

        <View style={styles.metricsContainer}>
          <HealthMetric
            title={oxygenText}
            value="98"
            unit="%"
            icon="pulse"
            color="#48BB78"
          />
          <HealthMetric
            title={bloodPressureText}
            value="120/80"
            unit="mmHg"
            icon="speedometer"
            color="#4299E1"
          />
          <HealthMetric
            title={stepsText}
            value="5,432"
            unit="steps"
            icon="walk"
            color="#9F7AEA"
          />
          <HealthMetric
            title={bmiText}
            value="22.5"
            unit=""
            icon="body"
            color="#ED8936"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>
            Recent Activity
          </Text>
          <View style={[styles.activityCard, { backgroundColor: isDark ? '#2D3748' : '#FFFFFF' }]}>
            <View style={styles.activityItem}>
              <Ionicons name="checkmark-circle" size={20} color="#38A169" />
              <Text style={[styles.activityText, { color: isDark ? '#E2E8F0' : '#2D3748' }]}>
                Morning walk completed
              </Text>
              <Text style={[styles.activityTime, { color: isDark ? '#A0AEC0' : '#718096' }]}>
                2h ago
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="medical" size={20} color="#3182CE" />
              <Text style={[styles.activityText, { color: isDark ? '#E2E8F0' : '#2D3748' }]}>
                Blood pressure recorded
              </Text>
              <Text style={[styles.activityTime, { color: isDark ? '#A0AEC0' : '#718096' }]}>
                4h ago
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricsContainer: {
    marginBottom: 24,
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  metricTextContainer: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricUnit: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2F855A',
  },
  activityCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
    marginLeft: 8,
  },
});

export default HealthScreen;
