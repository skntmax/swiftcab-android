# Ola Maps Integration - Complete Guide

## Overview

This React Native Expo app now includes full integration with [Ola Maps](https://maps.olakrutrim.com/docs), providing:
- Real-time location tracking
- Turn-by-turn directions
- Place search & autocomplete
- Geocoding & reverse geocoding
- Distance matrix calculations
- Route optimization
- Nearby places search

## 📚 Files Created

### 1. **API Service** (`app/lib/api/olaMapsApi.ts`)
- Complete Ola Maps REST API integration
- OAuth 2.0 authentication handling
- Methods for all major API endpoints:
  - `geocode()` - Convert address to coordinates
  - `reverseGeocode()` - Convert coordinates to address
  - `getDirections()` - Get route between two points
  - `autocomplete()` - Place search autocomplete
  - `getPlaceDetails()` - Detailed place information
  - `nearbySearch()` - Find places nearby
  - `getDistanceMatrix()` - Calculate distances between multiple points

### 2. **Custom Hooks** (`app/lib/hooks/useOlaMaps.ts`)
- `useCurrentLocation()` - Get user's current location
- `useDirections()` - Get and display routes
- `usePlaceSearch()` - Search for places with autocomplete
- `useGeocoding()` - Convert between addresses and coordinates
- `useNearbySearch()` - Find nearby places

### 3. **Map Component** (`components/map/OlaMapView.tsx`)
- Reusable map component using react-native-maps
- Support for markers, polylines, and custom styling
- Auto-fit to markers and routes
- User location tracking

### 4. **Search Component** (`components/map/PlaceSearchInput.tsx`)
- Autocomplete place search input
- Debounced API calls
- Beautiful dropdown with results

### 5. **Demo Screen** (`components/screens/map/MapDemoScreen.tsx`)
- Complete example showing all features
- Search places, get directions, view routes
- Display distance and duration

### 6. **Configuration** (`app/utils/env.ts`)
- Ola Maps API credentials
- Environment-specific configuration

## 🚀 Setup & Configuration

### 1. Environment Variables

Your Ola Maps credentials are already configured in `app/utils/env.ts`:

```typescript
OLA_API_URL: 'https://api.olamaps.io'
OLA_MAP_KEY: 'TmEEWGRULBa01UTDqFDzn7plIxDHJqn2QaMWzBoR'
OLA_CLIENT_ID: '9716cd3b-32e7-426f-95f6-d9a760c454a2'
OLA_CLIENT_SECRET: 'qGKFdaxVR1UJ1TCCjdpddZ1JhudSoQPq'
```

### 2. Google Maps API Key (for Android)

Update `app.json` with your Google Maps API key:

```json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

### 3. Install Dependencies

Already installed:
```bash
npm install react-native-maps axios
```

## 💻 Usage Examples

### Basic Map Display

```tsx
import OlaMapView from '@/components/map/OlaMapView';

<OlaMapView
  initialRegion={{
    latitude: 19.0760,
    longitude: 72.8777,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }}
  showUserLocation={true}
/>
```

### Get User's Current Location

```tsx
import { useCurrentLocation } from '@/app/lib/hooks/useOlaMaps';

function MyComponent() {
  const { location, loading, error } = useCurrentLocation();
  
  if (loading) return <Text>Getting location...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  
  return <Text>You are at: {location?.latitude}, {location?.longitude}</Text>;
}
```

### Search Places with Autocomplete

```tsx
import PlaceSearchInput from '@/components/map/PlaceSearchInput';

<PlaceSearchInput
  placeholder="Search destination..."
  onPlaceSelected={(placeId, description) => {
    console.log('Selected:', placeId, description);
  }}
/>
```

### Get Directions Between Two Points

```tsx
import { useDirections } from '@/app/lib/hooks/useOlaMaps';

function DirectionsExample() {
  const { getDirections, route, distance, duration, loading } = useDirections();
  
  const origin = { latitude: 19.0760, longitude: 72.8777 };
  const destination = { latitude: 19.1136, longitude: 72.9083 };
  
  useEffect(() => {
    getDirections(origin, destination);
  }, []);
  
  return (
    <View>
      <Text>Distance: {distance}</Text>
      <Text>Duration: {duration}</Text>
      <OlaMapView route={route} />
    </View>
  );
}
```

### Reverse Geocode (Get Address from Coordinates)

```tsx
import { useGeocoding } from '@/app/lib/hooks/useOlaMaps';

function AddressLookup() {
  const { reverseGeocode, loading } = useGeocoding();
  const [address, setAddress] = useState('');
  
  const getAddress = async () => {
    const result = await reverseGeocode(19.0760, 72.8777);
    setAddress(result || 'Address not found');
  };
  
  return <Text>{address}</Text>;
}
```

### Find Nearby Places

```tsx
import { useNearbySearch } from '@/app/lib/hooks/useOlaMaps';

function NearbyPlaces() {
  const { search, results, loading } = useNearbySearch();
  const location = { latitude: 19.0760, longitude: 72.8777 };
  
  useEffect(() => {
    search(location, 1000, 'restaurant'); // 1km radius
  }, []);
  
  return (
    <FlatList
      data={results}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
```

## 🎨 Complete Driver App Integration

### Example: Real-time Ride Navigation

```tsx
import React, { useEffect, useState } from 'react';
import OlaMapView from '@/components/map/OlaMapView';
import { useCurrentLocation, useDirections } from '@/app/lib/hooks/useOlaMaps';

function RideNavigationScreen({ pickupLocation, dropLocation }) {
  const { location: currentLocation } = useCurrentLocation();
  const { getDirections, route, distance, duration } = useDirections();
  
  const [markers, setMarkers] = useState([]);
  
  useEffect(() => {
    if (currentLocation) {
      // Get directions from current location to pickup
      getDirections(currentLocation, pickupLocation);
      
      // Set markers for pickup and drop
      setMarkers([
        {
          id: 'pickup',
          coordinate: pickupLocation,
          title: 'Pickup Location',
          icon: 'map-marker',
          color: '#4CAF50',
        },
        {
          id: 'drop',
          coordinate: dropLocation,
          title: 'Drop Location',
          icon: 'map-marker-check',
          color: '#FF5252',
        },
      ]);
    }
  }, [currentLocation, pickupLocation, dropLocation]);
  
  return (
    <View style={{ flex: 1 }}>
      <OlaMapView
        markers={markers}
        route={route}
        showUserLocation={true}
        followUserLocation={true}
      />
      
      <View style={styles.infoCard}>
        <Text>Distance: {distance}</Text>
        <Text>ETA: {duration}</Text>
      </View>
    </View>
  );
}
```

## 🔧 API Reference

### OlaMapsAPI Methods

| Method | Description | Reference |
|--------|-------------|-----------|
| `geocode(params)` | Convert address to coordinates | [Docs](https://maps.olakrutrim.com/docs/geocoding-api) |
| `reverseGeocode(params)` | Convert coordinates to address | [Docs](https://maps.olakrutrim.com/docs/reverse-geocoding-api) |
| `getDirections(params)` | Get route between points | [Docs](https://maps.olakrutrim.com/docs/directions-api) |
| `getDistanceMatrix(params)` | Calculate distances between multiple points | [Docs](https://maps.olakrutrim.com/docs/distance-matrix-api) |
| `autocomplete(params)` | Place search autocomplete | [Docs](https://maps.olakrutrim.com/docs/autocomplete-api) |
| `getPlaceDetails(placeId)` | Get detailed place information | [Docs](https://maps.olakrutrim.com/docs/place-details-api) |
| `nearbySearch(params)` | Find places nearby | [Docs](https://maps.olakrutrim.com/docs/nearby-search-api) |

## 📱 Testing

### 1. View Map Demo Screen

The MapDemoScreen is ready to use. Add it to your navigation:

```tsx
// In your drawer navigation
<Drawer.Screen 
  name="map-demo" 
  component={MapDemoScreen}
  options={{ title: 'Map Demo' }}
/>
```

### 2. Run the App

```bash
npm run start
# Press 'a' for Android or 'i' for iOS
```

### 3. Test Features
- ✅ Current location detection
- ✅ Place search with autocomplete
- ✅ Route calculation and display
- ✅ Distance and duration display
- ✅ Marker placement
- ✅ Map gestures (zoom, pan, rotate)

## 🎯 For Your Driver App

### Suggested Features to Implement

1. **Live Ride Tracking**
   - Track driver's real-time location
   - Show route to pickup/drop points
   - Update ETA dynamically

2. **Optimized Route Planning**
   - Use Route Optimizer API for multiple stops
   - Avoid tolls/highways based on preferences

3. **Nearby Rides**
   - Show nearby ride requests on map
   - Calculate distance to each request

4. **Geofencing**
   - Alert when driver enters pickup zone
   - Notify when near destination

5. **Address Validation**
   - Validate pickup/drop addresses
   - Suggest corrections for invalid addresses

## 🐛 Troubleshooting

### Map Not Showing on Android
- Ensure Google Maps API key is set in `app.json`
- Enable Maps SDK for Android in Google Cloud Console

### Location Permission Denied
- Check `app.json` has location permissions
- Request permissions at runtime using `expo-location`

### API Rate Limits
Ola Maps has fair usage limits. Contact support@olakrutrim.com for upgrades.

### OAuth Token Issues
- Tokens are cached and auto-refreshed
- Check client ID and secret are correct
- Ensure API URL is `https://api.olamaps.io`

## 📚 Additional Resources

- [Ola Maps Official Documentation](https://maps.olakrutrim.com/docs)
- [Ola Maps API Reference](https://maps.olakrutrim.com/docs)
- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)

## 🎉 Next Steps

1. **Add Map Demo to Drawer**: Update DrawerNavigation to include MapDemoScreen
2. **Test All Features**: Try search, directions, and markers
3. **Customize Styling**: Match map colors to your app theme
4. **Add to Driver Dashboard**: Integrate map into your ride screens
5. **Implement Live Tracking**: Use Location.watchPositionAsync for real-time updates

---

**Integration Complete!** 🚀 Your SwiftCab Driver App now has full Ola Maps support!

