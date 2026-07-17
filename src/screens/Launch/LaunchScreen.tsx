import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';

type LaunchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Launch'>;

export default function LaunchScreen() {
  const navigation = useNavigation<LaunchScreenNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  useEffect(() => {
    // Automatically navigate to Welcome screen after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative premium gold background shapes */}
      <View style={styles.circleDecorator1} />
      <View style={styles.circleDecorator2} />

      <View style={styles.content}>
        {/* Premium Gold Logo Outline */}
        <View style={styles.logoOutline}>
          <View style={styles.logoInner}>
            <Text style={styles.logoIcon}>🍔</Text>
          </View>
        </View>
        
        {/* DIGGY Branding Typography */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandTextPrimary}>DI</Text>
          <Text style={styles.brandTextSecondary}>GGY</Text>
        </View>
        
        <Text style={styles.tagline}>Fresh meals delivered in snaps</Text>
      </View>
    </SafeAreaView>
  );
}


const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B18', // Deep Charcoal
  },
  circleDecorator1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 199, 44, 0.05)', // Translucent Gold
  },
  circleDecorator2: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(232, 93, 34, 0.03)', // Translucent Orange
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoOutline: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#FFC72C', // Gold
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    padding: 6,
  },
  logoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#E85D22', // Brand Orange
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 45,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextPrimary: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFC72C', // Gold
    letterSpacing: 2,
  },
  brandTextSecondary: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF', // White
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#A0A0A0',
    marginTop: 10,
    fontWeight: '500',
    letterSpacing: 1,
  },
});

