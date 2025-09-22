// Web-specific MapView component
import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Navigation2 } from 'lucide-react-native';
import * as Location from 'expo-location';
import { EmergencyZone } from '@/types/emergency';
import WebMapView from './WebMapView';

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
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  }, []);

  const requestLocationPermission = useCallback(async () => {
    try {
      // For web, check if geolocation is available
      if ('geolocation' in navigator) {
        setLocationPermission(Location.PermissionStatus.GRANTED);
        getCurrentLocation();
      } else {
        setLocationPermission(Location.PermissionStatus.DENIED);
        console.log('Geolocation not available in this browser');
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
      console.log('Location permission denied - showing instructions');
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

  return (
    <View style={styles.container}>
      <WebMapView {...mapProps} />
      
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
    fontWeight: '600' as const,
  },
});