import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import FoodCard from './FoodCard';
import { FoodCardSkeleton } from '../skeleton/HomeScreenSkeleton';

export interface HomeBestSellersProps {
  items: MenuItem[];
  loading: boolean;
  onPressItem: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
  onViewAll: () => void;
}

export default function HomeBestSellers({
  items,
  loading,
  onPressItem,
  onAddToCart,
  onViewAll,
}: HomeBestSellersProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Best Sellers</Text>
          <Text style={styles.subtitle}>Most loved dishes in your city</Text>
        </View>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
          {[0, 1, 2, 3].map((i) => <FoodCardSkeleton key={i} width={155} />)}
        </ScrollView>
      ) : items.length === 0 ? (
        <Text style={styles.empty}>No best seller items found.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {items.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onPress={onPressItem}
              onAddToCart={onAddToCart}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 14,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 1,
    },
    viewAll: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    list: {
      paddingHorizontal: 16,
    },
    empty: {
      textAlign: 'center',
      color: colors.textMuted,
      marginVertical: 16,
      fontSize: 13,
    },
  });
