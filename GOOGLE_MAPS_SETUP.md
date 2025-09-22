# Google Maps Setup

This app is now configured to use Google Maps on mobile devices (iOS and Android). Here's how to set it up:

## 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API (if using places features)
4. Create credentials (API Key)
5. Restrict the API key to your app's bundle identifier and package name

## 2. Configure the API Key

### For Development
Replace `YOUR_GOOGLE_MAPS_API_KEY` in `expo.json` with your actual API key:

```json
[
  "react-native-maps",
  {
    "googleMapsApiKey": "YOUR_ACTUAL_API_KEY_HERE"
  }
]
```

### For Production
Use environment variables or Expo's secure configuration:

```json
[
  "react-native-maps",
  {
    "googleMapsApiKey": "$GOOGLE_MAPS_API_KEY"
  }
]
```

## 3. Platform Support

- **Mobile (iOS/Android)**: Full Google Maps support with native performance
- **Web**: Falls back to a custom map visualization (Google Maps JavaScript API would require additional setup)

## 4. Features Included

- ✅ Real-time location tracking
- ✅ Emergency zone visualization with circles and markers
- ✅ Custom markers with status-based colors
- ✅ User location display
- ✅ Interactive zone selection
- ✅ Cross-platform compatibility

## 5. Building the App

After setting up the API key, you can build the app:

```bash
# For development
expo start

# For production builds
expo build:android
expo build:ios
```

## Notes

- The app will work without the API key, but maps won't load properly on mobile
- Web version uses a fallback visualization that doesn't require an API key
- Make sure to restrict your API key to prevent unauthorized usage
- Consider setting up billing alerts in Google Cloud Console