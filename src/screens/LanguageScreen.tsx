import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../contexts/LanguageContext';
import i18n from '../i18n';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../contexts/theme/ThemeContext';

type LanguageScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Language'>;

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

const LanguageScreen = () => {
  const navigation = useNavigation<LanguageScreenNavigationProp>();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const { isDark } = useTheme();
  const { width } = Dimensions.get('window');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const { setLanguage, isChangingLanguage } = useLanguage();

  const handleContinue = async () => {
    try {
      // Only update the language in AsyncStorage without changing the i18n language yet
      await AsyncStorage.setItem('userLanguage', selectedLanguage);
      // Navigate to Onboarding
      navigation.replace('Onboarding');
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const bgColor = isDark ? '#171923' : '#FFFBEF';
  const textColor = isDark ? '#E2E8F0' : '#2D3748';
  const cardBg = isDark ? '#2D3748' : '#FFFFFF';
  const primaryColor = isDark ? '#48BB78' : '#2F855A';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Animated.View 
        style={[
          styles.header,
          { 
            opacity: fadeAnim,
            transform: [{ translateY }],
          }
        ]}
      >
        <TouchableOpacity 
          onPress={handleBack} 
          style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M5 12L12 19M5 12L12 5" 
                  stroke={textColor} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Select Language</Text>
      </Animated.View>
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateY }],
          }
        ]}
      >
        <Text style={[styles.subtitle, { color: textColor, marginBottom: 20 }]}>Select Your Language</Text>

      <ScrollView style={styles.languageList}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageItem,
              { 
                backgroundColor: cardBg,
                borderColor: selectedLanguage === lang.code ? primaryColor : 'transparent',
                borderWidth: 2,
              }
            ]}
            onPress={() => setSelectedLanguage(lang.code)}
          >
            <Text style={[styles.languageName, { color: textColor }]}>{lang.name}</Text>
            <Text style={[styles.languageNative, { color: textColor }]}>{lang.nativeName}</Text>
            {selectedLanguage === lang.code && (
              <View style={[styles.selectedIndicator, { backgroundColor: primaryColor }]} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      </Animated.View>

      <TouchableOpacity
        style={[styles.continueButton, { backgroundColor: primaryColor, opacity: isChangingLanguage ? 0.7 : 1 }]}
        onPress={handleContinue}
        disabled={isChangingLanguage}
      >
        {isChangingLanguage ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.continueButtonText}>
            {selectedLanguage === 'hi' ? 'जारी रखें' : 
             selectedLanguage === 'bn' ? 'চালিয়ে যান' :
             selectedLanguage === 'te' ? 'కొనసాగించు' :
             selectedLanguage === 'mr' ? 'सुरू ठेवा' :
             selectedLanguage === 'ta' ? 'தொடரவும்' :
             selectedLanguage === 'gu' ? 'ચાલુ રાખો' :
             selectedLanguage === 'kn' ? 'ಮುಂದುವರಿಸಿ' :
             selectedLanguage === 'ml' ? 'തുടരുക' :
             selectedLanguage === 'pa' ? 'ਜਾਰੀ ਰੱਖੋ' :
             'Continue'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 24, // Balance the back button space
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    opacity: 0.8,
  },
  languageList: {
    flex: 1,
    marginBottom: 20,
  },
  languageItem: {
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  languageNative: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginLeft: 10,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 10,
  },
  continueButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default LanguageScreen;
