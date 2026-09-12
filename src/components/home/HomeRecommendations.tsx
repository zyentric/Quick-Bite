import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import Icons from '../../constants/icons';

const { width } = Dimensions.get('window');

const getCategoryIcon = (category?: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('snack')) return Icons.snacks;
  if (cat.includes('vegan') || cat.includes('salad')) return Icons.vegan;
  if (cat.includes('dessert') || cat.includes('cake') || cat.includes('sweet')) return Icons.dessert;
  if (cat.includes('drink') || cat.includes('beverage')) return Icons.drinks;
  return Icons.meal;
};

export interface HomeRecommendationsProps {
  items: MenuItem[];
  onPressItem: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
  onViewAll: () => void;
}

export default function HomeRecommendations({
  items,
  onPressItem,
  onAddToCart,
  onViewAll,
}: HomeRecommendationsProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Recommended For You</Text>
          <Text style={styles.subtitle}>Curated dishes based on foodies</Text>
        </View>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => onPressItem(item)}
          >
            <View style={styles.imgWrapper}>
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

            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.desc} numberOfLines={1}>
                {item.description || 'Delicious freshly prepared dish'}
              </Text>
              <View style={styles.bottomRow}>
                <Text style={styles.price}>₹{item.price?.toFixed(0)}</Text>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    onAddToCart(item);
                  }}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Image source={require('../../assets/cart.png')} style={styles.addIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
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
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
    card: {
      width: (width - 44) / 2,
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#F0F0F0',
      overflow: 'hidden',
    },
    imgWrapper: {
      position: 'relative',
      height: 115,
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
    info: {
      padding: 10,
    },
    name: {
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
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addIcon: {
      width: 12,
      height: 12,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
  });
