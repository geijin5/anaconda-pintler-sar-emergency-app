# Android Build Setup

This document explains how to build the Android APK for the Anaconda Pintler SAR Emergency App.

## Issues Fixed

1. **React Native Maps Web Compatibility**: Added platform-specific imports and web stubs
2. **Metro Configuration**: Created proper metro.config.js for cross-platform builds
3. **Google Maps Plugin**: Added react-native-maps plugin configuration to app.json
4. **Build Scripts**: Improved prebuild and build scripts for CI/CD

## Build Process

### Local Build

1. Make scripts executable:
   ```bash
   chmod +x scripts/prebuild.sh
   chmod +x scripts/configure-maps.sh
   ```

2. Configure Google Maps:
   ```bash
   ./scripts/configure-maps.sh
   ```

3. Prebuild for Android:
   ```bash
   ./scripts/prebuild.sh android
   ```

4. Build APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

### GitHub Actions Build

The GitHub Actions workflow will automatically:
1. Set up the build environment
2. Install dependencies
3. Configure Google Maps
4. Create metro config for platform compatibility
5. Prebuild Android project
6. Build APK and AAB files
7. Upload artifacts

## Key Changes Made

### 1. Platform-Specific Imports
- Updated `components/MapView.tsx` to use conditional imports
- Native platforms use `NativeMapView` with react-native-maps
- Web platform uses `WebMapView` with fallback UI

### 2. Metro Configuration
- Added custom resolver for react-native-maps on web
- Configured platform-specific extensions
- Added web stubs for native-only modules

### 3. Build Scripts
- `scripts/prebuild.sh`: Handles prebuild process with error handling
- `scripts/configure-maps.sh`: Adds Google Maps plugin to app.json
- Improved error handling and logging

### 4. Web Compatibility
- Created web stubs in `web-stubs/react-native-maps.js`
- Added fallback UI for web platform
- Proper platform detection and conditional rendering

## Troubleshooting

If you encounter build issues:

1. **Clean build**: Remove `android`, `ios`, `.expo` directories
2. **Clear caches**: Remove `node_modules/.cache`, `~/.expo`, `~/.npm/_cacache`
3. **Reinstall dependencies**: Run `bun install`
4. **Check permissions**: Ensure scripts are executable
5. **Verify configuration**: Check that app.json has react-native-maps plugin

## Files Modified

- `components/MapView.tsx` - Added platform-specific imports
- `scripts/prebuild.sh` - Improved prebuild process
- `scripts/configure-maps.sh` - New script for Google Maps configuration
- `.github/workflows/build-android.yml` - Updated CI/CD workflow
- `web-stubs/react-native-maps.js` - Web compatibility stub (existing)
- `components/WebMapView.tsx` - Web fallback component (existing)
- `components/NativeMapView.tsx` - Native map component (existing)

The app should now build successfully on GitHub Actions and generate APK/AAB files for distribution.