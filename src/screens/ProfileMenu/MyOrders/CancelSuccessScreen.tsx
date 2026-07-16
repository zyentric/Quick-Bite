import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {/* Using a placeholder for the large orange circle with dot */}
          <Text style={styles.iconPlaceholder}>🔘</Text> 
        </View>
        <Text style={styles.title}>¡Order Cancelled!</Text>
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
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
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
  iconPlaceholder: {
    fontSize: 40,
    color: colors.primary,
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
