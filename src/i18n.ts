import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

// Import all translations
const resources = {
  en: {
    translation: {
      welcome: 'Welcome to CareTrek',
      journey: 'Journey Together',
      selectLanguage: 'Select Language',
      continue: 'Continue',
      // Add more English translations here
    },
  },
  hi: {
    translation: {
      welcome: 'केयरट्रेक में आपका स्वागत है',
      journey: 'एक साथ यात्रा करें',
      selectLanguage: 'भाषा चुनें',
      continue: 'जारी रखें',
      // Add more Hindi translations here
    },
  },
  // Add more languages as needed
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3', // For Android compatibility
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Handle RTL for RTL languages
const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
const currentLanguage = i18n.language || 'en';
const isRTL = rtlLanguages.some(lang => currentLanguage.startsWith(lang));
I18nManager.forceRTL(isRTL);

export default i18n;
