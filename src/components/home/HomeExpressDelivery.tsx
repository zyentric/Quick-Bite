import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { FastDeliveryIcon, ClockIcon } from '../icons';
import Icons from '../../constants/icons';

const getCategoryIcon = (category?: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('snack')) return Icons.snacks;
  if (cat.includes('vegan') || cat.includes('salad')) return Icons.vegan;
  if (cat.includes('dessert') || cat.includes('cake') || cat.includes('sweet')) return Icons.dessert;
  if (cat.includes('drink') || cat.includes('beverage')) return Icons.drinks;
  return Icons.meal;
};

export interface HomeExpressDeliveryProps {
  items: MenuItem[];
  onPressItem: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
  onViewAll: () => void;
}

export default function HomeExpressDelivery({
  items,
  onPressItem,
  onAddToCart,
  onViewAll,
}: HomeExpressDeliveryProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <FastDeliveryIcon size={22} color={colors.primary} />
          <View style={{ marginLeft: 6 }}>
            <Text style={styles.title}>Express Under 25 Mins</Text>
            <Text style={styles.subtitle}>Superfast kitchens ready to dispatch</Text>
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
              <View style={styles.speedTag}>
                <ClockIcon size={10} color="#FFFFFF" />
                <Text style={styles.speedTagText}> 15–20 MINS</Text>
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.desc} numberOfLines={1}>
                {item.description || 'Instant fresh preparation'}
              </Text>
              <View style={styles.bottomRow}>
                <Text style={styles.price}>₹{item.price?.toFixed(0)}</Text>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    onAddToCart(item);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.addBtnText}>ADD</Text>
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
      width: 155,
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
    },
    imgWrapper: {
      position: 'relative',
      height: 105,
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
      width: 38,
      height: 38,
      resizeMode: 'contain',
      tintColor: colors.primary,
      opacity: 0.5,
    },
    speedTag: {
      position: 'absolute',
      bottom: 6,
      left: 6,
      backgroundColor: '#2563EB',
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    speedTagText: {
      color: '#FFFFFF',
      fontSize: 8,
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
    addBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 8,
    },
    addBtnText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '900',
    },
  });
