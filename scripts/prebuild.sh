#!/bin/bash

# Prebuild script for Android/iOS builds
# This script helps handle react-native-maps compatibility issues

echo "Starting prebuild process..."

# Set environment variables for better compatibility
export EXPO_NO_TELEMETRY=1
export EXPO_NO_DOTENV=1
export CI=1
export EXPO_NO_FLIPPER=1
export EXPO_USE_METRO_WORKSPACE_ROOT=1

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf android ios .expo node_modules/.cache

# Install dependencies
echo "Installing dependencies..."
bun install

# Create metro.config.js if it doesn't exist to handle react-native-maps web compatibility
if [ ! -f "metro.config.js" ]; then
    echo "Creating metro.config.js for web compatibility..."
    cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add web-specific resolver for react-native-maps
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-maps': path.resolve(__dirname, 'web-stubs/react-native-maps.js'),
};

// Handle web platform resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
EOF
fi

# Run prebuild with error handling
echo "Running Expo prebuild..."
if [ "$1" = "android" ]; then
    bunx expo prebuild --platform android --clean --no-install
elif [ "$1" = "ios" ]; then
    bunx expo prebuild --platform ios --clean --no-install
else
    bunx expo prebuild --clean --no-install
fi

# Post-prebuild fixes for Android
if [ "$1" = "android" ] || [ -z "$1" ]; then
    if [ -d "android" ]; then
        echo "Applying Android-specific fixes..."
        
        # Fix gradle wrapper permissions
        if [ -f "android/gradlew" ]; then
            chmod +x android/gradlew
        fi
        
        # Update gradle.properties for better build performance
        if [ -f "android/gradle.properties" ]; then
            echo "" >> android/gradle.properties
            echo "# Build performance optimizations" >> android/gradle.properties
            echo "org.gradle.jvmargs=-Xmx3g -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError" >> android/gradle.properties
            echo "org.gradle.parallel=true" >> android/gradle.properties
            echo "org.gradle.configureondemand=true" >> android/gradle.properties
            echo "org.gradle.daemon=false" >> android/gradle.properties
            echo "android.useAndroidX=true" >> android/gradle.properties
            echo "android.enableJetifier=true" >> android/gradle.properties
        fi
    fi
fi

echo "Prebuild completed!"