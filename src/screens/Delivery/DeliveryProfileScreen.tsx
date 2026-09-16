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
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useUser } from '../../context/UserContext';
import { API_URL } from '../../config/api';
import { authFetch } from '../../utils/authFetch';
import { Icons } from '../../constants/icons';
import {
  DeliveryBikeIcon,
  ShieldCheckIcon,
  CardPaymentIcon,
  DocumentIdIcon,
  LocationPinIcon,
  CheckCircleIcon,
  WarningTriangleIcon,
} from '../../components/icons/DeliveryIcons';
import {
  GalleryUploadIcon,
  CameraPhotoIcon,
  CheckmarkIcon,
  PlusIcon,
} from '../../components/icons/ShopkeeperIcons';
import CustomAlert from '../../components/CustomAlert';

type DeliveryProfileNavProp = NativeStackNavigationProp<RootStackParamList, 'DeliveryProfile'>;

const VEHICLE_TYPES = ['Motorcycle', 'Scooter', 'Electric Bike', 'Bicycle'];

export default function DeliveryProfileScreen() {
  const navigation = useNavigation<DeliveryProfileNavProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const { userProfile, refreshUserProfile } = useUser();

  const [saving, setSaving] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Form Fields
  const [name, setName] = useState(userProfile?.name || 'Delivery Partner');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [profilePicture, setProfilePicture] = useState(userProfile?.profilePicture || '');
  const [isOnline, setIsOnline] = useState(userProfile?.isOnline ?? true);

  // Vehicle Info
  const [vehicleType, setVehicleType] = useState(userProfile?.vehicleType || 'Motorcycle');
  const [vehicleNumber, setVehicleNumber] = useState(userProfile?.vehicleNumber || '');

  // Address & GPS Coordinates
  const [address, setAddress] = useState(
    userProfile?.savedAddresses?.[0]?.addressLine1 || 'Indiranagar Hub, Bangalore'
  );
  const [latitude, setLatitude] = useState<number | null>(
    userProfile?.savedAddresses?.[0]?.latitude || 12.9716
  );
  const [longitude, setLongitude] = useState<number | null>(
    userProfile?.savedAddresses?.[0]?.longitude || 77.5946
  );

  // OpenStreetMap Autocomplete
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isImageStr = (val?: string) =>
    !!val && (val.startsWith('data:image') || val.startsWith('http') || val.startsWith('file:') || val.length > 200);

  const initLicense = userProfile?.documents?.drivingLicense || userProfile?.documents?.drivingLicenseImg || '';
  const initRc = userProfile?.documents?.vehicleRc || userProfile?.documents?.vehicleRC || userProfile?.documents?.vehicleRcImg || '';
  const initId = userProfile?.documents?.nationalId || userProfile?.documents?.identityProof || userProfile?.documents?.nationalIdImg || '';

  // KYC Documents (Images and Numbers)
  const [drivingLicenseImg, setDrivingLicenseImg] = useState(
    userProfile?.documents?.drivingLicenseImg || (isImageStr(initLicense) ? initLicense : '')
  );
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState(
    userProfile?.documents?.drivingLicenseNumber || (!isImageStr(initLicense) ? initLicense : '')
  );

  const [vehicleRcImg, setVehicleRcImg] = useState(
    userProfile?.documents?.vehicleRcImg || (isImageStr(initRc) ? initRc : '')
  );
  const [vehicleRcNumber, setVehicleRcNumber] = useState(
    userProfile?.documents?.vehicleRcNumber || (!isImageStr(initRc) ? initRc : '')
  );

  const [nationalIdImg, setNationalIdImg] = useState(
    userProfile?.documents?.nationalIdImg || (isImageStr(initId) ? initId : '')
  );
  const [nationalIdNumber, setNationalIdNumber] = useState(
    userProfile?.documents?.nationalIdNumber || (!isImageStr(initId) ? initId : '')
  );

  // Bank & Settlement Info
  const [upiId, setUpiId] = useState(userProfile?.bankDetails?.upiId || '');
  const [accountNumber, setAccountNumber] = useState(userProfile?.bankDetails?.accountNumber || '');
  const [ifsc, setIfsc] = useState(userProfile?.bankDetails?.ifsc || '');

  // Verification Status
  const verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected' =
    userProfile?.verificationStatus || 'unverified';

  // Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.email) setEmail(userProfile.email);
      if (userProfile.profilePicture) setProfilePicture(userProfile.profilePicture);
      if (userProfile.isOnline !== undefined) setIsOnline(userProfile.isOnline);
      if (userProfile.vehicleType) setVehicleType(userProfile.vehicleType);
      if (userProfile.vehicleNumber) setVehicleNumber(userProfile.vehicleNumber);

      const lic = userProfile.documents?.drivingLicense || userProfile.documents?.drivingLicenseImg || '';
      if (userProfile.documents?.drivingLicenseImg || isImageStr(lic)) {
        setDrivingLicenseImg(userProfile.documents?.drivingLicenseImg || lic);
      }
      if (userProfile.documents?.drivingLicenseNumber || !isImageStr(lic)) {
        setDrivingLicenseNumber(userProfile.documents?.drivingLicenseNumber || lic);
      }

      const rc = userProfile.documents?.vehicleRc || userProfile.documents?.vehicleRC || userProfile.documents?.vehicleRcImg || '';
      if (userProfile.documents?.vehicleRcImg || isImageStr(rc)) {
        setVehicleRcImg(userProfile.documents?.vehicleRcImg || rc);
      }
      if (userProfile.documents?.vehicleRcNumber || !isImageStr(rc)) {
        setVehicleRcNumber(userProfile.documents?.vehicleRcNumber || rc);
      }

      const id = userProfile.documents?.nationalId || userProfile.documents?.identityProof || userProfile.documents?.nationalIdImg || '';
      if (userProfile.documents?.nationalIdImg || isImageStr(id)) {
        setNationalIdImg(userProfile.documents?.nationalIdImg || id);
      }
      if (userProfile.documents?.nationalIdNumber || !isImageStr(id)) {
        setNationalIdNumber(userProfile.documents?.nationalIdNumber || id);
      }

      if (userProfile.bankDetails?.upiId) setUpiId(userProfile.bankDetails.upiId);
      if (userProfile.bankDetails?.accountNumber) setAccountNumber(userProfile.bankDetails.accountNumber);
      if (userProfile.bankDetails?.ifsc) setIfsc(userProfile.bankDetails.ifsc);
      if (userProfile.savedAddresses?.[0]?.addressLine1) {
        setAddress(userProfile.savedAddresses[0].addressLine1);
      }
      if (userProfile.savedAddresses?.[0]?.latitude) {
        setLatitude(userProfile.savedAddresses[0].latitude);
      }
      if (userProfile.savedAddresses?.[0]?.longitude) {
        setLongitude(userProfile.savedAddresses[0].longitude);
      }
    }
  }, [userProfile]);

  // Request Android location permission
  const requestAndroidLocationPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'QuickBite requires your location to assign nearby customer deliveries and calculate route proximity.',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
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
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'User-Agent': 'QuickBiteDelivery/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setAddress(data.display_name);
          setShowSuggestions(false);
          setAddressSuggestions([]);
          success = true;
        }
      }
    } catch (e) {
      console.log('Nominatim reverse geocode error:', e);
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
        { headers: { 'User-Agent': 'QuickBiteDelivery/1.0' } }
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

  // Auto-Detect Current GPS Base Location
  const handleFetchCurrentLocation = async () => {
    setFetchingLocation(true);
    const hasPerm = await requestAndroidLocationPermission();
    if (!hasPerm) {
      setFetchingLocation(false);
      showAlert('Permission Denied', 'Please grant location permission to detect your delivery zone.');
      return;
    }

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const ok = await reverseGeocodeCoords(lat, lng);
        if (ok) {
          showAlert('Location Detected', `Base location updated accurately.\nCoordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
        setFetchingLocation(false);
      },
      (err) => {
        setFetchingLocation(false);
        showAlert('GPS Unavailable', 'Could not detect GPS coordinates. Please enter your address manually.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Pick Profile Photo / Selfie from Gallery
  const handlePickFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        showAlert('Upload Failed', result.errorMessage || 'Failed to select photo from gallery');
        return;
      }

      const asset = result.assets?.[0];
      if (asset?.base64) {
        const mime = asset.type || 'image/jpeg';
        setProfilePicture(`data:${mime};base64,${asset.base64}`);
        showAlert('Photo Updated', 'Profile picture loaded successfully.');
      } else if (asset?.uri) {
        setProfilePicture(asset.uri);
      }
    } catch (err: any) {
      showAlert('Gallery Error', err.message || 'Unable to open file gallery');
    }
  };

  // Capture Photo via Camera
  const handleTakePhoto = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'QuickBite requires camera access to capture your profile photo / identity verification picture.',
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
        maxWidth: 800,
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
        setProfilePicture(`data:${mime};base64,${asset.base64}`);
        showAlert('Photo Captured', 'Profile photo updated successfully.');
      } else if (asset?.uri) {
        setProfilePicture(asset.uri);
      }
    } catch (err: any) {
      showAlert('Camera Error', err.message || 'Unable to launch camera');
    }
  };

  // Pick Document Photo from Gallery
  const handlePickDocFromGallery = async (docType: 'license' | 'rc' | 'id') => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        showAlert('Upload Failed', result.errorMessage || 'Failed to select document photo');
        return;
      }

      const asset = result.assets?.[0];
      const imgData = asset?.base64
        ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
        : asset?.uri || '';

      if (imgData) {
        if (docType === 'license') {
          setDrivingLicenseImg(imgData);
          showAlert('License Photo Selected', 'Driving license document image loaded.');
        } else if (docType === 'rc') {
          setVehicleRcImg(imgData);
          showAlert('RC Photo Selected', 'Vehicle RC document image loaded.');
        } else if (docType === 'id') {
          setNationalIdImg(imgData);
          showAlert('ID Proof Photo Selected', 'National ID document image loaded.');
        }
      }
    } catch (err: any) {
      showAlert('Gallery Error', err.message || 'Unable to open file gallery');
    }
  };

  // Capture Document Photo via Camera
  const handleTakeDocPhoto = async (docType: 'license' | 'rc' | 'id') => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'QuickBite requires camera access to capture KYC document photos.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showAlert('Permission Required', 'Camera permission is needed to take a document photo.');
          return;
        }
      }

      const result = await launchCamera({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        showAlert('Camera Failed', result.errorMessage || 'Failed to capture document photo');
        return;
      }

      const asset = result.assets?.[0];
      const imgData = asset?.base64
        ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
        : asset?.uri || '';

      if (imgData) {
        if (docType === 'license') {
          setDrivingLicenseImg(imgData);
          showAlert('License Photo Captured', 'Driving license document photo saved.');
        } else if (docType === 'rc') {
          setVehicleRcImg(imgData);
          showAlert('RC Photo Captured', 'Vehicle RC document photo saved.');
        } else if (docType === 'id') {
          setNationalIdImg(imgData);
          showAlert('ID Proof Captured', 'National ID document photo saved.');
        }
      }
    } catch (err: any) {
      showAlert('Camera Error', err.message || 'Unable to launch camera');
    }
  };

  // Remove Document Photo
  const handleRemoveDoc = (docType: 'license' | 'rc' | 'id') => {
    if (docType === 'license') {
      setDrivingLicenseImg('');
    } else if (docType === 'rc') {
      setVehicleRcImg('');
    } else if (docType === 'id') {
      setNationalIdImg('');
    }
  };

  // General Profile Save
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      showAlert('Required', 'Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      showAlert('Required', 'Please enter your contact phone number.');
      return;
    }

    setSaving(true);
    try {
      const response = await authFetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          profilePicture: profilePicture.trim(),
          isOnline,
          vehicleType,
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          savedAddresses: [
            {
              addressLine1: address.trim(),
              latitude: latitude || 12.9716,
              longitude: longitude || 77.5946,
            },
          ],
          documents: {
            drivingLicense: (drivingLicenseImg || drivingLicenseNumber).trim(),
            vehicleRC: (vehicleRcImg || vehicleRcNumber).trim(),
            vehicleRc: (vehicleRcImg || vehicleRcNumber).trim(),
            identityProof: (nationalIdImg || nationalIdNumber).trim(),
            nationalId: (nationalIdImg || nationalIdNumber).trim(),
            drivingLicenseImg: drivingLicenseImg.trim(),
            drivingLicenseNumber: drivingLicenseNumber.trim(),
            vehicleRcImg: vehicleRcImg.trim(),
            vehicleRcNumber: vehicleRcNumber.trim(),
            nationalIdImg: nationalIdImg.trim(),
            nationalIdNumber: nationalIdNumber.trim(),
          },
          bankDetails: {
            accountNumber: accountNumber.trim(),
            ifsc: ifsc.trim().toUpperCase(),
            upiId: upiId.trim(),
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showAlert('Error', data.message || 'Failed to update profile');
        return;
      }

      await refreshUserProfile();
      showAlert('Profile Saved', 'Your delivery partner credentials and settlement details have been updated.');
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  // Submit Application for Admin Verification
  const handleApplyVerification = async () => {
    if (!vehicleNumber.trim()) {
      showAlert('Missing Vehicle Number', 'Please enter your vehicle registration number.');
      return;
    }
    const licenseVal = drivingLicenseImg || drivingLicenseNumber;
    if (!licenseVal.trim()) {
      showAlert('Missing License', 'Please take a photo or enter your Driving License details for KYC verification.');
      return;
    }

    setSubmittingVerification(true);
    try {
      const response = await authFetch(`${API_URL}/users/apply-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          vehicleType,
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          documents: {
            drivingLicense: (drivingLicenseImg || drivingLicenseNumber).trim(),
            vehicleRc: (vehicleRcImg || vehicleRcNumber).trim(),
            vehicleRC: (vehicleRcImg || vehicleRcNumber).trim(),
            nationalId: (nationalIdImg || nationalIdNumber).trim(),
            identityProof: (nationalIdImg || nationalIdNumber).trim(),
            drivingLicenseImg: drivingLicenseImg.trim(),
            drivingLicenseNumber: drivingLicenseNumber.trim(),
            vehicleRcImg: vehicleRcImg.trim(),
            vehicleRcNumber: vehicleRcNumber.trim(),
            nationalIdImg: nationalIdImg.trim(),
            nationalIdNumber: nationalIdNumber.trim(),
          },
          bankDetails: {
            accountNumber: accountNumber.trim(),
            ifsc: ifsc.trim().toUpperCase(),
            upiId: upiId.trim(),
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showAlert('Error', data.message || 'Verification submission failed');
        return;
      }

      await refreshUserProfile();
      showAlert('KYC Submitted', 'Your document photos and details have been submitted for admin verification.');
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setSubmittingVerification(false);
    }
  };

  const getKycBanner = () => {
    switch (verificationStatus) {
      case 'verified':
        return {
          label: 'Verified Delivery Hero',
          desc: 'Your KYC documents & driving credentials are fully approved by admin.',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.4)',
          textColor: '#10B981',
          icon: <CheckCircleIcon size={20} color="#10B981" />,
        };
      case 'pending':
        return {
          label: 'KYC Under Admin Review',
          desc: 'Your verification documents are being reviewed. High-priority orders will unlock once approved.',
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.4)',
          textColor: '#F59E0B',
          icon: <ShieldCheckIcon size={20} color="#F59E0B" />,
        };
      case 'rejected':
        return {
          label: 'Verification Rejected',
          desc: 'Please update and re-submit your driving license and registration credentials.',
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.4)',
          textColor: '#EF4444',
          icon: <WarningTriangleIcon size={20} color="#EF4444" />,
        };
      default:
        return {
          label: 'KYC Verification Required',
          desc: 'Submit your license and vehicle RC details to become an official Verified Delivery Hero.',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.35)',
          textColor: '#EF4444',
          icon: <ShieldCheckIcon size={20} color="#EF4444" />,
        };
    }
  };

  const kyc = getKycBanner();

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
          <Text style={styles.headerTitle}>Delivery Hero Profile</Text>
          <Text style={styles.headerSubTitle}>Operational Shift & KYC Identity</Text>
        </View>

        <View style={styles.headerIconCircle}>
          <DeliveryBikeIcon size={20} color="#FFC72C" />
        </View>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Live Shift Status Card */}
        <View style={styles.statusCard}>
          <View style={{ flex: 1 }}>
            <View style={styles.statusTitleRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? '#10B981' : '#F59E0B' },
                ]}
              />
              <Text style={styles.statusCardTitle}>
                {isOnline ? 'Online for Delivery Orders' : 'Shift Paused / Offline'}
              </Text>
            </View>
            <Text style={styles.statusCardDesc}>
              {isOnline
                ? 'You are active to receive nearby delivery pickups and order alerts.'
                : 'You will not receive new delivery assignments until you go online.'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: '#F59E0B', true: '#10B981' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* 2. KYC Verification Status Badge */}
        <View style={[styles.kycStatusCard, { backgroundColor: kyc.bg, borderColor: kyc.border }]}>
          <View style={styles.kycIconWrap}>{kyc.icon}</View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kycCardTitle, { color: kyc.textColor }]}>{kyc.label}</Text>
            <Text style={styles.kycCardDesc}>{kyc.desc}</Text>
          </View>
        </View>

        {/* 3. Profile Avatar / Selfie Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <DocumentIdIcon size={18} color="#FFC72C" />
            <Text style={styles.sectionTitle}>Profile Photo / Identity Selfie</Text>
          </View>

          <View style={styles.avatarRowWrap}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.avatarPreviewImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <DeliveryBikeIcon size={32} color={colors.textMuted} />
              </View>
            )}

            <View style={styles.avatarActionsCol}>
              <TouchableOpacity
                style={styles.avatarActionBtn}
                onPress={handlePickFromGallery}
                activeOpacity={0.8}
              >
                <GalleryUploadIcon size={16} color="#FFC72C" />
                <Text style={styles.avatarActionBtnText}>Choose Photo / Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.avatarActionBtn}
                onPress={handleTakePhoto}
                activeOpacity={0.8}
              >
                <CameraPhotoIcon size={16} color="#FFC72C" />
                <Text style={styles.avatarActionBtnText}>Take Live Selfie</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 4. Personal Info */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <DocumentIdIcon size={18} color="#FFC72C" />
            <Text style={styles.sectionTitle}>Partner Information</Text>
          </View>

          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Ramesh Kumar"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.inputLabel}>Contact Phone Number *</Text>
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 9876543210"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="rider@example.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* 5. Vehicle Details */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <DeliveryBikeIcon size={18} color="#FFC72C" />
            <Text style={styles.sectionTitle}>Vehicle & Transport</Text>
          </View>

          <Text style={styles.inputLabel}>Vehicle Type</Text>
          <View style={styles.vehiclePillsRow}>
            {VEHICLE_TYPES.map((type) => {
              const isSelected = vehicleType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.vehiclePill, isSelected && styles.vehiclePillActive]}
                  onPress={() => setVehicleType(type)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.vehiclePillText, isSelected && styles.vehiclePillTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Vehicle Registration Number (RC) *</Text>
          <TextInput
            style={styles.textInput}
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            placeholder="e.g. KA 05 EQ 8821"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
          />
        </View>

        {/* 6. Base Operating Location & Address */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <LocationPinIcon size={18} color="#EF4444" />
            <Text style={styles.sectionTitle}>Operating Zone & Base Location</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Used to assign orders near your current operational hub.
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
                <Text style={styles.fetchLocationText}>Auto-Detect Current GPS & Base Location</Text>
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

          <Text style={styles.inputLabel}>Base Address & City *</Text>
          <View style={styles.addressInputContainer}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={address}
              onChangeText={handleAddressChange}
              placeholder="Type delivery area (e.g. Indiranagar, Bangalore)"
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

        {/* 7. KYC Verification Documents */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <ShieldCheckIcon size={18} color="#10B981" />
            <Text style={styles.sectionTitle}>KYC & Legal Documentation</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Upload clear photos of your official documents and vehicle papers for verification.
          </Text>

          {/* Document 1: Driving License */}
          <View style={styles.docItemCard}>
            <View style={styles.docHeaderRow}>
              <View style={styles.docTitleGroup}>
                <DocumentIdIcon size={16} color="#FFC72C" />
                <Text style={styles.docItemTitle}>Driving License (Front)</Text>
              </View>
              {drivingLicenseImg ? (
                <View style={styles.uploadedBadge}>
                  <CheckCircleIcon size={12} color="#10B981" />
                  <Text style={styles.uploadedBadgeText}>Photo Attached</Text>
                </View>
              ) : (
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredBadgeText}>Mandatory *</Text>
                </View>
              )}
            </View>

            {/* Photo Preview or Placeholder */}
            {drivingLicenseImg ? (
              <View style={styles.docPreviewWrap}>
                <Image source={{ uri: drivingLicenseImg }} style={styles.docPreviewImg} />
                <TouchableOpacity
                  style={styles.docRemoveBtn}
                  onPress={() => handleRemoveDoc('license')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.docRemoveBtnText}>Remove Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.docPlaceholder}>
                <DocumentIdIcon size={32} color={colors.textMuted} />
                <Text style={styles.docPlaceholderText}>No license photo attached</Text>
              </View>
            )}

            {/* Photo Action Buttons */}
            <View style={styles.docActionRow}>
              <TouchableOpacity
                style={styles.docActionBtn}
                onPress={() => handleTakeDocPhoto('license')}
                activeOpacity={0.8}
              >
                <CameraPhotoIcon size={15} color="#FFC72C" />
                <Text style={styles.docActionBtnText}>Take Live Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.docActionBtn}
                onPress={() => handlePickDocFromGallery('license')}
                activeOpacity={0.8}
              >
                <GalleryUploadIcon size={15} color="#FFC72C" />
                <Text style={styles.docActionBtnText}>Upload File / Gallery</Text>
              </TouchableOpacity>
            </View>

            {/* Document Number Input */}
            <Text style={styles.docInputLabel}>Driving License Number</Text>
            <TextInput
              style={styles.textInput}
              value={drivingLicenseNumber}
              onChangeText={setDrivingLicenseNumber}
              placeholder="e.g. DL-0420110012345"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
            />
          </View>

          {/* Document 2: Vehicle RC */}
          <View style={styles.docItemCard}>
            <View style={styles.docHeaderRow}>
              <View style={styles.docTitleGroup}>
                <DeliveryBikeIcon size={16} color="#FFC72C" />
                <Text style={styles.docItemTitle}>Vehicle Registration Certificate (RC)</Text>
              </View>
              {vehicleRcImg ? (
                <View style={styles.uploadedBadge}>
                  <CheckCircleIcon size={12} color="#10B981" />
                  <Text style={styles.uploadedBadgeText}>Photo Attached</Text>
                </View>
              ) : (
                <View style={styles.optionalBadge}>
                  <Text style={styles.optionalBadgeText}>Recommended</Text>
                </View>
              )}
            </View>

            {/* Photo Preview or Placeholder */}
            {vehicleRcImg ? (
              <View style={styles.docPreviewWrap}>
                <Image source={{ uri: vehicleRcImg }} style={styles.docPreviewImg} />
                <TouchableOpacity
                  style={styles.docRemoveBtn}
                  onPress={() => handleRemoveDoc('rc')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.docRemoveBtnText}>Remove Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.docPlaceholder}>
                <DeliveryBikeIcon size={32} color={colors.textMuted} />
                <Text style={styles.docPlaceholderText}>No vehicle RC photo attached</Text>
              </View>
            )}

            {/* Photo Action Buttons */}
            <View style={styles.docActionRow}>
              <TouchableOpacity
                style={styles.docActionBtn}
                onPress={() => handleTakeDocPhoto('rc')}
                activeOpacity={0.8}
              >
                <CameraPhotoIcon size={15} color="#FFC72C" />
                <Text style={styles.docActionBtnText}>Take Live Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.docActionBtn}
                onPress={() => handlePickDocFromGallery('rc')}
                activeOpacity={0.8}
              >
                <GalleryUploadIcon size={15} color="#FFC72C" />
                <Text style={styles.docActionBtnText}>Upload File / Gallery</Text>
              </TouchableOpacity>
            </View>

            {/* Document Number Input */}
            <Text style={styles.docInputLabel}>Vehicle RC Number</Text>
            <TextInput
              style={styles.textInput}
              value={vehicleRcNumber}
              onChangeText={setVehicleRcNumber}
              placeholder="e.g. RC-KA05-2022-9988"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
            />
          </View>

          {/* Document 3: National ID / Aadhaar */}
          <View style={styles.docItemCard}>
            <View style={styles.docHeaderRow}>
              <View style={styles.docTitleGroup}>
                <ShieldCheckIcon size={16} color="#FFC72C" />
                <Text style={styles.docItemTitle}>National ID / Aadhaar Card</Text>
              </View>
              {nationalIdImg ? (
                <View style={styles.uploadedBadge}>
                  <CheckCircleIcon size={12} color="#10B981" />
                  <Text style={styles.uploadedBadgeText}>Photo Attached</Text>
                </View>
              ) : (
                <View style={styles.optionalBadge}>
                  <Text style={styles.optionalBadgeText}>Recommended</Text>
                </View>
              )}
            </View>

            {/* Photo Preview or Placeholder */}
            {nationalIdImg ? (
              <View style={styles.docPreviewWrap}>
                <Image source={{ uri: nationalIdImg }} style={styles.docPreviewImg} />
                <TouchableOpacity
                  style={styles.docRemoveBtn}
                  onPress={() => handleRemoveDoc('id')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.docRemoveBtnText}>Remove Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.docPlaceholder}>
                <ShieldCheckIcon size={32} color={colors.textMuted} />
                <Text style={styles.docPlaceholderText}>No Aadhaar / ID photo attached</Text>
              </View>
            )}

            {/* Photo Action Buttons */}
            <View style={styles.docActionRow}>
              <TouchableOpacity
                style={styles.docActionBtn}
                onPress={() => handleTakeDocPhoto('id')}
                activeOpacity={0.8}
              >
                <CameraPhotoIcon size={15} color="#FFC72C" />
                <Text style={styles.docActionBtnText}>Take Live Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.docActionBtn}
                onPress={() => handlePickDocFromGallery('id')}
                activeOpacity={0.8}
              >
                <GalleryUploadIcon size={15} color="#FFC72C" />
                <Text style={styles.docActionBtnText}>Upload File / Gallery</Text>
              </TouchableOpacity>
            </View>

            {/* Document Number Input */}
            <Text style={styles.docInputLabel}>Aadhaar / National ID Number</Text>
            <TextInput
              style={styles.textInput}
              value={nationalIdNumber}
              onChangeText={setNationalIdNumber}
              placeholder="e.g. 12-digit Aadhaar / ID"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
            />
          </View>

          {verificationStatus !== 'verified' && (
            <TouchableOpacity
              style={styles.applyKycBtn}
              onPress={handleApplyVerification}
              disabled={submittingVerification}
              activeOpacity={0.88}
            >
              {submittingVerification ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.applyKycBtnText}>Submit KYC for Admin Approval</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* 8. Daily Earnings Settlement & Bank */}
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
            placeholder="rider@upi"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Bank Account Number</Text>
          <TextInput
            style={styles.textInput}
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder="12-16 digit bank account number"
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
          onPress={handleSaveProfile}
          disabled={saving}
          activeOpacity={0.88}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#1E1B18" />
          ) : (
            <Text style={styles.saveBtnText}>Save & Update Delivery Profile</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    kycStatusCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      marginBottom: 14,
      gap: 12,
    },
    kycIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    kycCardTitle: {
      fontSize: 13,
      fontWeight: '800',
      marginBottom: 2,
    },
    kycCardDesc: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 15,
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
    avatarRowWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginTop: 10,
    },
    avatarPreviewImg: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 2,
      borderColor: '#FFC72C',
    },
    avatarPlaceholder: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarActionsCol: {
      flex: 1,
      gap: 8,
    },
    avatarActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2D2824',
      paddingVertical: 9,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#3E3832',
      gap: 8,
    },
    avatarActionBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      marginTop: 10,
      marginBottom: 6,
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
    vehiclePillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    vehiclePill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    vehiclePillActive: {
      backgroundColor: '#1E1B18',
      borderColor: '#1E1B18',
    },
    vehiclePillText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    vehiclePillTextActive: {
      color: '#FFC72C',
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
    docItemCard: {
      backgroundColor: '#26221E',
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: '#38322B',
      marginBottom: 14,
    },
    docHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    docTitleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    docItemTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    uploadedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(16, 185, 129, 0.18)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.4)',
    },
    uploadedBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#10B981',
    },
    requiredBadge: {
      backgroundColor: 'rgba(239, 68, 68, 0.18)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    requiredBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#EF4444',
    },
    optionalBadge: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.35)',
    },
    optionalBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#F59E0B',
    },
    docPreviewWrap: {
      position: 'relative',
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#4A423A',
      marginBottom: 10,
      backgroundColor: '#1E1B18',
    },
    docPreviewImg: {
      width: '100%',
      height: 140,
      resizeMode: 'cover',
    },
    docRemoveBtn: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(239, 68, 68, 0.88)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    docRemoveBtnText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
    },
    docPlaceholder: {
      height: 100,
      backgroundColor: '#1C1917',
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: '#3E3832',
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
      gap: 6,
    },
    docPlaceholderText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '600',
    },
    docActionRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 10,
    },
    docActionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#302A24',
      paddingVertical: 9,
      paddingHorizontal: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#483F37',
      gap: 6,
    },
    docActionBtnText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },
    docInputLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
      marginBottom: 4,
    },
    applyKycBtn: {
      backgroundColor: '#2563EB',
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
    },
    applyKycBtnText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 13,
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
