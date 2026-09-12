import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useUser } from '../../context/UserContext';
import Icons from '../../constants/icons';

type LaunchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Launch'>;

export default function LaunchScreen() {
  const navigation = useNavigation<LaunchScreenNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { isAuthenticated, checkingAuth, role } = useUser();

  // Track whether the minimum splash duration has elapsed
  const [minSplashDone, setMinSplashDone] = useState(false);
  // Prevent double-navigation on re-renders
  const hasNavigated = useRef(false);

  // Start the minimum 2.5s splash timer once on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinSplashDone(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Navigate only when BOTH conditions are met:
  //   1. Minimum splash time has elapsed (minSplashDone)
  //   2. Auth check is complete (!checkingAuth)
  useEffect(() => {
    if (!minSplashDone || checkingAuth || hasNavigated.current) {
      return;
    }
    hasNavigated.current = true;
    if (isAuthenticated) {
      if (role === 'shopkeeper') {
        navigation.replace('ShopkeeperDashboard');
      } else if (role === 'delivery_man') {
        navigation.replace('DeliveryDashboard');
      } else {
        navigation.replace('MainTabs');
      }
    } else {
      navigation.replace('Welcome');
    }
  }, [minSplashDone, checkingAuth, isAuthenticated, role, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1C132B" />
      {/* Decorative background shapes */}
      <View style={styles.circleDecorator1} />
      <View style={styles.circleDecorator2} />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={Icons.logo} style={styles.logoImage} />
        </View>
        <Text style={styles.tagline}>Fresh meals delivered in snaps</Text>
      </View>
    </SafeAreaView>
  );
}


const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1C132B', // Deep brand theme
    },
    circleDecorator1: {
      position: 'absolute',
      top: -100,
      right: -100,
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: 'rgba(232, 93, 34, 0.1)',
    },
    circleDecorator2: {
      position: 'absolute',
      bottom: -150,
      left: -150,
      width: 400,
      height: 400,
      borderRadius: 200,
      backgroundColor: 'rgba(247, 198, 83, 0.08)',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    logoContainer: {
      width: 160,
      height: 160,
      borderRadius: 36,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0)',
    },
    logoImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    tagline: {
      fontSize: 15,
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: 10,
      fontWeight: '600',
      letterSpacing: 0.4,
    },
  });
