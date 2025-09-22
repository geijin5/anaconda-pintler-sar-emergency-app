// Web map component - only used on web platform
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WebMapView() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Web Map Component</Text>
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