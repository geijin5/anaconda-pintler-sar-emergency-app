// Cross-platform MapView component
import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Navigation2 } from 'lucide-react-native';
import * as Location from 'expo-location';
import { EmergencyZone } from '@/types/emergency';

// Platform-specific imports
let NativeMapView: any = null;
let WebMapView: any = null;

if (Platform.OS !== 'web') {
  NativeMapView = require('./NativeMapView').default;
} else {
  WebMapView = require('./WebMapView').default;
}

interface MapViewProps {
  zones: EmergencyZone[];
  onZonePress: (zone: EmergencyZone) => void;
  selectedZone: EmergencyZone | null;
}

export default function MapView({ zones, onZonePress, selectedZone }: MapViewProps) {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    try {
      // Use expo-location for native
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation(location);
      console.log('Native location obtained:', location.coords);
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  }, []);

  const requestLocationPermission = useCallback(async () => {
    try {
      // Use expo-location for native
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        console.log('Location permission denied');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  }, [getCurrentLocation]);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  const handleLocationPress = async () => {
    setLocationError(null);
    
    if (locationPermission === Location.PermissionStatus.DENIED) {
      Alert.alert(
        'Location Permission Required',
        'Please enable location permissions in your device settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', onPress: requestLocationPermission },
        ]
      );
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

  const mapProps = {
    zones,
    onZonePress,
    selectedZone,
    currentLocation,
    locationPermission,
    locationError,
    handleLocationPress,
    setLocationError,
    requestLocationPermission,
  };

  // Render platform-specific map component
  const MapComponent = Platform.OS === 'web' ? WebMapView : NativeMapView;
  
  return (
    <View style={styles.container}>
      {MapComponent && <MapComponent {...mapProps} />}
      
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

});