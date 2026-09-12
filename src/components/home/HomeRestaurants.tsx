import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Restaurant } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import RestaurantCard from './RestaurantCard';

export interface HomeRestaurantsProps {
  restaurants: Restaurant[];
  onPressRestaurant: (restaurant: Restaurant) => void;
  onViewAll: () => void;
}

export default function HomeRestaurants({
  restaurants,
  onPressRestaurant,
  onViewAll,
}: HomeRestaurantsProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  if (restaurants.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Top Restaurants Near You</Text>
          <Text style={styles.subtitle}>Fast delivery & top ratings</Text>
        </View>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {restaurants.map((rest) => (
          <RestaurantCard
            key={rest.id}
            restaurant={rest}
            onPress={onPressRestaurant}
          />
        ))}
      </ScrollView>
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
  });
