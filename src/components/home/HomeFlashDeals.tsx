import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { FireIcon, PercentIcon } from '../icons';
import Icons from '../../constants/icons';

const getCategoryIcon = (category?: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('snack')) return Icons.snacks;
  if (cat.includes('vegan') || cat.includes('salad')) return Icons.vegan;
  if (cat.includes('dessert') || cat.includes('cake') || cat.includes('sweet')) return Icons.dessert;
  if (cat.includes('drink') || cat.includes('beverage')) return Icons.drinks;
  return Icons.meal;
};

export interface HomeFlashDealsProps {
  items: MenuItem[];
  onPressItem: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
  onViewAll: () => void;
}

export default function HomeFlashDeals({
  items,
  onPressItem,
  onAddToCart,
  onViewAll,
}: HomeFlashDealsProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <FireIcon size={20} color="#EF4444" />
          <View style={{ marginLeft: 6 }}>
            <Text style={styles.title}>Pocket-Friendly Deals</Text>
            <Text style={styles.subtitle}>Big savings on delicious cravings</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
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
              <View style={styles.dealBadge}>
                <PercentIcon size={12} color="#FFFFFF" />
                <Text style={styles.dealBadgeText}> SPECIAL DEAL</Text>
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.desc} numberOfLines={1}>
                {item.description || 'Delicious hot dish'}
              </Text>
              <View style={styles.bottomRow}>
                <View>
                  <Text style={styles.price}>₹{item.price?.toFixed(0)}</Text>
                  {item.originalPrice ? (
                    <Text style={styles.originalPrice}>₹{item.originalPrice.toFixed(0)}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    onAddToCart(item);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.addBtnText}>ADD +</Text>
                </TouchableOpacity>
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
      backgroundColor: '#FFFBF2',
      paddingVertical: 18,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#FDECC2',
      marginBottom: 26,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 14,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
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
    card: {
      width: 160,
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      marginHorizontal: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 5,
      elevation: 3,
      borderWidth: 1,
      borderColor: '#F3E8C8',
      overflow: 'hidden',
    },
    imgWrapper: {
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
      width: 40,
      height: 40,
      resizeMode: 'contain',
      tintColor: colors.primary,
      opacity: 0.5,
    },
    dealBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: '#DC2626',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    dealBadgeText: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    content: {
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
    originalPrice: {
      fontSize: 11,
      color: colors.textMuted,
      textDecorationLine: 'line-through',
    },
    addBtn: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1.5,
      borderColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    addBtnText: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '900',
    },
  });
