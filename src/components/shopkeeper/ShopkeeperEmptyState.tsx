import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { ShopkeeperTabType } from './ShopkeeperTabs';
import { CookingPanIcon, OrderBellIcon, StoreFrontIcon } from '../icons/ShopkeeperIcons';
import { CheckCircleIcon } from '../icons/DeliveryIcons';

interface ShopkeeperEmptyStateProps {
  activeTab: ShopkeeperTabType;
}

export default function ShopkeeperEmptyState({ activeTab }: ShopkeeperEmptyStateProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const getEmptyDetails = () => {
    switch (activeTab) {
      case 'Pending':
        return {
          icon: <OrderBellIcon size={44} color="#FFC72C" />,
          title: 'No New Orders',
          subtitle: 'New customer orders will appear here automatically with alerts.',
        };
      case 'Preparing':
        return {
          icon: <CookingPanIcon size={44} color="#FFC72C" />,
          title: 'Kitchen is Clear',
          subtitle: 'No food orders currently being prepared. Accept incoming orders to begin cooking.',
        };
      case 'Ready':
        return {
          icon: <CheckCircleIcon size={44} color="#10B981" />,
          title: 'All Orders Dispatched',
          subtitle: 'No orders waiting for delivery partner pickup right now.',
        };
      case 'History':
        return {
          icon: <StoreFrontIcon size={44} color={colors.textMuted} />,
          title: 'No Order History Yet',
          subtitle: 'Completed deliveries and past orders will be archived here.',
        };
    }
  };

  const empty = getEmptyDetails();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>{empty.icon}</View>
      <Text style={styles.title}>{empty.title}</Text>
      <Text style={styles.subtitle}>{empty.subtitle}</Text>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 50,
      paddingHorizontal: 30,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 199, 44, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 6,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
    },
  });
