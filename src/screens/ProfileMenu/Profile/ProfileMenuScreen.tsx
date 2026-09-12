import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Modal,
  Linking,
  PermissionsAndroid,
  Platform,
  StatusBar,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { useUser } from '../../../context/UserContext';
import Icons from '../../../constants/icons';
import { APP_VERSION, APP_CONFIG } from '../../../constants/appConfig';

const CURRENT_VERSION = APP_VERSION;

// Compare semantic versions: returns true if remote > local
const isNewerVersion = (remote: string, local: string): boolean => {
  const toNums = (v: string) => v.replace(/^v/, '').split('.').map(Number);
  const r = toNums(remote);
  const l = toNums(local);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const ri = r[i] ?? 0;
    const li = l[i] ?? 0;
    if (ri > li) return true;
    if (ri < li) return false;
  }
  return false;
};

const { width } = Dimensions.get('window');

type ProfileMenuNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProfileMenu'>;

const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export default function ProfileMenuScreen() {
  const navigation = useNavigation<ProfileMenuNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { logout, userProfile: profile, isAuthenticated } = useUser();

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState(CURRENT_VERSION);
  const [updateUrl, setUpdateUrl] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  // In-app update download modal
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'done' | 'error'>('idle');

  // Check update on mount
  useEffect(() => {
    checkUpdate(false);
  }, []);

  const checkUpdate = async (openModalOnDone = false) => {
    setIsCheckingUpdate(true);
    try {
      const res = await fetch('https://api.github.com/repos/zyentric/Quick-Bite/releases/latest', {
        headers: { 'User-Agent': 'QuickBiteApp/1.0' },
      });
      if (res.ok) {
        const data = await res.json();
        const tag = data.tag_name || '';
        const cleanedTag = tag.replace(/^v/, '');
        setLatestVersion(cleanedTag || CURRENT_VERSION);
        setReleaseNotes(data.body || 'Performance improvements and bug fixes.');

        const assets = data.assets || [];
        const apkAsset = assets.find((a: any) => a.name.endsWith('.apk'));
        if (apkAsset && apkAsset.browser_download_url) {
          setUpdateUrl(apkAsset.browser_download_url);
        } else {
          setUpdateUrl(data.html_url || 'https://github.com/zyentric/Quick-Bite/releases');
        }

        if (cleanedTag && isNewerVersion(cleanedTag, CURRENT_VERSION)) {
          setUpdateAvailable(true);
        } else {
          setUpdateAvailable(false);
        }
      }
    } catch (err) {
      console.log('Failed to check latest GitHub release:', err);
    } finally {
      setIsCheckingUpdate(false);
      if (openModalOnDone) {
        setDownloadState('idle');
        setDownloadProgress(0);
        setUpdateModalVisible(true);
      }
    }
  };

  const handleSystemUpdatePress = () => {
    checkUpdate(true);
  };

  const handleDownloadUpdate = async () => {
    if (!updateUrl) {
      Linking.openURL('https://github.com/zyentric/Quick-Bite/releases');
      return;
    }

    if (!updateUrl.endsWith('.apk')) {
      Linking.openURL(updateUrl);
      return;
    }

    if (Platform.OS === 'android') {
      try {
        if (Number(Platform.Version) < 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'Allow QuickBite to save the update APK to your device.',
              buttonPositive: 'Allow',
              buttonNegative: 'Cancel',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Linking.openURL(updateUrl);
            return;
          }
        }
      } catch (e) {
        console.warn('Permission error:', e);
      }
    }

    setDownloadState('downloading');
    setDownloadProgress(0);

    try {
      const response = await fetch(updateUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      setDownloadProgress(50);
      await response.arrayBuffer();

      setDownloadProgress(100);
      setDownloadState('done');
    } catch (err: any) {
      console.log('Download error:', err);
      setDownloadState('error');
      Linking.openURL(updateUrl);
    }
  };

  const handleLogoutPress = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    try {
      setLogoutModalVisible(false);
      await logout();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        })
      );
    } catch (e) {
      console.error('Logout error:', e);
      navigation.navigate('Welcome');
    }
  };

  const generalItems = [
    { id: 'orders', title: 'My Orders', icon: Icons.order, action: () => navigation.navigate('MyOrders') },
    { id: 'profile', title: 'My Profile', icon: Icons.myProfile, action: () => navigation.navigate('MyProfile') },
    { id: 'address', title: 'Delivery Address', icon: Icons.location, action: () => navigation.navigate('DeliveryAddress') },
    { id: 'payments', title: 'Payment Methods', icon: Icons.card, action: () => navigation.navigate('PaymentMethods') },
  ];

  const profileItems = [
    { id: 'settings', title: 'Settings', icon: Icons.settings, action: () => navigation.navigate('Settings') },
    { id: 'help', title: 'Help & FAQs', icon: Icons.support, action: () => navigation.navigate('HelpCenter') },
    { id: 'contact', title: 'Contact Us', icon: Icons.contacts, action: () => navigation.navigate('HelpCenter') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Top Brand Curved Header Banner */}
        <View style={styles.headerBanner}>
        {/* Top bar with Brand Title and Close (X) button */}
        <View style={styles.topBarRow}>
          <View style={styles.brandRow}>
            <Image source={Icons.logo} style={styles.brandLogo} />
            <Text style={styles.brandTitle}>QuickBite</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* User Info Avatar + Name + Subtitle */}
        <View style={styles.userProfileSection}>
          <View style={styles.avatarWrapper}>
            {profile?.profilePicture ? (
              <Image source={{ uri: profile.profilePicture }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{getInitials(profile?.name || 'User')}</Text>
              </View>
            )}
          </View>
          <Text style={styles.userName} numberOfLines={1}>
            {profile?.name || (isAuthenticated ? 'Food Lover' : 'Guest User')}
          </Text>
          <Text style={styles.userSubtitle} numberOfLines={1}>
            {isAuthenticated ? (profile?.email || 'Ready for good food.') : 'Sign in to explore exclusive perks'}
          </Text>
        </View>
      </View>

      {/* Menu Body Sections */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section: General */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeading}>General</Text>
          {generalItems.map((item) => {
            const isSelected = activeItemId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuRow, isSelected && styles.menuRowActive]}
                activeOpacity={0.75}
                onPress={() => {
                  setActiveItemId(item.id);
                  item.action();
                }}
              >
                <Image
                  source={item.icon}
                  style={[styles.menuIcon, { tintColor: isSelected ? colors.primary : colors.text }]}
                />
                <Text
                  style={[styles.menuTitle, { color: colors.text }, isSelected && styles.menuTitleActive]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section: Profile & Preferences */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeading}>Profile</Text>
          {profileItems.map((item) => {
            const isSelected = activeItemId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuRow, isSelected && styles.menuRowActive]}
                activeOpacity={0.75}
                onPress={() => {
                  setActiveItemId(item.id);
                  item.action();
                }}
              >
                <Image
                  source={item.icon}
                  style={[styles.menuIcon, { tintColor: isSelected ? colors.primary : colors.text }]}
                />
                <Text
                  style={[styles.menuTitle, { color: colors.text }, isSelected && styles.menuTitleActive]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* System Update Menu Item */}
          <TouchableOpacity
            style={[styles.menuRow, activeItemId === 'update' && styles.menuRowActive]}
            activeOpacity={0.75}
            onPress={() => {
              setActiveItemId('update');
              handleSystemUpdatePress();
              
            }}
          >
            <Image
              source={require('../../../assets/cloud.png')}
              style={[
                styles.menuIcon,
                { tintColor: activeItemId === 'update' ? colors.primary : colors.text },
              ]}
            />
            <Text
              style={[
                styles.menuTitle,
                { color: colors.text },
                activeItemId === 'update' && styles.menuTitleActive,
              ]}
            >
              System Update
            </Text>

            {isCheckingUpdate ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
            ) : (
              <View style={[styles.badgeContainer, updateAvailable && styles.badgeContainerHighlight]}>
                <Text style={[styles.badgeText, updateAvailable && styles.badgeTextHighlight]}>
                  {updateAvailable ? `v${latestVersion} Available!` : `v${CURRENT_VERSION}`}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Out / Sign In Action Row */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.signOutRow}
            activeOpacity={0.75}
            onPress={handleLogoutPress}
          >
            <Image source={Icons.logout} style={styles.signOutIcon} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setLogoutModalVisible(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure you want{'\n'}to sign out?</Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnConfirm}
                onPress={confirmLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnConfirmText}>Yes, sign out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* In-App System Update Modal */}
      <Modal
        visible={isUpdateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setUpdateModalVisible(false);
          setDownloadState('idle');
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback
            onPress={() => {
              setUpdateModalVisible(false);
              setDownloadState('idle');
            }}
          >
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.updateModalContent}>
            <View style={styles.updateModalHeader}>
              <Image source={require('../../../assets/cloud.png')} style={styles.updateModalIconImg} />
              <Text style={styles.updateModalTitle}>
                {updateAvailable ? 'Update Available' : 'App is Up to Date'}
              </Text>
              <Text style={styles.updateModalVersion}>
                {updateAvailable
                  ? `v${CURRENT_VERSION} → v${latestVersion}`
                  : `QuickBite v${CURRENT_VERSION} (Latest)`}
              </Text>
            </View>

            {releaseNotes ? (
              <ScrollView style={styles.releaseNotesScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.releaseNotesLabel}>Release Information</Text>
                <Text style={styles.releaseNotesText}>
                  {releaseNotes.slice(0, 400)}
                  {releaseNotes.length > 400 ? '...' : ''}
                </Text>
              </ScrollView>
            ) : null}

            {downloadState === 'downloading' && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${downloadProgress}%` as any }]} />
                </View>
                <Text style={styles.progressLabel}>{downloadProgress}% Downloading...</Text>
              </View>
            )}

            {downloadState === 'done' && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '100%', backgroundColor: '#4CAF50' }]} />
                </View>
                <Text style={[styles.progressLabel, { color: '#4CAF50' }]}>
                  Download complete! Open your Downloads folder to install.
                </Text>
              </View>
            )}

            {downloadState === 'error' && (
              <Text style={styles.errorText}>Direct download failed. Opening browser instead...</Text>
            )}

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => {
                  setUpdateModalVisible(false);
                  setDownloadState('idle');
                  setDownloadProgress(0);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnCancelText}>
                  {updateAvailable ? 'Later' : 'Close'}
                </Text>
              </TouchableOpacity>

              {updateAvailable && downloadState !== 'done' && (
                <TouchableOpacity
                  style={[styles.modalBtnConfirm, downloadState === 'downloading' && { opacity: 0.6 }]}
                  disabled={downloadState === 'downloading'}
                  onPress={handleDownloadUpdate}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalBtnConfirmText}>
                    {downloadState === 'downloading'
                      ? `${downloadProgress}% Downloading`
                      : 'Download APK'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerBanner: {
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 42,
      borderBottomRightRadius: 42,
      paddingTop: Platform.OS === 'ios' ? 8 : 12,
      paddingBottom: 26,
      paddingHorizontal: 22,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 8,
    },
    topBarRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    brandLogo: {
      width: 28,
      height: 28,
      borderRadius: 7,
      marginRight: 8,
      resizeMode: 'contain',
    },
    brandTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.4,
    },
    closeButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    userProfileSection: {
      alignItems: 'center',
      marginTop: 4,
    },
    avatarWrapper: {
      width: 68,
      height: 68,
      borderRadius: 34,
      borderWidth: 3,
      borderColor: '#FFFFFF',
      overflow: 'hidden',
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarInitial: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.primary,
    },
    userName: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 3,
    },
    userSubtitle: {
      fontSize: 13,
      color: 'rgba(255, 255, 255, 0.85)',
      fontWeight: '500',
    },
    scrollContent: {
      paddingHorizontal: 22,
      paddingTop: 24,
      paddingBottom: 40,
    },
    menuSection: {
      marginBottom: 22,
    },
    sectionHeading: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 10,
      marginLeft: 4,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 22,
      marginBottom: 6,
    },
    menuRowActive: {
      backgroundColor: colors.surface,
      borderWidth: 1.2,
      borderColor: colors.border,
    },
    menuIcon: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
      marginRight: 14,
    },
    menuTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
    },
    menuTitleActive: {
      fontWeight: '700',
    },
    badgeContainer: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    badgeContainerHighlight: {
      backgroundColor: '#FFF3E0',
      borderColor: colors.primary,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    badgeTextHighlight: {
      color: colors.primary,
    },
    signOutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 22,
    },
    signOutIcon: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
      tintColor: '#FF5A5F',
      marginRight: 14,
    },
    signOutText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FF5A5F',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      backgroundColor: colors.surface,
      width: '90%',
      padding: 26,
      borderRadius: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 10,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    modalButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 12,
    },
    modalBtnCancel: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
    },
    modalBtnCancelText: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 14,
    },
    modalBtnConfirm: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
    },
    modalBtnConfirmText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
    updateModalContent: {
      backgroundColor: colors.surface,
      width: '92%',
      borderRadius: 24,
      padding: 24,
      maxHeight: '80%',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 10,
    },
    updateModalHeader: {
      alignItems: 'center',
      marginBottom: 16,
    },
    updateModalIconImg: {
      width: 48,
      height: 48,
      resizeMode: 'contain',
      tintColor: colors.primary,
      marginBottom: 10,
    },
    updateModalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    updateModalVersion: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '700',
      backgroundColor: '#FFF3E0',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
      overflow: 'hidden',
    },
    releaseNotesScroll: {
      maxHeight: 120,
      marginBottom: 16,
    },
    releaseNotesLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    releaseNotesText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 20,
    },
    progressContainer: {
      marginBottom: 16,
    },
    progressBar: {
      height: 10,
      backgroundColor: colors.border,
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: 10,
      backgroundColor: colors.primary,
      borderRadius: 10,
    },
    progressLabel: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      fontWeight: '600',
    },
    errorText: {
      fontSize: 13,
      color: '#FF5A5F',
      textAlign: 'center',
      marginBottom: 16,
    },
  });
