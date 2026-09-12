import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, ScrollView, Image, ActivityIndicator, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { WebView } from 'react-native-webview';
import { useUser } from '../../context/UserContext';
import { authFetch } from '../../utils/authFetch';
import { API_URL } from '../../config/api';

type DeliveryTimeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DeliveryTime'>;
type DeliveryTimeRouteProp = RouteProp<RootStackParamList, 'DeliveryTime'>;

// ── Restaurant location — Mumbai default ──────────────────────────────────────
const RESTAURANT_LAT = 19.0760;
const RESTAURANT_LNG = 72.8777;
const CUSTOMER_DEFAULT_LAT = 19.1136;
const CUSTOMER_DEFAULT_LNG = 72.8697;

// Status ordering for the tracker
const STATUS_ORDER = [
  'PendingPayment', 'Placed', 'Accepted', 'Preparing',
  'ReadyForPickup', 'OutForDelivery', 'Delivered',
];

const STATUS_LABELS: Record<string, string> = {
  PendingPayment:  'Order placed & payment pending',
  Placed:          'Order confirmed by restaurant',
  Accepted:        'Restaurant accepted your order',
  Preparing:       'Restaurant is preparing your food',
  ReadyForPickup:  'Food is ready for pickup',
  OutForDelivery:  'Delivery partner is on the way',
  Delivered:       'Order delivered successfully',
};

const getMapHtml = (
  startLat: number, startLng: number,
  destLat: number,  destLng: number
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { padding: 0; margin: 0; background: #f0f0f0; }
    #map { width: 100%; height: 100vh; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var destCoords   = [${destLat}, ${destLng}];
  var startCoords  = [${startLat}, ${startLng}];
  var driverCoords = [${startLat}, ${startLng}];

  var map = L.map('map', { zoomControl: false }).setView(startCoords, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Restaurant marker (orange pin with SVG cutlery)
  var restaurantIcon = L.divIcon({
    html: '<div style="background:#E85D22;width:34px;height:34px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.35)"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2\"/><path d=\"M15 2v14a4 4 0 0 1-4 4H7\"/><path d=\"M7 2v20\"/></svg></div>',
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
  L.marker(startCoords, { icon: restaurantIcon }).addTo(map).bindPopup('Restaurant');

  // Customer destination marker (gold pin with SVG home)
  var homeIcon = L.divIcon({
    html: '<div style="background:#FFC72C;width:34px;height:34px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.35)"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1E1B18\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><polyline points=\"9 22 9 12 15 12 15 22\"/></svg></div>',
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
  L.marker(destCoords, { icon: homeIcon }).addTo(map).bindPopup('Your Location').openPopup();

  // Delivery partner marker (white/orange with SVG scooter)
  var driverIcon = L.divIcon({
    html: '<div style="background:#fff;width:38px;height:38px;border-radius:50%;border:3px solid #E85D22;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.35)"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#E85D22\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"18\" cy=\"18\" r=\"3\"/><path d=\"M6 15h7l3-6h4\"/><path d=\"M16 9l-2-4h-4\"/></svg></div>',
    className: '',
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });
  var driverMarker = L.marker(driverCoords, { icon: driverIcon }).addTo(map);
  driverMarker.bindPopup('Delivery Partner');

  // Dashed route line
  var routeLine = L.polyline([startCoords, destCoords], {
    color: '#E85D22', weight: 3, dashArray: '8,6', opacity: 0.8
  }).addTo(map);
  map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

  // Message listener from React Native
  document.addEventListener('message', function(event) {
    try {
      var data = JSON.parse(event.data);
      if (data.type === 'UPDATE_LOCATION') {
        var newLatLng = [data.lat, data.lng];
        driverMarker.setLatLng(newLatLng);
        // Update route line to show remaining path
        routeLine.setLatLngs([newLatLng, destCoords]);
      } else if (data.type === 'READY') {
        // Acknowledge readiness
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
      }
    } catch(e) {}
  });

  // Signal that map is ready
  setTimeout(function() {
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
  }, 800);
</script>
</body>
</html>
`;

export default function DeliveryTimeScreen() {
  const navigation   = useNavigation<DeliveryTimeNavigationProp>();
  const route        = useRoute<DeliveryTimeRouteProp>();
  const colors       = useThemeColors();
  const styles       = getStyles(colors);
  const webViewRef   = useRef<any>(null);
  const { userProfile } = useUser();

  // Params passed from OrderConfirmed / MyOrders
  const { orderId, destLat: paramDestLat, destLng: paramDestLng, addressLabel: paramAddress } = route.params || {};

  // Saved address fallback
  const savedAddress = userProfile?.savedAddresses?.[0];
  const destLat = paramDestLat || (savedAddress as any)?.latitude  || CUSTOMER_DEFAULT_LAT;
  const destLng = paramDestLng || (savedAddress as any)?.longitude || CUSTOMER_DEFAULT_LNG;
  const addressString = paramAddress
    || (savedAddress ? `${savedAddress.addressLine1}, ${savedAddress.city}` : 'Your delivery address');

  // Order data
  const [orderStatus, setOrderStatus] = useState<string>('Placed');
  const [orderItems,  setOrderItems]  = useState<any[]>([]);
  const [estimatedMin, setEstimatedMin] = useState<number>(30);
  const [mapReady, setMapReady] = useState(false);
  const [fetchedOrder, setFetchedOrder] = useState<any>(null);

  // Animation state
  const animIntervalRef = useRef<any>(null);
  const currentStepRef  = useRef(0);
  const totalSteps      = 60; // 60 seconds to animate across the route

  const startAnimation = useCallback(() => {
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    currentStepRef.current = 0;

    animIntervalRef.current = setInterval(() => {
      if (currentStepRef.current <= totalSteps) {
        const progress = currentStepRef.current / totalSteps;
        const lat = RESTAURANT_LAT + (destLat - RESTAURANT_LAT) * progress;
        const lng = RESTAURANT_LNG + (destLng - RESTAURANT_LNG) * progress;
        webViewRef.current?.postMessage(
          JSON.stringify({ type: 'UPDATE_LOCATION', lat, lng })
        );
        currentStepRef.current++;
      } else {
        clearInterval(animIntervalRef.current);
      }
    }, 1000);
  }, [destLat, destLng]);

  // Fetch order details
  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await authFetch(`${API_URL}/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setFetchedOrder(data);
          setOrderStatus(data.status || 'Placed');
          setOrderItems(data.items || []);
          // Estimate: pending orders ~30 min, out for delivery ~15 min, etc.
          const statusIdx = STATUS_ORDER.indexOf(data.status);
          const remaining = Math.max(1, STATUS_ORDER.length - 1 - statusIdx);
          setEstimatedMin(remaining * 7);
        }
      } catch (e) {
        console.error('Failed to fetch order for tracking:', e);
      }
    };
    fetchOrder();

    // Poll every 20 seconds for live status
    const pollInterval = setInterval(fetchOrder, 20000);
    return () => clearInterval(pollInterval);
  }, [orderId]);

  // Start animation after map is ready
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

  const currentStatusIdx = STATUS_ORDER.indexOf(orderStatus);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#F7D055" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Delivery Address */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>{addressString}</Text>
          </View>

          {/* Map */}
          <View style={styles.mapPlaceholder}>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: getMapHtml(RESTAURANT_LAT, RESTAURANT_LNG, destLat, destLng) }}
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
                <Text style={styles.mapLoaderText}>Loading map...</Text>
              </View>
            )}
          </View>

          {/* Estimated time */}
          <View style={styles.deliveryTimeRow}>
            <View>
              <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
              <Text style={styles.deliverySubLabel}>
                {orderStatus === 'Delivered' ? 'Delivered!' : `~${estimatedMin} mins`}
              </Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: orderStatus === 'Delivered' ? '#16A34A' : colors.primary }]}>
              <Text style={styles.statusChipText}>{orderStatus}</Text>
            </View>
          </View>

          {/* Order Items summary */}
          {orderItems.length > 0 && (
            <View style={styles.itemsSummary}>
              <Text style={styles.sectionTitle}>Your Order</Text>
              {orderItems.map((item: any, idx: number) => (
                <Text key={idx} style={styles.itemRow}>
                  {item.quantity}× {item.menuItem?.name || 'Item'}
                </Text>
              ))}
            </View>
          )}

          {/* Tracking Status Steps */}
          <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 12 }]}>Order Progress</Text>
          <View style={styles.trackingContainer}>
            {STATUS_ORDER.filter(s => s !== 'PendingPayment' && s !== 'Delivered' || s === 'Delivered').map((status, idx) => {
              const isDone    = STATUS_ORDER.indexOf(status) <= currentStatusIdx;
              const isCurrent = status === orderStatus;
              return (
                <View key={status}>
                  <View style={styles.trackingStep}>
                    <View style={[
                      styles.trackingDot,
                      isDone    ? styles.dotFilled : styles.dotEmpty,
                      isCurrent ? styles.dotCurrent : {},
                    ]} />
                    <View style={styles.trackingTextCol}>
                      <Text style={[
                        styles.trackingStepText,
                        !isDone && styles.trackingStepTextMuted,
                        isCurrent && { fontWeight: '800', color: colors.primary },
                      ]}>
                        {STATUS_LABELS[status] || status}
                      </Text>
                      {isCurrent && (
                        <Text style={styles.currentBadge}>● Now</Text>
                      )}
                    </View>
                  </View>
                  {idx < STATUS_ORDER.filter(s => s !== 'PendingPayment').length - 1 && (
                    <View style={[styles.trackingLine, isDone ? styles.trackingLineFilled : styles.trackingLineEmpty]} />
                  )}
                </View>
              );
            })}
          </View>

        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.bottomSection}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.returnHomeBtn}
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
            >
              <Text style={styles.returnHomeBtnText}>Return Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.trackOrderBtn}
              onPress={() => navigation.navigate('MyOrders')}
            >
              <Text style={styles.trackOrderBtnText}>My Orders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7D055' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20,
  },
  backButton: { padding: 10 },
  backIconImg: { width: 20, height: 20, resizeMode: 'contain', tintColor: colors.primary },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  rightPlaceholder: { width: 40 },
  contentContainer: {
    flex: 1, backgroundColor: '#fff',
    borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: 'hidden',
  },
  scrollContent: { paddingHorizontal: 22, paddingTop: 28, paddingBottom: 160 },
  sectionHeaderRow: { marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  addressBox: {
    backgroundColor: colors.inputBackground, borderRadius: 14,
    padding: 14, marginBottom: 18,
  },
  addressText: { color: colors.text, fontSize: 14, fontWeight: '500' },
  mapPlaceholder: {
    width: '100%', height: 210, borderRadius: 18,
    overflow: 'hidden', marginBottom: 18,
    backgroundColor: '#e8f4f8',
  },
  mapWebView: { width: '100%', height: '100%' },
  mapLoader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    gap: 8,
  },
  mapLoaderText: { color: colors.textMuted, fontSize: 13 },
  deliveryTimeRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: colors.inputBackground, borderRadius: 14,
  },
  deliveryLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  deliverySubLabel: { fontSize: 22, fontWeight: '900', color: colors.primary, marginTop: 2 },
  statusChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  statusChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  itemsSummary: {
    backgroundColor: colors.inputBackground, borderRadius: 14,
    padding: 14, marginBottom: 18, gap: 4,
  },
  itemRow: { fontSize: 13, color: colors.text, marginTop: 6 },
  trackingContainer: { paddingLeft: 4 },
  trackingStep: { flexDirection: 'row', alignItems: 'flex-start' },
  trackingDot: {
    width: 14, height: 14, borderRadius: 7, marginRight: 14, marginTop: 2,
  },
  dotFilled: { backgroundColor: colors.primary },
  dotEmpty:  { borderWidth: 2, borderColor: '#E0E0E0', backgroundColor: '#fff' },
  dotCurrent: { backgroundColor: colors.primary, transform: [{ scale: 1.25 }] },
  trackingTextCol: { flex: 1, paddingBottom: 4 },
  trackingStepText: { fontSize: 13, color: colors.text, fontWeight: '500' },
  trackingStepTextMuted: { color: colors.textMuted },
  currentBadge: { fontSize: 11, color: colors.primary, fontWeight: '700', marginTop: 2 },
  trackingLine: { width: 2, height: 22, marginLeft: 6, marginVertical: 2 },
  trackingLineFilled: { backgroundColor: colors.primary },
  trackingLineEmpty:  { backgroundColor: '#E0E0E0' },
  bottomSection: {
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: '#fff', paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  actionButtonsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 22, paddingTop: 14, gap: 12,
  },
  returnHomeBtn: {
    flex: 1, backgroundColor: colors.inputBackground,
    paddingVertical: 14, borderRadius: 25, alignItems: 'center',
  },
  returnHomeBtnText: { color: colors.primary, fontSize: 14, fontWeight: 'bold' },
  trackOrderBtn: {
    flex: 1, backgroundColor: colors.primary,
    paddingVertical: 14, borderRadius: 25, alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  trackOrderBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});
