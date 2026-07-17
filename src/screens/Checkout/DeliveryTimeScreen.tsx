import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { WebView } from 'react-native-webview';

const mapHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { padding: 0; margin: 0; }
        #map { width: 100%; height: 100vh; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var destCoords = [37.8044, -122.2712];
        var startCoords = [37.7944, -122.2912];
        
        var map = L.map('map').setView(startCoords, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
        
        // Dest marker (Customer)
        L.marker(destCoords).addTo(map)
            .bindPopup('Delivery Address')
            .openPopup();
            
        // Driver marker
        var driverMarker = L.marker(startCoords, {
            icon: L.icon({
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
                iconSize: [35, 35],
                iconAnchor: [17, 35]
            })
        }).addTo(map).bindPopup('Delivery Partner').openPopup();

        // Draw polyline connecting them
        var polyline = L.polyline([startCoords, destCoords], {color: '#FFC72C', weight: 4}).addTo(map);
        map.fitBounds(polyline.getBounds());

        // Listen for parent messages
        window.addEventListener('message', function(event) {
            try {
                var data = JSON.parse(event.data);
                if (data.type === 'UPDATE_LOCATION') {
                    driverMarker.setLatLng([data.lat, data.lng]);
                    map.panTo([data.lat, data.lng]);
                }
            } catch (e) {}
        });
    </script>
</body>
</html>
`;

type DeliveryTimeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DeliveryTime'>;

export default function DeliveryTimeScreen() {
  const navigation = useNavigation<DeliveryTimeNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const webViewRef = React.useRef<any>(null);

  React.useEffect(() => {
    const start = { lat: 37.7944, lng: -122.2912 };
    const dest = { lat: 37.8044, lng: -122.2712 };
    const steps = 30; // 30 seconds path animation
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep <= steps) {
        const lat = start.lat + ((dest.lat - start.lat) * currentStep) / steps;
        const lng = start.lng + ((dest.lng - start.lng) * currentStep) / steps;
        
        webViewRef.current?.postMessage(
          JSON.stringify({ type: 'UPDATE_LOCATION', lat, lng })
        );
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery time</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>778 Locust View Drive Oaklanda, CA</Text>
          </View>

          {/* Map using Leaflet + OpenStreetMap */}
          <View style={styles.mapPlaceholder}>
            <WebView 
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: mapHtml }}
              style={styles.mapWebView}
              scrollEnabled={false}
            />
          </View>

          {/* Delivery Time Estimate */}
          <View style={styles.deliveryTimeRow}>
            <Text style={styles.deliveryLabel}>Delivery Time{'\n'}<Text style={styles.deliverySubLabel}>Estimated Delivery</Text></Text>
            <Text style={styles.deliveryValue}>25 mins</Text>
          </View>

          {/* Tracking Status List */}
          <View style={styles.trackingContainer}>
            <View style={styles.trackingStep}>
              <View style={styles.dotFilled} />
              <Text style={styles.trackingStepText}>Your order has been accepted</Text>
              <Text style={styles.trackingStepTime}>3 mins</Text>
            </View>
            <View style={styles.trackingLine} />

            <View style={styles.trackingStep}>
              <View style={styles.dotFilled} />
              <Text style={styles.trackingStepText}>The restaurant is preparing your order</Text>
              <Text style={styles.trackingStepTime}>5 mins</Text>
            </View>
            <View style={styles.trackingLine} />

            <View style={styles.trackingStep}>
              <View style={styles.dotFilled} />
              <Text style={styles.trackingStepText}>The delivery is on his way</Text>
              <Text style={styles.trackingStepTime}>10 mins</Text>
            </View>
            <View style={styles.trackingLine} />

            <View style={styles.trackingStep}>
              <View style={styles.dotEmpty} />
              <Text style={styles.trackingStepTextMuted}>Your order has been delivered</Text>
              <Text style={styles.trackingStepTimeMuted}>5 mins</Text>
            </View>
          </View>

        </ScrollView>
        
        {/* Bottom Buttons & Tabs */}
        <View style={styles.bottomSection}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={styles.returnHomeBtn} 
              onPress={() => {
                // Clear cart or something here maybe, then return to home
                navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
              }}
            >
              <Text style={styles.returnHomeBtnText}>Return Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.trackOrderBtn}>
              <Text style={styles.trackOrderBtnText}>Track Order</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomTabsContainer}>
            <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}>
              <Text style={styles.tabIcon}>🏠</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn}>
              <Text style={styles.tabIcon}>🍽️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn}>
              <Text style={styles.tabIcon}>🤍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn}>
              <Text style={styles.tabIcon}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn}>
              <Text style={styles.tabIcon}>🎧</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7D055', // Yellow
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary, // Orange back arrow
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rightPlaceholder: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 150, // Space for bottom section
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  addressBox: {
    backgroundColor: colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  addressText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  mapPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: colors.inputBackground,
  },
  mapWebView: {
    width: '100%',
    height: '100%',
  },
  deliveryTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  deliverySubLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: 'normal',
  },
  deliveryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  trackingContainer: {
    paddingLeft: 10,
  },
  trackingStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginRight: 15,
  },
  dotEmpty: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    marginRight: 15,
  },
  trackingStepText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  trackingStepTime: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  trackingStepTextMuted: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  trackingStepTimeMuted: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  trackingLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.primary,
    marginLeft: 4,
    marginVertical: 2,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  returnHomeBtn: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    paddingVertical: 15,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
  },
  returnHomeBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  trackOrderBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 25,
    marginLeft: 10,
    alignItems: 'center',
  },
  trackOrderBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomTabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  tabBtn: {
    padding: 5,
  },
  tabIcon: {
    fontSize: 20,
    color: '#fff',
  }
});
