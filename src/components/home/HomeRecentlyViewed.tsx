import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
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

export interface HomeRecentlyViewedProps {
  items: MenuItem[];
  onPressItem: (item: MenuItem) => void;
  onClear: () => void;
}

export default function HomeRecentlyViewed({
  items,
  onPressItem,
  onClear,
}: HomeRecentlyViewedProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Recently Viewed</Text>
          <Text style={styles.subtitle}>Pick up right where you left off</Text>
        </View>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clear}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id || (item as any)._id}
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
              <View style={styles.catBadge}>
                <Image source={getCategoryIcon(item.category)} style={styles.catIcon} />
              </View>
            </View>
            <View style={styles.content}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <View style={styles.bottomRow}>
                <Text style={styles.price}>₹{item.price?.toFixed(0)}</Text>
                <Text style={styles.revisitText}>View ›</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: '#FAFAFA',
      paddingVertical: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#EFEFEF',
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
    clear: {
      fontSize: 12,
      fontWeight: '600',
      color: '#E53935',
    },
    list: {
      paddingHorizontal: 16,
    },
    card: {
      width: 140,
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      marginHorizontal: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#ECECEC',
      overflow: 'hidden',
    },
    imgWrapper: {
      position: 'relative',
      height: 90,
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
      width: 36,
      height: 36,
      resizeMode: 'contain',
      tintColor: colors.primary,
      opacity: 0.5,
    },
    catBadge: {
      position: 'absolute',
      top: 6,
      left: 6,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    catIcon: {
      width: 12,
      height: 12,
      resizeMode: 'contain',
    },
    content: {
      padding: 8,
    },
    name: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    price: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.primary,
    },
    revisitText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
  });
