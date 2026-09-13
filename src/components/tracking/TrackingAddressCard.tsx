import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LocationPinIcon } from '../icons';
import { useThemeColors, ThemeColors } from '../../theme/colors';

interface TrackingAddressCardProps {
  addressString: string;
}

export default function TrackingAddressCard({ addressString }: TrackingAddressCardProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.cardSection}>
      <Text style={styles.cardSectionTitle}>Delivery Address</Text>
      <View style={styles.addressCard}>
        <LocationPinIcon size={20} color={colors.primary} />
        <View style={styles.addressInfoCol}>
          <Text style={styles.addressTitle}>Home / Delivery Location</Text>
          <Text style={styles.addressDesc}>{addressString}</Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    cardSection: {
      backgroundColor: '#FFFFFF',
      borderRadius: 22,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#F1F3F5',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    cardSectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 14,
    },
    addressCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#F9FAFB',
      borderRadius: 14,
      padding: 12,
      gap: 10,
    },
    addressInfoCol: {
      flex: 1,
    },
    addressTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 2,
    },
    addressDesc: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 16,
    },
  });
