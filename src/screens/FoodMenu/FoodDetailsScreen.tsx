import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { addRecentlyViewedItem } from '../../utils/recentItems';
import Icons from '../../constants/icons';
import { ClockIcon, StarIcon, PercentIcon, HeartIcon } from '../../components/icons';
import ProductDetailSkeleton from '../../components/skeleton/ProductDetailSkeleton';

const { width } = Dimensions.get('window');

type FoodDetailsRouteProp = RouteProp<RootStackParamList, 'FoodDetails'>;
type FoodDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodDetails'>;

const getCategoryIcon = (category?: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('snack')) return Icons.snacks;
  if (cat.includes('vegan') || cat.includes('salad')) return Icons.vegan;
  if (cat.includes('dessert') || cat.includes('cake') || cat.includes('sweet')) return Icons.dessert;
  if (cat.includes('drink') || cat.includes('beverage')) return Icons.drinks;
  return Icons.meal;
};

export default function FoodDetailsScreen() {
  const navigation = useNavigation<FoodDetailsNavigationProp>();
  const route = useRoute<FoodDetailsRouteProp>();
  const { item } = route.params;

  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const itemId = item?.id || (item as any)?._id || '';
  const isFav = isFavorite(itemId);

  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [showFavToast, setShowFavToast] = useState(false);
  const [favToastMsg, setFavToastMsg] = useState('');
  const toastAnim = useState(new Animated.Value(0))[0];
  const favToastAnim = useState(new Animated.Value(0))[0];
  const favScaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (item) {
      addRecentlyViewedItem(item);
    }
  }, [item]);

  const handleToggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleFavorite = async () => {
    // High-energy spring scale pop animation
    Animated.sequence([
      Animated.timing(favScaleAnim, {
        toValue: 1.45,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(favScaleAnim, {
        toValue: 1,
        friction: 3.5,
        tension: 180,
        useNativeDriver: true,
      }),
    ]).start();

    const result = await toggleFavorite(item);

    // Show feedback toast
    setFavToastMsg(result.isFavorite ? 'Saved to Favorites ❤️' : 'Removed from Favorites');
    setShowFavToast(true);
    Animated.spring(favToastAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();

    setTimeout(() => {
      Animated.timing(favToastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setShowFavToast(false));
    }, 2200);
  };

  // Calculate add-on cost
  const addOnsTotal =
    item.customizations?.reduce((total, section) => {
      return (
        total +
        section.options.reduce((secTotal, opt) => {
          return secTotal + (selectedAddOns[opt.id] ? opt.price : 0);
        }, 0)
      );
    }, 0) || 0;

  const basePrice = item.price || 0;
  const unitPrice = basePrice + addOnsTotal;
  const grandTotal = unitPrice * quantity;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        ...item,
        price: unitPrice,
      });
    }

    // Show smooth feedback toast
    setShowAddedToast(true);
    Animated.spring(toastAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();

    // Auto dismiss toast after 4s
    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowAddedToast(false));
    }, 4000);
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7D055" />
        <ProductDetailSkeleton />
      </SafeAreaView>
    );
  }

  // Accurate vegetarian vs non-vegetarian classification
  const isNonVeg = (() => {
    const name = (item.name || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    return (
      name.includes('chicken') ||
      name.includes('mutton') ||
      name.includes('fish') ||
      name.includes('prawn') ||
      name.includes('wings') ||
      name.includes('salmon') ||
      name.includes('egg') ||
      name.includes('beef') ||
      name.includes('meat') ||
      desc.includes('chicken') ||
      desc.includes('mutton') ||
      desc.includes('fish') ||
      desc.includes('meat')
    );
  })();

  const isVeg = !isNonVeg;

  const discountPercent =
    item.originalPrice && item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7D055" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Image source={require('../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {item.name}
        </Text>

        <TouchableOpacity
          style={[styles.heartBtn, isFav && styles.heartBtnActive]}
          onPress={handleToggleFavorite}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ scale: favScaleAnim }] }}>
            <HeartIcon
              size={19}
              color={isFav ? '#EF4444' : '#6B7280'}
              filled={isFav}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Main White Content Card */}
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          overScrollMode="never"
          bounces={true}
        >
          {/* Hero Food Image Container */}
          <View style={styles.imageContainer}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.mainImage} resizeMode="cover" />
            ) : (
              <View style={[styles.mainImage, styles.placeholderBox]}>
                <Image source={getCategoryIcon(item.category)} style={styles.placeholderIcon} />
              </View>
            )}

            {/* Badges Overlay */}
            <View style={styles.badgeRowOverlay}>
              {discountPercent > 0 ? (
                <View style={styles.discountBadge}>
                  <PercentIcon size={12} color="#FFFFFF" />
                  <Text style={styles.discountBadgeText}> {discountPercent}% OFF</Text>
                </View>
              ) : item.discountBadge ? (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>{item.discountBadge}</Text>
                </View>
              ) : null}

              <View style={styles.vegBadge}>
                <View style={[styles.vegDot, { backgroundColor: isVeg ? '#16A34A' : '#DC2626' }]} />
                <Text style={[styles.vegText, { color: isVeg ? '#16A34A' : '#DC2626' }]}>
                  {isVeg ? 'PURE VEG' : 'NON-VEG'}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Metrics Bar (Rating • ETA • Category) */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <StarIcon size={15} color="#F59E0B" />
              <Text style={styles.metricText}> {item.rating?.toFixed(1) || '4.8'}</Text>
              <Text style={styles.metricSubText}> (150+)</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <ClockIcon size={15} color={colors.primary} />
              <Text style={styles.metricText}> 20-30 min</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.categoryPillText}>{item.category || 'Special'}</Text>
            </View>
          </View>

          {/* Title & Price Row */}
          <View style={styles.infoSection}>
            <Text style={styles.itemName}>{item.name}</Text>

            <View style={styles.priceAndQtyRow}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>₹{unitPrice.toFixed(0)}</Text>
                {item.originalPrice && item.originalPrice > item.price ? (
                  <Text style={styles.originalPriceText}>₹{item.originalPrice.toFixed(0)}</Text>
                ) : null}
                {discountPercent > 0 ? (
                  <View style={styles.savingsPill}>
                    <Text style={styles.savingsPillText}>Save ₹{(item.originalPrice! - item.price).toFixed(0)}</Text>
                  </View>
                ) : null}
              </View>

              {/* Quantity Stepper */}
              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.qtyText}>{quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(quantity + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.descriptionHeader}>Description</Text>
            <Text style={styles.descriptionText}>
              {item.description ||
                'Prepared fresh with premium ingredients, authentic spices, and cooked to perfection for a delightful taste.'}
            </Text>
          </View>

          {/* Customizations / Add-ons if available */}
          {item.customizations && item.customizations.length > 0 ? (
            <View style={styles.customizationsContainer}>
              <Text style={styles.customizationMainTitle}>Customise Your Order</Text>
              {item.customizations.map((section, idx) => (
                <View key={idx} style={styles.customizationSection}>
                  <Text style={styles.customizationTitle}>{section.title}</Text>

                  {section.options.map((option) => {
                    const selected = !!selectedAddOns[option.id];
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[styles.optionCard, selected && styles.optionCardSelected]}
                        onPress={() => handleToggleAddOn(option.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.optionLeft}>
                          <View style={[styles.checkboxOuter, selected && styles.checkboxOuterSelected]}>
                            {selected && <View style={styles.checkboxInner} />}
                          </View>
                          <Text style={[styles.optionName, selected && styles.optionNameSelected]}>
                            {option.name}
                          </Text>
                        </View>
                        <Text style={[styles.optionPrice, selected && styles.optionPriceSelected]}>
                          +₹{option.price.toFixed(0)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          ) : null}

        </ScrollView>

        {/* Floating Added To Cart Banner Toast */}
        {showAddedToast && (
          <Animated.View
            style={[
              styles.toastBanner,
              {
                opacity: toastAnim,
                transform: [
                  {
                    translateY: toastAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.toastLeft}>
              <View style={styles.toastCheck}>
                <Text style={styles.toastCheckText}>✓</Text>
              </View>
              <View>
                <Text style={styles.toastTitle}>Item added to cart!</Text>
                <Text style={styles.toastSub}>{quantity}x {item.name}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.toastActionBtn}
              onPress={() => {
                setShowAddedToast(false);
                navigation.navigate('Cart');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.toastActionText}>View Cart ➔</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Floating Favorite Toast Banner */}
        {showFavToast && (
          <Animated.View
            style={[
              styles.favToastBanner,
              {
                opacity: favToastAnim,
                transform: [
                  {
                    translateY: favToastAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <HeartIcon size={16} color="#EF4444" filled />
            <Text style={styles.favToastText}>{favToastMsg}</Text>
          </Animated.View>
        )}

        {/* Bottom Floating Action Bar */}
        <View style={styles.floatingActionBar}>
          <View style={styles.actionPriceInfo}>
            <Text style={styles.actionPriceLabel}>Total Price</Text>
            <Text style={styles.actionPriceValue}>₹{grandTotal.toFixed(0)}</Text>
          </View>

          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Image source={require('../../assets/cart.png')} style={styles.cartIconImg} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F7D055',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 16,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    backIconImg: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      tintColor: '#1E1B18',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#1E1B18',
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 10,
    },
    heartBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    heartBtnActive: {
      backgroundColor: '#FEE2E2',
      borderWidth: 1.5,
      borderColor: '#FECACA',
    },
    contentContainer: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
      overflow: 'hidden',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 130,
    },
    imageContainer: {
      width: '100%',
      height: 240,
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 16,
      position: 'relative',
      backgroundColor: '#FFF9E6',
      borderWidth: 1,
      borderColor: '#F3E8C8',
    },
    mainImage: {
      width: '100%',
      height: '100%',
    },
    placeholderBox: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderIcon: {
      width: 80,
      height: 80,
      resizeMode: 'contain',
      tintColor: colors.primary,
      opacity: 0.6,
    },
    badgeRowOverlay: {
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    discountBadge: {
      backgroundColor: '#DC2626',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    discountBadgeText: {
      color: '#FFFFFF',
      fontWeight: '900',
      fontSize: 11,
      letterSpacing: 0.5,
    },
    vegBadge: {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    },
    vegDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    vegText: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    metricsBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      backgroundColor: '#F9FAFB',
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#EEF2F6',
    },
    metricItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metricText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.text,
    },
    metricSubText: {
      fontSize: 11,
      color: colors.textMuted,
    },
    metricDivider: {
      width: 1,
      height: 18,
      backgroundColor: '#E5E7EB',
    },
    categoryPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'capitalize',
    },
    infoSection: {
      marginBottom: 20,
    },
    itemName: {
      fontSize: 22,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 12,
      lineHeight: 28,
    },
    priceAndQtyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    priceText: {
      fontSize: 26,
      fontWeight: '900',
      color: colors.primary,
    },
    originalPriceText: {
      fontSize: 16,
      color: colors.textMuted,
      textDecorationLine: 'line-through',
    },
    savingsPill: {
      backgroundColor: '#DCFCE7',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    savingsPillText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#15803D',
    },
    qtyControl: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF4EB',
      borderRadius: 24,
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.25)',
    },
    qtyBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    qtyBtnText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '900',
      lineHeight: 20,
    },
    qtyText: {
      fontSize: 16,
      fontWeight: '900',
      color: colors.text,
      paddingHorizontal: 14,
    },
    descriptionHeader: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 6,
    },
    descriptionText: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 20,
    },
    customizationsContainer: {
      marginTop: 10,
      marginBottom: 20,
    },
    customizationMainTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 14,
    },
    customizationSection: {
      marginBottom: 16,
    },
    customizationTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textMuted,
      marginBottom: 10,
    },
    optionCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      backgroundColor: '#FFFFFF',
      marginBottom: 8,
    },
    optionCardSelected: {
      borderColor: colors.primary,
      backgroundColor: '#FFF8F4',
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    checkboxOuter: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: '#D1D5DB',
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxOuterSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    checkboxInner: {
      width: 8,
      height: 8,
      borderRadius: 2,
      backgroundColor: '#FFFFFF',
    },
    optionName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    optionNameSelected: {
      color: colors.primary,
      fontWeight: '700',
    },
    optionPrice: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
    },
    optionPriceSelected: {
      color: colors.primary,
    },
    toastBanner: {
      position: 'absolute',
      bottom: 95,
      left: 16,
      right: 16,
      backgroundColor: '#1E1B18',
      borderRadius: 18,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 99,
    },
    toastLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    toastCheck: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#16A34A',
      justifyContent: 'center',
      alignItems: 'center',
    },
    toastCheckText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '900',
    },
    toastTitle: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },
    toastSub: {
      color: '#9CA3AF',
      fontSize: 11,
      marginTop: 1,
    },
    toastActionBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    toastActionText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },
    floatingActionBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderColor: '#F3F4F6',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 6,
    },
    actionPriceInfo: {
      justifyContent: 'center',
    },
    actionPriceLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    actionPriceValue: {
      fontSize: 22,
      fontWeight: '900',
      color: colors.text,
      marginTop: 1,
    },
    addToCartBtn: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 20,
      gap: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    cartIconImg: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
    addToCartText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '900',
    },
    favToastBanner: {
      position: 'absolute',
      bottom: 95,
      alignSelf: 'center',
      backgroundColor: '#1E1B18',
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 7,
      zIndex: 99,
    },
    favToastText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
  });
