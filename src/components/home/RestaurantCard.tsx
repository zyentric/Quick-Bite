import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Restaurant } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { StarIcon, ClockIcon } from '../icons';

export interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: (restaurant: Restaurant) => void;
  width?: number;
}

export default function RestaurantCard({ restaurant, onPress, width = 220 }: RestaurantCardProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors, width);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onPress(restaurant)}
    >
      <Image source={{ uri: restaurant.image }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
          <View style={styles.ratingBadge}>
            <StarIcon size={12} color="#D97706" />
            <Text style={styles.ratingText}> {(restaurant.rating || 4.8).toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.cuisine} numberOfLines={1}>{restaurant.cuisine}</Text>
        <View style={styles.metaRow}>
          <View style={styles.timeTag}>
            <ClockIcon size={12} color="#4B5563" />
            <Text style={styles.timeTagText}> 20–30 min</Text>
          </View>
          <Text style={styles.freeDeliveryText}>Free Delivery</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors: ThemeColors, width: number) =>
  StyleSheet.create({
    card: {
      width,
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      marginHorizontal: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 5,
      elevation: 3,
      borderWidth: 1,
      borderColor: '#F0F0F0',
      overflow: 'hidden',
      marginBottom: 6,
    },
    image: {
      width: '100%',
      height: 110,
      resizeMode: 'cover',
    },
    info: {
      padding: 10,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 3,
    },
    name: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      flex: 1,
      marginRight: 6,
    },
    ratingBadge: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#D97706',
    },
    cuisine: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: 6,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    timeTag: {
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    timeTagText: {
      fontSize: 10,
      color: '#4B5563',
      fontWeight: '600',
    },
    freeDeliveryText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#059669',
    },
  });
