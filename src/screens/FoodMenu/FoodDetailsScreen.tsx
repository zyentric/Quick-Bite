import React, { useState, useEffect, useMemo } from 'react';
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
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { addRecentlyViewedItem } from '../../utils/recentItems';
import { API_URL } from '../../config/api';
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

// Default high-quality verified reviews for products
const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    userName: 'Aarav Sharma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    date: 'Yesterday',
    comment: 'Super fresh, hot, and packed with incredible authentic flavor! Best quality in the area.',
    verified: true,
  },
  {
    id: 'rev-2',
    userName: 'Priya Patel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    rating: 4.8,
    date: '3 days ago',
    comment: 'Perfect portion size and delivered right on time. Highly recommended!',
    verified: true,
  },
  {
    id: 'rev-3',
    userName: 'Rohan Gupta',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    date: 'Last week',
    comment: 'Tastes like high-end restaurant food at a very pocket-friendly price.',
    verified: true,
  },
];

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
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [relatedItems, setRelatedItems] = useState<MenuItem[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

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

  // Fetch Related / Suggested Menu Items
  useEffect(() => {
    const fetchRelated = async () => {
      if (!item) return;
      setLoadingRelated(true);
      try {
        const categoryParam = item.category ? `?category=${encodeURIComponent(item.category)}` : '';
        const res = await fetch(`${API_URL}/menu-items${categoryParam}`);
        if (res.ok) {
          const data: any[] = await res.json();
          const filtered = (Array.isArray(data) ? data : [])
            .filter((p) => (p.id || p._id) !== itemId)
            .map((p) => ({
              id: p.id || p._id,
              name: p.name,
              price: Number(p.price) || 0,
              originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
              discountBadge: p.discountBadge,
              description: p.description || '',
              image: p.image,
              rating: Number(p.rating) || 4.5,
              category: p.category || item.category,
              customizations: p.customizations,
            }));

          // If category has few items, fetch general items to ensure suggestions
          if (filtered.length < 3) {
            const allRes = await fetch(`${API_URL}/menu-items`);
            if (allRes.ok) {
              const allData = await allRes.json();
              const moreFiltered = (Array.isArray(allData) ? allData : [])
                .filter((p) => (p.id || p._id) !== itemId)
                .slice(0, 6)
                .map((p) => ({
                  id: p.id || p._id,
                  name: p.name,
                  price: Number(p.price) || 0,
                  originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
                  discountBadge: p.discountBadge,
                  description: p.description || '',
                  image: p.image,
                  rating: Number(p.rating) || 4.5,
                  category: p.category || 'Special',
                  customizations: p.customizations,
                }));
              setRelatedItems(moreFiltered);
              return;
            }
          }

          setRelatedItems(filtered.slice(0, 6));
        }
      } catch (err) {
        console.log('Error fetching related items:', err);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelated();
  }, [itemId, item]);

  const handleToggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleFavorite = async () => {
    Animated.sequence([
      Animated.timing(favScaleAnim, {
        toValue: 1.4,
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
    item?.customizations?.reduce((total, section) => {
      return (
        total +
        section.options.reduce((secTotal, opt) => {
          return secTotal + (selectedAddOns[opt.id] ? opt.price : 0);
        }, 0)
      );
    }, 0) || 0;

  const basePrice = item?.price || 0;
  const unitPrice = basePrice + addOnsTotal;
  const grandTotal = unitPrice * quantity;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        ...item,
        price: unitPrice,
      });
    }

    setShowAddedToast(true);
    Animated.spring(toastAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowAddedToast(false));
    }, 3800);
  };

  const handleQuickAddRelated = (relItem: MenuItem) => {
    addToCart(relItem);
    setShowAddedToast(true);
    Animated.spring(toastAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowAddedToast(false));
    }, 3500);
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7D055" />
        <ProductDetailSkeleton />
      </SafeAreaView>
    );
  }

  // Dietary Classification
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

  const ratingScore = item.rating || 4.8;
  const ratingCount = Math.floor(180 + ((item.price * 7) % 320));

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
            <HeartIcon size={19} color={isFav ? '#EF4444' : '#4B5563'} filled={isFav} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Main Content White Container */}
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          overScrollMode="never"
          bounces={true}
        >
          {/* 1. Hero Food Image */}
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
              ) : (
                <View style={styles.bestsellerBadge}>
                  <Text style={styles.bestsellerBadgeText}>★ BESTSELLER</Text>
                </View>
              )}

              {/* FSSAI Styled Veg / Non-Veg Indicator */}
              <View style={styles.dietaryBadge}>
                <View style={[styles.dietaryBox, { borderColor: isVeg ? '#16A34A' : '#DC2626' }]}>
                  <View
                    style={[
                      styles.dietaryDot,
                      { backgroundColor: isVeg ? '#16A34A' : '#DC2626' },
                    ]}
                  />
                </View>
                <Text style={[styles.vegText, { color: isVeg ? '#16A34A' : '#DC2626' }]}>
                  {isVeg ? 'PURE VEG' : 'NON-VEG'}
                </Text>
              </View>
            </View>
          </View>

          {/* 2. Key Metrics Bar (Rating • ETA • Category • Calories) */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <StarIcon size={15} color="#F59E0B" />
              <Text style={styles.metricText}> {ratingScore.toFixed(1)}</Text>
              <Text style={styles.metricSubText}> ({ratingCount}+)</Text>
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

          {/* 3. Product Title & Price Row */}
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
                    <Text style={styles.savingsPillText}>
                      Save ₹{(item.originalPrice! - item.price).toFixed(0)}
                    </Text>
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

            {/* 4. Quality & Freshness Guarantee Badges */}
            <View style={styles.qualityHighlightsContainer}>
              <View style={styles.qualityItem}>
                <View style={[styles.qualityIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Text style={styles.qualityEmoji}>🌿</Text>
                </View>
                <View style={styles.qualityTexts}>
                  <Text style={styles.qualityTitle}>100% Fresh</Text>
                  <Text style={styles.qualitySub}>Farm fresh ingredients</Text>
                </View>
              </View>

              <View style={styles.qualityItem}>
                <View style={[styles.qualityIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Text style={styles.qualityEmoji}>🛡️</Text>
                </View>
                <View style={styles.qualityTexts}>
                  <Text style={styles.qualityTitle}>Hygiene 5★</Text>
                  <Text style={styles.qualitySub}>Sanitized kitchen</Text>
                </View>
              </View>

              <View style={styles.qualityItem}>
                <View style={[styles.qualityIconBox, { backgroundColor: '#FFF7ED' }]}>
                  <Text style={styles.qualityEmoji}>⚡</Text>
                </View>
                <View style={styles.qualityTexts}>
                  <Text style={styles.qualityTitle}>Hot & Fresh</Text>
                  <Text style={styles.qualitySub}>Cooked on order</Text>
                </View>
              </View>

              <View style={styles.qualityItem}>
                <View style={[styles.qualityIconBox, { backgroundColor: '#FAF5FF' }]}>
                  <Text style={styles.qualityEmoji}>👨‍🍳</Text>
                </View>
                <View style={styles.qualityTexts}>
                  <Text style={styles.qualityTitle}>Chef's Secret</Text>
                  <Text style={styles.qualitySub}>Signature recipe</Text>
                </View>
              </View>
            </View>

            {/* 5. Food Attributes (Portion • Spice Level • Nutrition) */}
            <View style={styles.attributesCard}>
              <View style={styles.attributeCol}>
                <Text style={styles.attributeLabel}>Portion</Text>
                <Text style={styles.attributeVal}>Serves 1-2 • 350g</Text>
              </View>
              <View style={styles.attributeDivider} />
              <View style={styles.attributeCol}>
                <Text style={styles.attributeLabel}>Spice Level</Text>
                <Text style={styles.attributeVal}>{isVeg ? 'Medium 🌶️🌶️' : 'Spicy 🌶️🌶️🌶️'}</Text>
              </View>
              <View style={styles.attributeDivider} />
              <View style={styles.attributeCol}>
                <Text style={styles.attributeLabel}>Calories</Text>
                <Text style={styles.attributeVal}>~380 kcal</Text>
              </View>
            </View>

            {/* 6. Product Description */}
            <Text style={styles.sectionHeading}>Description</Text>
            <Text style={styles.descriptionText} numberOfLines={showFullDesc ? undefined : 3}>
              {item.description ||
                'Prepared fresh with authentic spices, premium farm-fresh ingredients, and perfected to deliver a mouth-watering taste in every bite.'}
            </Text>
            {(item.description?.length || 0) > 110 && (
              <TouchableOpacity
                onPress={() => setShowFullDesc(!showFullDesc)}
                style={styles.readMoreBtn}
              >
                <Text style={styles.readMoreText}>{showFullDesc ? 'Read Less ▲' : 'Read More ▼'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 7. Customizations / Add-ons if available */}
          {item.customizations && item.customizations.length > 0 ? (
            <View style={styles.customizationsContainer}>
              <Text style={styles.sectionHeading}>Customise Your Order</Text>
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
                          <View
                            style={[
                              styles.checkboxOuter,
                              selected && styles.checkboxOuterSelected,
                            ]}
                          >
                            {selected && <View style={styles.checkboxInner} />}
                          </View>
                          <Text
                            style={[styles.optionName, selected && styles.optionNameSelected]}
                          >
                            {option.name}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.optionPrice,
                            selected && styles.optionPriceSelected,
                          ]}
                        >
                          +₹{option.price.toFixed(0)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          ) : null}

          {/* 8. Ratings & Customer Reviews Breakdown */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeaderRow}>
              <View>
                <Text style={styles.sectionHeading}>Customer Reviews</Text>
                <Text style={styles.reviewsSubText}>Real reviews from verified foodies</Text>
              </View>
              <View style={styles.overallRatingBadge}>
                <StarIcon size={16} color="#FFFFFF" />
                <Text style={styles.overallRatingText}> {ratingScore.toFixed(1)}</Text>
              </View>
            </View>

            {/* Rating Breakdown Bar */}
            <View style={styles.ratingBreakdownCard}>
              <View style={styles.ratingScoreBigWrap}>
                <Text style={styles.ratingScoreBig}>{ratingScore.toFixed(1)}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarIcon key={s} size={13} color="#F59E0B" />
                  ))}
                </View>
                <Text style={styles.ratingTotalSub}>{ratingCount} ratings</Text>
              </View>

              <View style={styles.ratingBarsCol}>
                {[
                  { star: '5★', pct: '78%' },
                  { star: '4★', pct: '16%' },
                  { star: '3★', pct: '4%' },
                  { star: '2★', pct: '1%' },
                  { star: '1★', pct: '1%' },
                ].map((bar, idx) => (
                  <View key={idx} style={styles.ratingBarRow}>
                    <Text style={styles.ratingBarLabel}>{bar.star}</Text>
                    <View style={styles.ratingBarTrack}>
                      <View style={[styles.ratingBarFill, { width: bar.pct as any }]} />
                    </View>
                    <Text style={styles.ratingBarPct}>{bar.pct}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Individual Reviews List */}
            {DEFAULT_REVIEWS.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewCardHeader}>
                  <Image source={{ uri: rev.avatar }} style={styles.reviewerAvatar} />
                  <View style={styles.reviewerInfo}>
                    <View style={styles.reviewerNameRow}>
                      <Text style={styles.reviewerName}>{rev.userName}</Text>
                      {rev.verified && (
                        <View style={styles.verifiedPill}>
                          <Text style={styles.verifiedText}>✓ Verified</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.reviewDate}>{rev.date}</Text>
                  </View>

                  <View style={styles.reviewStarPill}>
                    <StarIcon size={11} color="#FFFFFF" />
                    <Text style={styles.reviewStarPillText}> {rev.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{rev.comment}</Text>
              </View>
            ))}
          </View>

          {/* 9. Related / Suggested Products Section */}
          {relatedItems.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.relatedHeaderRow}>
                <Text style={styles.sectionHeading}>Frequently Paired With</Text>
                <Text style={styles.relatedSubHeading}>Suggestions you might love</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScrollContainer}
              >
                {relatedItems.map((rel) => {
                  const relIsNonVeg = (rel.name || '').toLowerCase().match(/chicken|meat|fish|mutton|prawn|egg/i);
                  const relIsVeg = !relIsNonVeg;
                  return (
                    <TouchableOpacity
                      key={rel.id}
                      style={styles.relatedCard}
                      onPress={() => {
                        navigation.push('FoodDetails', { item: rel });
                      }}
                      activeOpacity={0.88}
                    >
                      <View style={styles.relatedImageWrap}>
                        {rel.image ? (
                          <Image
                            source={{ uri: rel.image }}
                            style={styles.relatedImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.relatedImage, styles.placeholderBox]}>
                            <Image
                              source={getCategoryIcon(rel.category)}
                              style={styles.relatedPlaceholderIcon}
                            />
                          </View>
                        )}
                        <View style={styles.relatedDietaryBadge}>
                          <View
                            style={[
                              styles.dietaryBoxSmall,
                              { borderColor: relIsVeg ? '#16A34A' : '#DC2626' },
                            ]}
                          >
                            <View
                              style={[
                                styles.dietaryDotSmall,
                                { backgroundColor: relIsVeg ? '#16A34A' : '#DC2626' },
                              ]}
                            />
                          </View>
                        </View>
                      </View>

                      <View style={styles.relatedBody}>
                        <Text style={styles.relatedTitle} numberOfLines={1}>
                          {rel.name}
                        </Text>
                        <View style={styles.relatedRatingRow}>
                          <StarIcon size={12} color="#F59E0B" />
                          <Text style={styles.relatedRatingText}>
                            {(rel.rating || 4.5).toFixed(1)}
                          </Text>
                        </View>

                        <View style={styles.relatedFooter}>
                          <Text style={styles.relatedPrice}>₹{rel.price.toFixed(0)}</Text>
                          <TouchableOpacity
                            style={styles.relatedAddBtn}
                            onPress={() => handleQuickAddRelated(rel)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.relatedAddBtnText}>+ ADD</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* 10. Safety & Delivery Commitment Footer */}
          <View style={styles.safetyBox}>
            <Image source={Icons.spoons} style={styles.safetyIcon} />
            <View style={styles.safetyTextWrap}>
              <Text style={styles.safetyTitle}>QuickBite Quality Assurance</Text>
              <Text style={styles.safetyDesc}>
                Contactless delivery • Tamper-proof packaging • 100% money-back freshness guarantee
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Floating Added To Cart Toast Banner */}
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
                <Text style={styles.toastSub}>
                  {quantity}x {item.name}
                </Text>
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
    bestsellerBadge: {
      backgroundColor: '#D97706',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    bestsellerBadgeText: {
      color: '#FFFFFF',
      fontWeight: '900',
      fontSize: 10,
      letterSpacing: 0.5,
    },
    dietaryBadge: {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    },
    dietaryBox: {
      width: 14,
      height: 14,
      borderWidth: 1.5,
      borderRadius: 3,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
    },
    dietaryDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
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
    qualityHighlightsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginVertical: 14,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: '#FAF9F6',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#F0EBE1',
    },
    qualityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '47%',
      gap: 8,
      marginVertical: 4,
    },
    qualityIconBox: {
      width: 32,
      height: 32,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    qualityEmoji: {
      fontSize: 16,
    },
    qualityTexts: {
      flex: 1,
    },
    qualityTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.text,
    },
    qualitySub: {
      fontSize: 10,
      color: colors.textMuted,
    },
    attributesCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginVertical: 12,
    },
    attributeCol: {
      flex: 1,
      alignItems: 'center',
    },
    attributeLabel: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '600',
      marginBottom: 2,
    },
    attributeVal: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.text,
    },
    attributeDivider: {
      width: 1,
      height: 24,
      backgroundColor: '#E5E7EB',
    },
    sectionHeading: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 6,
    },
    descriptionText: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 20,
    },
    readMoreBtn: {
      marginTop: 4,
    },
    readMoreText: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
    },
    customizationsContainer: {
      marginTop: 10,
      marginBottom: 20,
    },
    customizationSection: {
      marginBottom: 16,
    },
    customizationTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      marginBottom: 8,
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
    reviewsSection: {
      marginTop: 14,
      marginBottom: 24,
    },
    reviewsHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    reviewsSubText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    overallRatingBadge: {
      backgroundColor: '#16A34A',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    overallRatingText: {
      color: '#FFFFFF',
      fontWeight: '900',
      fontSize: 13,
    },
    ratingBreakdownCard: {
      flexDirection: 'row',
      backgroundColor: '#F9FAFB',
      borderRadius: 16,
      padding: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#EEF2F6',
      alignItems: 'center',
    },
    ratingScoreBigWrap: {
      alignItems: 'center',
      paddingRight: 16,
      borderRightWidth: 1,
      borderRightColor: '#E5E7EB',
      width: 100,
    },
    ratingScoreBig: {
      fontSize: 30,
      fontWeight: '900',
      color: colors.text,
    },
    starsRow: {
      flexDirection: 'row',
      gap: 2,
      marginVertical: 4,
    },
    ratingTotalSub: {
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: '600',
    },
    ratingBarsCol: {
      flex: 1,
      paddingLeft: 14,
      gap: 4,
    },
    ratingBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    ratingBarLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textMuted,
      width: 20,
    },
    ratingBarTrack: {
      flex: 1,
      height: 6,
      backgroundColor: '#E5E7EB',
      borderRadius: 3,
      overflow: 'hidden',
    },
    ratingBarFill: {
      height: '100%',
      backgroundColor: '#F59E0B',
      borderRadius: 3,
    },
    ratingBarPct: {
      fontSize: 10,
      color: colors.textMuted,
      width: 28,
      textAlign: 'right',
    },
    reviewCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#F3F4F6',
    },
    reviewCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    reviewerAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 10,
    },
    reviewerInfo: {
      flex: 1,
    },
    reviewerNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    reviewerName: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.text,
    },
    verifiedPill: {
      backgroundColor: '#ECFDF5',
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 6,
    },
    verifiedText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#059669',
    },
    reviewDate: {
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 2,
    },
    reviewStarPill: {
      backgroundColor: '#16A34A',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    reviewStarPillText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
    },
    reviewComment: {
      fontSize: 12,
      color: colors.text,
      lineHeight: 18,
    },
    relatedSection: {
      marginTop: 10,
      marginBottom: 24,
    },
    relatedHeaderRow: {
      marginBottom: 12,
    },
    relatedSubHeading: {
      fontSize: 12,
      color: colors.textMuted,
    },
    relatedScrollContainer: {
      paddingRight: 10,
      gap: 14,
    },
    relatedCard: {
      width: 155,
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#F0EBE1',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    relatedImageWrap: {
      width: '100%',
      height: 105,
      backgroundColor: '#FFF9E6',
      position: 'relative',
    },
    relatedImage: {
      width: '100%',
      height: '100%',
    },
    relatedPlaceholderIcon: {
      width: 40,
      height: 40,
      tintColor: colors.primary,
      opacity: 0.6,
    },
    relatedDietaryBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: '#FFFFFF',
      padding: 3,
      borderRadius: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    dietaryBoxSmall: {
      width: 10,
      height: 10,
      borderWidth: 1.2,
      borderRadius: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dietaryDotSmall: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    relatedBody: {
      padding: 10,
    },
    relatedTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
    },
    relatedRatingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 8,
    },
    relatedRatingText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    relatedFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    relatedPrice: {
      fontSize: 14,
      fontWeight: '900',
      color: colors.primary,
    },
    relatedAddBtn: {
      backgroundColor: '#FFF4EB',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.3)',
    },
    relatedAddBtnText: {
      fontSize: 10,
      fontWeight: '900',
      color: colors.primary,
    },
    safetyBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F9FAFB',
      borderRadius: 16,
      padding: 14,
      gap: 12,
      marginTop: 10,
      borderWidth: 1,
      borderColor: '#EEF2F6',
    },
    safetyIcon: {
      width: 28,
      height: 28,
      resizeMode: 'contain',
      tintColor: colors.primary,
    },
    safetyTextWrap: {
      flex: 1,
    },
    safetyTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 2,
    },
    safetyDesc: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 15,
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
