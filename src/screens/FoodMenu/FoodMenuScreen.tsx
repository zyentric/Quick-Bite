import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Dimensions, 
  StatusBar,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { API_URL } from '../../config/api';
import CustomAlert from '../../components/CustomAlert';
import DashboardHeader from '../../components/DashboardHeader';
import ExploreSkeleton, { ExploreFoodCardSkeleton } from '../../components/skeleton/ExploreSkeleton';
import Icons from '../../constants/icons';

const { width } = Dimensions.get('window');

type FoodMenuNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodMenu'>;
type FoodMenuRouteProp = RouteProp<RootStackParamList, 'FoodMenu'>;

const CATEGORIES = [
  { id: 'Snacks',  icon: Icons.snacks },
  { id: 'Meal',    icon: Icons.meal },
  { id: 'Vegan',   icon: Icons.vegan },
  { id: 'Dessert', icon: Icons.dessert },
  { id: 'Drinks',  icon: Icons.drinks },
];

export default function FoodMenuScreen() {
  const navigation = useNavigation<FoodMenuNavigationProp>();
  const route = useRoute<FoodMenuRouteProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(route.params?.category || 'Snacks');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>(route.params?.sort || 'popular');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const colors = useThemeColors();
  const styles = getStyles(colors);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const normalizeItem = (item: any): MenuItem => ({
    id: item.id || item._id || '',
    name: item.name || '',
    price: Number(item.price) || 0,
    rating: Number(item.rating) || 4.5,
    description: item.description || '',
    image: item.image || '',
    category: item.category || 'Snacks',
    customizations: item.customizations || []
  });

  const fetchCategoryItems = useCallback(async (
    isRefresh = false, 
    pageNum = 1, 
    currentCategory = activeTab, 
    currentSort = sortBy
  ) => {
    if (pageNum === 1 && !isRefresh) {
      if (initialLoading) {
        // First screen open
      } else {
        setTabLoading(true);
      }
    } else if (pageNum > 1) {
      setLoadingMore(true);
    }

    try {
      const url = `${API_URL}/menu-items?category=${encodeURIComponent(currentCategory)}&page=${pageNum}&limit=10&sort=${currentSort}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        showAlert('Error', data.message || 'Failed to fetch menu items');
        return;
      }

      const fetchedList: MenuItem[] = Array.isArray(data)
        ? data.map(normalizeItem)
        : Array.isArray(data?.items)
        ? data.items.map(normalizeItem)
        : [];

      setItems((prev) => {
        if (pageNum === 1) return fetchedList;
        const existingIds = new Set(prev.map((i) => i.id));
        const newOnes = fetchedList.filter((i) => !existingIds.has(i.id));
        return [...prev, ...newOnes];
      });

      if (data.hasMore !== undefined) {
        setHasMore(data.hasMore);
      } else {
        setHasMore(fetchedList.length >= 10);
      }
      setPage(pageNum);
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setInitialLoading(false);
      setTabLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [activeTab, sortBy, initialLoading]);

  useEffect(() => {
    fetchCategoryItems(false, 1, activeTab, sortBy);
  }, [activeTab, sortBy]);

  useEffect(() => {
    if (route.params?.category && route.params.category !== activeTab) {
      setActiveTab(route.params.category);
      setPage(1);
      setHasMore(true);
      setItems([]);
    }
    if (route.params?.sort && route.params.sort !== sortBy) {
      setSortBy(route.params.sort);
      setPage(1);
      setHasMore(true);
      setItems([]);
    }
  }, [route.params]);

  const handleTabChange = (catId: string) => {
    if (catId === activeTab) return;
    setActiveTab(catId);
    setPage(1);
    setHasMore(true);
    setItems([]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchCategoryItems(true, 1, activeTab, sortBy);
  };

  const loadMore = () => {
    if (!initialLoading && !tabLoading && !loadingMore && hasMore) {
      fetchCategoryItems(false, page + 1, activeTab, sortBy);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 80;
    if (isCloseToBottom && !initialLoading && !tabLoading && !loadingMore && hasMore) {
      loadMore();
    }
  };

  const toggleSort = () => {
    if (sortBy === 'popular') setSortBy('price_asc');
    else if (sortBy === 'price_asc') setSortBy('price_desc');
    else setSortBy('popular');
    setPage(1);
    setHasMore(true);
    setItems([]);
  };

  const getSortLabel = () => {
    if (sortBy === 'price_asc') return 'Price: Low to High';
    if (sortBy === 'price_desc') return 'Price: High to Low';
    return 'Popular';
  };

  const displayItems = items.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }
    if (route.params?.maxPrice && item.price > route.params.maxPrice) {
      return false;
    }
    if (route.params?.minRating && (item.rating || 0) < route.params.minRating) {
      return false;
    }
    if (route.params?.subCategory) {
      const sub = route.params.subCategory.toLowerCase();
      const matchSub =
        item.name.toLowerCase().includes(sub) || item.description.toLowerCase().includes(sub);
      if (!matchSub) return false;
    }
    return true;
  });

  const renderFoodItem = (item: MenuItem) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.foodCard}
      onPress={() => navigation.navigate('FoodDetails', { item })}
      activeOpacity={0.88}
    >
      <Image source={{ uri: item.image }} style={styles.foodImage} />
      <View style={styles.foodInfo}>
        <View style={styles.foodHeader}>
          <Text style={styles.foodTitle} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Image source={Icons.star} style={styles.ratingStarIcon} />
            <Text style={styles.ratingText}>{item.rating?.toFixed(1)}</Text>
          </View>
          <Text style={styles.foodPrice}>₹{item.price.toFixed(2)}</Text>
        </View>
        <Text style={styles.foodDescription} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#F7D055' }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7D055" />

      {/* Reusable Custom Alert Modal */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <View style={styles.container}>
        {/* Yellow Header Area */}
        <View style={styles.headerSection}>
          <DashboardHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </View>

        {/* Content Area */}
        <View style={styles.contentSection}>
          {initialLoading ? (
            <ExploreSkeleton count={3} />
          ) : (
            <>
              {/* Horizontal Categories */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {CATEGORIES.map((cat) => {
                  const isActive = activeTab === cat.id;
                  return (
                    <TouchableOpacity 
                      key={cat.id} 
                      style={styles.categoryItem}
                      onPress={() => handleTabChange(cat.id)}
                    >
                      <View style={[styles.categoryCircle, isActive ? styles.categoryCircleActive : null]}>
                        <Image source={cat.icon} style={[styles.categoryIcon, isActive ? styles.categoryIconActive : null]} />
                      </View>
                      <Text style={[styles.categoryLabel, isActive ? styles.categoryLabelActive : null]}>
                        {cat.id}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Sort By Filter */}
              <View style={styles.sortRow}>
                <Text style={styles.sortLabel}>Sort: <Text style={styles.sortHighlight}>{getSortLabel()}</Text></Text>
                <TouchableOpacity style={styles.sortIconBtn} onPress={toggleSort}>
                  <Image source={require('../../assets/sortby.png')} style={styles.sortIconImg} />
                </TouchableOpacity>
              </View>

              {/* Active Filter Badges from Filter Screen */}
              {(route.params?.maxPrice || route.params?.minRating || route.params?.subCategory || route.params?.dietary) && (
                <View style={styles.activeFilterPillsRow}>
                  {route.params.dietary && (
                    <View style={styles.activeFilterPill}>
                      <Text style={styles.activeFilterPillText}>{route.params.dietary.toUpperCase()}</Text>
                    </View>
                  )}
                  {route.params.maxPrice && (
                    <View style={styles.activeFilterPill}>
                      <Text style={styles.activeFilterPillText}>Under ₹{route.params.maxPrice}</Text>
                    </View>
                  )}
                  {route.params.minRating && (
                    <View style={styles.activeFilterPill}>
                      <Image source={Icons.star} style={styles.activePillStar} />
                      <Text style={styles.activeFilterPillText}>{route.params.minRating}+</Text>
                    </View>
                  )}
                  {route.params.subCategory && (
                    <View style={styles.activeFilterPill}>
                      <Text style={styles.activeFilterPillText}>{route.params.subCategory}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.clearFilterPill}
                    onPress={() =>
                      navigation.setParams({
                        maxPrice: undefined,
                        minRating: undefined,
                        subCategory: undefined,
                        dietary: undefined,
                      })
                    }
                  >
                    <Text style={styles.clearFilterPillText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Food List with Infinite Scroll & Skeletons */}
              {tabLoading ? (
                <View style={{ paddingHorizontal: 20 }}>
                  <ExploreFoodCardSkeleton />
                  <ExploreFoodCardSkeleton />
                </View>
              ) : (
                <ScrollView 
                  showsVerticalScrollIndicator={false} 
                  contentContainerStyle={styles.listContent}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                  }
                >
                  {displayItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyTitle}>No dishes found</Text>
                      <Text style={styles.emptySubtitle}>Try changing category or clear search filter</Text>
                    </View>
                  ) : (
                    displayItems.map(renderFoodItem)
                  )}

                  {/* Load More Skeleton Footer */}
                  {loadingMore && (
                    <View style={{ marginTop: 10 }}>
                      <ExploreFoodCardSkeleton />
                      <ExploreFoodCardSkeleton />
                    </View>
                  )}
                </ScrollView>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7D055', // Yellow
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary, // Orange bottom area
  },
  headerSection: {
    backgroundColor: '#F7D055',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#fff', // White container for categories and list
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -20,
    paddingTop: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 120, // Adjusted height to accommodate images
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  categoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FDF0D5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#F7C653',
    padding: 12,
  },
  categoryCircleActive: {
    backgroundColor: 'rgba(232, 93, 34, 0.15)', // Light orange to show contrast
    borderColor: colors.primary,
  },
  categoryIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  categoryIconActive: {
    opacity: 0.7, // Reduce opacity slightly as requested to make it pop nicely
  },
  categoryLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  categoryLabelActive: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  sortLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  sortHighlight: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  sortIconBtn: {
    backgroundColor: colors.inputBackground,
    padding: 8,
    borderRadius: 15,
  },
  sortIconImg: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  foodCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    paddingBottom: 15,
  },
  foodImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  foodInfo: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  ratingStarIcon: {
    width: 9,
    height: 9,
    tintColor: '#FFFFFF',
    marginRight: 3,
    resizeMode: 'contain',
  },
  activePillStar: {
    width: 10,
    height: 10,
    tintColor: '#B45309',
    marginRight: 4,
    resizeMode: 'contain',
  },
  ratingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  foodPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  foodDescription: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  bottomTabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    bottom: 0,
  },
  tabBtn: {
    padding: 5,
  },
  tabIcon: {
    fontSize: 20,
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  activeFilterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 6,
    alignItems: 'center',
  },
  activeFilterPill: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeFilterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  clearFilterPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clearFilterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
});
