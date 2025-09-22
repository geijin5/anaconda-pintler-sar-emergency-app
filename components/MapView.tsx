import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { MapPin, Navigation2, MapPinned } from 'lucide-react-native';
import * as Location from 'expo-location';
import { EmergencyZone } from '@/types/emergency';
// Conditional import for react-native-maps to handle web compatibility
let RNMapView: any = null;
let Marker: any = null;
let Circle: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    RNMapView = maps.default;
    Marker = maps.Marker;
    Circle = maps.Circle;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch {
    console.log('react-native-maps not available on this platform');
  }
}

interface MapViewProps {
  zones: EmergencyZone[];
  onZonePress: (zone: EmergencyZone) => void;
  selectedZone: EmergencyZone | null;
}

export default function MapView({ zones, onZonePress, selectedZone }: MapViewProps) {
  const { width, height } = useWindowDimensions();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    try {
      if ((Platform.OS as string) === 'web') {
        // Use web geolocation API
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  altitude: position.coords.altitude,
                  accuracy: position.coords.accuracy,
                  altitudeAccuracy: position.coords.altitudeAccuracy,
                  heading: position.coords.heading,
                  speed: position.coords.speed,
                },
                timestamp: position.timestamp,
              } as Location.LocationObject;
              setCurrentLocation(location);
              console.log('Web location obtained:', location.coords);
            },
            (error) => {
              let errorMessage = 'Unknown geolocation error';
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
                  setLocationPermission(Location.PermissionStatus.DENIED);
                  setLocationError(errorMessage);
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage = 'Location information is currently unavailable. Please try again later.';
                  setLocationError(errorMessage);
                  break;
                case error.TIMEOUT:
                  errorMessage = 'Location request timed out. Please try again.';
                  setLocationError(errorMessage);
                  break;
                default:
                  errorMessage = `Unable to get location: ${error.message || 'Unknown error'}`;
                  setLocationError(errorMessage);
              }
              console.log('Location access issue:', errorMessage);
            },
            { 
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            }
          );
        }
      } else {
        // Use expo-location for native
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation(location);
        console.log('Native location obtained:', location.coords);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  }, []);

  const requestLocationPermission = useCallback(async () => {
    try {
      if ((Platform.OS as string) === 'web') {
        // For web, check if geolocation is available
        if ('geolocation' in navigator) {
          setLocationPermission(Location.PermissionStatus.GRANTED);
          getCurrentLocation();
        } else {
          setLocationPermission(Location.PermissionStatus.DENIED);
          console.log('Geolocation not available in this browser');
        }
      } else {
        // Use expo-location for native
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);
        
        if (status === 'granted') {
          getCurrentLocation();
        } else {
          console.log('Location permission denied');
        }
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  }, [getCurrentLocation]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  const getZoneColor = (status: string, opacity: number = 0.3) => {
    switch (status) {
      case 'active':
        return `rgba(220, 38, 38, ${opacity})`;
      case 'caution':
        return `rgba(245, 158, 11, ${opacity})`;
      case 'clear':
        return `rgba(16, 185, 129, ${opacity})`;
      default:
        return `rgba(107, 114, 128, ${opacity})`;
    }
  };

  const handleLocationPress = async () => {
    setLocationError(null);
    
    if (locationPermission === Location.PermissionStatus.DENIED) {
      if (Platform.OS === 'web') {
        Alert.alert(
          'Location Access Required',
          'Location access was denied. To enable location:\n\n1. Click the location icon in your browser\'s address bar\n2. Select "Allow" for location access\n3. Refresh the page if needed',
          [
            { text: 'OK', style: 'default' },
            { text: 'Try Again', onPress: requestLocationPermission },
          ]
        );
      } else {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions in your device settings to use this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: requestLocationPermission },
          ]
        );
      }
      return;
    }

    if (locationPermission !== Location.PermissionStatus.GRANTED) {
      await requestLocationPermission();
      return;
    }

    try {
      await getCurrentLocation();
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Unable to get your current location. Please try again.');
    }
  };

  // Default region (Montana area)
  const defaultRegion = {
    latitude: 46.0059,
    longitude: -112.5362,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  // Convert zone coordinates to lat/lng (mock conversion for demo)
  const convertZoneCoordinates = (zone: EmergencyZone) => {
    return {
      latitude: defaultRegion.latitude + (zone.coordinates.y - 0.5) * 0.1,
      longitude: defaultRegion.longitude + (zone.coordinates.x - 0.5) * 0.1,
    };
  };

  const getZoneColorHex = (status: string) => {
    switch (status) {
      case 'active':
        return '#DC2626';
      case 'caution':
        return '#F59E0B';
      case 'clear':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {Platform.OS !== 'web' ? (
          <RNMapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={defaultRegion}
            region={currentLocation ? {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            } : defaultRegion}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={true}
            showsScale={true}
            mapType="standard"
          >
            {/* Emergency zones */}
            {zones.map((zone) => {
              const zoneCoords = convertZoneCoordinates(zone);
              return (
                <React.Fragment key={zone.id}>
                  <Circle
                    center={zoneCoords}
                    radius={zone.radius * 100} // Convert to meters
                    fillColor={getZoneColor(zone.status, 0.3)}
                    strokeColor={getZoneColorHex(zone.status)}
                    strokeWidth={2}
                  />
                  <Marker
                    coordinate={zoneCoords}
                    onPress={() => onZonePress(zone)}
                    title={zone.name}
                    description={`Status: ${zone.status}`}
                  >
                    <View style={[
                      styles.markerContainer,
                      { backgroundColor: getZoneColorHex(zone.status) },
                      selectedZone?.id === zone.id && styles.selectedMarker
                    ]}>
                      <MapPin size={16} color="#fff" />
                    </View>
                  </Marker>
                </React.Fragment>
              );
            })}
          </RNMapView>
        ) : (
          // Web fallback
          <View style={styles.webMapFallback}>
            <Text style={styles.mapTitle}>Emergency Response Map</Text>
            <Text style={styles.mapSubtitle}>
              Google Maps - Web version (requires API key)
            </Text>
            
            {zones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              const isActive = zone.status === 'active';
              
              return (
                <TouchableOpacity
                  key={zone.id}
                  style={[
                    styles.zone,
                    {
                      left: zone.coordinates.x * width * 0.8 + width * 0.1,
                      top: zone.coordinates.y * height * 0.6 + 100,
                      width: zone.radius * 1.5,
                      height: zone.radius * 1.5,
                      backgroundColor: getZoneColor(zone.status),
                      borderColor: getZoneColor(zone.status, 0.8),
                      borderWidth: isSelected ? 3 : 2,
                      transform: [{ scale: isSelected ? 1.1 : 1 }],
                    },
                  ]}
                  onPress={() => onZonePress(zone)}
                  activeOpacity={0.8}
                  testID={`zone-${zone.id}`}
                >
                  {isActive && (
                    <Animated.View
                      style={[
                        styles.pulseCircle,
                        {
                          backgroundColor: getZoneColor(zone.status, 0.2),
                          transform: [{ scale: pulseAnim }],
                        },
                      ]}
                    />
                  )}
                  <View style={[styles.zoneCenter, { backgroundColor: getZoneColor(zone.status, 1) }]}>
                    <MapPin size={12} color="#fff" />
                  </View>
                  {isSelected && (
                    <View style={styles.zoneLabel}>
                      <Text style={styles.zoneLabelText}>{zone.name}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            
            {/* Current location indicator */}
            {currentLocation && (
              <View
                style={[
                  styles.currentLocationMarker,
                  {
                    left: width * 0.5 - 12,
                    top: height * 0.4 - 12,
                  },
                ]}
              >
                <View style={styles.currentLocationPulse}>
                  <Animated.View
                    style={[
                      styles.currentLocationPulseRing,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  />
                </View>
                <MapPinned size={24} color="#1E3A8A" />
                <Text style={styles.currentLocationText}>You are here</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.locationButton,
          locationPermission === Location.PermissionStatus.GRANTED && currentLocation && styles.locationButtonActive,
          locationPermission === Location.PermissionStatus.DENIED && styles.locationButtonDenied
        ]}
        onPress={handleLocationPress}
        testID="location-button"
      >
        <Navigation2 
          size={20} 
          color={
            locationPermission === Location.PermissionStatus.GRANTED && currentLocation 
              ? '#10B981' 
              : locationPermission === Location.PermissionStatus.DENIED 
              ? '#DC2626' 
              : '#1E3A8A'
          } 
        />
      </TouchableOpacity>
      
      {locationError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => {
              setLocationError(null);
              requestLocationPermission();
            }}
          >
            <Text style={styles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4E8',
    position: 'relative',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#F0F4E8',
  },
  map: {
    flex: 1,
  },
  webMapFallback: {
    flex: 1,
    backgroundColor: '#E8F4F8',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedMarker: {
    borderWidth: 3,
    borderColor: '#fff',
    transform: [{ scale: 1.2 }],
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#E8F4F8',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  mapSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  zone: {
    position: 'absolute',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  pulseCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  zoneCenter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  zoneLabel: {
    position: 'absolute',
    bottom: -25,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  zoneLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  locationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  locationButtonActive: {
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  locationButtonDenied: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  errorBanner: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
    marginRight: 12,
  },
  errorButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  currentLocationMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  currentLocationPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationPulseRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(30, 58, 138, 0.4)',
  },
  currentLocationText: {
    position: 'absolute',
    top: 30,
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});