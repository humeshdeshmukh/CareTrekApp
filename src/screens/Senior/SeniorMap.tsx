import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/theme/ThemeContext';
import LocationView from '../../components/LocationView';

const SeniorMap = () => {
  const { colors } = useTheme();

  const handleLocationUpdate = (location: { latitude: number; longitude: number; address?: string }) => {
    // In a real app, you would send this location to your backend
    console.log('Location updated:', location);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LocationView 
        onLocationUpdate={handleLocationUpdate}
        showActions={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default SeniorMap;
