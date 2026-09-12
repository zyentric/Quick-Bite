import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';

type CancelSuccessNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CancelSuccess'>;

export default function CancelSuccessScreen() {
  const navigation = useNavigation<CancelSuccessNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const handleBack = () => {
    // Go back to the orders list
    navigation.navigate('MyOrders');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBackground} />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          onPress={handleBack}
        >
          <Image source={require('../../../assets/back.png')} style={{ width: 24, height: 24, resizeMode: 'contain', tintColor: colors.primary }} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.innerDot} />
        </View>
        <Text style={styles.title}>Order Cancelled!</Text>
        <Text style={styles.subtitle}>Your order has been successfully{'\n'}cancelled</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          If you have any question reach directly to our{'\n'}customer support
        </Text>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground, // Yellow background across the whole screen
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 10,
    alignSelf: 'flex-start',
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: colors.primary, // Orange outline
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  innerDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text, // Usually dark text in mockup
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingBottom: 80, // Padding to avoid bottom tab bar
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
  }
});
