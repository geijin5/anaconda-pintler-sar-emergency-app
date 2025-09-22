// Native map component - only used on mobile platforms
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This file should only be imported on native platforms
export default function NativeMapView() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Native Map Component</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F4F8',
  },
  text: {
    fontSize: 16,
    color: '#6B7280',
  },
});