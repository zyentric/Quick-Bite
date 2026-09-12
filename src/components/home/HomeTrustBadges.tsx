import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { FastDeliveryIcon, ShieldCheckIcon, CreditCardIcon } from '../icons';

export default function HomeTrustBadges() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <View style={styles.iconWrapper}>
          <FastDeliveryIcon size={20} color={colors.primary} />
        </View>
        <Text style={styles.title}>Superfast</Text>
        <Text style={styles.subtitle}>Live GPS Tracking</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <View style={styles.iconWrapper}>
          <ShieldCheckIcon size={20} color="#10B981" />
        </View>
        <Text style={styles.title}>100% Safe</Text>
        <Text style={styles.subtitle}>Hygienic Kitchens</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <View style={styles.iconWrapper}>
          <CreditCardIcon size={20} color="#3B82F6" />
        </View>
        <Text style={styles.title}>Easy Pay</Text>
        <Text style={styles.subtitle}>UPI & Cards</Text>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: '#FFFDF5',
      marginHorizontal: 20,
      marginTop: 8,
      paddingVertical: 14,
      paddingHorizontal: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#FCE7A6',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    item: {
      alignItems: 'center',
      flex: 1,
    },
    iconWrapper: {
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    title: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      fontSize: 9,
      color: colors.textMuted,
      fontWeight: '500',
    },
    divider: {
      width: 1,
      height: 28,
      backgroundColor: '#F7D055',
      opacity: 0.5,
    },
  });
