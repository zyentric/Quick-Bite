import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { API_URL } from '../../config/api';
import Icons from '../../constants/icons';
import { RestaurantMenuItemSkeleton } from '../../components/skeleton/RestaurantDetailsSkeleton';

const { width } = Dimensions.get('window');

type RestaurantDetailsRouteProp = RouteProp<RootStackParamList, 'RestaurantDetails'>;
type RestaurantDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RestaurantDetails'>;

const dietaryStyles = StyleSheet.create({
  dietaryBox: {
    borderWidth: 1.5,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

// Standard FSSAI dietary indicators
function VegIndicator({ size = 13 }: { size?: number }) {
  return (
    <View style={[dietaryStyles.dietaryBox, { width: size, height: size, borderColor: '#16A34A' }]}>
      <View style={{ width: size * 0.45, height: size * 0.45, borderRadius: (size * 0.45) / 2, backgroundColor: '#16A34A' }} />
    </View>
  );
}

function NonVegIndicator({ size = 13 }: { size?: number }) {
  return (
    <View style={[dietaryStyles.dietaryBox, { width: size, height: size, borderColor: '#DC2626' }]}>
      <View style={{ width: size * 0.45, height: size * 0.45, borderRadius: (size * 0.45) / 2, backgroundColor: '#DC2626' }} />
    </View>
  );
}

export default function RestaurantDetailsScreen() {
  const route = useRoute<RestaurantDetailsRouteProp>();
  const navigation = useNavigation<RestaurantDetailsNavigationProp>();
  const insets = useSafeAreaInsets();
  const { restaurant } = route.params;

  const { addToCart, cartItems, updateQuantity, totalItems, totalPrice } = useCart();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header background opacity based on scroll position
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [80, 160],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [120, 170],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${API_URL}/restaurants`);
        if (res.ok) {
          const allRestaurants = await res.json();
          const matched = allRestaurants.find(
            (r: any) => r.name === restaurant.name || r.id === restaurant.id || r._id === (restaurant as any)._id
          );
          const items = matched?.menu || [];
          if (items.length > 0) {
            setMenuItems(
              items.map((item: any) => ({
                id: item.id || item._id,
                name: item.name,
                price: Number(item.price) || 0,
                originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
                discountBadge: item.discountBadge,
                rating: Number(item.rating) || 4.5,
                category: item.category || 'Meal',
                description: item.description || '',
                image: item.image || '',
                customizations: item.customizations || [],
              }))
            );
            return;
          }
        }

        // Fallback: load all menu items from /menu-items
        const fallback = await fetch(`${API_URL}/menu-items`);
        if (fallback.ok) {
          const data = await fallback.json();
          const list = Array.isArray(data) ? data : data?.items || [];
          setMenuItems(
            list.map((item: any) => ({
              id: item.id || item._id,
              name: item.name,
              price: Number(item.price) || 0,
              originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
              discountBadge: item.discountBadge,
              rating: Number(item.rating) || 4.5,
              category: item.category || 'Meal',
              description: item.description || '',
              image: item.image || '',
              customizations: item.customizations || [],
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch restaurant menu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [restaurant.name, restaurant.id]);

  const isItemVeg = (item: MenuItem) => {
    const cat = (item.category || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const isNonVeg =
      name.includes('chicken') ||
      name.includes('mutton') ||
      name.includes('fish') ||
      name.includes('prawn') ||
      name.includes('wings') ||
      name.includes('salmon') ||
      name.includes('egg') ||
      desc.includes('chicken');
    if (isNonVeg) return false;
    return cat.includes('vegan') || cat.includes('salad') || name.includes('veg') || true;
  };

  const renderMenuItem = (item: MenuItem) => {
    const isVeg = isItemVeg(item);
    const cartEntry = cartItems.find((ci) => ci.id === item.id);
    const inCartQty = cartEntry ? cartEntry.quantity : 0;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItemCard}
        activeOpacity={0.92}
        onPress={() => (navigation as any).navigate('FoodDetails', { item })}
      >
        {/* Left Side: Details */}
        <View style={styles.menuLeft}>
          <View style={styles.dietaryRow}>
            {isVeg ? <VegIndicator size={13} /> : <NonVegIndicator size={13} />}
            {item.discountBadge ? (
              <View style={styles.itemDiscountPill}>
                <Text style={styles.itemDiscountText}>{item.discountBadge}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.menuName} numberOfLines={2}>{item.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.menuPrice}>₹{item.price.toFixed(0)}</Text>
            {item.originalPrice && item.originalPrice > item.price ? (
              <Text style={styles.originalPrice}>₹{item.originalPrice.toFixed(0)}</Text>
            ) : null}
          </View>

          {item.rating ? (
            <View style={styles.ratingRow}>
              <Image source={Icons.star} style={styles.itemStarIcon} />
              <Text style={styles.itemRatingText}>{item.rating.toFixed(1)}</Text>
            </View>
          ) : null}

          {item.description ? (
            <Text style={styles.menuDesc} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>

        {/* Right Side: Image & Add / Stepper Button */}
        <View style={styles.menuRight}>
          <View style={styles.imageWrap}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.menuItemImage} resizeMode="cover" />
            ) : (
              <View style={[styles.menuItemImage, styles.menuItemImagePlaceholder]}>
                <Image source={Icons.spoons} style={styles.menuItemPlaceholderIcon} />
              </View>
            )}
          </View>

          {/* Add / Stepper Controller */}
          {inCartQty > 0 ? (
            <View style={styles.cartStepperWrap}>
              <TouchableOpacity
                style={styles.stepperActionBtn}
                onPress={() => updateQuantity(item.id, inCartQty - 1)}
                activeOpacity={0.7}
              >
                <Text style={styles.stepperActionText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperQtyText}>{inCartQty}</Text>
              <TouchableOpacity
                style={styles.stepperActionBtn}
                onPress={() => updateQuantity(item.id, inCartQty + 1)}
                activeOpacity={0.7}
              >
                <Text style={styles.stepperActionText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.85}
              onPress={() => addToCart(item)}
            >
              <Text style={styles.addButtonText}>ADD</Text>
              <Text style={styles.addButtonPlus}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Fixed Sticky Navigation Header ── */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            paddingTop: insets.top,
            height: insets.top + 54,
            opacity: headerBgOpacity,
          },
        ]}
      />

      {/* Floating Header Actions Layer (Always Accessible) */}
      <View style={[styles.floatingHeaderBar, { top: insets.top + 6 }]}>
        <TouchableOpacity
          style={styles.fixedBackBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.8}
        >
          <Image source={Icons.back} style={styles.fixedBackIcon} />
        </TouchableOpacity>

        <Animated.View style={[styles.stickyTitleWrap, { opacity: headerTitleOpacity }]}>
          <Text style={styles.stickyTitleText} numberOfLines={1}>
            {restaurant.name}
          </Text>
        </Animated.View>

        <View style={{ width: 40 }} />
      </View>

      {/* ── Scrollable Body ── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        contentContainerStyle={{ paddingBottom: totalItems > 0 ? 120 : 60 }}
      >
        {/* Restaurant Hero Image */}
        <View style={styles.heroImageContainer}>
          {restaurant.image ? (
            <Image source={{ uri: restaurant.image }} style={styles.headerImage} resizeMode="cover" />
          ) : (
            <View style={[styles.headerImage, styles.heroPlaceholder]}>
              <Image source={Icons.spoons} style={{ width: 60, height: 60, tintColor: '#D1D5DB' }} />
            </View>
          )}
          {/* Subtle gradient vignette at top for back button contrast */}
          <View style={styles.heroTopShadow} />
        </View>

        {/* Restaurant Info Card */}
        <View style={styles.contentContainer}>
          <View style={styles.restaurantCard}>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{restaurant.name}</Text>
              <View style={styles.ratingBadge}>
                <Image source={Icons.star} style={styles.starBadgeIcon} />
                <Text style={styles.ratingText}>
                  {(restaurant.rating || 4.8).toFixed(1)}
                </Text>
              </View>
            </View>

            <Text style={styles.cuisineInfo}>
              {restaurant.cuisine || 'Fast Food, Beverages'}
            </Text>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Image source={Icons.order} style={styles.metricIcon} />
                <Text style={styles.metricText}>20–35 min</Text>
              </View>
              <View style={styles.metricDot} />
              <View style={styles.metricItem}>
                <Image source={Icons.deliverymen} style={styles.metricIcon} />
                <Text style={styles.metricFreeDelivery}>Free Delivery</Text>
              </View>
              <View style={styles.metricDot} />
              <Text style={styles.metricDistance}>2.5 km away</Text>
            </View>
          </View>

          <View style={styles.menuHeaderSection}>
            <Text style={styles.sectionTitle}>Full Menu</Text>
            <Text style={styles.itemCountText}>({menuItems.length} items)</Text>
          </View>

          {loading ? (
            <View>
              {[0, 1, 2, 3, 4].map((i) => (
                <RestaurantMenuItemSkeleton key={i} />
              ))}
            </View>
          ) : menuItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No menu items available right now.</Text>
            </View>
          ) : (
            menuItems.map(renderMenuItem)
          )}
        </View>
      </Animated.ScrollView>

      {/* ── Sticky Bottom Cart Bar ── */}
      {totalItems > 0 && (
        <View style={[styles.cartBarContainer, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
          <TouchableOpacity
            style={styles.cartBar}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Cart')}
          >
            <View style={styles.cartLeft}>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
              <View>
                <Text style={styles.cartPrice}>₹{totalPrice.toFixed(0)}</Text>
                <Text style={styles.cartSubText}>plus taxes</Text>
              </View>
            </View>

            <View style={styles.cartRight}>
              <Text style={styles.cartActionText}>View Cart</Text>
              <Image source={Icons.next} style={styles.cartNextIcon} />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9FAFB',
    },
    stickyHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      zIndex: 90,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 4,
    },
    floatingHeaderBar: {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 100,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    fixedBackBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    fixedBackIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      tintColor: '#1F2937',
    },
    stickyTitleWrap: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 12,
    },
    stickyTitleText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#111827',
    },
    heroImageContainer: {
      width: '100%',
      height: 230,
      position: 'relative',
      backgroundColor: '#E5E7EB',
    },
    headerImage: {
      width: '100%',
      height: '100%',
    },
    heroPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
    },
    heroTopShadow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 80,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    contentContainer: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      marginTop: -28,
      paddingTop: 20,
      paddingHorizontal: 16,
      minHeight: 500,
    },
    restaurantCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#F3F4F6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    headerInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    name: {
      fontSize: 22,
      fontWeight: '900',
      color: '#111827',
      flex: 1,
      marginRight: 10,
    },
    ratingBadge: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    starBadgeIcon: {
      width: 12,
      height: 12,
      resizeMode: 'contain',
      tintColor: '#D97706',
      marginRight: 4,
    },
    ratingText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#B45309',
    },
    cuisineInfo: {
      fontSize: 13,
      color: '#6B7280',
      marginBottom: 12,
      fontWeight: '500',
    },
    metricsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
    },
    metricItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metricIcon: {
      width: 13,
      height: 13,
      resizeMode: 'contain',
      tintColor: '#4B5563',
      marginRight: 4,
    },
    metricText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#4B5563',
    },
    metricFreeDelivery: {
      fontSize: 12,
      fontWeight: '700',
      color: '#059669',
    },
    metricDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: '#D1D5DB',
      marginHorizontal: 8,
    },
    metricDistance: {
      fontSize: 12,
      color: '#6B7280',
    },
    menuHeaderSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: '#111827',
    },
    itemCountText: {
      fontSize: 13,
      color: '#6B7280',
      marginLeft: 6,
      fontWeight: '500',
    },
    menuItemCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    menuLeft: {
      flex: 1,
      paddingRight: 14,
    },
    dietaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      gap: 6,
    },
    dietaryBox: {
      borderWidth: 1.5,
      borderRadius: 3,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
    },
    itemDiscountPill: {
      backgroundColor: '#FEF2F2',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#FCA5A5',
    },
    itemDiscountText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#DC2626',
    },
    menuName: {
      fontSize: 15,
      fontWeight: '800',
      color: '#1F2937',
      marginBottom: 4,
      lineHeight: 20,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 6,
    },
    menuPrice: {
      fontSize: 15,
      fontWeight: '900',
      color: '#111827',
    },
    originalPrice: {
      fontSize: 13,
      color: '#9CA3AF',
      textDecorationLine: 'line-through',
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    itemStarIcon: {
      width: 11,
      height: 11,
      resizeMode: 'contain',
      tintColor: '#F59E0B',
      marginRight: 3,
    },
    itemRatingText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#B45309',
    },
    menuDesc: {
      fontSize: 12,
      color: '#6B7280',
      lineHeight: 16,
    },
    menuRight: {
      width: 100,
      alignItems: 'center',
    },
    imageWrap: {
      width: 100,
      height: 96,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#F3F4F6',
    },
    menuItemImage: {
      width: '100%',
      height: '100%',
    },
    menuItemImagePlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuItemPlaceholderIcon: {
      width: 28,
      height: 28,
      resizeMode: 'contain',
      tintColor: '#9CA3AF',
      opacity: 0.5,
    },
    addButton: {
      position: 'absolute',
      bottom: -10,
      backgroundColor: '#FFFFFF',
      borderWidth: 1.5,
      borderColor: colors.primary,
      paddingHorizontal: 18,
      paddingVertical: 6,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 3,
      elevation: 3,
    },
    addButtonText: {
      fontSize: 12,
      fontWeight: '900',
      color: colors.primary,
      marginRight: 2,
    },
    addButtonPlus: {
      fontSize: 14,
      fontWeight: '900',
      color: colors.primary,
    },
    cartStepperWrap: {
      position: 'absolute',
      bottom: -10,
      backgroundColor: colors.primary,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 4,
    },
    stepperActionBtn: {
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    stepperActionText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '900',
    },
    stepperQtyText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
      paddingHorizontal: 6,
    },
    emptyContainer: {
      paddingVertical: 50,
      alignItems: 'center',
    },
    emptyText: {
      color: '#6B7280',
      fontSize: 14,
    },
    cartBarContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      backgroundColor: 'transparent',
    },
    cartBar: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 18,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 8,
    },
    cartLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cartBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    cartBadgeText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '900',
    },
    cartPrice: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '900',
    },
    cartSubText: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 10,
      fontWeight: '600',
    },
    cartRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cartActionText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '900',
      marginRight: 4,
    },
    cartNextIcon: {
      width: 14,
      height: 14,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
  });
