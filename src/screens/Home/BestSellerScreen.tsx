import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { API_URL } from '../../config/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

type BestSellerNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BestSeller'>;

import Icons from '../../constants/icons';

const getCategoryIcon = (category?: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('drink') || cat.includes('beverage')) return Icons.drinks;
  if (cat.includes('dessert') || cat.includes('cake') || cat.includes('sweet')) return Icons.dessert;
  if (cat.includes('vegan') || cat.includes('salad')) return Icons.vegan;
  if (cat.includes('snack')) return Icons.snacks;
  return Icons.meal;
};

export default function BestSellerScreen() {
  const navigation = useNavigation<BestSellerNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { addToCart } = useCart();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${API_URL}/menu-items`);
        if (res.ok) {
          const data = await res.json();
          // Sort by rating descending → best sellers
          const sorted = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          setItems(sorted);
        }
      } catch (e) {
        console.error('Failed to fetch best sellers:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const renderCard = (item: any) => (
    <TouchableOpacity
      key={item.id || item._id}
      style={styles.cardContainer}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('FoodDetails', {
        item: {
          id: item.id || item._id,
          name: item.name,
          price: item.price,
          rating: item.rating || 5.0,
          description: item.description || '',
          image: item.image || '',
          customizations: item.customizations || [],
        }
      })}
    >
      {/* Top Image Section */}
      <View style={styles.imageWrapper}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.imagePlaceholder]}>
            <Image source={getCategoryIcon(item.category)} style={styles.placeholderIcon} />
          </View>
        )}

        <View style={styles.categoryIconBadge}>
          <Image source={getCategoryIcon(item.category)} style={styles.categoryIconImg} />
        </View>

        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>₹{item.price?.toFixed(0)}</Text>
        </View>
      </View>

      {/* Bottom Info */}
      <View style={styles.cardInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{(item.rating || 5.0).toFixed(1)} ★</Text>
          </View>
        </View>
        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
        ) : null}

        {/* Add to Cart */}
        <TouchableOpacity style={styles.cartBtn} onPress={() => addToCart({
          id: item.id || item._id,
          name: item.name,
          price: item.price,
          rating: item.rating || 5.0,
          description: item.description || '',
          image: item.image || '',
          customizations: item.customizations || [],
        })}>
          <Image source={require('../../assets/cart.png')} style={styles.cartIconImg} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#F7D055" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image source={require('../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Best Sellers</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 60 }} />
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>No items found.</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.subtitle}>Our most popular dishes — loved by everyone!</Text>
            <View style={styles.gridContainer}>
              {items.map(renderCard)}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7D055' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 25,
  },
  backButton: { padding: 10 },
  backIconImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  contentContainer: {
    flex: 1, backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden',
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 100 },
  subtitle: {
    fontSize: 16, fontWeight: 'bold', color: colors.primary,
    textAlign: 'center', marginBottom: 25,
  },
  emptyText: {
    textAlign: 'center', marginTop: 60, color: colors.textMuted, fontSize: 15,
  },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardContainer: {
    width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 20,
    marginBottom: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 5, elevation: 3, overflow: 'hidden',
  },
  imageWrapper: { position: 'relative', height: 120, width: '100%' },
  cardImage: {
    width: '100%', height: '100%',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  imagePlaceholder: {
    backgroundColor: colors.inputBackground,
    justifyContent: 'center', alignItems: 'center',
  },
  placeholderIcon: {
    width: 48, height: 48, resizeMode: 'contain',
    tintColor: colors.primary, opacity: 0.5,
  },
  categoryIconBadge: {
    position: 'absolute', top: 10, left: 10,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#fff', borderWidth: 2, borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  categoryIconImg: {
    width: 14, height: 14, resizeMode: 'contain',
    tintColor: colors.primary,
  },
  priceTag: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  priceTagText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cardInfo: { padding: 10, position: 'relative' },
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 5,
  },
  cardTitle: { fontSize: 12, fontWeight: 'bold', color: colors.text, flex: 1, paddingRight: 5 },
  ratingBadge: { backgroundColor: colors.primary, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 5 },
  ratingText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  cardDescription: { fontSize: 9, color: colors.textMuted, lineHeight: 12, marginBottom: 15 },
  cartBtn: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: colors.primary, width: 24, height: 24,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  cartIconImg: {
    width: 12, height: 12, resizeMode: 'contain', tintColor: '#fff',
  },
});
