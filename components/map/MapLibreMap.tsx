import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { WebView } from 'react-native-webview';

interface MapLibreMapProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  onMapClick?: (lng: number, lat: number) => void;
  onRouteCalculated?: (distance: number, duration: number) => void;
  fromLocation?: { lat: number; lng: number; description?: string } | null;
  toLocation?: { lat: number; lng: number; description?: string } | null;
  userLocation?: { lat: number; lng: number } | null;
  style?: any;
}

const MapLibreMap: React.FC<MapLibreMapProps> = ({
  center = [77.2090, 28.6139], // Default to Delhi
  zoom = 12,
  onMapClick,
  onRouteCalculated,
  fromLocation,
  toLocation,
  userLocation,
  style,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [points, setPoints] = useState<Array<[number, number]>>([]);
  const [mapReady, setMapReady] = useState(false);

  // Memoize HTML content to prevent regeneration
  const htmlContent = useMemo(() => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MapLibre Map</title>
  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
  <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://demotiles.maplibre.org/style.json',
      center: [${center[0]}, ${center[1]}],
      zoom: ${zoom}
    });

    let points = [];
    let routeSource = null;
    let routeLayer = null;

    map.on('load', () => {
      console.log('Map loaded successfully');
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
      
      // Center on initial location if provided
      ${center ? `map.setCenter([${center[0]}, ${center[1]}]);` : ''}
    });

    map.on('error', (e) => {
      console.error('Map error:', e);
      window.ReactNativeWebView.postMessage(JSON.stringify({ 
        type: 'mapError', 
        error: e.error ? e.error.message : 'Unknown map error' 
      }));
    });

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      points.push([lng, lat]);
      
      // Add marker
      new maplibregl.Marker({ color: '#ED8902' })
        .setLngLat([lng, lat])
        .addTo(map);
      
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'mapClick',
        lng: lng,
        lat: lat
      }));

      if (points.length === 2) {
        getRoute(points[0], points[1]);
        points = [];
      }
    });

    async function getRoute(start, end) {
      try {
        const res = await fetch(
          \`https://router.project-osrm.org/route/v1/driving/\${start.join(",")};\${end.join(",")}?overview=full&geometries=geojson\`
        );
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0].geometry;
          const distance = data.routes[0].distance / 1000; // km
          const duration = data.routes[0].duration / 60; // minutes

          // Remove existing route if any
          if (routeLayer) {
            map.removeLayer('route-line');
          }
          if (routeSource) {
            map.removeSource('route');
          }

          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: route
            }
          });

          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            paint: {
              'line-color': '#ED8902',
              'line-width': 5
            }
          });

          routeSource = map.getSource('route');
          routeLayer = map.getLayer('route-line');

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'routeCalculated',
            distance: distance,
            duration: duration
          }));
        }
      } catch (error) {
        console.error('Route error:', error);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'routeError',
          error: error.message
        }));
      }
    }

    // Update map center if needed
    window.updateMapCenter = function(lng, lat) {
      map.setCenter([lng, lat]);
    };

    window.updateMapZoom = function(zoomLevel) {
      map.setZoom(zoomLevel);
    };

    // Function to add marker
    window.addMarker = function(lng, lat, color, id) {
      const marker = new maplibregl.Marker({ color: color || '#ED8902' })
        .setLngLat([lng, lat])
        .addTo(map);
      if (id) {
        window.markers = window.markers || {};
        window.markers[id] = marker;
      }
      return marker;
    };

    // Function to remove marker
    window.removeMarker = function(id) {
      if (window.markers && window.markers[id]) {
        window.markers[id].remove();
        delete window.markers[id];
      }
    };

    // Function to clear all markers
    window.clearMarkers = function() {
      if (window.markers) {
        Object.values(window.markers).forEach(marker => marker.remove());
        window.markers = {};
      }
    };

    // Function to draw route between two points
    window.drawRoute = function(startLng, startLat, endLng, endLat) {
      getRoute([startLng, startLat], [endLng, endLat]);
    };

    // Initialize markers object
    window.markers = {};
  </script>
</body>
</html>
  `, [center, zoom]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'mapReady') {
        setMapReady(true);
        setIsLoading(false);
      } else if (data.type === 'mapClick') {
        if (onMapClick) {
          onMapClick(data.lng, data.lat);
        }
      } else if (data.type === 'routeCalculated') {
        if (onRouteCalculated) {
          onRouteCalculated(data.distance, data.duration);
        }
      } else if (data.type === 'routeError') {
        console.error('Route calculation error:', data.error);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  // Update map when locations change
  useEffect(() => {
    if (!mapReady || !webViewRef.current) return;

    // Small delay to ensure map is fully ready
    const timeout = setTimeout(() => {
      const script = `
        (function() {
          try {
            // Clear existing markers
            if (window.clearMarkers) {
              window.clearMarkers();
            }

            // Add user location marker (blue) and center map
            ${userLocation ? `
              window.addMarker(${userLocation.lng}, ${userLocation.lat}, '#4285F4', 'user');
              if (window.updateMapCenter) {
                window.updateMapCenter(${userLocation.lng}, ${userLocation.lat});
              }
            ` : ''}

            // Add from location marker (green)
            ${fromLocation ? `
              window.addMarker(${fromLocation.lng}, ${fromLocation.lat}, '#10B981', 'from');
            ` : ''}

            // Add to location marker (red)
            ${toLocation ? `
              window.addMarker(${toLocation.lng}, ${toLocation.lat}, '#EF4444', 'to');
            ` : ''}

            // Draw route if both from and to are available
            ${fromLocation && toLocation ? `
              if (window.drawRoute) {
                window.drawRoute(${fromLocation.lng}, ${fromLocation.lat}, ${toLocation.lng}, ${toLocation.lat});
              }
            ` : ''}
          } catch (error) {
            console.error('Error updating map:', error);
          }
        })();
        true; // Required for injectJavaScript
      `;

      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(script);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [mapReady, userLocation, fromLocation, toLocation]);

  // Timeout for loading state (fallback)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Map loading timeout - hiding loader');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
        originWhitelist={['*']}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error: ', nativeEvent);
          setIsLoading(false);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView HTTP error: ', nativeEvent);
        }}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ED8902" />
            <Text style={styles.loadingText}>Loading Map...</Text>
          </View>
        )}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ED8902" />
          <Text style={styles.loadingText}>Loading Map...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 12,
    color: '#ED8902',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MapLibreMap;

