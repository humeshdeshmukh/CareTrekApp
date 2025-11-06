import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../contexts/theme/ThemeContext';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface WaveAnimationProps {
  color?: string;
  style?: any;
  isDark: boolean;
}

const WaveAnimation: React.FC<WaveAnimationProps> = ({ color, style, isDark }) => {
  const animateWave = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animateWave, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateX = animateWave.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '-50%']
  });

  const wavePath = (height = 40, width = 300, segmentWidth = 300) => {
    return `M0,${height} 
      C${width * 0.2},${height * 0.7} ${width * 0.4},${height * 0.3} ${width},${height}
      C${width * 1.6},${height * 1.7} ${width * 1.8},${height * 1.3} ${width * 2},${height}
      V${height * 2} H0 Z`;
  };

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <Animated.View 
        style={[{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateX }],
          width: '200%',
        }]}
      >
        <Svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 300 100" 
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={isDark ? '#2D3748' : '#E2E8F0'} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={isDark ? '#4A5568' : '#CBD5E0'} stopOpacity="0.8" />
            </LinearGradient>
          </Defs>
          <Path 
            d={wavePath(40, 300, 300)} 
            fill="url(#waveGradient)"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { width } = Dimensions.get('window');
  
  // Animation effects
  useEffect(() => {
    // Fade in and scale up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();

    // Pulsing animation for the next button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const handleNext = () => {
    navigation.navigate('Language');
  };

  const bgColor = isDark ? '#171923' : '#FFFBEF';
  const textColor = isDark ? '#E2E8F0' : '#2D3748';
  const buttonBg = isDark ? '#48BB78' : '#2F855A';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Wave Animation Background */}
      <WaveAnimation 
        color={isDark ? '#2D3748' : '#E2E8F0'} 
        style={styles.waveContainer}
        isDark={isDark}
      />

      {/* App Name */}
      <Animated.View 
        style={[
          styles.appNameContainer,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <Text style={[styles.appName, { color: textColor }]}>CareTrek</Text>
        <Text style={[styles.tagline, { color: textColor }]}>Journey Together</Text>
      </Animated.View>

      {/* Next Button */}
      <Animated.View 
        style={[
          styles.buttonContainer,
          { 
            opacity: fadeAnim,
            transform: [{ scale: pulseAnim }],
          }
        ]}
      >
        <TouchableOpacity 
          style={[styles.nextButton, { backgroundColor: buttonBg }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <Path 
              d="M5 12H19M19 12L12 5M19 12L12 19" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  appNameContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
  },
  nextButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});

export default WelcomeScreen;
