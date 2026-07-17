import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { useUser } from '../../../context/UserContext';
import { API_URL } from '../../../config/api';
import CustomLoader from '../../../components/CustomLoader';
import CustomAlert from '../../../components/CustomAlert';

type AddNewAddressNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddNewAddress'>;

const parseAddressFromNominatim = (data: any) => {
  const addr = data.address || {};
  const displayName = data.display_name || '';
  
  const cityVal = addr.city || addr.town || addr.village || addr.county || '';
  const zipCodeVal = addr.postcode || '';
  const stateVal = addr.state || '';
  const countryVal = addr.country || '';
  
  const parts = displayName.split(',').map((p: string) => p.trim());
  const filterOut = new Set([
    cityVal.toLowerCase(),
    stateVal.toLowerCase(),
    countryVal.toLowerCase(),
    zipCodeVal.toLowerCase(),
    'india'
  ]);
  
  const streetParts = parts.filter((part: string) => {
    const lp = part.toLowerCase();
    return !filterOut.has(lp) && !/^\d{5,6}$/.test(lp);
  });
  
  const addressLine1Val = streetParts.slice(0, Math.min(3, streetParts.length)).join(', ') || addr.road || addr.suburb || 'Detected Location';
  const addressLine2Val = streetParts.slice(3).join(', ') || [stateVal, countryVal].filter(Boolean).join(', ') || '';

  return {
    addressLine1: addressLine1Val,
    addressLine2: addressLine2Val,
    city: cityVal,
    zipCode: zipCodeVal
  };
};

const parseAddressFromBigDataCloud = (data: any) => {
  const cityVal = data.city || data.locality || '';
  const stateVal = data.principalSubdivision || '';
  const countryVal = data.countryName || '';
  
  const adminList = data.localityInfo?.administrative || [];
  const parts = adminList.map((item: any) => item.name);
  
  const addressLine1Val = [data.locality, ...parts.slice(0, Math.max(0, parts.length - 2))].filter(Boolean).join(', ') || 'Detected Location';
  const addressLine2Val = [stateVal, countryVal].filter(Boolean).join(', ');
  
  return {
    addressLine1: addressLine1Val,
    addressLine2: addressLine2Val,
    city: cityVal,
    zipCode: ''
  };
};

const getMapHtml = (lat: number, lng: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="initial-scale=1.0, user-scalable=no, width=device-width" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #f0f0f0; }
    .leaflet-control-attribution { display: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    var marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

    function emitCoords(lat, lng) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
    }

    marker.on('dragend', function(event) {
      var position = marker.getLatLng();
      emitCoords(position.lat, position.lng);
    });

    map.on('click', function(event) {
      var coords = event.latlng;
      marker.setLatLng(coords);
      emitCoords(coords.lat, coords.lng);
    });
  </script>
</body>
</html>
`;

export default function AddNewAddressScreen() {
  const navigation = useNavigation<AddNewAddressNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { userId } = useUser();

  const [label, setLabel] = useState<'Home' | 'Work' | 'Office' | 'Other'>('Home');
  const [customLabel, setCustomLabel] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const requestAndroidLocationPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to set the delivery address.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const reverseGeocodeCoords = async (lat: number, lng: number) => {
    let geocodeSuccess = false;
    setLatitude(lat);
    setLongitude(lng);

    try {
      // 1. Try Nominatim reverse geocoding
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: {
          'User-Agent': 'QuickBiteApp/1.0'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const parsed = parseAddressFromNominatim(data);
        
        setAddressLine1(parsed.addressLine1);
        setAddressLine2(parsed.addressLine2);
        setCity(parsed.city);
        setZipCode(parsed.zipCode);
        geocodeSuccess = true;
        console.log('Reverse geocoding using Nominatim succeeded');
      }
    } catch (e: any) {
      console.log('Nominatim reverse geocoding failed, trying BigDataCloud:', e);
    }

    if (!geocodeSuccess) {
      try {
        // 2. Try BigDataCloud reverse geocoding client as fallback
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        if (res.ok) {
          const data = await res.json();
          const parsed = parseAddressFromBigDataCloud(data);
          
          setAddressLine1(parsed.addressLine1);
          setAddressLine2(parsed.addressLine2);
          setCity(parsed.city);
          setZipCode(parsed.zipCode);
          geocodeSuccess = true;
          console.log('Reverse geocoding using BigDataCloud succeeded');
        }
      } catch (e: any) {
        console.log('BigDataCloud reverse geocoding failed:', e);
      }
    }

    return geocodeSuccess;
  };

  const fetchCurrentLocation = async () => {
    setLoading(true);
    
    const hasPermission = await requestAndroidLocationPermission();
    if (!hasPermission) {
      setLoading(false);
      showAlert('Permission Denied', 'Location permission is required to fetch current location.');
      return;
    }

    const tryGeolocation = (highAccuracy: boolean) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          console.log('GPS coordinates fetched:', lat, lng);
          const success = await reverseGeocodeCoords(lat, lng);
          if (!success) {
            console.log('Both reverse geocoders failed, trying IP fallback');
            await fetchIpLocationFallback();
          }
          setLoading(false);
        },
        (error) => {
          console.log(`Geolocation error (highAccuracy=${highAccuracy}):`, error);
          if (highAccuracy) {
            // If high accuracy failed, try low accuracy (network/passive provider)
            tryGeolocation(false);
          } else {
            // Both failed. Show friendly alert if GPS is off.
            if (error.code === 2 || error.message?.includes('provider')) {
              showAlert(
                'Location Service Off',
                'Your device GPS/Location service is turned off. Please turn it on in your phone settings for accurate location.'
              );
            }
            // Fallback to IP address geolocation if GPS is unavailable
            fetchIpLocationFallback().finally(() => setLoading(false));
          }
        },
        { enableHighAccuracy: highAccuracy, timeout: 15000, maximumAge: 0 }
      );
    };

    // Start with high accuracy (GPS) first, as emulators typically support GPS but lack wifi/network provider emulation
    tryGeolocation(true);
  };

  const fetchIpLocationFallback = async () => {
    let success = false;
    const userAgentHeader = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36'
    };

    try {
      const res = await fetch('https://freeipapi.com/api/json', { headers: userAgentHeader });
      if (res.ok) {
        const data = await res.json();
        setAddressLine1('Detected Location (IP)');
        setCity(data.cityName || '');
        setZipCode(data.zipCode || '');
        setAddressLine2(data.regionName || '');
        if (data.latitude && data.longitude) {
          setLatitude(data.latitude);
          setLongitude(data.longitude);
        }
        success = true;
      }
    } catch (e) {
      console.log('freeipapi failed, trying ipapi.co...');
    }

    if (!success) {
      try {
        const res = await fetch('https://ipapi.co/json/', { headers: userAgentHeader });
        if (res.ok) {
          const data = await res.json();
          setAddressLine1(data.org ? `Near ${data.org}` : 'Detected Location (IP)');
          setCity(data.city || '');
          setZipCode(data.postal || '');
          setAddressLine2(data.region || '');
          if (data.latitude && data.longitude) {
            setLatitude(data.latitude);
            setLongitude(data.longitude);
          }
          success = true;
        }
      } catch (e) {
        console.log('ipapi.co failed, trying ipinfo.io...');
      }
    }

    if (!success) {
      try {
        const res = await fetch('https://ipinfo.io/json', { headers: userAgentHeader });
        if (res.ok) {
          const data = await res.json();
          setAddressLine1(data.org ? `Near ${data.org}` : 'Detected Location (IP)');
          setCity(data.city || '');
          setZipCode(data.postal || '');
          setAddressLine2(data.region || '');
          if (data.loc) {
            const [latStr, lngStr] = data.loc.split(',');
            const latNum = parseFloat(latStr);
            const lngNum = parseFloat(lngStr);
            if (!isNaN(latNum) && !isNaN(lngNum)) {
              setLatitude(latNum);
              setLongitude(lngNum);
            }
          }
          success = true;
        }
      } catch (e) {
        console.log('ipinfo.io failed too');
      }
    }

    if (!success) {
      showAlert('Location Error', 'Could not auto-fetch location. Please enter it manually.');
    }
  };

  const handleApply = async () => {
    if (!userId) return;
    const finalLabel = label === 'Other' ? customLabel : label;
    if (!finalLabel.trim()) {
      showAlert('Required', 'Please select or enter an address label');
      return;
    }
    if (!addressLine1.trim() || !city.trim() || !zipCode.trim()) {
      showAlert('Required', 'Street Address, City, and Zip Code are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId,
        },
        body: JSON.stringify({
          label: finalLabel,
          addressLine1,
          addressLine2,
          city,
          zipCode,
          latitude,
          longitude
        })
      });

      if (res.ok) {
        navigation.goBack();
      } else {
        const errData = await res.json();
        showAlert('Error', errData.message || 'Failed to save address');
      }
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomLoader visible={loading} message="Processing..." />
      <CustomAlert 
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Address</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.iconContainer}>
            <Text style={styles.largeIcon}>
              {label === 'Home' ? '🏠' : label === 'Work' || label === 'Office' ? '💼' : '📍'}
            </Text>
          </View>

          {/* Location Fetching Button */}
          <TouchableOpacity style={styles.locationFetchBtn} onPress={fetchCurrentLocation}>
            <Text style={styles.locationFetchText}>📍 Fetch Current Location</Text>
          </TouchableOpacity>

          {/* Interactive Leaflet Map for Precise Pin Adjustment */}
          {latitude !== null && longitude !== null && (
            <View style={styles.mapContainer}>
              <WebView
                originWhitelist={['*']}
                source={{ html: getMapHtml(latitude, longitude) }}
                style={{ flex: 1 }}
                onMessage={async (event) => {
                  try {
                    const coords = JSON.parse(event.nativeEvent.data);
                    if (coords.latitude && coords.longitude) {
                      console.log('Marker dragged/clicked on map:', coords);
                      // Reverse geocode the new dragged coordinates
                      setLoading(true);
                      await reverseGeocodeCoords(coords.latitude, coords.longitude);
                      setLoading(false);
                    }
                  } catch (err) {
                    console.log('Failed to parse map postMessage data:', err);
                  }
                }}
              />
              <Text style={styles.mapHintText}>📍 Drag the red pin or tap the map to adjust your location</Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Label</Text>
            <View style={styles.labelSelectorRow}>
              {(['Home', 'Work', 'Office', 'Other'] as const).map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[
                    styles.labelOptionBtn,
                    label === l && styles.labelOptionBtnActive
                  ]}
                  onPress={() => setLabel(l)}
                >
                  <Text style={[styles.labelOptionText, label === l && styles.labelOptionTextActive]}>
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {label === 'Other' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Custom Label Name</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="e.g., Parent's House"
                placeholderTextColor={colors.textMuted}
                value={customLabel}
                onChangeText={setCustomLabel}
              />
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Street / Building Address (Line 1)</Text>
            <TextInput 
              style={styles.textInput}
              placeholder="e.g., House No. 124, Sector 21-A"
              placeholderTextColor={colors.textMuted}
              value={addressLine1}
              onChangeText={setAddressLine1}
            />
            <Text style={styles.helperText}>Include your house/flat number, block, and street name.</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Apartment, Landmark, Suite (Line 2)</Text>
            <TextInput 
              style={styles.textInput}
              placeholder="e.g., Near Royal Cafe, Opp. Govt School"
              placeholderTextColor={colors.textMuted}
              value={addressLine2}
              onChangeText={setAddressLine2}
            />
            <Text style={styles.helperText}>Add a nearby landmark, shop, or entry gate to guide the delivery rider.</Text>
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.formGroup, { flex: 1.2, marginRight: 10 }]}>
              <Text style={styles.label}>City</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="e.g., Oakland"
                placeholderTextColor={colors.textMuted}
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={[styles.formGroup, { flex: 0.8 }]}>
              <Text style={styles.label}>Zip Code</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="e.g., 94612"
                placeholderTextColor={colors.textMuted}
                value={zipCode}
                onChangeText={setZipCode}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Save Address</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
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
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    paddingTop: 40,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 80, 
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  largeIcon: {
    fontSize: 80,
    color: colors.primary,
  },
  formGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: colors.inputBackground, // Light yellow
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 14,
    color: colors.inputText,
    fontWeight: '500',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 50,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationFetchBtn: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1.5,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 25,
  },
  locationFetchText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 14,
  },
  labelSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  labelOptionBtn: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  labelOptionBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  labelOptionText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  labelOptionTextActive: {
    color: '#fff',
  },
  helperText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 15,
    paddingHorizontal: 4,
  },
  mapContainer: {
    height: 220,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 25,
    borderWidth: 1.5,
    borderColor: '#e2e2e2',
    backgroundColor: '#f5f5f5',
  },
  mapHintText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 5,
    backgroundColor: '#fff7f2',
    borderTopWidth: 1,
    borderTopColor: '#f2e2d9',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
