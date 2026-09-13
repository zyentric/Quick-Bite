import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { useAppTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';
import { DocumentIcon, ShieldCheckIcon, LockIcon } from '../../../components/icons';
import AppFooter from '../../../components/common/AppFooter';

type SettingsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const { themePreference, setThemePreference } = useAppTheme();
  const { logout } = useUser();
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action is permanent and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ]
    );
  };

  const accountSettings = [
    {
      id: 'notifications',
      title: 'Notification Setting',
      subtitle: 'Order updates, offers & alerts',
      icon: require('../../../assets/notification.png'),
      onPress: () => navigation.navigate('NotificationSetting'),
    },
    {
      id: 'password',
      title: 'Password Setting',
      subtitle: 'Change or reset your password',
      icon: require('../../../assets/keysetting.png'),
      onPress: () => navigation.navigate('PasswordSetting'),
    },
  ];

  const legalSettings = [
    {
      id: 'terms',
      title: 'Terms & Conditions',
      subtitle: 'User agreement, ordering & refund terms',
      type: 'terms',
      onPress: () => navigation.navigate('TermsAndConditions'),
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'Data protection, GPS & privacy rights',
      type: 'privacy',
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Image source={require('../../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity
          style={styles.themeButton}
          onPress={() => setThemeModalVisible(true)}
          activeOpacity={0.8}
        >
          <Image source={require('../../../assets/settings.png')} style={styles.themeIconImg} />
        </TouchableOpacity>
      </View>

      {/* Theme Selector Modal */}
      <Modal
        visible={themeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setThemeModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Theme</Text>

            {(['light', 'dark', 'system'] as const).map((pref) => (
              <TouchableOpacity
                key={pref}
                style={[
                  styles.themeOption,
                  themePreference === pref && { backgroundColor: colors.primary + '20' },
                ]}
                onPress={() => {
                  setThemePreference(pref);
                  setThemeModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: colors.text },
                    themePreference === pref && { color: colors.primary, fontWeight: 'bold' },
                  ]}
                >
                  {pref.charAt(0).toUpperCase() + pref.slice(1)} {pref === 'system' && 'Default'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section: Account & Security */}
          <Text style={styles.sectionLabel}>Account & Security</Text>
          <View style={styles.sectionBox}>
            {accountSettings.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  style={styles.settingRow}
                  activeOpacity={0.7}
                  onPress={item.onPress}
                >
                  <View style={styles.iconCircle}>
                    <Image source={item.icon} style={styles.settingIconImg} />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Image source={require('../../../assets/next.png')} style={styles.chevronImg} />
                </TouchableOpacity>
                {index < accountSettings.length - 1 && <View style={styles.rowDivider} />}
              </React.Fragment>
            ))}
          </View>

          {/* Section: Legal & Policies */}
          <Text style={styles.sectionLabel}>Legal & Compliance</Text>
          <View style={styles.sectionBox}>
            {legalSettings.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  style={styles.settingRow}
                  activeOpacity={0.7}
                  onPress={item.onPress}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: item.type === 'privacy' ? '#ECFDF5' : '#EFF6FF' },
                    ]}
                  >
                    {item.type === 'privacy' ? (
                      <ShieldCheckIcon size={20} color="#10B981" />
                    ) : (
                      <DocumentIcon size={18} color="#3B82F6" />
                    )}
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Image source={require('../../../assets/next.png')} style={styles.chevronImg} />
                </TouchableOpacity>
                {index < legalSettings.length - 1 && <View style={styles.rowDivider} />}
              </React.Fragment>
            ))}
          </View>

          {/* Section: Danger Zone */}
          <Text style={styles.sectionLabel}>Account Management</Text>
          <View style={styles.sectionBox}>
            <TouchableOpacity
              style={styles.settingRow}
              activeOpacity={0.7}
              onPress={handleDeleteAccount}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Image
                  source={require('../../../assets/user.png')}
                  style={[styles.settingIconImg, { tintColor: '#DC2626' }]}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: '#DC2626' }]}>Delete Account</Text>
                <Text style={styles.settingSubtitle}>Permanently remove account & data</Text>
              </View>
              <Image
                source={require('../../../assets/next.png')}
                style={[styles.chevronImg, { tintColor: '#DC2626' }]}
              />
            </TouchableOpacity>
          </View>

          {/* App Footer & Copyright */}
          <AppFooter bottomSpacing={20} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
      paddingBottom: 25,
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
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    themeButton: {
      padding: 10,
    },
    themeIconImg: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '80%',
      borderRadius: 16,
      padding: 20,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    themeOption: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginBottom: 8,
    },
    themeOptionText: {
      fontSize: 15,
      textAlign: 'center',
    },
    contentContainer: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      overflow: 'hidden',
      paddingTop: 24,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 80,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 10,
      marginTop: 8,
      marginLeft: 4,
    },
    sectionBox: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      paddingHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#F3F4F6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFF4EB',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    settingIconImg: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
      tintColor: colors.primary,
    },
    settingTextContainer: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    settingSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
    },
    chevronImg: {
      width: 14,
      height: 14,
      resizeMode: 'contain',
      tintColor: colors.textMuted,
      opacity: 0.6,
    },
    rowDivider: {
      height: 1,
      backgroundColor: '#F3F4F6',
    },
    versionContainer: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 10,
    },
    versionText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      marginBottom: 2,
    },
    versionSubText: {
      fontSize: 10,
      color: colors.textMuted,
      opacity: 0.7,
    },
  });
