import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { EyeIcon, EyeOffIcon } from '../../components/VectorIcons';

const { height } = Dimensions.get('window');

type SetPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SetPassword'>;

export default function SetPasswordScreen() {
  const navigation = useNavigation<SetPasswordScreenNavigationProp>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const colors = useThemeColors();
  const styles = getStyles(colors);

  const handleCreatePassword = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBackground} />
      {/* Top Section */}
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
          <Image source={require('../../assets/back.png')} style={{ width: 24, height: 24, resizeMode: 'contain', tintColor: colors.primary }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Password</Text>
      </View>

      {/* Bottom Card Section */}
      <View style={styles.cardSection}>
        <Text style={styles.description}>
          Create a strong password for your account. Use at least 6 characters including letters and numbers.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input}
              placeholder="**************"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={securePassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setSecurePassword(!securePassword)}>
              {securePassword ? <EyeOffIcon color={colors.primary} size={20} /> : <EyeIcon color={colors.primary} size={20} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input}
              placeholder="**************"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={secureConfirmPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}>
              {secureConfirmPassword ? <EyeOffIcon color={colors.primary} size={20} /> : <EyeIcon color={colors.primary} size={20} />}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreatePassword} activeOpacity={0.8}>
          <Text style={styles.createButtonText}>Create New Password</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground, 
  },
  topSection: {
    height: 56,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cardSection: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 40,
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
    backgroundColor: colors.inputBackground, 
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
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
