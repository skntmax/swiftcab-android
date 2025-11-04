# 🚀 Quick Start - Ola Maps in Your SwiftCab App

## ✅ What's Been Done

Your SwiftCab Driver App now has **full Ola Maps integration** with:

1. ✅ **API Service** - Complete REST API integration with OAuth authentication
2. ✅ **Custom Hooks** - Easy-to-use React hooks for all map features
3. ✅ **Map Component** - Beautiful, reusable map component
4. ✅ **Search Component** - Place search with autocomplete
5. ✅ **Demo Screen** - Working example showing all features
6. ✅ **Environment Config** - All your Ola Maps credentials configured

## 🎯 See It in Action

### Step 1: Start the App

```bash
npm run start
```

### Step 2: Open the Map Tab

Once the app loads, you'll see a new **"Map"** tab in the bottom navigation. Tap it to see the Ola Maps integration!

### Step 3: Try These Features

1. **Your Location**: The map automatically shows your current location
2. **Search**: Type any place name in the search box
3. **Get Directions**: Select a place and tap "Get Directions"
4. **View Route**: See the route, distance, and estimated time

## 📱 Using Ola Maps in Your Screens

### Example 1: Simple Map Display

```tsx
import OlaMapView from '@/components/map/OlaMapView';

function MyScreen() {
  return (
    <OlaMapView 
      showUserLocation={true}
      followUserLocation={true}
    />
  );
}
```

### Example 2: Show Ride Route

```tsx
import { useDirections } from '@/app/lib/hooks/useOlaMaps';
import OlaMapView from '@/components/map/OlaMapView';

function RideScreen({ pickup, dropoff }) {
  const { getDirections, route, distance, duration } = useDirections();
  
  useEffect(() => {
    getDirections(pickup, dropoff);
  }, [pickup, dropoff]);
  
  return (
    <View style={{ flex: 1 }}>
      <OlaMapView route={route} />
      <Text>Distance: {distance}</Text>
      <Text>Time: {duration}</Text>
    </View>
  );
}
```

### Example 3: Place Search

```tsx
import PlaceSearchInput from '@/components/map/PlaceSearchInput';

function SearchScreen() {
  return (
    <PlaceSearchInput
      placeholder="Where to?"
      onPlaceSelected={(placeId, address) => {
        console.log('Going to:', address);
      }}
    />
  );
}
```

## 🔧 Important Configuration

### Android: Google Maps API Key

Before testing on Android, update your Google Maps API key in `app.json`:

```json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_ACTUAL_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

**How to get a key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Maps SDK for Android"
3. Create credentials → API Key
4. Copy the key to `app.json`

### iOS: No Extra Setup Needed!

iOS uses Apple Maps by default, so no API key is required.

## 📦 What's Included

### Files Created:

```
app/
├── lib/
│   ├── api/
│   │   └── olaMapsApi.ts          # API service with all Ola Maps endpoints
│   └── hooks/
│       └── useOlaMaps.ts          # Custom hooks for easy integration
├── utils/
│   ├── env.ts                     # Updated with Ola Maps config
│   └── helper.ts                  # Utility functions (debounce, distance)
└── (drawer)/(tabs)/
    └── map.tsx                    # Map demo screen route

components/
├── map/
│   ├── OlaMapView.tsx             # Main map component
│   └── PlaceSearchInput.tsx       # Search with autocomplete
└── screens/map/
    └── MapDemoScreen.tsx          # Complete demo example

OLA_MAPS_INTEGRATION.md            # Detailed documentation
QUICK_START_OLA_MAPS.md           # This file!
```

## 🎨 Customization

### Change Map Colors

Edit `components/map/OlaMapView.tsx`:

```tsx
const OLA_MAP_STYLE = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  // Add more styling here
];
```

### Change Primary Color

The map uses your app's primary color (`#ED8902`) from `CONSTANTS.theme.primaryColor`.

## 🚗 Next Steps for Driver App

### 1. Add to Ride Acceptance Screen

```tsx
// Show pickup location on map
<OlaMapView
  markers={[{
    id: 'pickup',
    coordinate: { latitude: ride.pickupLat, longitude: ride.pickupLng },
    title: 'Pickup Location',
    icon: 'map-marker',
  }]}
/>
```

### 2. Add to Active Ride Screen

```tsx
// Show route to destination
const { getDirections, route } = useDirections();

useEffect(() => {
  getDirections(currentLocation, destinationLocation);
}, [currentLocation]);

<OlaMapView route={route} showUserLocation={true} />
```

### 3. Add to Earnings Screen

```tsx
// Show all today's ride locations
<OlaMapView
  markers={todayRides.map(ride => ({
    id: ride.id,
    coordinate: ride.dropoffLocation,
    title: ride.destinationAddress,
  }))}
/>
```

## 💡 Pro Tips

1. **Debouncing**: Place search is already debounced (500ms) to avoid excessive API calls
2. **Token Management**: OAuth tokens are automatically refreshed - you don't need to handle this
3. **Error Handling**: All hooks return `error` state - always check and display errors to users
4. **Loading States**: All hooks return `loading` state - show spinners while fetching data

## 🐛 Troubleshooting

### "Map not showing"
- Check location permissions are granted
- Verify Google Maps API key is set (Android only)
- Check console for error messages

### "API calls failing"
- Verify Ola Maps credentials in `app/utils/env.ts`
- Check internet connection
- Look for rate limit errors in console

### "Search not working"
- Type at least 2 characters
- Wait for results (500ms debounce)
- Check for API errors in console

## 📚 Learn More

- See `OLA_MAPS_INTEGRATION.md` for detailed documentation
- Visit [Ola Maps Docs](https://maps.olakrutrim.com/docs) for API reference
- Check `components/screens/map/MapDemoScreen.tsx` for complete example

## 🎉 You're All Set!

Your SwiftCab Driver App is now powered by Ola Maps! Start building amazing location-based features for your drivers.

**Happy Coding!** 🚀🗺️

