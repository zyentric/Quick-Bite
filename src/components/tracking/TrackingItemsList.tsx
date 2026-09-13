import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RawOrderItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';

interface TrackingItemsListProps {
  orderItems: RawOrderItem[];
}

export default function TrackingItemsList({ orderItems }: TrackingItemsListProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  if (!orderItems || orderItems.length === 0) return null;

  return (
    <View style={styles.cardSection}>
      <Text style={styles.cardSectionTitle}>Items in this Order</Text>
      <View style={styles.itemsCard}>
        {orderItems.map((item: RawOrderItem, idx: number) => {
          const name = item.menuItem?.name || item.name || 'Delicious Dish';
          const qty = item.quantity || 1;
          return (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemQtyBadge}>
                <Text style={styles.itemQtyText}>{qty}x</Text>
              </View>
              <Text style={styles.itemName} numberOfLines={1}>
                {name}
              </Text>
            </View>
          );
        })}
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
    itemsCard: {
      gap: 8,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F9FAFB',
      borderRadius: 12,
      padding: 10,
      gap: 10,
    },
    itemQtyBadge: {
      backgroundColor: '#FFF4EB',
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
    },
    itemQtyText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
    },
    itemName: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
  });
