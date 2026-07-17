import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useUser } from '../../context/UserContext';
import CustomAlert from '../../components/CustomAlert';
import CustomLoader from '../../components/CustomLoader';
import { API_URL } from '../../config/api';

import AsyncStorage from '../../utils/storage';
import { EyeIcon, EyeOffIcon, GoogleIcon, FacebookIcon } from '../../components/VectorIcons';

const { height } = Dimensions.get('window');

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { setRole, setUserId, setIsAuthenticated } = useUser();
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [role, setRoleState] = useState<'customer' | 'shopkeeper' | 'delivery_man'>('customer');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState({ code: '+91', name: 'India', flag: '🇮🇳' });
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const COUNTRY_CODES = [
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+1', name: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+971', name: 'UAE', flag: '🇦🇪' },
    { code: '+65', name: 'Singapore', flag: '🇸🇬' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
  ];

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.country_calling_code) {
            const code = data.country_calling_code.startsWith('+') 
              ? data.country_calling_code 
              : `+${data.country_calling_code}`;
            
            const flag = data.country ? getFlagEmoji(data.country) : '🌐';
            setSelectedCountry({
              code,
              name: data.country_name || 'Detected',
              flag
            });
          }
        }
      } catch (err) {
        console.log('Failed to detect country code, default to India (+91):', err);
      }
    };
    detectCountry();
  }, []);

  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

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

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      showCustomAlert('Required Fields', 'Please fill in Name, Email, and Password');
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
          name: fullName,
          email: email,
          password: password,
          role: role,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        showCustomAlert('Registration Error', resData.message || 'Registration failed');
        return;
      }

      // Save token to AsyncStorage
      if (resData.accessToken) {
        await AsyncStorage.setItem('userToken', resData.accessToken);
        if (resData.refreshToken) {
          await AsyncStorage.setItem('refreshToken', resData.refreshToken);
        }
      }

      await setRole(role);
      await setUserId(resData.user?.id || resData.user?._id || null);
      await setIsAuthenticated(true);
      navigation.navigate('Fingerprint');
    } catch (error: any) {
      showCustomAlert('Network Issue', 'Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Reusable Custom Loader */}
      <CustomLoader visible={loading} message="Creating Account..." />

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
        <Text style={styles.headerTitle}>New Account</Text>
      </View>

      {/* Bottom Card Section */}
      <View style={styles.cardSection}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Role</Text>
            <View style={styles.roleSelectorContainer}>
              {(['customer', 'shopkeeper', 'delivery_man'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleOption,
                    role === r && styles.roleOptionSelected,
                  ]}
                  onPress={() => setRoleState(r)}
                >
                  <Text
                    style={[
                      styles.roleText,
                      role === r && styles.roleTextSelected,
                    ]}
                  >
                    {r === 'customer' ? 'Customer' : r === 'shopkeeper' ? 'Shopkeeper' : 'Delivery Man'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full name</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
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
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
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
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.countryPickerBtn} onPress={() => setCountryModalVisible(true)}>
                <Text style={styles.countryPickerBtnText}>{selectedCountry.flag} {selectedCountry.code}</Text>
                <Text style={styles.countryPickerDropdownArrow}>▼</Text>
              </TouchableOpacity>
              <View style={styles.dividerLine} />
              <TextInput 
                style={styles.input}
                placeholder="123 456 789"
                placeholderTextColor={colors.textMuted}
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date of birth</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input}
                placeholder="DD / MM / YYYY"
                placeholderTextColor={colors.textMuted}
                value={dob}
                onChangeText={setDob}
              />
            </View>
          </View>

          <Text style={styles.termsText}>
            By continuing, you agree to{'\n'}Terms of Use and Privacy Policy.
          </Text>

          <TouchableOpacity style={styles.signupButton} onPress={handleSignUp} activeOpacity={0.8}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>

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

          <View style={styles.loginPromptContainer}>
            <Text style={styles.loginPromptText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginPromptLink}>Log in</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
      {/* Country Picker Modal */}
      <Modal
        visible={countryModalVisible}
        transparent={true}
        animationType="slide"
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
                >
                  <Text style={styles.countryRowText}>
                    {item.flag}  {item.name} ({item.code})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setCountryModalVisible(false)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground, 
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
    marginTop: -30, 
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
  formGroup: {
    marginBottom: 15,
  },
  roleSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 4,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleOptionSelected: {
    backgroundColor: colors.primary,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  roleTextSelected: {
    color: '#FFFFFF',
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
    backgroundColor: colors.inputBackground, 
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 45,
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
  termsText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 20,
  },
  signupButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  orText: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 10,
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
    fontWeight: 'bold',
    color: colors.text,
  },
  loginPromptContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPromptText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  loginPromptLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  countryPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  countryPickerBtnText: {
    fontSize: 15,
    color: colors.inputText,
    fontWeight: '600',
  },
  countryPickerDropdownArrow: {
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: 4,
  },
  dividerLine: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '85%',
    maxHeight: '70%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  modalScroll: {
    width: '100%',
  },
  countryRow: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    width: '100%',
  },
  countryRowText: {
    fontSize: 15,
    color: '#333',
  },
  modalCloseBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  modalCloseBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
