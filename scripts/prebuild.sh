#!/bin/bash

# Prebuild script for Android/iOS builds
# This script helps handle react-native-maps compatibility issues

set -e  # Exit on any error

echo "Starting prebuild process..."

# Set environment variables for better compatibility
export EXPO_NO_TELEMETRY=1
export EXPO_NO_DOTENV=1
export CI=1
export EXPO_NO_FLIPPER=1
export EXPO_USE_METRO_WORKSPACE_ROOT=1
export NODE_ENV=production

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf android ios .expo node_modules/.cache

# Install dependencies
echo "Installing dependencies..."
bun install --frozen-lockfile

# Create metro.config.js if it doesn't exist to handle react-native-maps web compatibility
if [ ! -f "metro.config.js" ]; then
    echo "Creating metro.config.js for web compatibility..."
    cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure platform-specific resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Handle platform-specific extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

// Configure resolver for better web compatibility
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add custom resolver to handle react-native-maps on web
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle react-native-maps on web platform
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: path.resolve(__dirname, 'web-stubs/react-native-maps.js'),
      type: 'sourceFile',
    };
  }
  
  // Use default resolver for other cases
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
EOF
fi

# Run prebuild with error handling
echo "Running Expo prebuild..."
if [ "$1" = "android" ]; then
    echo "Prebuilding for Android..."
    bunx expo prebuild --platform android --clean --no-install
    
    # Verify android directory was created
    if [ ! -d "android" ]; then
        echo "ERROR: Android directory was not created by prebuild"
        echo "Trying prebuild without --no-install flag..."
        bunx expo prebuild --platform android --clean
        
        if [ ! -d "android" ]; then
            echo "ERROR: Still no android directory. Prebuild failed."
            exit 1
        fi
    fi
elif [ "$1" = "ios" ]; then
    echo "Prebuilding for iOS..."
    bunx expo prebuild --platform ios --clean --no-install
else
    echo "Prebuilding for all platforms..."
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