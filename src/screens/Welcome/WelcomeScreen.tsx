import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Placeholder (Heart Fork/Spoon) */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoIcon}>🍽️</Text>
        </View>
        
        {/* YUMQUICK Typography */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandYum}>YUM</Text>
          <Text style={styles.brandQuick}>QUICK</Text>
        </View>

        {/* Description Text */}
        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.signupButton} onPress={handleSignUp} activeOpacity={0.8}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary, // Deep orange background from mockup, becomes main primary
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoPlaceholder: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: colors.secondary, // Yellow border for logo on orange bg
    borderRadius: 75,
  },
  logoIcon: {
    fontSize: 50,
  },
  brandContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  brandYum: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.secondary, // Yellow color for YUM
    letterSpacing: 1,
  },
  brandQuick: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF', // White color
    letterSpacing: 1,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  loginButton: {
    backgroundColor: colors.secondary, // Yellow button
    width: '80%',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: colors.primary, // Orange text
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: colors.surface, // Very light cream button or surface
    width: '80%',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signupButtonText: {
    color: colors.primary, // Orange text
    fontSize: 16,
    fontWeight: 'bold',
  },
});

