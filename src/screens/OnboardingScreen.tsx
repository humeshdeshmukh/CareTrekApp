import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, Easing, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../contexts/theme/ThemeContext';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const OnboardingScreen = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { isDark } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const pan = useRef(new Animated.ValueXY()).current;

  // Set up pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow horizontal swipes
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          pan.setValue({ x: gestureState.dx, y: 0 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100 && currentSlide > 0) {
          // Swipe right to go back
          goToSlide(currentSlide - 1);
        } else if (gestureState.dx < -100 && currentSlide < slides.length - 1) {
          // Swipe left to go forward
          goToSlide(currentSlide + 1);
        } else {
          // Reset position if swipe wasn't significant
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const goToSlide = (index: number) => {
    // Reset pan value
    pan.setValue({ x: 0, y: 0 });
    
    // Update current slide
    setCurrentSlide(index);
    
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    // Start new animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleRoleSelect = (role: 'senior' | 'family') => {
    // In a real app, you would save the selected role to your state/context
    console.log(`Selected role: ${role}`);
    navigation.replace('Auth');
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    } else {
      navigation.goBack();
    }
  };

  const slides = [
    {
      title: 'Welcome to CareTrek',
      subtitle: 'Your trusted companion for senior care and family connection',
      description: 'Bridging generations with care and technology',
      image: require('../../assets/ChatGPT Image Nov 6, 2025, 07_19_20 PM.png')
    },
    {
      title: 'I am a...',
      subtitle: 'Choose your role to get started',
      description: 'This helps us personalize your experience',
      showButtons: true
    }
  ];

  const { width } = Dimensions.get('window');
  const currentSlideData = slides[currentSlide];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#171923' : '#FFFBEF' }]}>
      <View style={styles.content} {...panResponder.panHandlers}>
        {/* Back Button - Only show if not on first screen or if there's a previous screen to go back to */}
        {currentSlide > 0 && (
          <TouchableOpacity 
            style={[styles.backButton, { borderColor: isDark ? '#4A5568' : '#E2E8F0' }]}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonText, { color: isDark ? '#E2E8F0' : '#4A5568' }]}>
              ← Back
            </Text>
          </TouchableOpacity>
        )}
        {/* Header with Logo */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: isDark ? '#48BB78' : '#2F855A' }]}>CareTrek</Text>
        </View>

        {/* Main Content */}
        <Animated.View 
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {currentSlide === 0 && (
            <View style={styles.illustrationContainer}>
              <View style={[styles.imageWrapper, isDark && styles.imageWrapperDark]}>
                <View style={[styles.imageBackground, isDark && styles.imageBackgroundDark]}>
                  <Image 
                    source={currentSlideData.image} 
                    style={styles.illustration}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
          )}
          
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>
              {currentSlideData.title}
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              {currentSlideData.subtitle}
            </Text>
            <Text style={[styles.tagline, { color: isDark ? '#CBD5E1' : '#475569' }]}>
              {currentSlideData.description}
            </Text>
          </View>
        </Animated.View>

        {/* Navigation Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                index === currentSlide ? styles.activeDot : {},
                { 
                  backgroundColor: index === currentSlide 
                    ? (isDark ? '#48BB78' : '#2F855A') 
                    : (isDark ? '#4A5568' : '#E2E8F0') 
                }
              ]} 
            />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {currentSlide === 0 ? (
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton, { backgroundColor: isDark ? '#48BB78' : '#2F855A' }]}
              onPress={() => setCurrentSlide(1)}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>Get Started</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton, { backgroundColor: isDark ? '#48BB78' : '#2F855A' }]}
                onPress={() => handleRoleSelect('senior')}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, { color: 'white' }]}>I'm a Senior Citizen</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton, { borderColor: isDark ? '#48BB78' : '#2F855A' }]}
                onPress={() => handleRoleSelect('family')}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, { color: isDark ? '#48BB78' : '#2F855A' }]}>
                  I'm a Family Member
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageWrapper: {
    width: '100%',
    maxWidth: 400,
    height: 300,
    borderRadius: 16,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
    overflow: 'hidden',
    borderWidth: 0,
  },
  imageWrapperDark: {
    backgroundColor: '#2D3748',
    shadowColor: '#000',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  illustration: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  textContainer: {
    marginBottom: 40,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
    fontWeight: '500',
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 'auto',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primaryButton: {
    shadowColor: '#2F855A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  // Back button styles
  backButton: {
    position: 'absolute',
    top: 8,
    left: 16,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
  },
  imageBackground: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  imageBackgroundDark: {
    backgroundColor: 'transparent',
  },
});
