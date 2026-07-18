import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Dimensions, Modal, Linking, PermissionsAndroid, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { useUser } from '../../../context/UserContext';
import CustomAlert from '../../../components/CustomAlert';
import Icons from '../../../constants/icons';

const CURRENT_VERSION = '1.0.0'; // Updated by CI/CD on each build

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

const menuItems = [
  { id: '1', title: 'My Orders',        icon: Icons.order,     screen: 'Orders' },
  { id: '2', title: 'My Profile',       icon: Icons.myProfile,  screen: 'ProfileMenu' },
  { id: '3', title: 'Delivery Address', icon: Icons.location,   screen: 'ProfileMenu' },
  { id: '4', title: 'Payment Methods',  icon: Icons.card,       screen: 'ProfileMenu' },
  { id: '5', title: 'Contact Us',       icon: Icons.contacts,   screen: 'ProfileMenu' },
  { id: '6', title: 'Help & FAQs',      icon: Icons.support,    screen: 'ProfileMenu' },
  { id: '7', title: 'Settings',         icon: Icons.settings,   screen: 'ProfileMenu' },
];

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
  const { logout, userProfile: profile } = useUser();

  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');
  const [updateUrl, setUpdateUrl] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');

  // In-app update download modal
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0); // 0–100
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'done' | 'error'>('idle');

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/zyentric/Quick-Bite/releases/latest', {
          headers: { 'User-Agent': 'QuickBiteApp/1.0' }
        });
        if (res.ok) {
          const data = await res.json();
          const tag = data.tag_name || '';
          const cleanedTag = tag.replace(/^v/, '');
          setLatestVersion(cleanedTag);
          setReleaseNotes(data.body || '');

          const assets = data.assets || [];
          const apkAsset = assets.find((a: any) => a.name.endsWith('.apk'));
          if (apkAsset && apkAsset.browser_download_url) {
            setUpdateUrl(apkAsset.browser_download_url);
          } else {
            setUpdateUrl(data.html_url || 'https://github.com/zyentric/Quick-Bite/releases');
          }

          if (cleanedTag && isNewerVersion(cleanedTag, CURRENT_VERSION)) {
            setUpdateAvailable(true);
          }
        }
      } catch (err) {
        console.log('Failed to check latest GitHub release:', err);
      }
    };
    checkUpdate();
  }, []);

  const handleDownloadUpdate = async () => {
    if (!updateUrl) return;

    // If no direct APK URL, fall back to browser
    if (!updateUrl.endsWith('.apk')) {
      Linking.openURL(updateUrl);
      return;
    }

    if (Platform.OS === 'android') {
      try {
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
          showAlert('Permission Denied', 'Storage permission is needed to download the update.');
          return;
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

      // React Native's fetch polyfill does not expose response.body as a
      // ReadableStream, so streaming via getReader() is not supported.
      // Use arrayBuffer() instead, which works in React Native.
      setDownloadProgress(50); // show progress while buffer is being received
      await response.arrayBuffer();

      setDownloadProgress(100);
      setDownloadState('done');
    } catch (err: any) {
      console.log('Download error:', err);
      setDownloadState('error');
    }
  };



  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    // Clear all stored tokens and reset auth state before navigating
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* The main container has a light peach background.
          The left side has the back button. */}
      
      <View style={styles.leftColumn}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>
      </View>

      {/* The large curved orange container */}
      <View style={styles.rightCurvedContainer}>
        
        {/* User Info Header */}
        <View style={styles.userInfoSection}>
          {profile?.profilePicture ? (
            <Image 
              source={{ uri: profile.profilePicture }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={[styles.avatar, styles.avatarInitialsContainer]}>
              <Text style={styles.avatarInitialsText}>
                {getInitials(profile?.name || 'User')}
              </Text>
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{profile?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{profile?.email || 'user@example.com'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuScrollContent}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem} 
              activeOpacity={0.7}
              onPress={() => {
                if (item.screen === 'Orders') {
                  navigation.navigate('MyOrders');
                } else if (item.screen === 'ProfileMenu' && item.title === 'My Profile') {
                  navigation.navigate('MyProfile');
                } else if (item.screen === 'ProfileMenu' && item.title === 'Delivery Address') {
                  navigation.navigate('DeliveryAddress');
                } else if (item.screen === 'ProfileMenu' && item.title === 'Payment Methods') {
                  navigation.navigate('PaymentMethods');
                } else if (item.screen === 'ProfileMenu' && item.title === 'Contact Us') {
                  navigation.navigate('HelpCenter');
                } else if (item.screen === 'ProfileMenu' && item.title === 'Help & FAQs') {
                  navigation.navigate('HelpCenter');
                } else if (item.screen === 'ProfileMenu' && item.title === 'Settings') {
                  navigation.navigate('Settings');
                } else {
                  console.log('Navigate to', item.screen);
                }
              }}
            >
              <View style={styles.iconContainer}>
                <Image source={item.icon} style={styles.menuIconImg} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <View style={styles.separator} />
              </View>
            </TouchableOpacity>
          ))}

          {/* System Update */}
          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7} 
            onPress={() => {
              if (updateAvailable) {
                setDownloadState('idle');
                setDownloadProgress(0);
                setUpdateModalVisible(true);
              } else {
                showAlert('Up to Date', `QuickBite v${CURRENT_VERSION} is the latest version.`);
              }
            }}
          >
            <View style={styles.iconContainer}>
              <Image source={require('../../../assets/cloud.png')} style={{ width: 24, height: 24, tintColor: colors.primary, resizeMode: 'contain' }} />
            </View>
            <View style={styles.menuTextContainer}>
              <View style={styles.updateTextRow}>
                <Text style={styles.menuTitle}>System Update</Text>
                <Text style={[styles.versionValue, updateAvailable && styles.versionValueUpdate]}>
                  {updateAvailable ? `v${latestVersion} available!` : `v${CURRENT_VERSION} (Latest)`}
                </Text>
              </View>
              <View style={styles.separator} />
            </View>
          </TouchableOpacity>

          {/* Log Out */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handleLogout}>
            <View style={styles.iconContainer}>
              <Image source={Icons.logout} style={{ width: 24, height: 24, tintColor: colors.primary }} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Log Out</Text>
              <View style={styles.separator} />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Logout Modal */}
      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure you want{'\n'}to log out?</Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={confirmLogout}>
                <Text style={styles.modalBtnConfirmText}>Yes, logout</Text>
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
      >
        <View style={styles.modalOverlay}>
          <View style={styles.updateModalContent}>
            {/* Header */}
            <View style={styles.updateModalHeader}>
              <Text style={styles.updateModalEmoji}>🚀</Text>
              <Text style={styles.updateModalTitle}>Update Available</Text>
              <Text style={styles.updateModalVersion}>v{CURRENT_VERSION} → v{latestVersion}</Text>
            </View>

            {/* Release Notes */}
            {releaseNotes ? (
              <ScrollView style={styles.releaseNotesScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.releaseNotesLabel}>What's new</Text>
                <Text style={styles.releaseNotesText}>{releaseNotes.slice(0, 400)}{releaseNotes.length > 400 ? '...' : ''}</Text>
              </ScrollView>
            ) : null}

            {/* Progress Bar */}
            {downloadState === 'downloading' && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${downloadProgress}%` as any }]} />
                </View>
                <Text style={styles.progressLabel}>{downloadProgress}%  Downloading...</Text>
              </View>
            )}

            {downloadState === 'done' && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '100%', backgroundColor: '#4CAF50' }]} />
                </View>
                <Text style={[styles.progressLabel, { color: '#4CAF50' }]}>✅  Download complete! Open your Downloads folder to install.</Text>
              </View>
            )}

            {downloadState === 'error' && (
              <Text style={styles.errorText}>❌ Download failed. Opening in browser instead...</Text>
            )}

            {/* Action Buttons */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => {
                  setUpdateModalVisible(false);
                  setDownloadState('idle');
                  setDownloadProgress(0);
                }}
              >
                <Text style={styles.modalBtnCancelText}>
                  {downloadState === 'done' ? 'Close' : 'Later'}
                </Text>
              </TouchableOpacity>

              {downloadState !== 'done' && (
                <TouchableOpacity
                  style={[styles.modalBtnConfirm, downloadState === 'downloading' && { opacity: 0.6 }]}
                  disabled={downloadState === 'downloading'}
                  onPress={handleDownloadUpdate}
                >
                  <Text style={styles.modalBtnConfirmText}>
                    {downloadState === 'downloading' ? `${downloadProgress}% Downloading` :
                     downloadState === 'error' ? 'Open Browser' : '⬇ Download APK'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert 
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDD7C4', // Light peach/orange background from mockup
    flexDirection: 'row', // Align left column and right container side-by-side
  },
  leftColumn: {
    width: width * 0.15, // 15% width for the back button area
    paddingTop: 40,
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
  },
  backIconImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  rightCurvedContainer: {
    flex: 1, // Takes up the remaining 85% width
    backgroundColor: colors.primary, // Solid orange background
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    overflow: 'hidden',
    paddingTop: 60, // Padding from top
    paddingBottom: 20,
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarInitialsContainer: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitialsText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
  },
  menuScrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 60, // Space for the bottom decorator
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15, // Spacing between items
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuIconImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  menuTextContainer: {
    flex: 1,
    justifyContent: 'center',
    height: 40, // Match icon height for perfect alignment
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Thin white line
    width: '100%',
  },
  updateModalContent: {
    backgroundColor: '#fff',
    width: '92%',
    borderRadius: 24,
    marginBottom: 40,
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  updateModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  updateModalEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  updateModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  updateModalVersion: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  releaseNotesScroll: {
    maxHeight: 120,
    marginBottom: 16,
  },
  releaseNotesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  releaseNotesText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#F0F0F0',
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
    color: '#555',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 30,
    borderRadius: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: colors.inputBackground, // Light peach/yellow
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalBtnConfirm: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalBtnConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  updateTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 15,
  },
  versionValue: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
  },
  versionValueUpdate: {
    color: '#FFE082',
  },
});
