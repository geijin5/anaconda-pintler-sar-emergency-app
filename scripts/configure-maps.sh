#!/bin/bash

# Script to configure app.json for Google Maps
# This script adds the react-native-maps plugin configuration

echo "Configuring app.json for Google Maps..."

# Check if app.json exists
if [ ! -f "app.json" ]; then
    echo "Error: app.json not found"
    exit 1
fi

# Create a backup
cp app.json app.json.backup

# Use node to modify the JSON file
node -e "
const fs = require('fs');
const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));

// Add react-native-maps plugin if not already present
const plugins = appConfig.expo.plugins || [];
const hasMapPlugin = plugins.some(plugin => 
  Array.isArray(plugin) && plugin[0] === 'react-native-maps'
);

if (!hasMapPlugin) {
  plugins.push([
    'react-native-maps',
    {
      'googleMapsApiKey': 'AIzaSyDummy_Key_For_Build_Only'
    }
  ]);
  appConfig.expo.plugins = plugins;
  
  fs.writeFileSync('app.json', JSON.stringify(appConfig, null, 2));
  console.log('Added react-native-maps plugin to app.json');
} else {
  console.log('react-native-maps plugin already configured');
}
"

echo "app.json configuration completed!"