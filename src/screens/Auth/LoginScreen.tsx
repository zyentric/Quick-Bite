import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';

import { useUser } from '../../context/UserContext';
import CustomAlert from '../../components/CustomAlert';
import CustomLoader from '../../components/CustomLoader';
import { API_URL } from '../../config/api';

import { EyeIcon, EyeOffIcon, FingerprintIcon, GoogleIcon, FacebookIcon } from '../../components/VectorIcons';

const { height } = Dimensions.get('window');

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setRole, setUserId, setIsAuthenticated, saveTokens } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

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
    if (!email || !password) {
      showCustomAlert('Required Fields', 'Please enter your email and password');
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
          email,
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
      await setRole(resData.user.role || 'customer');
      await setUserId(resData.user.id || resData.user._id);
      navigation.replace('MainTabs');
    } catch (error: any) {
      showCustomAlert('Network Issue', 'Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Reusable Custom Loader */}
      <CustomLoader visible={loading} message="Logging In..." />

      {/* Reusable Custom Alert Modal */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      {/* Top Section */}
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log In</Text>
      </View>

      {/* Bottom Card Section */}
      <View style={styles.cardSection}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.welcomeTitle}>Welcome</Text>
          <Text style={styles.welcomeDesc}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>

          {/* Form */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email or Mobile Number</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input}
                placeholder="example@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input}
                placeholder="**************"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureText}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setSecureText(!secureText)}>
                {secureText ? <EyeOffIcon color={colors.primary} size={20} /> : <EyeIcon color={colors.primary} size={20} />}
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('SetPassword')} style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPassword}>Forgot Password</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          <View style={styles.fingerprintSection}>
            <Text style={styles.orText}>or</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Fingerprint')} style={styles.fingerprintButton}>
              <FingerprintIcon color={colors.primary} size={28} />
            </TouchableOpacity>
          </View>

          <View style={styles.socialSection}>
            <Text style={styles.orText}>or sign up with</Text>
            <View style={styles.socialIconsRow}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <GoogleIcon size={18} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <FacebookIcon size={18} />
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.signupPromptContainer}>
            <Text style={styles.signupPromptText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signupPromptLink}>Sign Up</Text>
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
    backgroundColor: colors.primaryBackground, // Yellow bg
  },
  topSection: {
    height: height * 0.15,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: -30, // Adjust centering
  },
  cardSection: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  welcomeDesc: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground, // Light yellow/gray from mockup
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 50,
    color: colors.inputText,
    fontSize: 15,
  },
  eyeIcon: {
    padding: 10,
  },
  eyeIconText: {
    fontSize: 16,
    color: colors.primary,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPassword: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fingerprintSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  orText: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 10,
  },
  fingerprintButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: 'rgba(232, 93, 34, 0.1)', // Light orange tint
  },
  fingerprintIcon: {
    fontSize: 24,
  },
  socialSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  socialIconsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
    justifyContent: 'center',
  },
  socialButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  signupPromptContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupPromptText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  signupPromptLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
