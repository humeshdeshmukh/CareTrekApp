// MapScreen.tsx  (improved: share + sos + cleaned UI + fixed bugs)
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
  Share,
  Linking,
  SafeAreaView as RNFSafeAreaView,
} from 'react-native';
import MapView, { Marker, Circle, Region, MapType } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../contexts/translation/TranslationContext';
import { useCachedTranslation } from '../../hooks/useCachedTranslation';
import Slider from '@react-native-community/slider';
import { v4 as uuidv4 } from 'uuid';

let Battery: any = null;
try {
  Battery = require('expo-battery');
} catch (e) {
  Battery = null;
}

const { width, height } = Dimensions.get('window');

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

type LocationPoint = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

type SafeZone = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  radius: number;
};

const DEFAULT_REGION: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const MapScreen: React.FC = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const { isDark } = useTheme();
  const { currentLanguage } = useTranslation();

  const { translatedText: myLocationText } = useCachedTranslation('My Location', currentLanguage);
  const { translatedText: shareText } = useCachedTranslation('Share', currentLanguage);
  const { translatedText: backText } = useCachedTranslation('Back', currentLanguage);
  const { translatedText: sosText } = useCachedTranslation('SOS', currentLanguage);

  const mapRef = useRef<MapView | null>(null);

  // Map & UI
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [showTraffic, setShowTraffic] = useState<boolean>(false);

  // Sharing
  const [isSharingLive, setIsSharingLive] = useState(false);
  const [shareDuration, setShareDuration] = useState<number>(60 * 60 * 1000); // 1 hour
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const shareIntervalRef = useRef<number | null>(null);
  const activeShareIdRef = useRef<string | null>(null);

  // Location + history
  const [currentLocation, setCurrentLocation] = useState<LocationPoint>({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
    timestamp: Date.now(),
  });
  const [locationHistory, setLocationHistory] = useState<LocationPoint[]>([]);
  const [historyPlaybackIndex, setHistoryPlaybackIndex] = useState<number>(0);
  const [isPlayingHistory, setIsPlayingHistory] = useState(false);

  // history UI
  const [historyExpanded, setHistoryExpanded] = useState(false);

  // Safezones, favorites
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [tempZoneCoords, setTempZoneCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [newZoneModalVisible, setNewZoneModalVisible] = useState(false);
  const [newZoneTitle, setNewZoneTitle] = useState('');
  const [newZoneRadius, setNewZoneRadius] = useState<number>(100);
  const [favorites, setFavorites] = useState<LocationPoint[]>([]);

  // extras
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [weatherText, setWeatherText] = useState<string | null>(null);

  // ---------- lifecycle ----------
  useEffect(() => {
    loadPersistedData();

    if (Battery && Battery.getBatteryLevelAsync) {
      Battery.getBatteryLevelAsync().then((lvl: number) => setBatteryLevel(lvl));
    }

    // simulate location updates (replace with real location watcher)
    const sim = setInterval(simulateLocationMovement, 5000);

    return () => {
      clearInterval(sim);
      stopLiveShareInterval();
    };
  }, []);

  // playback effect
  useEffect(() => {
    let playTimer: any = null;
    if (isPlayingHistory && locationHistory.length > 0) {
      playTimer = setInterval(() => {
        setHistoryPlaybackIndex((prev) => {
          const next = Math.min(prev + 1, locationHistory.length - 1);
          const p = locationHistory[next];
          if (p) {
            mapRef.current?.animateToRegion({
              latitude: p.latitude,
              longitude: p.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 400);
          }
          if (next >= locationHistory.length - 1) {
            clearInterval(playTimer);
            setIsPlayingHistory(false);
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (playTimer) clearInterval(playTimer);
    };
  }, [isPlayingHistory, locationHistory]);

  // ---------- helpers ----------
  const loadPersistedData = async () => {
    // demo history (replace with your persisted storage)
    const demoHistory: LocationPoint[] = [
      { latitude: 37.78825, longitude: -122.4324, timestamp: Date.now() - 1800_000 },
      { latitude: 37.78925, longitude: -122.4334, timestamp: Date.now() - 1200_000 },
      { latitude: 37.79025, longitude: -122.4344, timestamp: Date.now() - 600_000 },
      { latitude: 37.79125, longitude: -122.4354, timestamp: Date.now() },
    ];
    setLocationHistory(demoHistory);
  };

  const simulateLocationMovement = () => {
    setCurrentLocation((prev) => {
      const next = {
        latitude: prev.latitude + (Math.random() - 0.5) * 0.0006,
        longitude: prev.longitude + (Math.random() - 0.5) * 0.0006,
        timestamp: Date.now(),
      };
      setLocationHistory((h) => {
        const arr = [...h, next];
        // keep limited history
        return arr.slice(-200);
      });
      checkSafeZones(next);
      // if live sharing is active, push update immediately (also interval will push)
      if (isSharingLive) sendShareUpdate(next);
      return next;
    });
  };

  const checkSafeZones = (loc: LocationPoint) => {
    safeZones.forEach((z) => {
      const distance = haversineDistance(z.latitude, z.longitude, loc.latitude, loc.longitude);
      if (distance <= z.radius) {
        // TODO: notify user or send enter event
        console.log(`[zone] inside ${z.title}`);
      }
    });
  };

  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ---------- Share (live) functionality ----------
  const openShareModal = () => setShareModalVisible(true);
  const closeShareModal = () => setShareModalVisible(false);

  const startLiveShare = async () => {
    // generate id + create session (call API here)
    const shareId = uuidv4();
    activeShareIdRef.current = shareId;
    setIsSharingLive(true);
    setShareModalVisible(false);

    // start interval to push location
    stopLiveShareInterval();
    // @ts-ignore - window.setInterval returns number in RN env
    shareIntervalRef.current = setInterval(() => {
      sendShareUpdate(currentLocation);
    }, 5000) as unknown as number;

    // create share link and open share sheet
    const shareLink = `https://example.com/share/${shareId}`; // replace with your own share URL
    try {
      await Share.share({
        message: `I'm sharing my live location: ${shareLink}`,
        title: 'Live location share',
      });
    } catch (e) {
      console.warn('Share failed', e);
    }

    console.log('[share] started', shareId);
    // Optionally set a timeout to auto-stop after shareDuration
    if (shareDuration > 0) {
      setTimeout(() => {
        stopLiveShare();
      }, shareDuration);
    }
  };

  const sendShareUpdate = async (loc: LocationPoint) => {
    // TODO: replace this with your API call (e.g., POST /share/:id/locations)
    // send activeShareIdRef.current + loc
    const sid = activeShareIdRef.current;
    if (!sid) return;
    console.log(`[share:${sid}] update sent:`, loc);
    // Example:
    // await fetch(`${API_BASE}/share/${sid}/location`, { method: 'POST', body: JSON.stringify(loc) })
  };

  const stopLiveShareInterval = () => {
    if (shareIntervalRef.current) {
      clearInterval(shareIntervalRef.current as any);
      shareIntervalRef.current = null;
    }
  };

  const stopLiveShare = async () => {
    // call API to close session if needed
    stopLiveShareInterval();
    console.log('[share] stopped', activeShareIdRef.current);
    activeShareIdRef.current = null;
    setIsSharingLive(false);
  };

  // ---------- SOS ----------
  const triggerSOS = async () => {
    const locText = `My location: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)} (https://www.google.com/maps/search/?api=1&query=${currentLocation.latitude},${currentLocation.longitude})`;
    const message = `SOS! I need help. ${locText}`;

    // Try SMS composer (Android/iOS) — fallback to share sheet
    const phone = ''; // optionally preset emergency phone numbers or fetch from user settings
    try {
      if (Platform.OS === 'ios') {
        // open sms: with body param
        const url = `sms:${phone}?body=${encodeURIComponent(message)}`;
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
          return;
        }
      } else {
        // android
        const url = `sms:${phone}?body=${encodeURIComponent(message)}`;
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
          return;
        }
      }
    } catch (e) {
      console.warn('SMS open failed', e);
    }

    // fallback: share sheet so user can pick SMS/WhatsApp/Email
    try {
      await Share.share({
        message,
        title: 'SOS — Help',
      });
    } catch (e) {
      console.warn('Share failed', e);
      Alert.alert('SOS', 'Unable to open sharing options — please call your emergency contacts.');
    }

    // stub: call backend to notify emergency contacts
    console.log('[SOS] sent', currentLocation);
    Alert.alert('SOS', 'SOS message prepared. Please complete the send in your messaging app.');
  };

  // ---------- UI actions ----------
  const centerOnUser = () => {
    mapRef.current?.animateToRegion({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 350);
  };

  const saveFavorite = (loc?: LocationPoint) => {
    const p = loc ?? currentLocation;
    setFavorites((f) => [...f, p]);
    Alert.alert('Saved', 'Favorite saved');
  };

  const confirmAddSafeZone = () => {
    if (!tempZoneCoords) {
      Alert.alert('Error', 'No coordinates selected.');
      return;
    }
    const newZone: SafeZone = {
      id: `zone_${Date.now()}`,
      title: newZoneTitle || 'Safe Zone',
      latitude: tempZoneCoords.latitude,
      longitude: tempZoneCoords.longitude,
      radius: newZoneRadius,
    };
    setSafeZones((s) => [...s, newZone]);
    setNewZoneModalVisible(false);
    setTempZoneCoords(null);
    setNewZoneTitle('');
    setNewZoneRadius(100);
    Alert.alert('Zone added', newZone.title);
  };

  const handleMapLongPress = (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setTempZoneCoords(coords);
    setNewZoneModalVisible(true);
  };

  // history controls
  const togglePlayPause = () => {
    setIsPlayingHistory((p) => {
      const next = !p;
      if (next && locationHistory.length > 0) {
        // ensure expanded for visibility
        setHistoryExpanded(true);
      }
      return next;
    });
  };

  const clearHistory = () => {
    Alert.alert('Confirm', 'Clear location history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => { setLocationHistory([]); setHistoryPlaybackIndex(0); } },
    ]);
  };

  // ---------- Render ----------
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F1724' : '#FFFBEF' }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#24303a' : '#E6E6E6' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={20} color={isDark ? '#E2E8F0' : '#1A202C'} />
          <Text style={[styles.headerTitle, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>{myLocationText}</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setMapType((t) => (t === 'standard' ? 'satellite' : t === 'satellite' ? 'hybrid' : 'standard'))} style={styles.iconButton}>
            <Ionicons name="layers" size={20} color={isDark ? '#E2E8F0' : '#1A202C'} />
            <Text style={styles.iconLabel}>Map</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowTraffic((s) => !s)} style={styles.iconButton}>
            <Ionicons name="speedometer" size={20} color={showTraffic ? '#EF4444' : (isDark ? '#E2E8F0' : '#1A202C')} />
            <Text style={styles.iconLabel}>Traffic</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openShareModal} style={[styles.shareButton, { backgroundColor: isDark ? '#1F2937' : '#2F855A' }]}>
            <Ionicons name="share-social" size={18} color="white" />
            <Text style={styles.shareButtonText}>{shareText}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={(r) => (mapRef.current = r)}
          style={styles.map}
          initialRegion={DEFAULT_REGION}
          showsUserLocation
          showsMyLocationButton
          followsUserLocation
          onLongPress={handleMapLongPress}
          mapType={mapType}
          showsTraffic={showTraffic}
        >
          <Marker
            coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
            title="You"
            description={new Date(currentLocation.timestamp).toLocaleString()}
          />
          {locationHistory.map((p, i) => (
            <Marker key={`hist-${i}`} coordinate={{ latitude: p.latitude, longitude: p.longitude }} opacity={0.5} />
          ))}
          {safeZones.map((z) => (
            <Circle
              key={z.id}
              center={{ latitude: z.latitude, longitude: z.longitude }}
              radius={z.radius}
              strokeColor="rgba(34,139,34,0.6)"
              fillColor="rgba(34,139,34,0.15)"
            />
          ))}
          {favorites.map((f, idx) => (
            <Marker key={`fav-${idx}`} coordinate={{ latitude: f.latitude, longitude: f.longitude }} pinColor="purple" />
          ))}
          {tempZoneCoords && <Marker coordinate={tempZoneCoords} pinColor="orange" />}
        </MapView>
      </View>

      {/* Footer (lowest panel) */}
      <View style={[styles.footer, { backgroundColor: isDark ? '#0B1220' : '#FFFFFF' }]}>
        <View style={styles.locationInfo}>
          <Ionicons name="location" size={20} color={isDark ? '#63B3ED' : '#3182CE'} style={styles.locationIcon} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.addressTitle, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>Current Location</Text>
            <Text style={[styles.address, { color: isDark ? '#9AA6B2' : '#4A5568' }]}>
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </Text>
            <Text style={[styles.smallText, { color: isDark ? '#9AA6B2' : '#718096' }]}>
              {weatherText ?? 'Weather: —'}  •  Battery: {batteryLevel !== null ? `${Math.round(batteryLevel * 100)}%` : '—'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.footerButton} onPress={centerOnUser}>
            <Ionicons name="locate" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.footerButton, { backgroundColor: '#F97316' }]} onPress={() => saveFavorite()}>
            <Ionicons name="star" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.footerButton, { backgroundColor: isSharingLive ? '#E53E3E' : '#38A169' }]} onPress={() => (isSharingLive ? stopLiveShare() : openShareModal())}>
            <Ionicons name="people" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SOS Floating Button (right) */}
      <TouchableOpacity style={styles.sosButton} onPress={triggerSOS} activeOpacity={0.8}>
        <Ionicons name="warning" size={28} color="white" />
        <Text style={styles.sosText}>{sosText ?? 'SOS'}</Text>
      </TouchableOpacity>

      {/* Vertical history controls (right, above SOS) */}
      {!historyExpanded ? (
        <View style={[styles.verticalHistoryRight, { backgroundColor: isDark ? '#071127' : '#FFFFFF' }]}>
          <TouchableOpacity style={styles.iconSquare} onPress={togglePlayPause} accessibilityLabel="PlayPause history">
            <Ionicons name={isPlayingHistory ? 'pause' : 'play'} size={18} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.iconSquare, { marginTop: 8 }]} onPress={clearHistory} accessibilityLabel="Clear history">
            <Ionicons name="trash" size={16} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.iconSquare, { marginTop: 8 }]} onPress={() => setHistoryExpanded(true)} accessibilityLabel="Expand history">
            <Ionicons name="chevron-up" size={18} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.historyPanelExpanded, { backgroundColor: isDark ? '#071127' : '#FFFFFF' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: isDark ? '#E2E8F0' : '#111', fontWeight: '600' }}>Location History</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={styles.smallAction} onPress={() => setHistoryExpanded(false)}>
                <Ionicons name="chevron-down" size={18} color={isDark ? '#E2E8F0' : '#111'} />
              </TouchableOpacity>
            </View>
          </View>

          <Slider
            style={{ width: Math.max(180, width - 220) }}
            minimumValue={0}
            maximumValue={Math.max(locationHistory.length - 1, 0)}
            step={1}
            value={Math.min(historyPlaybackIndex, Math.max(locationHistory.length - 1, 0))}
            minimumTrackTintColor="#2563EB"
            onValueChange={(v: number) => {
              const vi = Math.round(v);
              setHistoryPlaybackIndex(vi);
              const p = locationHistory[vi];
              if (p) {
                mapRef.current?.animateToRegion({
                  latitude: p.latitude,
                  longitude: p.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }, 300);
              }
            }}
            disabled={locationHistory.length === 0}
          />

          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
              <Ionicons name={isPlayingHistory ? 'pause' : 'play'} size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.playButton, { marginLeft: 8 }]} onPress={clearHistory}>
              <Ionicons name="trash" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Share Modal */}
      <Modal visible={shareModalVisible} transparent animationType="slide" onRequestClose={closeShareModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#0B1220' : '#FFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#E2E8F0' : '#111' }]}>Share live location</Text>

            <View style={{ marginVertical: 12 }}>
              <TouchableOpacity onPress={() => setShareDuration(60 * 60 * 1000)} style={shareDuration === 60 * 60 * 1000 ? styles.durationSelected : styles.durationOption}>
                <Text>1 hour</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShareDuration(3 * 60 * 60 * 1000)} style={shareDuration === 3 * 60 * 60 * 1000 ? styles.durationSelected : styles.durationOption}>
                <Text>3 hours</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShareDuration(24 * 60 * 60 * 1000)} style={shareDuration === 24 * 60 * 60 * 1000 ? styles.durationSelected : styles.durationOption}>
                <Text>24 hours</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={closeShareModal}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={startLiveShare}>
                <Text style={{ color: 'white' }}>{isSharingLive ? 'Updating' : 'Start'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Safe Zone Modal */}
      <Modal visible={newZoneModalVisible} transparent animationType="slide" onRequestClose={() => setNewZoneModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#0B1220' : '#FFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#E2E8F0' : '#111' }]}>Add Safe Zone</Text>

            <TextInput
              placeholder="Zone name"
              value={newZoneTitle}
              onChangeText={setNewZoneTitle}
              style={[styles.input, { backgroundColor: isDark ? '#111827' : '#F7FAFC', color: isDark ? '#E2E8F0' : '#111' }]}
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
            />

            <Text style={{ marginBottom: 8 }}>{`Radius (meters): ${newZoneRadius}`}</Text>
            <Slider
              minimumValue={50}
              maximumValue={1000}
              step={10}
              value={newZoneRadius}
              onValueChange={(v) => setNewZoneRadius(Math.round(v))}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => { setNewZoneModalVisible(false); setTempZoneCoords(null); }}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={confirmAddSafeZone}>
                <Text style={{ color: 'white' }}>Add Zone</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { marginLeft: 8, fontSize: 18, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { marginHorizontal: 6, alignItems: 'center' },
  iconLabel: { fontSize: 10 },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    marginLeft: 8,
  },
  shareButtonText: { color: 'white', marginLeft: 6, fontWeight: '600' },

  mapContainer: { flex: 1 },
  map: { width: '100%', height: '100%' },

  footer: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  locationIcon: { marginRight: 12 },
  addressTitle: { fontSize: 14, fontWeight: '700' },
  address: { fontSize: 12 },
  smallText: { fontSize: 11 },

  footerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sosButton: {
    position: 'absolute',
    right: 16,
    bottom: 110,
    backgroundColor: '#EF4444',
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  sosText: { color: 'white', fontWeight: '700', marginTop: 4, fontSize: 12 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 40,
    padding: 16,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  durationOption: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: '#F1F5F9',
  },
  durationSelected: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: '#D1FAE5',
  },
  modalButtonPrimary: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2F855A',
    minWidth: 120,
    alignItems: 'center',
  },
  modalButtonCancel: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    minWidth: 120,
    alignItems: 'center',
  },
  input: { padding: 10, borderRadius: 8, marginVertical: 8 },

  // Right-side compact history control
  verticalHistoryRight: {
    position: 'absolute',
    right: 16,
    bottom: 186, // above SOS (SOS at bottom ~110) and footer, tuned spacing
    width: 56,
    padding: 8,
    borderRadius: 12,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSquare: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Expanded history panel that sits just above footer (centered horizontal)
  historyPanelExpanded: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 76,
    padding: 10,
    borderRadius: 12,
    elevation: 6,
    alignItems: 'center',
  },

  smallAction: {
    padding: 6,
    marginLeft: 8,
  },

  playButton: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  historyContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    padding: 10,
    borderRadius: 12,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
