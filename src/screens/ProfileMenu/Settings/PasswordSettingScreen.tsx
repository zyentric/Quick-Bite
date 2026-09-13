import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { EyeIcon, EyeOffIcon } from '../../../components/VectorIcons';
import { LockIcon } from '../../../components/icons';
import { authFetch } from '../../../utils/authFetch';
import { API_URL } from '../../../config/api';
import CustomAlert from '../../../components/CustomAlert';
import AppFooter from '../../../components/common/AppFooter';

type PasswordSettingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PasswordSetting'>;

export default function PasswordSettingScreen() {
  const navigation = useNavigation<PasswordSettingNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert('Required Fields', 'Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      showAlert('Weak Password', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Mismatch', 'New password and confirmation do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/users/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert('Error', data.message || 'Failed to change password.');
        return;
      }
      showAlert('Success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBackground} />

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => {
          setAlertVisible(false);
          if (alertTitle === 'Success') navigation.goBack();
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Settings'))}
          activeOpacity={0.8}
        >
          <Image source={require('../../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Password Setting</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Security Banner Card */}
          <View style={styles.securityBanner}>
            <View style={styles.securityIconCircle}>
              <LockIcon size={20} color={colors.primary} />
            </View>
            <View style={styles.securityTextContainer}>
              <Text style={styles.securityTitle}>Secure Your Account</Text>
              <Text style={styles.securitySub}>
                Use at least 6 characters with a combination of letters, numbers, and symbols.
              </Text>
            </View>
          </View>

          {/* Form Group Box */}
          <Text style={styles.sectionLabel}>Update Password</Text>
          <View style={styles.sectionBox}>
            {/* Current Password */}
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.textMuted}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrent}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowCurrent(!showCurrent)}
                  style={styles.eyeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showCurrent ? <EyeIcon color={colors.primary} size={20} /> : <EyeOffIcon color={colors.textMuted} size={20} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* New Password */}
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Min 6 characters"
                  placeholderTextColor={colors.textMuted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNew}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowNew(!showNew)}
                  style={styles.eyeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showNew ? <EyeIcon color={colors.primary} size={20} /> : <EyeOffIcon color={colors.textMuted} size={20} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* Confirm New Password */}
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Re-enter new password"
                  placeholderTextColor={colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  style={styles.eyeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showConfirm ? <EyeIcon color={colors.primary} size={20} /> : <EyeOffIcon color={colors.textMuted} size={20} />}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleChangePassword}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Update Password</Text>
            )}
          </TouchableOpacity>

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
      paddingBottom: 60,
    },
    securityBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF4EB',
      borderRadius: 18,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.2)',
    },
    securityIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    securityTextContainer: {
      flex: 1,
    },
    securityTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 2,
    },
    securitySub: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 15,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 10,
      marginTop: 4,
      marginLeft: 4,
    },
    sectionBox: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 6,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#F3F4F6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    inputBlock: {
      paddingVertical: 12,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 46,
    },
    textInput: {
      flex: 1,
      fontSize: 14,
      color: colors.inputText,
      fontWeight: '500',
    },
    eyeBtn: {
      padding: 4,
    },
    rowDivider: {
      height: 1,
      backgroundColor: '#F3F4F6',
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      paddingVertical: 15,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
      marginBottom: 20,
    },
    saveBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
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
