import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import {
  DeliveryBikeIcon,
  PackageIcon,
  ClockHistoryIcon,
} from '../icons/DeliveryIcons';
import { DeliveryTabType } from './DeliveryTabs';

interface DeliveryEmptyStateProps {
  activeTab: DeliveryTabType;
}

export default function DeliveryEmptyState({ activeTab }: DeliveryEmptyStateProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const getEmptyData = () => {
    switch (activeTab) {
      case 'active':
        return {
          icon: <DeliveryBikeIcon size={38} color={colors.primary} />,
          title: 'No Active Deliveries',
          sub: 'Switch to the Pickups tab to accept and claim ready orders from restaurant kitchens.',
        };
      case 'available':
        return {
          icon: <PackageIcon size={38} color={colors.primary} />,
          title: 'No Pending Pickups',
          sub: 'All current restaurant orders have been claimed. Pull down to refresh live orders.',
        };
      case 'history':
        return {
          icon: <ClockHistoryIcon size={38} color={colors.primary} />,
          title: 'No Completed History Yet',
          sub: 'Delivered orders will appear here along with your estimated daily payout summary.',
        };
    }
  };

  const data = getEmptyData();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.iconCircle}>{data.icon}</View>
      <Text style={styles.emptyTitle}>{data.title}</Text>
      <Text style={styles.emptySub}>{data.sub}</Text>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
      paddingTop: 60,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 6,
    },
    emptySub: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
