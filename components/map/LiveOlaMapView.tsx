/**
 * Live Ola Map View with Location Tracking
 * WebView-based Ola Maps integration for React Native
 */

import { all_env } from '@/app/utils/env';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LiveOlaMapViewProps {
  currentLocation?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  drivers?: Array<{
    id: string;
    lat: number;
    lng: number;
    name: string;
    avatar?: string;
    vehicle?: string;
  }>;
  onDistanceCalculated?: (distance: number) => void;
}

export const LiveOlaMapView: React.FC<LiveOlaMapViewProps> = ({
  currentLocation,
  destination,
  drivers = [],
  onDistanceCalculated,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Update map when location changes
  useEffect(() => {
    if (webViewRef.current && currentLocation) {
      const message = JSON.stringify({
        type: 'UPDATE_LOCATION',
        location: currentLocation,
      });
      webViewRef.current.postMessage(message);
    }
  }, [currentLocation]);

  // Update drivers
  useEffect(() => {
    if (webViewRef.current && drivers) {
      const message = JSON.stringify({
        type: 'UPDATE_DRIVERS',
        drivers,
      });
      webViewRef.current.postMessage(message);
    }
  }, [drivers]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'DISTANCE_CALCULATED' && onDistanceCalculated) {
        onDistanceCalculated(data.distance);
      } else if (data.type === 'MAP_LOADED') {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { height: 100%; width: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; }
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
  </style>
  <script src="https://api.olamaps.io/tiles/v1/sdk.js"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    const OLA_MAP_KEY = '${all_env.OLA_MAP_KEY}';
    let map = null;
    let markers = {};
    let currentLocationMarker = null;
    let destinationMarker = null;
    let routeLine = null;

    // Initialize OLA Maps
    function initMap(lat, lng) {
      if (map) {
        map.remove();
      }

      map = new OlaMaps.Map({
        apiKey: OLA_MAP_KEY,
        container: 'map',
        center: [lng, lat],
        zoom: 14,
        style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json'
      });

      map.on('load', () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MAP_LOADED'
        }));
      });

      return map;
    }

    // Add marker for current location
    function addCurrentLocationMarker(lat, lng) {
      if (currentLocationMarker) {
        currentLocationMarker.remove();
      }

      const el = document.createElement('div');
      el.style.cssText = 'width: 40px; height: 40px;';
      el.innerHTML = \`
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
        ">
          <div style="
            position: absolute;
            width: 20px;
            height: 20px;
            background: #10b981;
            border: 3px solid white;
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
          <div style="
            position: absolute;
            width: 40px;
            height: 40px;
            background: rgba(16, 185, 129, 0.3);
            border-radius: 50%;
            top: 0;
            left: 0;
            animation: pulse 2s infinite;
          "></div>
        </div>
      \`;

      currentLocationMarker = new OlaMaps.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);
    }

    // Add marker for destination
    function addDestinationMarker(lat, lng) {
      if (destinationMarker) {
        destinationMarker.remove();
      }

      const el = document.createElement('div');
      el.style.cssText = 'width: 40px; height: 50px;';
      el.innerHTML = \`
        <div style="
          width: 32px;
          height: 32px;
          background: #ef4444;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-size: 18px;">🏁</span>
        </div>
      \`;

      destinationMarker = new OlaMaps.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .addTo(map);
    }

    // Draw route
    function drawRoute(fromLat, fromLng, toLat, toLng) {
      // Simple straight line for now (you can integrate Ola Directions API)
      const coords = [[fromLng, fromLat], [toLng, toLat]];
      
      if (map.getSource('route')) {
        map.getSource('route').setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coords
          }
        });
      } else {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coords
            }
          }
        });

        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#0099ff',
            'line-width': 5,
            'line-opacity': 0.85
          }
        });
      }

      // Calculate distance
      const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'DISTANCE_CALCULATED',
        distance
      }));
    }

    // Calculate distance (Haversine formula)
    function calculateDistance(lat1, lng1, lat2, lng2) {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    // Add driver markers
    function updateDriverMarkers(drivers) {
      // Clear existing driver markers
      Object.values(markers).forEach(marker => marker.remove());
      markers = {};

      drivers.forEach(driver => {
        const el = document.createElement('div');
        el.style.cssText = 'width: 36px; height: 36px; cursor: pointer;';
        el.innerHTML = \`
          <div style="
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            overflow: hidden;
            background: #fff;
          ">
            <img 
              src="\${driver.avatar || 'https://via.placeholder.com/36'}" 
              style="width: 100%; height: 100%; object-fit: cover;"
            />
          </div>
        \`;

        const marker = new OlaMaps.Marker({ element: el })
          .setLngLat([driver.lng, driver.lat])
          .addTo(map);

        markers[driver.id] = marker;
      });
    }

    // Handle messages from React Native
    window.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'UPDATE_LOCATION') {
        const { lat, lng } = data.location;
        if (!map) {
          initMap(lat, lng);
        } else {
          map.setCenter([lng, lat]);
        }
        addCurrentLocationMarker(lat, lng);
      } else if (data.type === 'UPDATE_DRIVERS') {
        updateDriverMarkers(data.drivers);
      } else if (data.type === 'UPDATE_DESTINATION') {
        const { lat, lng } = data.destination;
        addDestinationMarker(lat, lng);
      }
    });

    // Initialize with default location
    ${currentLocation ? `initMap(${currentLocation.lat}, ${currentLocation.lng});` : ''}
    ${currentLocation ? `addCurrentLocationMarker(${currentLocation.lat}, ${currentLocation.lng});` : ''}
    ${destination && currentLocation ? `
      addDestinationMarker(${destination.lat}, ${destination.lng});
      drawRoute(${currentLocation.lat}, ${currentLocation.lng}, ${destination.lat}, ${destination.lng});
    ` : ''}
  </script>
  <style>
    @keyframes pulse {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.3); }
    }
  </style>
</body>
</html>
`;

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Loading Map...</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error: ', nativeEvent);
        }}
        onShouldStartLoadWithRequest={(request) => {
          // Only allow data URLs and blob URLs (block external navigation)
          const url = request.url;
          if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('about:')) {
            return true;
          }
          // Block any external URLs (like Google search)
          if (url.includes('google.com') || url.includes('http')) {
            console.warn('Blocked external navigation:', url);
            return false;
          }
          return true;
        }}
        originWhitelist={['data:', 'blob:', 'about:']}
        allowsBackForwardNavigationGestures={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 420, // Fixed height for consistent UI
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

export default LiveOlaMapView;

