import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { EyeIcon, EyeOffIcon } from '../../../components/VectorIcons';

type PasswordSettingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PasswordSetting'>;

export default function PasswordSettingScreen() {
  const navigation = useNavigation<PasswordSettingNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [currentPassword, setCurrentPassword] = useState('**************');
  const [newPassword, setNewPassword] = useState('**************');
  const [confirmPassword, setConfirmPassword] = useState('**************');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Password Setting</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.textInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeIconContainer}>
                {showCurrent ? <EyeIcon color={colors.primary} size={20} /> : <EyeOffIcon color={colors.primary} size={20} />}
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.textInput}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIconContainer}>
                {showNew ? <EyeIcon color={colors.primary} size={20} /> : <EyeOffIcon color={colors.primary} size={20} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIconContainer}>
                {showConfirm ? <EyeIcon color={colors.primary} size={20} /> : <EyeOffIcon color={colors.primary} size={20} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.changeBtn} onPress={handleChangePassword}>
              <Text style={styles.changeBtnText}>Change Password</Text>
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
    backgroundColor: colors.primaryBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rightPlaceholder: {
    width: 40, 
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    paddingTop: 40,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 80, 
  },
  formGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground, // Light yellow
    borderRadius: 15,
  },
  textInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.inputText,
    fontWeight: '500',
  },
  eyeIconContainer: {
    paddingHorizontal: 15,
  },
  eyeIcon: {
    color: colors.primary,
    fontSize: 18,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: colors.primary, // Orange
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  changeBtn: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  changeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
