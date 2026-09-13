import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, Dimensions, StatusBar, RefreshControl
} from 'react-native';
import FavoritesSkeleton, { FavoriteCardSkeleton } from '../../components/skeleton/FavoritesSkeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { API_URL } from '../../config/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

type RecommendationsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Recommendations'>;

const getCategoryIcon = (category?: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('drink') || cat.includes('beverage')) return require('../../assets/drinks.png');
  if (cat.includes('dessert') || cat.includes('sweet')) return require('../../assets/dessert.png');
  if (cat.includes('vegan') || cat.includes('salad')) return require('../../assets/vegan.png');
  if (cat.includes('snack')) return require('../../assets/snacks.png');
  return require('../../assets/spoons.png');
};

export default function RecommendationsScreen() {
  const navigation = useNavigation<RecommendationsNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { addToCart } = useCart();

  const [items, setItems]         = useState<any[]>([]);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(true);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing]   = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getQty = (id: string) => quantities[id] || 1;
  const updateQty = (id: string, delta: number) =>
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));

  const fetchItems = useCallback(async (isRefresh = false, pageNum = 1) => {
    if (isRefresh) {
      setRefreshing(true);
      pageNum = 1;
    } else if (pageNum > 1) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(`${API_URL}/menu-items?page=${pageNum}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : (data.items || []);

        if (pageNum === 1) {
          setItems(rawList);
        } else {
          setItems((prev) => {
            const existingIds = new Set(prev.map((i) => i.id || i._id));
            const fresh = rawList.filter((i: any) => !existingIds.has(i.id || i._id));
            return [...prev, ...fresh];
          });
        }

        setPage(pageNum);

        if (Array.isArray(data)) {
          setHasMore(rawList.length >= 10);
        } else {
          setHasMore(data.hasMore ?? (pageNum < (data.totalPages || 1)));
        }
      }
    } catch (e) {
      console.error('Failed to fetch recommendations:', e);
    } finally {
      if (isRefresh) setRefreshing(false);
      else if (pageNum > 1) setLoadingMore(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(false, 1);
  }, [fetchItems]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && !refreshing && hasMore) {
      fetchItems(false, page + 1);
    }
  };

  const handleAddToCart = (item: any) => {
    const qty = getQty(item.id || item._id);
    const cartItem = {
      id: item.id || item._id,
      name: item.name,
      price: item.price,
      rating: item.rating || 5.0,
      description: item.description || '',
      image: item.image || '',
      customizations: item.customizations || [],
    };
    for (let i = 0; i < qty; i++) addToCart(cartItem);
    navigation.navigate('Cart');
  };

  const featuredItem = items[0];
  const gridItems    = items.slice(1);

  const normalizeMenuItem = (item: any): MenuItem => ({
    id: item.id || item._id,
    name: item.name,
    price: item.price,
    rating: item.rating || 5.0,
    description: item.description || '',
    image: item.image || '',
    category: item.category || 'Special',
    customizations: item.customizations || [],
    originalPrice: item.originalPrice,
    discountBadge: item.discountBadge,
  });

  const renderGridCard = (item: any) => {
    const menuItem = normalizeMenuItem(item);
    return (
      <TouchableOpacity
        key={menuItem.id}
        style={styles.gridCardContainer}
        activeOpacity={0.85}
        onPress={() => (navigation as any).navigate('FoodDetails', { item: menuItem })}
      >
        <View style={styles.imageWrapper}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.gridCardImage} />
          ) : (
            <View style={[styles.gridCardImage, styles.imagePlaceholder]}>
              <Image source={getCategoryIcon(item.category)} style={styles.placeholderIcon} />
            </View>
          )}
          <View style={styles.categoryIconBadge}>
            <Image source={getCategoryIcon(item.category)} style={styles.categoryIconImage} />
          </View>
          <View style={styles.ratingBadgeImg}>
            <Text style={styles.ratingTextImg}>{(item.rating || 5.0).toFixed(1)} ★</Text>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
          ) : null}
          <View style={styles.priceCartRow}>
            <Text style={styles.priceText}>₹{item.price?.toFixed(0)}</Text>
            <TouchableOpacity
              style={styles.cartIconBtn}
              onPress={(e) => {
                e.stopPropagation();
                addToCart(menuItem);
              }}
            >
              <Image source={require('../../assets/cart.png')} style={styles.cartIconImg} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#F7D055" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recommendations</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.contentContainer}>
        {loading ? (
          <FavoritesSkeleton count={6} />
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>No recommendations available.</Text>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchItems(true, 1)}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 120;
              if (isCloseToBottom) {
                handleLoadMore();
              }
            }}
            scrollEventThrottle={16}
          >
            <Text style={styles.subtitle}>Dishes recommended{'\n'}by our top chefs.</Text>

            {/* Featured Item */}
            {featuredItem && (
              <TouchableOpacity
                style={styles.featuredContainer}
                activeOpacity={0.88}
                onPress={() => (navigation as any).navigate('FoodDetails', { item: normalizeMenuItem(featuredItem) })}
              >
                <View style={styles.featuredImageWrapper}>
                  {featuredItem.image ? (
                    <Image source={{ uri: featuredItem.image }} style={styles.featuredImage} />
                  ) : (
                    <View style={[styles.featuredImage, styles.imagePlaceholder]}>
                      <Image source={getCategoryIcon(featuredItem.category)} style={styles.placeholderIconFeatured} />
                    </View>
                  )}
                  <View style={styles.categoryIconBadge}>
                    <Image source={getCategoryIcon(featuredItem.category)} style={styles.categoryIconImage} />
                  </View>
                  <View style={styles.ratingBadgeImg}>
                    <Text style={styles.ratingTextImg}>{(featuredItem.rating || 5.0).toFixed(1)} ★</Text>
                  </View>
                </View>
                <View style={styles.featuredInfo}>
                  <View style={styles.newProductBadge}>
                    <Text style={styles.newProductText}>Chef's Pick</Text>
                  </View>
                  <Text style={styles.featuredTitle} numberOfLines={1}>{featuredItem.name}</Text>
                  <Text style={styles.featuredDescription} numberOfLines={2}>{featuredItem.description}</Text>
                  <View style={styles.priceCartRow}>
                    <Text style={styles.priceText}>₹{(featuredItem.price || 0).toFixed(0)}</Text>
                    <View style={styles.qtyControlSmall}>
                      <TouchableOpacity onPress={(e) => { e.stopPropagation(); updateQty(featuredItem.id || featuredItem._id, -1); }}>
                        <View style={styles.qtyBtnSmall}><Text style={styles.qtyBtnTextSmall}>-</Text></View>
                      </TouchableOpacity>
                      <Text style={styles.qtyTextSmall}>{getQty(featuredItem.id || featuredItem._id)}</Text>
                      <TouchableOpacity onPress={(e) => { e.stopPropagation(); updateQty(featuredItem.id || featuredItem._id, 1); }}>
                        <View style={styles.qtyBtnSmall}><Text style={styles.qtyBtnTextSmall}>+</Text></View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cartBtnSmall}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleAddToCart(featuredItem);
                        }}
                      >
                        <Image source={require('../../assets/cart.png')} style={styles.cartIconImg} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Grid */}
            <View style={styles.gridContainer}>
              {gridItems.map(renderGridCard)}
            </View>
            {loadingMore && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 }}>
                <FavoriteCardSkeleton />
                <FavoriteCardSkeleton />
              </View>
            )}
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
  backIconImg: { width: 20, height: 20, resizeMode: 'contain', tintColor: colors.primary },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  contentContainer: {
    flex: 1, backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden',
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 100 },
  subtitle: {
    fontSize: 18, fontWeight: 'bold', color: colors.primary,
    textAlign: 'center', marginBottom: 25,
  },
  emptyText: { textAlign: 'center', marginTop: 60, color: colors.textMuted, fontSize: 15 },
  featuredContainer: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 20, marginBottom: 25, alignItems: 'center',
  },
  featuredImageWrapper: {
    width: 140, height: 140, borderRadius: 20, overflow: 'hidden',
    marginRight: 15, position: 'relative',
  },
  featuredImage: { width: '100%', height: '100%' },
  imagePlaceholder: { backgroundColor: colors.inputBackground, justifyContent: 'center', alignItems: 'center' },
  featuredInfo: { flex: 1, justifyContent: 'center' },
  newProductBadge: {
    backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4,
    borderTopLeftRadius: 5, borderBottomLeftRadius: 5, borderTopRightRadius: 15,
    alignSelf: 'flex-start', marginBottom: 8,
  },
  newProductText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  featuredTitle: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginBottom: 5 },
  featuredDescription: { fontSize: 10, color: colors.textMuted, lineHeight: 14, marginBottom: 10 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCardContainer: {
    width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 20, marginBottom: 20,
  },
  imageWrapper: { position: 'relative', height: 140, width: '100%', marginBottom: 10 },
  gridCardImage: { width: '100%', height: '100%', borderRadius: 20 },
  categoryIconBadge: {
    position: 'absolute', top: 10, left: 10, width: 26, height: 26,
    borderRadius: 13, backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  categoryIconImage: { width: 14, height: 14, resizeMode: 'contain' },
  ratingBadgeImg: {
    position: 'absolute', bottom: 10, left: 10,
    backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },
  ratingTextImg: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cardInfo: { paddingHorizontal: 5 },
  cardTitle: { fontSize: 12, fontWeight: 'bold', color: colors.text, marginBottom: 5 },
  cardDescription: { fontSize: 9, color: colors.textMuted, lineHeight: 12, marginBottom: 10 },
  priceCartRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', width: '100%',
  },
  priceText: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  qtyControlSmall: { flexDirection: 'row', alignItems: 'center' },
  qtyBtnSmall: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#FDE1D3', justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnTextSmall: { fontSize: 12, color: colors.primary, fontWeight: 'bold' },
  qtyTextSmall: { fontSize: 12, fontWeight: 'bold', marginHorizontal: 6 },
  placeholderIcon: { width: 40, height: 40, resizeMode: 'contain', tintColor: colors.primary, opacity: 0.5 },
  placeholderIconFeatured: { width: 50, height: 50, resizeMode: 'contain', tintColor: colors.primary, opacity: 0.5 },
  cartIconBtn: {
    backgroundColor: colors.primary, width: 24, height: 24,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  cartBtnSmall: {
    backgroundColor: colors.primary, width: 20, height: 20,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 5,
  },
  cartIconImg: { width: 12, height: 12, resizeMode: 'contain', tintColor: '#FFFFFF' },
});
