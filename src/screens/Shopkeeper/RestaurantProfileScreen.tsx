import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Switch,
  Image,
  Platform,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Geolocation from '@react-native-community/geolocation';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useUser } from '../../context/UserContext';
import { API_URL } from '../../config/api';
import { authFetch } from '../../utils/authFetch';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { Icons } from '../../constants/icons';
import { ChefHatIcon, StoreFrontIcon, CookingPanIcon, CheckmarkIcon, PlusIcon, GalleryUploadIcon, CameraPhotoIcon } from '../../components/icons/ShopkeeperIcons';
import { CardPaymentIcon, ShieldCheckIcon, LocationPinIcon } from '../../components/icons/DeliveryIcons';
import CustomAlert from '../../components/CustomAlert';

type RestaurantProfileNavProp = NativeStackNavigationProp<RootStackParamList, 'RestaurantProfile'>;

const CUISINE_PRESETS = [
  'Indian',
  'Biryani',
  'Fast Food',
  'Pizza & Burger',
  'Chinese',
  'South Indian',
  'Desserts & Bakery',
  'Healthy & Vegan',
];

const BANNER_PRESETS = [
  { label: 'Indian Spice', uri: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800&auto=format&fit=crop' },
  { label: 'Burgers & Fries', uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop' },
  { label: 'Cafe & Bakery', uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop' },
  { label: 'Pizza Parlor', uri: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop' },
  { label: 'Verde Vegan', uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop' },
];

export default function RestaurantProfileScreen() {
  const navigation = useNavigation<RestaurantProfileNavProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const { userProfile, refreshUserProfile } = useUser();

  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Form Fields
  const [storeName, setStoreName] = useState(userProfile?.name || 'QuickBite Kitchen');
  const [cuisine, setCuisine] = useState('Indian, Fast Food');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800&auto=format&fit=crop'
  );
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [address, setAddress] = useState(
    userProfile?.savedAddresses?.[0]?.addressLine1 || '12 Spice Garden Lane, 100ft Road, Indiranagar, Bangalore'
  );
  const [latitude, setLatitude] = useState<number | null>(12.9352);
  const [longitude, setLongitude] = useState<number | null>(77.6245);
  const [isOpen, setIsOpen] = useState(userProfile?.isOnline ?? true);
  const [prepTime, setPrepTime] = useState('20 mins');
  const [fssaiLicense, setFssaiLicense] = useState('FSSAI-11223344556677');
  const [upiId, setUpiId] = useState(userProfile?.bankDetails?.upiId || 'kitchen@upi');
  const [accountNumber, setAccountNumber] = useState(userProfile?.bankDetails?.accountNumber || '');
  const [ifsc, setIfsc] = useState(userProfile?.bankDetails?.ifsc || '');

  // OpenStreetMap Autocomplete Suggestions
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Fetch real restaurant from MongoDB
  useEffect(() => {
    let isMounted = true;
    const fetchRestaurantData = async () => {
      setLoadingData(true);
      try {
        const res = await authFetch(`${API_URL}/restaurants/my`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            const rest = data[0];
            setRestaurantId(rest.id || rest._id);
            if (rest.name) setStoreName(rest.name);
            if (rest.cuisine) setCuisine(rest.cuisine);
            if (rest.image) setImageUrl(rest.image);
            if (rest.address) setAddress(rest.address);
            if (rest.phone) setPhone(rest.phone);
            if (rest.isOpen !== undefined) setIsOpen(rest.isOpen);
            if (rest.location?.latitude && rest.location?.longitude) {
              setLatitude(rest.location.latitude);
              setLongitude(rest.location.longitude);
            }
          }
        }
      } catch (err) {
        console.log('Error loading restaurant details:', err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    };

    if (userProfile) {
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.bankDetails?.upiId) setUpiId(userProfile.bankDetails.upiId);
      if (userProfile.bankDetails?.accountNumber) setAccountNumber(userProfile.bankDetails.accountNumber);
      if (userProfile.bankDetails?.ifsc) setIfsc(userProfile.bankDetails.ifsc);
    }

    fetchRestaurantData();

    return () => {
      isMounted = false;
    };
  }, [userProfile]);

  // Request Android location permission
  const requestAndroidLocationPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Kitchen Location Permission',
          message: 'QuickBite requires your physical kitchen location to route nearby delivery orders and calculate customer proximity accurately.',
          buttonNeutral: 'Ask Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Reverse geocode coordinates to full address text
  const reverseGeocodeCoords = async (lat: number, lng: number): Promise<boolean> => {
    setLatitude(lat);
    setLongitude(lng);
    let success = false;

    try {
      // 1. Nominatim OpenStreetMap Reverse
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`, {
        headers: { 'User-Agent': 'QuickBiteStore/1.0' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setAddress(data.display_name);
          setShowSuggestions(false);
          setAddressSuggestions([]);
          success = true;
        } else {
          const a = data.address || {};
          const parts = [
            a.road || a.street || a.neighbourhood || a.suburb,
            a.residential || a.subdistrict,
            a.city || a.town || a.village || a.state_district,
            a.postcode ? `PIN: ${a.postcode}` : '',
          ].filter(Boolean);

          if (parts.length > 0) {
            setAddress(parts.join(', '));
            setShowSuggestions(false);
            setAddressSuggestions([]);
            success = true;
          }
        }
      }
    } catch (e) {
      console.log('Nominatim reverse geocode error:', e);
    }

    if (!success) {
      try {
        // 2. BigDataCloud Fallback
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );
        if (res.ok) {
          const data = await res.json();
          const parts = [
            data.locality || data.localityInfo?.administrative?.[3]?.name,
            data.city || data.principalSubdivision,
            data.postcode ? `PIN: ${data.postcode}` : '',
          ].filter(Boolean);

          if (parts.length > 0) {
            setAddress(parts.join(', '));
            setShowSuggestions(false);
            setAddressSuggestions([]);
            success = true;
          }
        }
      } catch (e) {
        console.log('BigDataCloud error:', e);
      }
    }

    return success;
  };

  // OpenStreetMap Nominatim Live Search Query
  const fetchAddressSuggestions = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&addressdetails=1&limit=5`,
        {
          headers: { 'User-Agent': 'QuickBiteStore/1.0' },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAddressSuggestions(data);
          setShowSuggestions(true);
        } else {
          setAddressSuggestions([]);
          setShowSuggestions(false);
        }
      }
    } catch (e) {
      console.log('Nominatim search error:', e);
    } finally {
      setSearchingAddress(false);
    }
  };

  const handleAddressChange = (text: string) => {
    setAddress(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.trim().length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchAddressSuggestions(text);
      }, 400);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    if (!isNaN(lat) && !isNaN(lng)) {
      setLatitude(lat);
      setLongitude(lng);
    }

    setAddress(item.display_name || '');
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  // GPS Current Location Fetcher
  const handleFetchCurrentLocation = async () => {
    setFetchingLocation(true);
    const hasPerm = await requestAndroidLocationPermission();
    if (!hasPerm) {
      setFetchingLocation(false);
      showAlert('Permission Denied', 'Please enable Location permission in your settings to auto-fetch kitchen GPS coordinates.');
      return;
    }

    const tryGetLocation = (highAccuracy: boolean) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          const ok = await reverseGeocodeCoords(lat, lng);
          if (ok) {
            showAlert('Location Detected', `Kitchen location auto-filled accurately.\nCoordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          } else {
            // IP Fallback
            try {
              const ipRes = await fetch('https://freeipapi.com/api/json');
              if (ipRes.ok) {
                const ipData = await ipRes.json();
                if (ipData.latitude && ipData.longitude) {
                  setLatitude(ipData.latitude);
                  setLongitude(ipData.longitude);
                  setAddress(`${ipData.cityName || 'City'}, ${ipData.regionName || 'State'}`);
                  showAlert('Location Found (Network)', 'Estimated city location filled via network.');
                }
              }
            } catch (err) {}
          }
          setFetchingLocation(false);
        },
        async (err) => {
          console.log(`Geolocation error (highAccuracy=${highAccuracy}):`, err);
          if (highAccuracy) {
            tryGetLocation(false);
          } else {
            setFetchingLocation(false);
            showAlert('GPS Unavailable', 'Could not detect GPS coordinates. Please enter your physical address manually below.');
          }
        },
        { enableHighAccuracy: highAccuracy, timeout: 12000, maximumAge: 0 }
      );
    };

    tryGetLocation(true);
  };

  // Image Picker - Gallery / Files (Base64)
  const handlePickFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 800,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        showAlert('Upload Failed', result.errorMessage || 'Failed to select image from gallery');
        return;
      }

      const asset = result.assets?.[0];
      if (asset?.base64) {
        const mime = asset.type || 'image/jpeg';
        setImageUrl(`data:${mime};base64,${asset.base64}`);
        showAlert('Photo Selected', 'Store banner photo loaded successfully.');
      } else if (asset?.uri) {
        setImageUrl(asset.uri);
      }
    } catch (err: any) {
      showAlert('Gallery Error', err.message || 'Unable to open file gallery');
    }
  };

  // Image Picker - Camera Capture (Base64)
  const handleTakePhoto = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'QuickBite requires camera access to capture your restaurant storefront banner.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showAlert('Permission Required', 'Camera permission is needed to take a photo.');
          return;
        }
      }

      const result = await launchCamera({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 800,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        showAlert('Camera Failed', result.errorMessage || 'Failed to capture photo');
        return;
      }

      const asset = result.assets?.[0];
      if (asset?.base64) {
        const mime = asset.type || 'image/jpeg';
        setImageUrl(`data:${mime};base64,${asset.base64}`);
        showAlert('Photo Captured', 'Store banner photo updated successfully.');
      } else if (asset?.uri) {
        setImageUrl(asset.uri);
      }
    } catch (err: any) {
      showAlert('Camera Error', err.message || 'Unable to launch camera');
    }
  };

  const handleToggleCuisine = (c: string) => {
    if (cuisine.includes(c)) {
      const parts = cuisine.split(',').map((s) => s.trim()).filter((s) => s !== c);
      setCuisine(parts.join(', '));
    } else {
      const parts = cuisine ? cuisine.split(',').map((s) => s.trim()).filter(Boolean) : [];
      parts.push(c);
      setCuisine(parts.join(', '));
    }
  };

  const handleSaveStore = async () => {
    if (!storeName.trim()) {
      showAlert('Required', 'Please enter your restaurant/kitchen name.');
      return;
    }
    if (!address.trim()) {
      showAlert('Required', 'Please enter or auto-fetch your kitchen address for customer proximity.');
      return;
    }

    setSaving(true);
    try {
      // 1. Save or Update Real Restaurant in MongoDB
      const restPayload = {
        name: storeName.trim(),
        cuisine: cuisine.trim(),
        image: imageUrl.trim(),
        address: address.trim(),
        phone: phone.trim(),
        isOpen,
        isAcceptingOrders: isOpen,
        location: {
          latitude: latitude || 12.9352,
          longitude: longitude || 77.6245,
        },
      };

      if (restaurantId) {
        await authFetch(`${API_URL}/restaurants/${restaurantId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(restPayload),
        });
      } else {
        const createRes = await authFetch(`${API_URL}/restaurants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(restPayload),
        });
        if (createRes.ok) {
          const newRest = await createRes.json();
          setRestaurantId(newRest.id || newRest._id);
        }
      }

      // 2. Save User Profile operational & settlement details
      const response = await authFetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeName.trim(),
          phone: phone.trim(),
          isOnline: isOpen,
          bankDetails: {
            accountNumber: accountNumber.trim(),
            ifsc: ifsc.trim(),
            upiId: upiId.trim(),
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showAlert('Error', data.message || 'Failed to update kitchen details');
        return;
      }

      await refreshUserProfile();
      showAlert('Store Profile Saved', 'Your restaurant profile, live location presence, and menu are now published to customers.');
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const prepTimes = ['15 mins', '20 mins', '30 mins', '45 mins'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B18" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Image source={Icons.back} style={styles.backIconImg} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Restaurant & Kitchen Profile</Text>
          <Text style={styles.headerSubTitle}>Live Store Presence & Operations</Text>
        </View>

        <View style={styles.headerIconCircle}>
          <ChefHatIcon size={20} color="#FFC72C" />
        </View>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      {loadingData ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#FFC72C" />
          <Text style={styles.loadingText}>Loading restaurant profile...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Live Store Status Card */}
          <View style={styles.statusCard}>
            <View style={{ flex: 1 }}>
              <View style={styles.statusTitleRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isOpen ? '#10B981' : '#EF4444' },
                  ]}
                />
                <Text style={styles.statusCardTitle}>
                  {isOpen ? 'Kitchen is Live & Open' : 'Kitchen is Paused / Closed'}
                </Text>
              </View>
              <Text style={styles.statusCardDesc}>
                {isOpen
                  ? 'Nearby customers can browse your menu and place live orders.'
                  : 'Your kitchen is offline. No new orders will arrive.'}
              </Text>
            </View>
            <Switch
              value={isOpen}
              onValueChange={setIsOpen}
              trackColor={{ false: '#EF4444', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* 2. Restaurant Cover Banner */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <StoreFrontIcon size={18} color="#FFC72C" />
              <Text style={styles.sectionTitle}>Cover Banner / Store Image</Text>
            </View>
            <Text style={styles.sectionDesc}>
              Upload a high-quality photo of your restaurant storefront or banner.
            </Text>

            {/* Live Preview */}
            <View style={styles.bannerPreviewWrap}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.bannerPreviewImg} />
              ) : (
                <View style={styles.bannerPlaceholder}>
                  <GalleryUploadIcon size={36} color={colors.textMuted} />
                  <Text style={styles.bannerPlaceholderText}>No image selected</Text>
                </View>
              )}
              <View style={styles.bannerOverlayBadge}>
                <Text style={styles.bannerOverlayText}>Live Customer View</Text>
              </View>
            </View>

            {/* Image Picker Action Buttons */}
            <View style={styles.imageActionRow}>
              <TouchableOpacity
                style={styles.uploadActionBtn}
                onPress={handlePickFromGallery}
                activeOpacity={0.8}
              >
                <GalleryUploadIcon size={18} color="#FFC72C" />
                <Text style={styles.uploadActionBtnText}>Choose File / Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadActionBtn}
                onPress={handleTakePhoto}
                activeOpacity={0.8}
              >
                <CameraPhotoIcon size={18} color="#FFC72C" />
                <Text style={styles.uploadActionBtnText}>Take Photo</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Or Choose Preset Photo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
              {BANNER_PRESETS.map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.presetPill, imageUrl === preset.uri && styles.presetPillActive]}
                  onPress={() => setImageUrl(preset.uri)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetPillText, imageUrl === preset.uri && styles.presetPillTextActive]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 3. Kitchen & Restaurant Details */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <ChefHatIcon size={18} color="#FFC72C" />
              <Text style={styles.sectionTitle}>Restaurant Information</Text>
            </View>

            <Text style={styles.inputLabel}>Restaurant / Kitchen Name *</Text>
            <TextInput
              style={styles.textInput}
              value={storeName}
              onChangeText={setStoreName}
              placeholder="e.g. The Royal Spice Kitchen"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Cuisine Categories</Text>
            <View style={styles.cuisinePillsWrap}>
              {CUISINE_PRESETS.map((c) => {
                const isSelected = cuisine.toLowerCase().includes(c.toLowerCase());
                return (
                  <TouchableOpacity
                    key={c}
                    style={[styles.cuisinePill, isSelected && styles.cuisinePillActive]}
                    onPress={() => handleToggleCuisine(c)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cuisinePillContent}>
                      {isSelected ? (
                        <CheckmarkIcon size={11} color="#B45309" />
                      ) : (
                        <PlusIcon size={10} color={colors.textMuted} />
                      )}
                      <Text style={[styles.cuisinePillText, isSelected && styles.cuisinePillTextActive]}>
                        {c}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={[styles.textInput, { marginTop: 8 }]}
              value={cuisine}
              onChangeText={setCuisine}
              placeholder="e.g. North Indian, Biryani, Mughlai"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Kitchen Contact Phone / Hotline</Text>
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 9876543211"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          {/* 4. Physical Address with GPS Auto-Fetch */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <LocationPinIcon size={18} color="#EF4444" />
              <Text style={styles.sectionTitle}>Kitchen Location & Address</Text>
            </View>
            <Text style={styles.sectionDesc}>
              Used by customers to calculate delivery distance & time.
            </Text>

            {/* Auto Fetch GPS Location Button */}
            <TouchableOpacity
              style={styles.fetchLocationBtn}
              onPress={handleFetchCurrentLocation}
              disabled={fetchingLocation}
              activeOpacity={0.85}
            >
              {fetchingLocation ? (
                <ActivityIndicator size="small" color="#1E1B18" />
              ) : (
                <View style={styles.fetchLocationBtnContent}>
                  <LocationPinIcon size={16} color="#92400E" />
                  <Text style={styles.fetchLocationText}>Auto-Detect Kitchen GPS & Address</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* GPS Pin Badge */}
            {latitude && longitude && (
              <View style={styles.geoBadge}>
                <LocationPinIcon size={12} color="#059669" />
                <Text style={styles.geoBadgeText}>
                  GPS Pin: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Physical Address & Landmark *</Text>
            <View style={styles.addressInputContainer}>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={address}
                onChangeText={handleAddressChange}
                placeholder="Type kitchen address (e.g. Indiranagar, Bangalore)"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
              {searchingAddress && (
                <View style={styles.searchingBadge}>
                  <ActivityIndicator size="small" color="#FFC72C" />
                  <Text style={styles.searchingBadgeText}>Searching OpenStreetMap...</Text>
                </View>
              )}
            </View>

            {/* Live OpenStreetMap Autocomplete Dropdown */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <View style={styles.suggestionsHeader}>
                  <Text style={styles.suggestionsHeaderText}>Suggested Locations (OpenStreetMap)</Text>
                  <TouchableOpacity onPress={() => setShowSuggestions(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.suggestionsCloseText}>Close</Text>
                  </TouchableOpacity>
                </View>
                {addressSuggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={item.place_id || idx}
                    style={[
                      styles.suggestionItem,
                      idx === addressSuggestions.length - 1 && { borderBottomWidth: 0 },
                    ]}
                    onPress={() => handleSelectSuggestion(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.suggestionIconWrap}>
                      <LocationPinIcon size={16} color="#FFC72C" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionTitle} numberOfLines={1}>
                        {item.name || item.address?.road || item.address?.suburb || item.display_name.split(',')[0]}
                      </Text>
                      <Text style={styles.suggestionSubtitle} numberOfLines={2}>
                        {item.display_name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 5. Cooking Prep Time & Compliance */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <CookingPanIcon size={18} color="#FFC72C" />
              <Text style={styles.sectionTitle}>Preparation & Compliance</Text>
            </View>

            <Text style={styles.inputLabel}>Average Cooking Preparation Time</Text>
            <View style={styles.prepTimeRow}>
              {prepTimes.map((time) => {
                const isSelected = prepTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[styles.prepPill, isSelected && styles.prepPillActive]}
                    onPress={() => setPrepTime(time)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.prepPillText, isSelected && styles.prepPillTextActive]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>FSSAI Food License / Registration</Text>
            <TextInput
              style={styles.textInput}
              value={fssaiLicense}
              onChangeText={setFssaiLicense}
              placeholder="e.g. FSSAI-11223344556677"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
            />
          </View>

          {/* 6. Settlement Bank & UPI */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <CardPaymentIcon size={18} color="#10B981" />
              <Text style={styles.sectionTitle}>Daily Payouts & Settlement</Text>
            </View>

            <Text style={styles.inputLabel}>UPI ID for Instant Settlement</Text>
            <TextInput
              style={styles.textInput}
              value={upiId}
              onChangeText={setUpiId}
              placeholder="kitchen@upi"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Bank Account Number</Text>
            <TextInput
              style={styles.textInput}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="12-16 digit account number"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
            />

            <Text style={styles.inputLabel}>Bank IFSC Code</Text>
            <TextInput
              style={styles.textInput}
              value={ifsc}
              onChangeText={setIfsc}
              placeholder="HDFC0001234"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
            />
          </View>

          {/* Save Action Button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveStore}
            disabled={saving}
            activeOpacity={0.88}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#1E1B18" />
            ) : (
              <Text style={styles.saveBtnText}>Save & Publish Restaurant Profile</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1E1B18',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: '#1E1B18',
      borderBottomWidth: 1,
      borderBottomColor: '#2D2824',
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: '#2D2824',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    backIconImg: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
    headerTitleWrap: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    headerSubTitle: {
      fontSize: 11,
      color: '#9CA3AF',
      marginTop: 2,
    },
    headerIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 199, 44, 0.18)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingCenter: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '600',
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 40,
      backgroundColor: colors.background,
    },
    statusCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
      gap: 12,
    },
    statusTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 2,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusCardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },
    statusCardDesc: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 3,
      lineHeight: 16,
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },
    sectionDesc: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: 10,
    },
    bannerPreviewWrap: {
      position: 'relative',
      width: '100%',
      height: 140,
      borderRadius: 14,
      overflow: 'hidden',
      marginTop: 4,
      marginBottom: 10,
      backgroundColor: '#2D2824',
    },
    bannerPreviewImg: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    bannerPlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
    },
    bannerPlaceholderText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
    },
    imageActionRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 8,
    },
    uploadActionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#2D2824',
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#3E3832',
      gap: 8,
    },
    uploadActionBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    bannerOverlayBadge: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    bannerOverlayText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
    presetRow: {
      gap: 8,
      paddingVertical: 4,
      marginBottom: 8,
    },
    presetPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    presetPillActive: {
      backgroundColor: '#1E1B18',
      borderColor: '#1E1B18',
    },
    presetPillText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    presetPillTextActive: {
      color: '#FFC72C',
    },
    cuisinePillsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
    },
    cuisinePill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cuisinePillActive: {
      backgroundColor: 'rgba(255, 199, 44, 0.2)',
      borderColor: '#FFC72C',
    },
    cuisinePillContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    cuisinePillText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    cuisinePillTextActive: {
      color: '#B45309',
    },
    fetchLocationBtn: {
      backgroundColor: '#FEF3C7',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#FCD34D',
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    fetchLocationBtnContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    fetchLocationIcon: {
      fontSize: 14,
    },
    fetchLocationText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#92400E',
    },
    geoBadge: {
      backgroundColor: '#ECFDF5',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    geoBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#059669',
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      marginTop: 10,
      marginBottom: 6,
    },
    addressInputContainer: {
      position: 'relative',
    },
    searchingBadge: {
      position: 'absolute',
      top: 8,
      right: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: 'rgba(30, 27, 24, 0.85)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    searchingBadgeText: {
      fontSize: 10,
      color: '#FFC72C',
      fontWeight: '600',
    },
    suggestionsContainer: {
      backgroundColor: '#26221E',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#3E3832',
      marginTop: 6,
      marginBottom: 10,
      overflow: 'hidden',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    suggestionsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: '#1E1B18',
      borderBottomWidth: 1,
      borderBottomColor: '#332D27',
    },
    suggestionsHeaderText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFC72C',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    suggestionsCloseText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#332D27',
      gap: 10,
    },
    suggestionIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 199, 44, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    suggestionTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 2,
    },
    suggestionSubtitle: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 15,
    },
    textInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    textArea: {
      minHeight: 70,
      textAlignVertical: 'top',
    },
    prepTimeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    prepPill: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    prepPillActive: {
      backgroundColor: '#1E1B18',
      borderColor: '#1E1B18',
    },
    prepPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    prepPillTextActive: {
      color: '#FFC72C',
    },
    saveBtn: {
      backgroundColor: '#FFC72C',
      paddingVertical: 15,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    saveBtnText: {
      color: '#1E1B18',
      fontWeight: '900',
      fontSize: 15,
      letterSpacing: 0.3,
    },
  });
