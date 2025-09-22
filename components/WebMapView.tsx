// Web map component - only used on web platform
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MapPin, MapPinned } from 'lucide-react-native';
import * as Location from 'expo-location';
import { EmergencyZone } from '@/types/emergency';

interface WebMapViewProps {
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

export default function WebMapView({
  zones,
  onZonePress,
  selectedZone,
  currentLocation,
}: WebMapViewProps) {
  const { width, height } = useWindowDimensions();
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4E8',
  },
  webMapFallback: {
    flex: 1,
    backgroundColor: '#E8F4F8',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
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
    fontWeight: '600' as const,
    color: '#111827',
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
    fontWeight: '600' as const,
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