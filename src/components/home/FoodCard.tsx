import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import Icons from '../../constants/icons';

const getCategoryIcon = (category?: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('snack')) return Icons.snacks;
  if (cat.includes('vegan') || cat.includes('salad')) return Icons.vegan;
  if (cat.includes('dessert') || cat.includes('cake') || cat.includes('sweet')) return Icons.dessert;
  if (cat.includes('drink') || cat.includes('beverage')) return Icons.drinks;
  return Icons.meal;
};

export interface FoodCardProps {
  item: MenuItem;
  onPress: (item: MenuItem) => void;
  onAddToCart?: (item: MenuItem) => void;
  width?: number;
}

export default function FoodCard({ item, onPress, onAddToCart, width = 155 }: FoodCardProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors, width);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onPress(item)}
    >
      <View style={styles.imageWrapper}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Image source={getCategoryIcon(item.category)} style={styles.placeholderIcon} />
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{(item.rating || 5.0).toFixed(1)} ★</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.desc} numberOfLines={1}>
          {item.description || 'Delicious freshly prepared dish'}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>₹{item.price?.toFixed(0)}</Text>
          {onAddToCart && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart(item);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Image source={require('../../assets/cart.png')} style={styles.addIcon} />
            </TouchableOpacity>
          )}
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
    imageWrapper: {
      position: 'relative',
      height: 110,
      width: '100%',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholder: {
      backgroundColor: '#FFF9E6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderIcon: {
      width: 42,
      height: 42,
      resizeMode: 'contain',
      tintColor: colors.primary,
      opacity: 0.5,
    },
    ratingBadge: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    ratingText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
    },
    content: {
      padding: 10,
    },
    title: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    desc: {
      fontSize: 10,
      color: colors.textMuted,
      marginBottom: 8,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    price: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.primary,
    },
    addBtn: {
      backgroundColor: colors.primary,
      width: 26,
      height: 26,
      borderRadius: 13,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addIcon: {
      width: 13,
      height: 13,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
  });
