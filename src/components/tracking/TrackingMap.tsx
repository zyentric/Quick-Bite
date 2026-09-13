import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useThemeColors, ThemeColors } from '../../theme/colors';

interface TrackingMapProps {
  startLat: number;
  startLng: number;
  destLat: number;
  destLng: number;
}

const getMapHtml = (
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { padding: 0; margin: 0; background: #f8fafc; overflow: hidden; font-family: -apple-system, sans-serif; }
    #map { width: 100%; height: 100vh; }
    .pulse-ring {
      position: absolute;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: rgba(232, 93, 34, 0.25);
      animation: pulse 1.8s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
      top: -6px;
      left: -6px;
      z-index: -1;
    }
    @keyframes pulse {
      0% { transform: scale(0.6); opacity: 0.8; }
      100% { transform: scale(1.6); opacity: 0; }
    }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var destCoords   = [${destLat}, ${destLng}];
  var startCoords  = [${startLat}, ${startLng}];
  var driverCoords = [${startLat}, ${startLng}];

  var map = L.map('map', { zoomControl: false, attributionControl: false }).setView(startCoords, 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  // Restaurant marker
  var restaurantIcon = L.divIcon({
    html: '<div style="position:relative;background:#E85D22;width:36px;height:36px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(232,93,34,0.45)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v14a4 4 0 0 1-4 4H7"/><path d="M7 2v20"/></svg></div>',
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
  L.marker(startCoords, { icon: restaurantIcon }).addTo(map).bindPopup('<b>Kitchen / Restaurant</b>');

  // Customer Destination marker
  var homeIcon = L.divIcon({
    html: '<div style="background:#F59E0B;width:36px;height:36px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(245,158,11,0.45)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>',
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
  L.marker(destCoords, { icon: homeIcon }).addTo(map).bindPopup('<b>Your Delivery Address</b>');

  // Delivery Partner Marker
  var driverIcon = L.divIcon({
    html: '<div style="position:relative;background:#FFFFFF;width:40px;height:40px;border-radius:50%;border:3px solid #E85D22;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.3)"><div class="pulse-ring"></div><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E85D22" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M5.5 17.5l4-8h4l2 4h3"/><path d="M14 9l-2-4h-3"/></svg></div>',
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
  var driverMarker = L.marker(driverCoords, { icon: driverIcon, zIndexOffset: 1000 }).addTo(map);

  var routeLine = L.polyline([startCoords, destCoords], {
    color: '#E85D22',
    weight: 4,
    dashArray: '8, 8',
    opacity: 0.85
  }).addTo(map);

  map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

  window.recenterMap = function() {
    map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
  };

  document.addEventListener('message', function(event) {
    try {
      var data = JSON.parse(event.data);
      if (data.type === 'UPDATE_LOCATION') {
        var newLatLng = [data.lat, data.lng];
        driverMarker.setLatLng(newLatLng);
        routeLine.setLatLngs([newLatLng, destCoords]);
      } else if (data.type === 'RECENTER') {
        window.recenterMap();
      } else if (data.type === 'READY') {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
      }
    } catch(e) {}
  });

  setTimeout(function() {
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
  }, 600);
</script>
</body>
</html>
`;

export default function TrackingMap({
  startLat,
  startLng,
  destLat,
  destLng,
}: TrackingMapProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const webViewRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // Simulation of driver movement along route
  const animIntervalRef = useRef<any>(null);
  const currentStepRef = useRef(0);
  const totalSteps = 45;

  const startAnimation = useCallback(() => {
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    currentStepRef.current = 0;

    animIntervalRef.current = setInterval(() => {
      if (currentStepRef.current <= totalSteps) {
        const progress = currentStepRef.current / totalSteps;
        const lat = startLat + (destLat - startLat) * progress;
        const lng = startLng + (destLng - startLng) * progress;
        webViewRef.current?.postMessage(
          JSON.stringify({ type: 'UPDATE_LOCATION', lat, lng })
        );
        currentStepRef.current++;
      } else {
        clearInterval(animIntervalRef.current);
      }
    }, 1200);
  }, [startLat, startLng, destLat, destLng]);

  useEffect(() => {
    if (mapReady) {
      startAnimation();
    }
    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    };
  }, [mapReady, startAnimation]);

  const onWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setMapReady(true);
      }
    } catch (e) {}
  };

  const handleRecenter = () => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'RECENTER' }));
  };

  return (
    <View style={styles.mapContainer}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{
          html: getMapHtml(startLat, startLng, destLat, destLng),
        }}
        style={styles.mapWebView}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={onWebViewMessage}
        onError={() => console.warn('WebView error')}
      />
      {!mapReady && (
        <View style={styles.mapLoader}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.mapLoaderText}>Connecting GPS Map...</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.recenterFab}
        onPress={handleRecenter}
        activeOpacity={0.85}
      >
        <Text style={styles.recenterFabText}>🎯 Recenter</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    mapContainer: {
      width: '100%',
      height: 230,
      borderRadius: 22,
      overflow: 'hidden',
      marginBottom: 16,
      backgroundColor: '#E0F2FE',
      position: 'relative',
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    mapWebView: {
      width: '100%',
      height: '100%',
    },
    mapLoader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.9)',
      gap: 8,
    },
    mapLoaderText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
    },
    recenterFab: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    recenterFabText: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.text,
    },
  });
