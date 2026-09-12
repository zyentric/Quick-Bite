import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { LeafIcon, StarIcon } from '../icons';
import Icons from '../../constants/icons';

export interface HomeHealthyCornerProps {
  items: MenuItem[];
  onPressItem: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
  onViewAll: () => void;
}

export default function HomeHealthyCorner({
  items,
  onPressItem,
  onAddToCart,
  onViewAll,
}: HomeHealthyCornerProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LeafIcon size={20} color="#10B981" />
          <View style={{ marginLeft: 6 }}>
            <Text style={styles.title}>Guilt-Free & Healthy Corner</Text>
            <Text style={styles.subtitle}>Nutritious, fresh greens & high-protein bowls</Text>
          </View>
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
                  <Image source={Icons.vegan} style={styles.placeholderIcon} />
                </View>
              )}
              <View style={styles.greenTag}>
                <Text style={styles.greenTagText}>100% FRESH</Text>
              </View>
            </View>

            <View style={styles.content}>
              <View style={styles.titleRowCard}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <View style={styles.ratingBadge}>
                  <StarIcon size={10} color="#059669" />
                  <Text style={styles.ratingText}> {(item.rating || 5.0).toFixed(1)}</Text>
                </View>
              </View>
              <Text style={styles.desc} numberOfLines={1}>
                {item.description || 'Nutritious fresh meal'}
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
                  <Text style={styles.addBtnText}>+ ADD</Text>
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
      backgroundColor: '#F0FDF4',
      paddingVertical: 18,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#DCFCE7',
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
      color: '#059669',
    },
    list: {
      paddingHorizontal: 16,
    },
    card: {
      width: 165,
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      marginHorizontal: 6,
      shadowColor: '#059669',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 5,
      elevation: 3,
      borderWidth: 1,
      borderColor: '#D1FAE5',
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
      backgroundColor: '#ECFDF5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderIcon: {
      width: 40,
      height: 40,
      resizeMode: 'contain',
      tintColor: '#10B981',
      opacity: 0.6,
    },
    greenTag: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: '#059669',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 5,
    },
    greenTagText: {
      color: '#FFFFFF',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    content: {
      padding: 10,
    },
    titleRowCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    name: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
      marginRight: 4,
    },
    ratingBadge: {
      backgroundColor: '#ECFDF5',
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#059669',
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
      color: '#059669',
    },
    addBtn: {
      backgroundColor: '#ECFDF5',
      borderWidth: 1.5,
      borderColor: '#059669',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    addBtnText: {
      color: '#059669',
      fontSize: 11,
      fontWeight: '900',
    },
  });
