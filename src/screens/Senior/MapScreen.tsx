import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../contexts/translation/TranslationContext';
import { useCachedTranslation } from '../../hooks/useCachedTranslation';

const { width, height } = Dimensions.get('window');

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

const MapScreen = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const { isDark } = useTheme();
  const { currentLanguage } = useTranslation();
  
  // Translations
  const { translatedText: myLocationText } = useCachedTranslation('My Location', currentLanguage);
  const { translatedText: shareText } = useCachedTranslation('Share', currentLanguage);
  const { translatedText: backText } = useCachedTranslation('Back', currentLanguage);
  
  const handleBack = () => {
    navigation.goBack();
  };

  // Sample location (you can replace with actual location data)
  const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

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
        <Text style={[styles.title, { color: isDark ? '#2F855A' : '#2F855A' }]}>
          {myLocationText}
        </Text>
        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: isDark ? '#2D3748' : '#38A169' }]}
          onPress={() => console.log('Share location')}
        >
          <Ionicons name="share-social" size={20} color="white" />
          <Text style={[styles.shareButtonText, { color: 'white' }]}>
            {shareText}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          followsUserLocation={true}
        >
          <Marker
            coordinate={{
              latitude: initialRegion.latitude,
              longitude: initialRegion.longitude,
            }}
            title="Your Location"
            description="Current position"
          >
            <View style={[styles.marker, { backgroundColor: isDark ? '#4299E1' : '#2B6CB0' }]}>
              <Ionicons name="person" size={20} color="white" />
            </View>
          </Marker>
        </MapView>
      </View>

      <View style={[styles.footer, { backgroundColor: isDark ? '#2D3748' : '#FFFFFF' }]}>
        <View style={styles.locationInfo}>
          <Ionicons 
            name="location" 
            size={20} 
            color={isDark ? '#63B3ED' : '#3182CE'} 
            style={styles.locationIcon} 
          />
          <View>
            <Text style={[styles.addressTitle, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>
              Current Location
            </Text>
            <Text style={[styles.address, { color: isDark ? '#A0AEC0' : '#4A5568' }]}>
              123 Main St, San Francisco, CA 94105
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.refreshButton, { backgroundColor: isDark ? '#4299E1' : '#3182CE' }]}
          onPress={() => console.log('Refresh location')}
        >
          <Ionicons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2F855A',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shareButtonText: {
    marginLeft: 4,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  marker: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 12,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  address: {
    fontSize: 14,
    opacity: 0.8,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});

export default MapScreen;
