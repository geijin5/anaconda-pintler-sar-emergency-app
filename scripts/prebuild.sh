#!/bin/bash

# Prebuild script for Android/iOS builds
# This script helps handle react-native-maps compatibility issues

echo "Starting prebuild process..."

# Set environment variables for better compatibility
export EXPO_NO_TELEMETRY=1
export EXPO_NO_DOTENV=1
export CI=1
export EXPO_NO_FLIPPER=1

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf android ios .expo node_modules/.cache

# Install dependencies
echo "Installing dependencies..."
bun install

# Run prebuild with error handling
echo "Running Expo prebuild..."
if [ "$1" = "android" ]; then
    bunx expo prebuild --platform android --clean --no-install
elif [ "$1" = "ios" ]; then
    bunx expo prebuild --platform ios --clean --no-install
else
    bunx expo prebuild --clean --no-install
fi

echo "Prebuild completed!"