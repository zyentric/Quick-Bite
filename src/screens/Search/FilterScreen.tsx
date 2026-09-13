import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MenuItem, FilterOptions } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { API_URL } from '../../config/api';
import Icons from '../../constants/icons';

const { width } = Dimensions.get('window');

type FilterNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Filter'>;
type FilterRouteProp = RouteProp<RootStackParamList, 'Filter'>;

const iconStyles = StyleSheet.create({
  dietarySymbolBox: {
    borderWidth: 1.5,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  standardIcon: {
    resizeMode: 'contain',
    marginRight: 6,
  },
});

// ── Standard Dietary Indicators (FSSAI standard) ──────────────────────────
function VegIcon({ size = 14 }: { size?: number }) {
  return (
    <View style={[iconStyles.dietarySymbolBox, { width: size, height: size, borderColor: '#16A34A' }]}>
      <View style={{ width: size * 0.45, height: size * 0.45, backgroundColor: '#16A34A', borderRadius: (size * 0.45) / 2 }} />
    </View>
  );
}

function NonVegIcon({ size = 14 }: { size?: number }) {
  return (
    <View style={[iconStyles.dietarySymbolBox, { width: size, height: size, borderColor: '#DC2626' }]}>
      <View style={{ width: size * 0.45, height: size * 0.45, backgroundColor: '#DC2626', borderRadius: (size * 0.45) / 2 }} />
    </View>
  );
}

function VeganIcon({ size = 15, isSelected = false }: { size?: number; isSelected?: boolean }) {
  return (
    <Image
      source={Icons.vegan}
      style={[
        iconStyles.standardIcon,
        { width: size, height: size, tintColor: isSelected ? '#FFFFFF' : '#059669' },
      ]}
    />
  );
}

function AllItemsIcon({ size = 15, isSelected = false }: { size?: number; isSelected?: boolean }) {
  return (
    <Image
      source={Icons.spoons}
      style={[
        iconStyles.standardIcon,
        { width: size, height: size, tintColor: isSelected ? '#FFFFFF' : '#4B5563' },
      ]}
    />
  );
}

const MAIN_CATEGORIES = [
  { id: 'All',     label: 'All',     icon: Icons.spoons },
  { id: 'Snacks',  label: 'Snacks',  icon: Icons.snacks },
  { id: 'Meal',    label: 'Meals',   icon: Icons.meal },
  { id: 'Vegan',   label: 'Vegan',   icon: Icons.vegan },
  { id: 'Dessert', label: 'Dessert', icon: Icons.dessert },
  { id: 'Drinks',  label: 'Drinks',  icon: Icons.drinks },
];

const SORT_OPTIONS: { id: 'popular' | 'rating' | 'price_asc' | 'price_desc' | 'fast_delivery'; label: string; icon?: any }[] = [
  { id: 'popular',       label: 'Most Popular',         icon: Icons.favorite },
  { id: 'rating',        label: 'Top Rated (4.0+)',     icon: Icons.star },
  { id: 'price_asc',     label: 'Price: Low to High' },
  { id: 'price_desc',    label: 'Price: High to Low' },
  { id: 'fast_delivery', label: 'Express Delivery',     icon: Icons.deliverymen },
];

const PRICE_TIERS = [
  { id: 'all',       label: 'Any Price',     max: 1000 },
  { id: 'under_150', label: 'Under ₹150',    max: 150 },
  { id: '150_300',   label: '₹150 – ₹300',   max: 300 },
  { id: '300_500',   label: '₹300 – ₹500',   max: 500 },
  { id: 'above_500', label: '₹500 & Above',  max: 1000 },
];

const RATING_TIERS = [
  { id: 0,   label: 'Any Rating' },
  { id: 3.5, label: '3.5 & Above' },
  { id: 4.0, label: '4.0 & Above' },
  { id: 4.5, label: '4.5 & Above' },
];

const POPULAR_DISH_TAGS = [
  'Pizza', 'Burger', 'Biryani', 'Pasta', 'Sushi', 'Tacos',
  'Salad', 'Rolls', 'Wings', 'Cakes', 'Ice Cream', 'Coffee',
  'Smoothie', 'Noodles', 'Sandwich', 'Curry'
];

export default function FilterScreen() {
  const navigation = useNavigation<FilterNavigationProp>();
  const route = useRoute<FilterRouteProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const initialCat = route.params?.initialCategory || 'All';
  const initial = route.params?.initialFilters;

  // Filter States
  const [selectedMain, setSelectedMain] = useState<string>(initial?.category || initialCat);
  const [selectedSort, setSelectedSort] = useState<'popular' | 'rating' | 'price_asc' | 'price_desc' | 'fast_delivery'>(
    initial?.sortBy || 'popular'
  );
  const [dietary, setDietary] = useState<'all' | 'veg' | 'non_veg' | 'vegan'>(initial?.dietary || 'all');
  const [selectedRating, setSelectedRating] = useState<number>(initial?.minRating ?? 0);
  const [maxPrice, setMaxPrice] = useState<number>(initial?.maxPrice ?? 1000);
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>(initial?.subCategories || []);
  const [freeDelivery, setFreeDelivery] = useState<boolean>(initial?.freeDeliveryOnly ?? false);
  const [offersOnly, setOffersOnly] = useState<boolean>(initial?.offersOnly ?? false);

  // Data for live count calculation
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Fetch all items to compute real-time matching count
  useEffect(() => {
    let isMounted = true;
    const loadItems = async () => {
      try {
        const res = await fetch(`${API_URL}/menu-items`);
        if (res.ok) {
          const data = await res.json();
          const list: MenuItem[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
            ? data.items
            : [];
          if (isMounted) setAllItems(list);
        }
      } catch (e) {
        console.warn('Could not load menu items for filter counter:', e);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    };
    loadItems();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Active Filters Count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedMain !== 'All') count++;
    if (selectedSort !== 'popular') count++;
    if (dietary !== 'all') count++;
    if (selectedRating > 0) count++;
    if (maxPrice < 1000) count++;
    if (selectedTags.length > 0) count += selectedTags.length;
    if (freeDelivery) count++;
    if (offersOnly) count++;
    return count;
  }, [selectedMain, selectedSort, dietary, selectedRating, maxPrice, selectedTags, freeDelivery, offersOnly]);

  // Compute matching items in real time
  const matchingItems = useMemo(() => {
    if (allItems.length === 0) return [];

    return allItems.filter((item) => {
      // Category check
      if (selectedMain !== 'All') {
        const itemCat = (item.category || '').toLowerCase();
        if (itemCat !== selectedMain.toLowerCase()) return false;
      }

      // Price ceiling check
      if (item.price > maxPrice) return false;

      // Rating check
      if (selectedRating > 0 && (item.rating || 0) < selectedRating) return false;

      // Dietary check
      const name = (item.name || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();

      const isNonVegDish =
        name.includes('chicken') ||
        name.includes('mutton') ||
        name.includes('fish') ||
        name.includes('prawn') ||
        name.includes('wings') ||
        name.includes('salmon') ||
        name.includes('egg') ||
        desc.includes('chicken');

      if (dietary === 'veg' && isNonVegDish) return false;
      if (dietary === 'non_veg' && !isNonVegDish) return false;
      if (dietary === 'vegan') {
        const isVegan = cat.includes('vegan') || name.includes('vegan') || desc.includes('vegan');
        if (!isVegan) return false;
      }

      // Dish tags / Subcategories check
      if (selectedTags.length > 0) {
        const matchesTag = selectedTags.some(
          (tag) => name.includes(tag.toLowerCase()) || desc.includes(tag.toLowerCase()) || cat.includes(tag.toLowerCase())
        );
        if (!matchesTag) return false;
      }

      // Offers check
      if (offersOnly && !item.discountBadge && (!item.originalPrice || item.originalPrice <= item.price)) {
        return false;
      }

      return true;
    });
  }, [allItems, selectedMain, maxPrice, selectedRating, dietary, selectedTags, offersOnly]);

  // Reset all filters to default
  const handleResetAll = () => {
    setSelectedMain('All');
    setSelectedSort('popular');
    setDietary('all');
    setSelectedRating(0);
    setMaxPrice(1000);
    setSelectedTier('all');
    setSelectedTags([]);
    setFreeDelivery(false);
    setOffersOnly(false);
  };

  const handlePriceTierSelect = (tier: typeof PRICE_TIERS[0]) => {
    setSelectedTier(tier.id);
    setMaxPrice(tier.max);
  };

  const adjustPriceStepper = (delta: number) => {
    setSelectedTier('custom');
    setMaxPrice((prev) => Math.max(50, Math.min(1000, prev + delta)));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Apply filters and navigate
  const handleApply = () => {
    const filterState: FilterOptions = {
      category: selectedMain === 'All' ? undefined : selectedMain,
      sortBy: selectedSort,
      dietary: dietary === 'all' ? undefined : dietary,
      minRating: selectedRating > 0 ? selectedRating : undefined,
      maxPrice: maxPrice < 1000 ? maxPrice : undefined,
      subCategories: selectedTags.length > 0 ? selectedTags : undefined,
      freeDeliveryOnly: freeDelivery,
      offersOnly: offersOnly,
    };

    if (route.params?.onApply) {
      route.params.onApply(filterState);
      navigation.goBack();
      return;
    }

    // Default action: Navigate to FoodMenu tab with applied filters
    const sortParam: 'popular' | 'price_asc' | 'price_desc' =
      selectedSort === 'price_asc'
        ? 'price_asc'
        : selectedSort === 'price_desc'
        ? 'price_desc'
        : 'popular';

    navigation.navigate('MainTabs', {
      screen: 'FoodMenu',
      params: {
        category: selectedMain === 'All' ? 'Snacks' : selectedMain,
        sort: sortParam,
        maxPrice: maxPrice < 1000 ? maxPrice : undefined,
        minRating: selectedRating > 0 ? selectedRating : undefined,
        dietary: dietary !== 'all' ? dietary : undefined,
        subCategory: selectedTags.length > 0 ? selectedTags[0] : undefined,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7D055" />

      {/* ── Modern QuickBite Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Image source={Icons.back} style={styles.backIconImg} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Filter & Refine</Text>
          {activeFiltersCount > 0 ? (
            <View style={styles.activeFiltersBadge}>
              <Text style={styles.activeFiltersText}>{activeFiltersCount} Active</Text>
            </View>
          ) : (
            <Text style={styles.headerSubtitle}>Customize your cravings</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.resetBtn, activeFiltersCount === 0 && styles.resetBtnDisabled]}
          onPress={handleResetAll}
          disabled={activeFiltersCount === 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.resetBtnText, activeFiltersCount === 0 && styles.resetBtnTextDisabled]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── White Curved Content Card ── */}
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section 1: Meal Categories */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Meal Categories</Text>
            {selectedMain !== 'All' && (
              <TouchableOpacity onPress={() => setSelectedMain('All')}>
                <Text style={styles.sectionClearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {MAIN_CATEGORIES.map((cat) => {
              const isSelected = selectedMain === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryItem}
                  onPress={() => setSelectedMain(cat.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryCircle, isSelected && styles.categoryCircleSelected]}>
                    <Image
                      source={cat.icon}
                      style={[styles.categoryIconImg, isSelected && styles.categoryIconImgSelected]}
                    />
                  </View>
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.divider} />

          {/* Section 2: Sort Options */}
          <Text style={styles.sectionTitle}>Sort Dishes By</Text>
          <View style={styles.sortChipsContainer}>
            {SORT_OPTIONS.map((opt) => {
              const isSelected = selectedSort === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.sortChip, isSelected && styles.sortChipSelected]}
                  onPress={() => setSelectedSort(opt.id)}
                  activeOpacity={0.8}
                >
                  {opt.icon && (
                    <Image
                      source={opt.icon}
                      style={[
                        styles.chipIconImg,
                        isSelected && { tintColor: '#FFFFFF' },
                        opt.id === 'rating' && !isSelected && { tintColor: '#F59E0B' },
                      ]}
                    />
                  )}
                  <Text style={[styles.sortChipText, isSelected && styles.sortChipTextSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          {/* Section 3: Dietary Preference (Standard FSSAI style icons) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Dietary Preference</Text>
            {dietary !== 'all' && (
              <TouchableOpacity onPress={() => setDietary('all')}>
                <Text style={styles.sectionClearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.dietaryRow}>
            {/* All Items */}
            <TouchableOpacity
              style={[styles.dietaryChip, dietary === 'all' && styles.dietaryChipSelectedAll]}
              onPress={() => setDietary('all')}
              activeOpacity={0.8}
            >
              <AllItemsIcon size={14} isSelected={dietary === 'all'} />
              <Text style={[styles.dietaryText, dietary === 'all' && styles.dietaryTextSelected]}>
                All Items
              </Text>
            </TouchableOpacity>

            {/* Pure Veg */}
            <TouchableOpacity
              style={[styles.dietaryChip, dietary === 'veg' && styles.dietaryChipSelectedVeg]}
              onPress={() => setDietary('veg')}
              activeOpacity={0.8}
            >
              <VegIcon size={13} />
              <Text style={[styles.dietaryText, dietary === 'veg' && { color: '#16A34A', fontWeight: '700' }]}>
                Pure Veg
              </Text>
            </TouchableOpacity>

            {/* Non-Veg */}
            <TouchableOpacity
              style={[styles.dietaryChip, dietary === 'non_veg' && styles.dietaryChipSelectedNonVeg]}
              onPress={() => setDietary('non_veg')}
              activeOpacity={0.8}
            >
              <NonVegIcon size={13} />
              <Text style={[styles.dietaryText, dietary === 'non_veg' && { color: '#DC2626', fontWeight: '700' }]}>
                Non-Veg
              </Text>
            </TouchableOpacity>

            {/* Vegan Only */}
            <TouchableOpacity
              style={[styles.dietaryChip, dietary === 'vegan' && styles.dietaryChipSelectedVegan]}
              onPress={() => setDietary('vegan')}
              activeOpacity={0.8}
            >
              <VeganIcon size={15} isSelected={dietary === 'vegan'} />
              <Text style={[styles.dietaryText, dietary === 'vegan' && { color: '#059669', fontWeight: '700' }]}>
                Vegan Only
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Section 4: Price Range (Interactive INR ₹) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Price Ceiling</Text>
            <View style={styles.priceCurrentBubble}>
              <Text style={styles.priceCurrentText}>
                {maxPrice >= 1000 ? 'Any Price' : `Up to ₹${maxPrice}`}
              </Text>
            </View>
          </View>

          {/* Quick Price Preset Chips */}
          <View style={styles.priceTierRow}>
            {PRICE_TIERS.map((tier) => {
              const isSelected = selectedTier === tier.id;
              return (
                <TouchableOpacity
                  key={tier.id}
                  style={[styles.priceTierChip, isSelected && styles.priceTierChipSelected]}
                  onPress={() => handlePriceTierSelect(tier)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.priceTierText,
                      isSelected && styles.priceTierTextSelected,
                    ]}
                  >
                    {tier.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Stepper Fine-Tuner */}
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => adjustPriceStepper(-50)}
              activeOpacity={0.7}
            >
              <Text style={styles.stepperBtnText}>- ₹50</Text>
            </TouchableOpacity>

            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, Math.max(5, (maxPrice / 1000) * 100))}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressBarLabel}>Max Budget: ₹{maxPrice}</Text>
            </View>

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => adjustPriceStepper(50)}
              activeOpacity={0.7}
            >
              <Text style={styles.stepperBtnText}>+ ₹50</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Section 5: Customer Rating */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Customer Rating</Text>
            {selectedRating > 0 && (
              <TouchableOpacity onPress={() => setSelectedRating(0)}>
                <Text style={styles.sectionClearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Interactive Star Buttons */}
          <View style={styles.starsSelectRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setSelectedRating(star === selectedRating ? 0 : star)}
                style={styles.starTouchItem}
                activeOpacity={0.7}
              >
                <Image
                  source={Icons.star}
                  style={[
                    styles.starLargeImg,
                    star <= selectedRating ? styles.starLargeActive : styles.starLargeInactive,
                  ]}
                />
                <Text style={styles.starNumberLabel}>{star} Star{star > 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating Filter Chips */}
          <View style={styles.ratingChipsRow}>
            {RATING_TIERS.map((tier) => {
              const isSelected = selectedRating === tier.id;
              return (
                <TouchableOpacity
                  key={tier.id}
                  style={[styles.ratingChip, isSelected && styles.ratingChipSelected]}
                  onPress={() => setSelectedRating(tier.id)}
                  activeOpacity={0.8}
                >
                  {tier.id > 0 && (
                    <Image
                      source={Icons.star}
                      style={[
                        styles.chipStarIcon,
                        isSelected && { tintColor: '#FFFFFF' },
                      ]}
                    />
                  )}
                  <Text
                    style={[
                      styles.ratingChipText,
                      isSelected && styles.ratingChipTextSelected,
                    ]}
                  >
                    {tier.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          {/* Section 6: Popular Dish Tags & Cuisines */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Cuisines & Dish Types</Text>
            {selectedTags.length > 0 && (
              <TouchableOpacity onPress={() => setSelectedTags([])}>
                <Text style={styles.sectionClearText}>Clear ({selectedTags.length})</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.tagsCloudContainer}>
            {POPULAR_DISH_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.dishTagPill, isSelected && styles.dishTagPillSelected]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dishTagText,
                      isSelected && styles.dishTagTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                  {isSelected && (
                    <View style={styles.removeTagCircle}>
                      <Text style={styles.dishTagRemove}>✕</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          {/* Section 7: Perks & Delivery */}
          <Text style={styles.sectionTitle}>Offers & Delivery Perks</Text>
          <View style={styles.perksRow}>
            <TouchableOpacity
              style={[styles.perkChip, freeDelivery && styles.perkChipActive]}
              onPress={() => setFreeDelivery(!freeDelivery)}
              activeOpacity={0.8}
            >
              <Image
                source={Icons.deliverymen}
                style={[styles.perkImgIcon, freeDelivery && { tintColor: colors.primary }]}
              />
              <Text style={[styles.perkLabel, freeDelivery && styles.perkLabelActive]}>
                Free Delivery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.perkChip, offersOnly && styles.perkChipActive]}
              onPress={() => setOffersOnly(!offersOnly)}
              activeOpacity={0.8}
            >
              <Image
                source={Icons.card}
                style={[styles.perkImgIcon, offersOnly && { tintColor: colors.primary }]}
              />
              <Text style={[styles.perkLabel, offersOnly && styles.perkLabelActive]}>
                Special Deals
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ── Sticky Bottom Floating Action Bar ── */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.bottomResetBtn}
            onPress={handleResetAll}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomResetText}>Clear All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bottomApplyBtn,
              matchingItems.length === 0 && !loadingData && styles.bottomApplyBtnEmpty,
            ]}
            onPress={handleApply}
            activeOpacity={0.88}
          >
            <Text style={styles.bottomApplyText}>
              {loadingData
                ? 'Applying Filters...'
                : matchingItems.length === 0
                ? 'No Dishes Match (Reset)'
                : `Show ${matchingItems.length} Dishes`}
            </Text>
            {matchingItems.length > 0 && (
              <Image source={Icons.next} style={styles.bottomApplyNextIcon} />
            )}
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
      backgroundColor: '#F7D055', // Signature QuickBite yellow header
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 20,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    backIconImg: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      tintColor: colors.primary,
    },
    headerTitleWrap: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1F2937',
    },
    headerSubtitle: {
      fontSize: 12,
      color: '#4B5563',
      marginTop: 2,
    },
    activeFiltersBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginTop: 2,
    },
    activeFiltersText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
    resetBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    resetBtnDisabled: {
      opacity: 0.5,
    },
    resetBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    resetBtnTextDisabled: {
      color: '#9CA3AF',
    },
    contentContainer: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 34,
      borderTopRightRadius: 34,
      overflow: 'hidden',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 110, // Generous clearance for sticky bottom bar
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 14,
    },
    sectionClearText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 14,
    },
    categoriesScroll: {
      paddingVertical: 4,
      gap: 14,
    },
    categoryItem: {
      alignItems: 'center',
      marginRight: 10,
    },
    categoryCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#FFF8EB',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: '#FDE68A',
      marginBottom: 6,
    },
    categoryCircleSelected: {
      backgroundColor: 'rgba(232, 93, 34, 0.12)',
      borderColor: colors.primary,
      borderWidth: 2,
      transform: [{ scale: 1.05 }],
    },
    categoryIconImg: {
      width: 26,
      height: 26,
      resizeMode: 'contain',
    },
    categoryIconImgSelected: {
      tintColor: colors.primary,
    },
    categoryLabel: {
      fontSize: 12,
      color: '#4B5563',
      fontWeight: '500',
    },
    categoryLabelSelected: {
      color: colors.primary,
      fontWeight: '700',
    },
    divider: {
      height: 1,
      backgroundColor: '#F3F4F6',
      marginVertical: 20,
    },
    sortChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    sortChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F9FAFB',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
      marginBottom: 8,
      marginRight: 6,
    },
    sortChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipIconImg: {
      width: 14,
      height: 14,
      resizeMode: 'contain',
      marginRight: 6,
      tintColor: '#4B5563',
    },
    sortChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#374151',
    },
    sortChipTextSelected: {
      color: '#FFFFFF',
    },
    dietaryRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    dietaryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F9FAFB',
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
    },
    dietaryChipSelectedAll: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    dietaryChipSelectedVeg: {
      borderColor: '#16A34A',
      backgroundColor: '#F0FDF4',
    },
    dietaryChipSelectedNonVeg: {
      borderColor: '#DC2626',
      backgroundColor: '#FEF2F2',
    },
    dietaryChipSelectedVegan: {
      borderColor: '#059669',
      backgroundColor: '#ECFDF5',
    },
    dietarySymbolBox: {
      borderWidth: 1.5,
      borderRadius: 3,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      marginRight: 6,
    },
    dietarySymbolDot: {},
    standardIcon: {
      resizeMode: 'contain',
      marginRight: 6,
    },
    dietaryText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#4B5563',
    },
    dietaryTextSelected: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    priceCurrentBubble: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    priceCurrentText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#B45309',
    },
    priceTierRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 14,
    },
    priceTierChip: {
      backgroundColor: '#F9FAFB',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 16,
      marginRight: 6,
      marginBottom: 6,
    },
    priceTierChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    priceTierText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#4B5563',
    },
    priceTierTextSelected: {
      color: '#FFFFFF',
    },
    stepperContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#F9FAFB',
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      marginTop: 6,
    },
    stepperBtn: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#D1D5DB',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    stepperBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    progressBarWrapper: {
      flex: 1,
      marginHorizontal: 12,
      alignItems: 'center',
    },
    progressBarBackground: {
      width: '100%',
      height: 6,
      backgroundColor: '#E5E7EB',
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    progressBarLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: '#6B7280',
      marginTop: 4,
    },
    starsSelectRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 14,
      backgroundColor: '#FFFBEB',
      paddingVertical: 12,
      borderRadius: 16,
    },
    starTouchItem: {
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    starLargeImg: {
      width: 26,
      height: 26,
      resizeMode: 'contain',
    },
    starLargeActive: {
      tintColor: '#F59E0B',
    },
    starLargeInactive: {
      tintColor: '#D1D5DB',
      opacity: 0.6,
    },
    starNumberLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: '#6B7280',
      marginTop: 4,
    },
    ratingChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    ratingChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F9FAFB',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 16,
      marginRight: 6,
      marginBottom: 6,
    },
    ratingChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipStarIcon: {
      width: 12,
      height: 12,
      resizeMode: 'contain',
      tintColor: '#F59E0B',
      marginRight: 4,
    },
    ratingChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#4B5563',
    },
    ratingChipTextSelected: {
      color: '#FFFFFF',
    },
    tagsCloudContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    dishTagPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 6,
      marginBottom: 8,
    },
    dishTagPillSelected: {
      backgroundColor: colors.primary,
    },
    dishTagText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#374151',
    },
    dishTagTextSelected: {
      color: '#FFFFFF',
    },
    removeTagCircle: {
      marginLeft: 6,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dishTagRemove: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: 'bold',
      lineHeight: 11,
    },
    perksRow: {
      flexDirection: 'row',
      gap: 12,
    },
    perkChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F9FAFB',
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 16,
      marginRight: 8,
    },
    perkChipActive: {
      borderColor: colors.primary,
      backgroundColor: 'rgba(232, 93, 34, 0.08)',
    },
    perkImgIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      marginRight: 8,
      tintColor: '#4B5563',
    },
    perkLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: '#374151',
    },
    perkLabelActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 10,
      gap: 12,
    },
    bottomResetBtn: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 24,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottomResetText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#4B5563',
    },
    bottomApplyBtn: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    bottomApplyBtnEmpty: {
      backgroundColor: '#9CA3AF',
      shadowOpacity: 0,
    },
    bottomApplyText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: 'bold',
    },
    bottomApplyNextIcon: {
      width: 14,
      height: 14,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
      marginLeft: 8,
    },
  });
