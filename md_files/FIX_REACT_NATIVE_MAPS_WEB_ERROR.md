# Fix: react-native-maps Web Error

## 🐛 The Error
```
Metro error: (0 , _index.codegenNativeComponent) is not a function
TypeError: (0 , _index.codegenNativeComponent) is not a function
  at factory (.../react-native-maps/src/specs/NativeComponentGooglePolygon.ts:102:38)
```

## 🔍 Root Cause
`react-native-maps` uses native modules that don't work on web. Even though we have `.web.tsx` fallback files, Metro still tries to parse the native `.tsx` files during the bundling process.

## ✅ Solution Applied

### 1. Created Metro Config (`metro.config.js`)
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure .web.tsx files are properly resolved for web platform
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.tsx', 'web.ts', 'web.jsx', 'web.js'];

// Ensure platform-specific extensions are resolved in correct order
config.resolver.platforms = ['web', 'ios', 'android'];

module.exports = config;
```

### 2. Web Fallback Files Created
- ✅ `components/map/OlaMapView.web.tsx` - Web placeholder for map component
- ✅ `components/screens/map/MapDemoScreen.web.tsx` - Web version of demo screen

### 3. Downgraded react-native-maps
```bash
npm install react-native-maps@1.18.0
```
Version 1.18.0 is more stable with Expo SDK 53.

## 🚀 How to Fix Completely

### Step 1: Clear ALL Caches
```powershell
# Kill all node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove all cache directories
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\metro-* -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\haste-map-* -ErrorAction SilentlyContinue
```

### Step 2: Restart with Clear Cache
```bash
npx expo start --clear
```

### Step 3: Test on Web
```bash
# Press 'w' in the terminal to open web
# OR
npx expo start --web --clear
```

## 📱 Platform-Specific File Resolution

React Native automatically resolves files based on platform:

```
For Web:
  MapDemoScreen → MapDemoScreen.web.tsx (if exists)
                → MapDemoScreen.tsx (fallback)

For iOS/Android:
  MapDemoScreen → MapDemoScreen.tsx
```

## 🎯 Expected Behavior

### On Web:
- Map screens show placeholder with message
- No native map components loaded
- No errors in console

### On Mobile (iOS/Android):
- Full map functionality works
- react-native-maps renders correctly
- Location tracking enabled

## 🔧 Alternative Solutions

### Option 1: Skip Map Screen on Web (Conditional)
In `app/(drawer)/(tabs)/map.tsx`:

```typescript
import { Platform } from 'react-native';
import MapDemoScreen from '@/components/screens/map/MapDemoScreen';
import { View, Text } from 'react-native';

export default function MapScreen() {
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Map features are available on mobile devices</Text>
      </View>
    );
  }
  return <MapDemoScreen />;
}
```

### Option 2: Use expo-router to Skip Route on Web
In `app.json`:

```json
{
  "expo": {
    "web": {
      "excludePaths": ["/(drawer)/(tabs)/map"]
    }
  }
}
```

## ✅ Verification Checklist

After applying the fix:

- [ ] Metro bundler starts without errors
- [ ] Web build completes successfully
- [ ] Web shows map placeholder (not error)
- [ ] Android shows full map (if testing)
- [ ] iOS shows full map (if testing)
- [ ] No console errors on web
- [ ] Socket integration still works

## 🐛 If Error Persists

### Check 1: Verify Web Files Exist
```bash
ls components/map/OlaMapView.web.tsx
ls components/screens/map/MapDemoScreen.web.tsx
```

### Check 2: Verify Metro Config
```bash
cat metro.config.js
# Should contain sourceExts and platforms config
```

### Check 3: Nuclear Option - Complete Reinstall
```powershell
# Stop all processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove everything
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .expo
Remove-Item package-lock.json

# Reinstall
npm install

# Start clean
npx expo start --clear
```

## 📊 Why This Happens

1. **Metro Bundling Process**: Metro reads ALL imports to create dependency graph
2. **Native Modules**: react-native-maps imports native code
3. **Web Build**: Native code doesn't exist in web environment
4. **Solution**: Platform-specific files prevent native code from being included in web bundle

## 🎉 Success Indicators

When fixed, you should see:

```
✅ Web Bundled successfully
✅ No Metro errors
✅ Web app loads at http://localhost:8081
✅ Map placeholder shows on web
```

## 📞 Related Issues

- Warnings about "shadow*" props are normal (react-native-web limitation)
- Warnings about routes missing default exports are normal (utility files)
- Only the `codegenNativeComponent` error needs fixing

---

**Status**: Fix applied with metro.config.js and web fallback files ✅

**Next Step**: Restart dev server with `npx expo start --clear`

