import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useUser } from '../../context/UserContext';
import CustomAlert from '../../components/CustomAlert';
import CustomLoader from '../../components/CustomLoader';
import { API_URL } from '../../config/api';
import Icons from '../../constants/icons';

import {
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  LockIcon,
  UserIcon,
  StoreIcon,
  BikeIcon,
  CheckIcon,
} from '../../components/VectorIcons';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

type RoleType = 'customer' | 'shopkeeper' | 'delivery_man';

interface RoleOption {
  key: RoleType;
  title: string;
  subtitle: string;
  badge: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    key: 'customer',
    title: 'Customer',
    subtitle: 'Order food from nearby kitchens within 10 km',
    badge: 'Foodie',
  },
  {
    key: 'shopkeeper',
    title: 'Restaurant',
    subtitle: 'Register your kitchen and receive incoming orders',
    badge: 'Partner',
  },
  {
    key: 'delivery_man',
    title: 'Delivery Hero',
    subtitle: 'Accept local pickup tasks and earn on your schedule',
    badge: 'Rider',
  },
];

const COUNTRY_CODES = [
  { code: '+91', name: 'India', tag: 'IN' },
  { code: '+1', name: 'USA / Canada', tag: 'US' },
  { code: '+44', name: 'United Kingdom', tag: 'UK' },
  { code: '+61', name: 'Australia', tag: 'AU' },
  { code: '+971', name: 'UAE / Dubai', tag: 'AE' },
  { code: '+65', name: 'Singapore', tag: 'SG' },
  { code: '+49', name: 'Germany', tag: 'DE' },
  { code: '+33', name: 'France', tag: 'FR' },
];

export default function SignUpScreen() {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { setRole, setUserId, saveTokens } = useUser();

  const [role, setRoleState] = useState<RoleType>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [secureText, setSecureText] = useState(true);
  const [confirmSecureText, setConfirmSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  // Custom Alert Modal States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const colors = useThemeColors();
  const styles = getStyles(colors);

  const activeRoleData = ROLE_OPTIONS.find((r) => r.key === role) || ROLE_OPTIONS[0];
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const showCustomAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleDobChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.substring(0, 2) + ' / ' + cleaned.substring(2);
    }
    if (cleaned.length > 4) {
      formatted = cleaned.substring(0, 2) + ' / ' + cleaned.substring(2, 4) + ' / ' + cleaned.substring(4, 8);
    }
    setDob(formatted);
  };

  const handleSignUp = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      showCustomAlert('Required Fields', 'Please fill in all required fields.');
      return;
    }

    if (!isEmailValid) {
      showCustomAlert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      showCustomAlert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      showCustomAlert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      showCustomAlert('Terms Required', 'Please accept the Terms of Service to proceed.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password: password,
          role: role,
          phone: mobile ? `${selectedCountry.code} ${mobile}` : undefined,
          dob: dob || undefined,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        showCustomAlert('Registration Error', resData.message || 'Registration failed');
        return;
      }

      // Persist tokens and update auth state atomically
      if (resData.accessToken) {
        await saveTokens(resData.accessToken, resData.refreshToken || '');
      }

      await setRole(role as any);
      await setUserId(resData.user?.id || resData.user?._id || null);

      const targetRoute =
        role === 'shopkeeper'
          ? 'ShopkeeperDashboard'
          : role === 'delivery_man'
          ? 'DeliveryDashboard'
          : 'MainTabs';

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: targetRoute }],
        })
      );
    } catch (error: any) {
      showCustomAlert('Network Issue', 'Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <CustomLoader visible={loading} message="Creating Account..." />

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header */}
        <View style={styles.topSection}>
          <TouchableOpacity
            style={styles.backButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Welcome');
              }
            }}
          >
            <Image source={Icons.back} style={styles.backIcon} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Join the QuickBite Network</Text>
          </View>

          <View style={styles.brandIconMiniHeader}>
            <Image source={Icons.logo} style={styles.miniLogoHeaderImg} />
          </View>
        </View>

        {/* Bottom Card Section */}
        <View style={styles.cardSection}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Role Tabs */}
            <View style={styles.roleTabsContainer}>
              {ROLE_OPTIONS.map((opt) => {
                const isSelected = role === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.roleTab, isSelected && styles.roleTabActive]}
                    onPress={() => setRoleState(opt.key)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.roleTabIconRow}>
                      {opt.key === 'customer' ? (
                        <UserIcon color={isSelected ? '#FFFFFF' : colors.textMuted} size={16} />
                      ) : opt.key === 'shopkeeper' ? (
                        <StoreIcon color={isSelected ? '#FFFFFF' : colors.textMuted} size={16} />
                      ) : (
                        <BikeIcon color={isSelected ? '#FFFFFF' : colors.textMuted} size={16} />
                      )}
                      <Text
                        style={[
                          styles.roleTabText,
                          isSelected && styles.roleTabTextActive,
                        ]}
                      >
                        {opt.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Context Header */}
            <View style={styles.contextHeader}>
              <View style={styles.contextTitleRow}>
                <Text style={styles.welcomeTitle}>Sign Up as {activeRoleData.title}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{activeRoleData.badge}</Text>
                </View>
              </View>
              <Text style={styles.welcomeDesc}>{activeRoleData.subtitle}</Text>
            </View>

            {/* Full Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconWrapper}>
                  <UserIcon color={colors.primary} size={18} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor={colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  selectionColor={colors.primary}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Email Address</Text>
                {isEmailValid && (
                  <View style={styles.validBadge}>
                    <CheckIcon color="#10B981" size={14} />
                    <Text style={styles.validBadgeText}>Valid</Text>
                  </View>
                )}
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconWrapper}>
                  <MailIcon color={colors.primary} size={18} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor={colors.primary}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Mobile Number with Country Code */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mobile Number (Optional)</Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.countryPickerBtn}
                  onPress={() => setCountryModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.countryTagBadge}>
                    <Text style={styles.countryTagText}>{selectedCountry.tag}</Text>
                  </View>
                  <Text style={styles.countryPickerBtnText}>{selectedCountry.code}</Text>
                </TouchableOpacity>
                <View style={styles.dividerPipe} />
                <TextInput
                  style={styles.input}
                  placeholder="98765 43210"
                  placeholderTextColor={colors.textMuted}
                  value={mobile}
                  onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  selectionColor={colors.primary}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date of Birth (Optional)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { paddingLeft: 4 }]}
                  placeholder="DD / MM / YYYY"
                  placeholderTextColor={colors.textMuted}
                  value={dob}
                  onChangeText={handleDobChange}
                  keyboardType="number-pad"
                  maxLength={14}
                  selectionColor={colors.primary}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password (Min 6 chars)</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconWrapper}>
                  <LockIcon color={colors.primary} size={18} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Create a strong password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureText}
                  autoCapitalize="none"
                  selectionColor={colors.primary}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setSecureText(!secureText)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {secureText ? (
                    <EyeOffIcon color={colors.primary} size={20} />
                  ) : (
                    <EyeIcon color={colors.primary} size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.formGroup}>
              <View style={styles.confirmHeaderRow}>
                <Text style={styles.label}>Confirm Password</Text>
                {passwordsMatch && (
                  <Text style={styles.matchIndicatorSuccess}>Passwords match</Text>
                )}
                {passwordsMismatch && (
                  <Text style={styles.matchIndicatorError}>Passwords don't match</Text>
                )}
              </View>
              <View
                style={[
                  styles.inputContainer,
                  passwordsMismatch && styles.inputContainerError,
                ]}
              >
                <View style={styles.inputIconWrapper}>
                  <LockIcon color={colors.primary} size={18} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor={colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={confirmSecureText}
                  autoCapitalize="none"
                  selectionColor={colors.primary}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setConfirmSecureText(!confirmSecureText)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {confirmSecureText ? (
                    <EyeOffIcon color={colors.primary} size={20} />
                  ) : (
                    <EyeIcon color={colors.primary} size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms of Service Agreement */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the QuickBite Terms of Service and Privacy Policy.
              </Text>
            </TouchableOpacity>

            {/* Create Account Button */}
            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignUp}
              activeOpacity={0.85}
            >
              <Text style={styles.signupButtonText}>Create {activeRoleData.title} Account</Text>
            </TouchableOpacity>

            {/* Social Options */}
            <View style={styles.socialSection}>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>or register with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialIconsRow}>
                <TouchableOpacity
                  onPress={() =>
                    showCustomAlert(
                      'Google Sign Up',
                      'Google registration will be enabled in an upcoming release.'
                    )
                  }
                  style={styles.socialButton}
                  activeOpacity={0.8}
                >
                  <Image source={Icons.google} style={styles.socialIconImg} />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    showCustomAlert(
                      'Facebook Sign Up',
                      'Facebook registration will be enabled in an upcoming release.'
                    )
                  }
                  style={styles.socialButton}
                  activeOpacity={0.8}
                >
                  <Image source={Icons.facebook} style={styles.socialIconImg} />
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Prompt */}
            <View style={styles.loginPromptContainer}>
              <Text style={styles.loginPromptText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.loginPromptLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal
        visible={countryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Country Code</Text>
            <ScrollView style={styles.modalScroll}>
              {COUNTRY_CODES.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.countryRow}
                  onPress={() => {
                    setSelectedCountry(item);
                    setCountryModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalTagBadge}>
                    <Text style={styles.modalTagText}>{item.tag}</Text>
                  </View>
                  <Text style={styles.countryRowName}>{item.name}</Text>
                  <Text style={styles.countryRowCode}>{item.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setCountryModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary,
    },
    topSection: {
      height: 64,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    backIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
    headerCenter: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    headerSubtitle: {
      fontSize: 11,
      color: 'rgba(255, 255, 255, 0.85)',
      fontWeight: '600',
      marginTop: 2,
    },
    brandIconMiniHeader: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    miniLogoHeaderImg: {
      width: 32,
      height: 32,
      resizeMode: 'contain',
    },
    cardSection: {
      flex: 1,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: 22,
      paddingTop: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.12,
      shadowRadius: 14,
      elevation: 6,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    roleTabsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      padding: 4,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    roleTab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    roleTabActive: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    roleTabIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    roleTabText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    roleTabTextActive: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
    contextHeader: {
      marginBottom: 18,
    },
    contextTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    welcomeTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: colors.text,
      letterSpacing: 0.2,
    },
    roleBadge: {
      backgroundColor: 'rgba(232, 93, 34, 0.12)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.25)',
    },
    roleBadgeText: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    welcomeDesc: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    formGroup: {
      marginBottom: 16,
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
      letterSpacing: 0.2,
    },
    validBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    validBadgeText: {
      fontSize: 11,
      color: '#10B981',
      fontWeight: '700',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      paddingHorizontal: 14,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    inputContainerError: {
      borderColor: colors.error,
    },
    inputIconWrapper: {
      width: 26,
      height: 26,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    input: {
      flex: 1,
      height: 48,
      color: colors.inputText,
      fontSize: 14,
      fontWeight: '600',
    },
    eyeIcon: {
      padding: 6,
    },
    countryPickerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingRight: 8,
      gap: 6,
    },
    countryTagBadge: {
      backgroundColor: colors.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    countryTagText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.text,
    },
    countryPickerBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    dividerPipe: {
      width: 1,
      height: 24,
      backgroundColor: colors.border,
      marginRight: 10,
    },
    confirmHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    matchIndicatorSuccess: {
      fontSize: 11,
      fontWeight: '700',
      color: '#10B981',
    },
    matchIndicatorError: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.error,
    },
    termsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 4,
      marginBottom: 16,
    },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
    },
    checkboxActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkmark: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '900',
      lineHeight: 12,
    },
    termsText: {
      flex: 1,
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 16,
      fontWeight: '500',
    },
    signupButton: {
      backgroundColor: colors.primary,
      borderRadius: 24,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
    signupButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    socialSection: {
      marginBottom: 20,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    orText: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
      marginHorizontal: 12,
    },
    socialIconsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    socialButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 18,
      paddingVertical: 11,
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    socialIconImg: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
    },
    socialButtonText: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '700',
    },
    loginPromptContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loginPromptText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '500',
    },
    loginPromptLink: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '800',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalContent: {
      width: '100%',
      maxHeight: 400,
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalScroll: {
      maxHeight: 260,
    },
    countryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTagBadge: {
      backgroundColor: 'rgba(232, 93, 34, 0.1)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginRight: 10,
    },
    modalTagText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
    },
    countryRowName: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    countryRowCode: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textMuted,
    },
    modalCloseBtn: {
      marginTop: 16,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 16,
      alignItems: 'center',
    },
    modalCloseBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
  });
