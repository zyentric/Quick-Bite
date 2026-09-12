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
} from '../../components/VectorIcons';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

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

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [role, setRoleState] = useState<'customer' | 'shopkeeper' | 'delivery_man'>('customer');
  const [secureText, setSecureText] = useState(true);
  const [confirmSecureText, setConfirmSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  // Custom Alert Modal States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const colors = useThemeColors();
  const styles = getStyles(colors);

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
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

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

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
            <Image
              source={Icons.back}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>

        {/* Bottom Card Section */}
        <View style={styles.cardSection}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.titleHeaderRow}>
              <View>
                <Text style={styles.welcomeTitle}>Join QuickBite</Text>
                <Text style={styles.welcomeDesc}>
                  Select your role to start your culinary journey
                </Text>
              </View>
              <View style={styles.brandIconMini}>
                <Image source={Icons.logo} style={styles.miniLogoImg} />
              </View>
            </View>

            {/* Role Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>I am joining as a</Text>
              <View style={styles.roleSelectorContainer}>
                {[
                  { id: 'customer', title: 'Customer', subtitle: 'Food Lover' },
                  { id: 'shopkeeper', title: 'Shopkeeper', subtitle: 'Restaurant' },
                  { id: 'delivery_man', title: 'Delivery Hero', subtitle: 'Earn & Deliver' },
                ].map((item) => {
                  const isSelected = role === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.roleOption,
                        isSelected && styles.roleOptionSelected,
                      ]}
                      onPress={() => setRoleState(item.id as any)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.roleTitle,
                          isSelected && styles.roleTitleSelected,
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.roleSubtitle,
                          isSelected && styles.roleSubtitleSelected,
                        ]}
                      >
                        {item.subtitle}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'name' && styles.inputContainerFocused,
                ]}
              >
                <View style={styles.inputIconWrapper}>
                  <Image source={Icons.user} style={styles.inputLeadingIcon} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'email' && styles.inputContainerFocused,
                ]}
              >
                <View style={styles.inputIconWrapper}>
                  <MailIcon color={focusedField === 'email' ? colors.primary : '#999'} size={18} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Mobile Number with Country Code */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mobile Number (Optional)</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'mobile' && styles.inputContainerFocused,
                ]}
              >
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
                <View style={styles.dividerLine} />
                <TextInput
                  style={styles.input}
                  placeholder="98765 43210"
                  placeholderTextColor={colors.textMuted}
                  value={mobile}
                  onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ''))}
                  onFocus={() => setFocusedField('mobile')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date of Birth (Optional)</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'dob' && styles.inputContainerFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="DD / MM / YYYY"
                  placeholderTextColor={colors.textMuted}
                  value={dob}
                  onChangeText={handleDobChange}
                  onFocus={() => setFocusedField('dob')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="number-pad"
                  maxLength={14}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password (Min 6 chars)</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'password' && styles.inputContainerFocused,
                ]}
              >
                <View style={styles.inputIconWrapper}>
                  <LockIcon color={focusedField === 'password' ? colors.primary : '#999'} size={18} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Create a strong password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={secureText}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setSecureText(!secureText)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {secureText ? (
                    <EyeOffIcon color={colors.primary} size={22} />
                  ) : (
                    <EyeIcon color={colors.primary} size={22} />
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
                  focusedField === 'confirmPassword' && styles.inputContainerFocused,
                  passwordsMismatch && styles.inputContainerError,
                ]}
              >
                <View style={styles.inputIconWrapper}>
                  <LockIcon color={focusedField === 'confirmPassword' ? colors.primary : '#999'} size={18} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor={colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={confirmSecureText}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setConfirmSecureText(!confirmSecureText)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {confirmSecureText ? (
                    <EyeOffIcon color={colors.primary} size={22} />
                  ) : (
                    <EyeIcon color={colors.primary} size={22} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.termsText}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </Text>

            {/* Create Account Button */}
            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignUp}
              activeOpacity={0.85}
            >
              <Text style={styles.signupButtonText}>Create Account</Text>
            </TouchableOpacity>

            {/* Social Options with Real Google and Facebook Icons */}
            <View style={styles.socialSection}>
              <Text style={styles.orText}>or sign up with</Text>
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
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
      height: 56,
      paddingHorizontal: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    backButton: {
      position: 'absolute',
      left: 16,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      zIndex: 10,
    },
    backIcon: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    cardSection: {
      flex: 1,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
      paddingHorizontal: 24,
      paddingTop: 28,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.14,
      shadowRadius: 14,
      elevation: 6,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    titleHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    welcomeTitle: {
      fontSize: 26,
      fontWeight: '900',
      color: colors.text,
      letterSpacing: 0.2,
      marginBottom: 4,
    },
    welcomeDesc: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
    },
    brandIconMini: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: 'rgba(232, 93, 34, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.2)',
    },
    miniLogoImg: {
      width: 46,
      height: 46,
      resizeMode: 'contain',
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      letterSpacing: 0.2,
    },
    confirmHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    matchIndicatorSuccess: {
      fontSize: 11,
      fontWeight: '700',
      color: '#10B981',
      marginBottom: 8,
    },
    matchIndicatorError: {
      fontSize: 11,
      fontWeight: '700',
      color: '#EF4444',
      marginBottom: 8,
    },
    roleSelectorContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 6,
    },
    roleOption: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 6,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    roleOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    roleTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    roleTitleSelected: {
      color: '#FFFFFF',
    },
    roleSubtitle: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
      textAlign: 'center',
    },
    roleSubtitleSelected: {
      color: 'rgba(255, 255, 255, 0.85)',
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
    inputContainerFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    inputContainerError: {
      borderColor: '#EF4444',
    },
    inputIconWrapper: {
      width: 28,
      height: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    inputLeadingIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      tintColor: '#999',
    },
    input: {
      flex: 1,
      height: 48,
      color: colors.inputText,
      fontSize: 15,
      fontWeight: '500',
    },
    eyeIcon: {
      padding: 8,
    },
    countryPickerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 8,
    },
    countryTagBadge: {
      backgroundColor: 'rgba(232, 93, 34, 0.12)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      marginRight: 6,
    },
    countryTagText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
    },
    countryPickerBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    dividerLine: {
      width: 1,
      height: 24,
      backgroundColor: colors.border,
      marginRight: 10,
    },
    termsText: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 18,
      textAlign: 'center',
      marginVertical: 14,
    },
    signupButton: {
      backgroundColor: colors.primary,
      borderRadius: 25,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
    signupButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    socialSection: {
      alignItems: 'center',
      marginBottom: 24,
    },
    orText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '500',
      marginBottom: 10,
    },
    socialIconsRow: {
      flexDirection: 'row',
      gap: 14,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 20,
      paddingVertical: 12,
      paddingHorizontal: 22,
      minWidth: 130,
      justifyContent: 'center',
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    socialIconImg: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
    },
    socialButtonText: {
      fontSize: 14,
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
      fontSize: 14,
      fontWeight: '500',
    },
    loginPromptLink: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '800',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    modalContent: {
      backgroundColor: colors.surface,
      width: '100%',
      maxHeight: '65%',
      borderRadius: 24,
      padding: 22,
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
      marginBottom: 16,
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
      paddingVertical: 3,
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
      color: colors.primary,
    },
    modalCloseBtn: {
      backgroundColor: colors.inputBackground,
      borderRadius: 20,
      paddingVertical: 12,
      alignItems: 'center',
    },
    modalCloseBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
  });
