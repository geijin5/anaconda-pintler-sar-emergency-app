// Native map component - only used on mobile platforms
import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';
import { EmergencyZone } from '@/types/emergency';

interface NativeMapViewProps {
  zones: EmergencyZone[];
  onZonePress: (zone: EmergencyZone) => void;
  selectedZone: EmergencyZone | null;
  currentLocation: Location.LocationObject | null;
  locationPermission: Location.PermissionStatus | null;
  locationError: string | null;
  handleLocationPress: () => Promise<void>;
  setLocationError: (error: string | null) => void;
  requestLocationPermission: () => Promise<void>;
}

// This file should only be imported on native platforms
export default function NativeMapView({
  zones,
  onZonePress,
  selectedZone,
  currentLocation,
}: NativeMapViewProps) {
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
      <MapView
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
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4E8',
  },
  map: {
    flex: 1,
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
});