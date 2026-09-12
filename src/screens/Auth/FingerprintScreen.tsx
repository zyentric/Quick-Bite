import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { FingerprintIcon } from '../../components/VectorIcons';

const { height } = Dimensions.get('window');

type FingerprintScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Fingerprint'>;

export default function FingerprintScreen() {
  const navigation = useNavigation<FingerprintScreenNavigationProp>();
  const [isActive, setIsActive] = useState(false);

  const colors = useThemeColors();
  const styles = getStyles(colors);

  const handleContinue = () => {
    navigation.replace('MainTabs');
  };

  const handleSkip = () => {
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBackground} />
      {/* Top Section */}
      <View style={styles.topSection}>
        <TouchableOpacity 
          style={styles.backButton} 
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          onPress={() => navigation.goBack()}
        >
          <Image source={require('../../assets/back.png')} style={{ width: 24, height: 24, resizeMode: 'contain', tintColor: colors.primary }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Your Fingerprint</Text>
      </View>

      {/* Bottom Card Section */}
      <View style={styles.cardSection}>
        <Text style={styles.description}>
          Add fingerprint authentication for faster and more secure login. Your biometric data never leaves your device.
        </Text>

        <TouchableOpacity 
          style={styles.fingerprintContainer} 
          onPress={() => setIsActive(!isActive)}
          activeOpacity={0.9}
        >
          <FingerprintIcon 
            color={isActive ? colors.primary : '#ccc'} 
            size={120} 
          />
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.8}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>

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
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 50,
  },
  fingerprintContainer: {
    width: 200,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  fingerprintIcon: {
    fontSize: 120,
    opacity: 0.3, // Inactive state
  },
  fingerprintIconActive: {
    opacity: 1, // Active state
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  skipButton: {
    backgroundColor: colors.inputBackground, // Light background for skip
    paddingVertical: 15,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
