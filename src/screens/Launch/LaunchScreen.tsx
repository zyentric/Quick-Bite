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
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground, 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: colors.primary,
    borderRadius: 75,
  },
  logoIcon: {
    fontSize: 50,
  },
  brandContainer: {
    flexDirection: 'row',
  },
  brandYum: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary, 
    letterSpacing: 1,
  },
  brandQuick: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF', // Always white according to mockup logic
    letterSpacing: 1,
  },
});

