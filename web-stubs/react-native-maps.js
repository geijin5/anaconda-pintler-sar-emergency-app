// Web stub for react-native-maps
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: '#E8F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Stub components for web compatibility
export const MapView = ({ children, ...props }) => (
  <View style={styles.mapContainer}>
    <Text>Map not available on web</Text>
    {children}
  </View>
);

export const Marker = ({ children, ...props }) => (
  <View>{children}</View>
);

export const Callout = ({ children, ...props }) => (
  <View>{children}</View>
);

export const Circle = ({ ...props }) => null;
export const Polygon = ({ ...props }) => null;
export const Polyline = ({ ...props }) => null;

export default MapView;