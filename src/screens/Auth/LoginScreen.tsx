import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
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
  FingerprintIcon,
  MailIcon,
  LockIcon,
} from '../../components/VectorIcons';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setRole, setUserId, saveTokens } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

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

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      showCustomAlert('Required Fields', 'Please enter your email and password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showCustomAlert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        showCustomAlert('Login Error', resData.message || 'Invalid credentials');
        return;
      }

      // Persist tokens and update auth state atomically
      await saveTokens(resData.accessToken, resData.refreshToken || '');

      // Set role and userId
      const userRole = (resData.user?.role || 'customer').toLowerCase();
      await setRole(userRole as any);
      await setUserId(resData.user?.id || resData.user?._id);

      const targetRoute =
        userRole === 'shopkeeper'
          ? 'ShopkeeperDashboard'
          : userRole === 'delivery_man'
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
      <CustomLoader visible={loading} message="Signing in..." />

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
          <Text style={styles.headerTitle}>Sign In</Text>
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
                <Text style={styles.welcomeTitle}>Welcome Back</Text>
                <Text style={styles.welcomeDesc}>
                  Sign in to your QuickBite account
                </Text>
              </View>
              <View style={styles.brandIconMini}>
                <Image source={Icons.logo} style={styles.miniLogoImg} />
              </View>
            </View>

            {/* Email Field */}
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

            {/* Password Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
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
                  placeholder="Enter your password"
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

              <View style={styles.forgotAndRememberRow}>
                <TouchableOpacity
                  style={styles.rememberMeRow}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxActive,
                    ]}
                  >
                    {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberMeText}>Remember Me</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('SetPassword')}
                  style={styles.forgotPasswordContainer}
                >
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>

            {/* Biometric & Social Options */}
            <View style={styles.fingerprintSection}>
              <Text style={styles.orText}>or use fingerprint</Text>
              <TouchableOpacity
                onPress={() =>
                  showCustomAlert(
                    'Biometric Login',
                    'Fingerprint and FaceID authentication enabled in your device settings.'
                  )
                }
                style={styles.fingerprintButton}
                activeOpacity={0.7}
              >
                <FingerprintIcon color={colors.primary} size={28} />
              </TouchableOpacity>
            </View>

            {/* Social Logins with Official High-Res Icons */}
            <View style={styles.socialSection}>
              <Text style={styles.orText}>or continue with</Text>
              <View style={styles.socialIconsRow}>
                <TouchableOpacity
                  onPress={() =>
                    showCustomAlert(
                      'Google Authentication',
                      'Google One-Tap sign-in will connect your account securely.'
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
                      'Facebook Authentication',
                      'Facebook sign-in will connect your account securely.'
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

            {/* Sign Up Prompt */}
            <View style={styles.signupPromptContainer}>
              <Text style={styles.signupPromptText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupPromptLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
      marginBottom: 24,
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
      marginBottom: 18,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      letterSpacing: 0.2,
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
    inputIconWrapper: {
      width: 28,
      height: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    input: {
      flex: 1,
      height: 50,
      color: colors.inputText,
      fontSize: 15,
      fontWeight: '500',
    },
    eyeIcon: {
      padding: 8,
    },
    forgotAndRememberRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    rememberMeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
    rememberMeText: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '600',
    },
    forgotPasswordContainer: {},
    forgotPassword: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    loginButton: {
      backgroundColor: colors.primary,
      borderRadius: 25,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    fingerprintSection: {
      alignItems: 'center',
      marginBottom: 20,
    },
    orText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '500',
      marginBottom: 10,
    },
    fingerprintButton: {
      width: 52,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 26,
      backgroundColor: 'rgba(232, 93, 34, 0.1)',
      borderWidth: 1.5,
      borderColor: 'rgba(232, 93, 34, 0.25)',
    },
    socialSection: {
      alignItems: 'center',
      marginBottom: 26,
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
    signupPromptContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    signupPromptText: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '500',
    },
    signupPromptLink: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '800',
    },
  });
