import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Restaurant, MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import { API_URL } from '../../config/api';
import DashboardHeader from '../../components/DashboardHeader';
import Icons from '../../constants/icons';
import { getRecentlyViewedItems, clearRecentlyViewedItems } from '../../utils/recentItems';
import ShopkeeperDashboardScreen from '../Shopkeeper/ShopkeeperDashboardScreen';
import DeliveryDashboardScreen from './DeliveryDashboardScreen';

// Modular Home Components
import {
  HomePerksFilter,
  HomeCravings,
  HomeCategories,
  HomeBannerCarousel,
  HomeFlashDeals,
  HomeBestSellers,
  HomeExpressDelivery,
  HomeRestaurants,
  HomeHealthyCorner,
  HomeRecommendations,
  HomeRecentlyViewed,
  HomeTrustBadges,
  CinemaClosedModal,
} from '../../components/home';
import AppFooter from '../../components/common/AppFooter';
import HomeScreenSkeleton from '../../components/skeleton/HomeScreenSkeleton';

// Fallback Categories
const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Snacks',  icon: Icons.snacks,  tab: 'Snacks' },
  { id: '2', name: 'Meal',    icon: Icons.meal,    tab: 'Meal' },
  { id: '3', name: 'Vegan',   icon: Icons.vegan,   tab: 'Vegan' },
  { id: '4', name: 'Dessert', icon: Icons.dessert, tab: 'Dessert' },
  { id: '5', name: 'Drinks',  icon: Icons.drinks,  tab: 'Drinks' },
];

// Fallback Promotional Banners
const DEFAULT_BANNERS = [
  {
    id: 'b1',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=2669&auto=format&fit=crop',
    tag: 'FLAT 30% OFF',
    text: 'Experience our delicious\nChef Specials today!',
    subtext: 'Code: QUICK30 | Min order ₹199',
  },
  {
    id: 'b2',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=2670&auto=format&fit=crop',
    tag: 'BUY 1 GET 1',
    text: 'Taco & Burger Fiesta\nBuy 1 Get 1 Free!',
    subtext: 'Free instant contactless delivery',
  },
];

const getCategoryIcon = (category?: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('snack')) return Icons.snacks;
  if (cat.includes('vegan') || cat.includes('salad')) return Icons.vegan;
  if (cat.includes('dessert') || cat.includes('cake') || cat.includes('sweet')) return Icons.dessert;
  if (cat.includes('drink') || cat.includes('beverage')) return Icons.drinks;
  return Icons.meal;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { role, userProfile } = useUser();
  const { addToCart } = useCart();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recentItems, setRecentItems] = useState<MenuItem[]>([]);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dismissedClosedModal, setDismissedClosedModal] = useState(false);

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { title: 'Good Morning', sub: "Rise and shine! What's for breakfast?" };
    if (hour < 17) return { title: 'Good Afternoon', sub: 'Craving delicious lunch or fresh bites?' };
    return { title: 'Good Evening', sub: 'Time to relax with your favorite dinner.' };
  };

  const { title: greetingTitle, sub: greetingSub } = getGreeting();

  // Haversine distance calculator for real proximity
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Fetch Menu Items and Restaurants from API
  const fetchData = async () => {
    if (role === 'shopkeeper' || role === 'delivery_man') return;
    try {
      const userLat = userProfile?.savedAddresses?.[0]?.latitude || 12.9352;
      const userLng = userProfile?.savedAddresses?.[0]?.longitude || 77.6245;

      const [menuRes, restRes, configRes] = await Promise.all([
        fetch(`${API_URL}/menu-items`),
        fetch(`${API_URL}/restaurants?latitude=${userLat}&longitude=${userLng}`),
        fetch(`${API_URL}/system-config`).catch(() => null),
      ]);

      let maxRadiusKm = 10;
      if (configRes && configRes.ok) {
        const configData = await configRes.json();
        if (configData.maxDeliveryRadiusKm) {
          maxRadiusKm = configData.maxDeliveryRadiusKm;
        }
      }

      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenuItems(Array.isArray(menuData) ? menuData : menuData.items || []);
      }

      if (restRes.ok) {
        const restData: Restaurant[] = await restRes.json();

        const mappedRestaurants = (Array.isArray(restData) ? restData : []).map((r: any, idx) => {
          let dist = r.distanceKm;
          if (dist === undefined || dist === null) {
            if (r.location?.latitude && r.location?.longitude) {
              dist = calculateDistanceKm(userLat, userLng, r.location.latitude, r.location.longitude);
            } else {
              dist = 1.2 + idx * 0.5;
            }
          }
          return {
            ...r,
            distanceKm: dist,
            deliveryTime: dist < 2 ? '15–20 min' : dist < 4 ? '20–30 min' : '30–45 min',
          };
        });

        // Filter stores within active delivery radius (10 km default)
        const withinRadiusStores = mappedRestaurants.filter((r) => (r.distanceKm || 0) <= maxRadiusKm);

        // Sort: Open stores first, then highest rating, then closest distance
        withinRadiusStores.sort((a, b) => {
          const aOpen = a.isOpen !== false ? 1 : 0;
          const bOpen = b.isOpen !== false ? 1 : 0;
          if (aOpen !== bOpen) return bOpen - aOpen;

          const aDist = a.distanceKm || 0;
          const bDist = b.distanceKm || 0;
          if (aDist !== bDist) return aDist - bDist;

          const aRating = a.rating || 4.5;
          const bRating = b.rating || 4.5;
          return bRating - aRating;
        });

        setRestaurants(withinRadiusStores);
      }
    } catch (err) {
      console.error('Error fetching home screen data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recently viewed items on screen focus
  const loadRecentItems = async () => {
    const items = await getRecentlyViewedItems();
    setRecentItems(items);
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  useFocusEffect(
    useCallback(() => {
      loadRecentItems();
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchData(), loadRecentItems()]);
    setRefreshing(false);
  }, [role]);

  const handleClearRecents = async () => {
    await clearRecentlyViewedItems();
    setRecentItems([]);
  };

  // Handlers for Navigation
  const handleOpenFoodItem = (item: MenuItem) => {
    (navigation as any).navigate('FoodDetails', { item });
  };

  const handleOpenRestaurant = (restaurant: Restaurant) => {
    (navigation as any).navigate('RestaurantDetails', { restaurant });
  };

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item);
  };

  // Filtered menu items if quick filter is selected
  const filteredMenuItems = menuItems.filter((item) => {
    if (selectedQuickFilter === 'all') return true;
    if (selectedQuickFilter === 'top_rated') return (item.rating || 0) >= 4.5;
    if (selectedQuickFilter === 'deals') return !!item.discountBadge || (item.originalPrice && item.originalPrice > item.price);
    if (selectedQuickFilter === 'vegan') return (item.category || '').toLowerCase().includes('vegan');
    if (selectedQuickFilter === 'snacks') return (item.category || '').toLowerCase().includes('snack');
    return true;
  });

  // Best Sellers (Top rated items)
  const bestSellers = [...filteredMenuItems]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);

  // Flash Deals (Discounts & pocket friendly items)
  const flashDeals = [...filteredMenuItems]
    .filter((item) => item.price <= 60 || !!item.discountBadge || (item.originalPrice && item.originalPrice > item.price))
    .slice(0, 6);

  // Express Delivery (Fast items like snacks, drinks, quick meals)
  const expressItems = [...filteredMenuItems]
    .filter((item) => {
      const cat = (item.category || '').toLowerCase();
      return cat.includes('snack') || cat.includes('drink') || cat.includes('dessert') || item.price < 50;
    })
    .slice(0, 6);

  // Healthy Corner items
  const healthyItems = [...filteredMenuItems]
    .filter((item) => {
      const cat = (item.category || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      return cat.includes('vegan') || desc.includes('salad') || desc.includes('vegan') || desc.includes('healthy');
    })
    .slice(0, 6);

  // Recommendations (Curated variety)
  const recommendations = [...filteredMenuItems]
    .reverse()
    .slice(0, 6);

  // Dynamic Categories from API with fallback
  const uniqueCategories = Array.from(new Set(menuItems.map((i) => i.category).filter(Boolean)));
  const categoriesList = uniqueCategories.length > 0
    ? uniqueCategories.map((cat, idx) => ({
        id: String(idx + 1),
        name: cat as string,
        icon: getCategoryIcon(cat as string),
        tab: cat as string,
      }))
    : DEFAULT_CATEGORIES;

  // Check if all restaurants in the system are currently closed
  const allRestaurantsClosed = restaurants.length > 0 && restaurants.every((r) => r.isOpen === false);

  // Render shopkeeper or delivery partner dashboard if switched role
  if (role === 'shopkeeper') {
    return <ShopkeeperDashboardScreen />;
  }
  if (role === 'delivery_man') {
    return <DeliveryDashboardScreen />;
  }

  // Show skeleton on initial load
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7D055" />
        {/* Keep the yellow header visible while skeleton loads */}
        <View style={styles.headerSection}>
          <DashboardHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <View style={styles.greetingWrapper}>
            <Text style={styles.greetingTitle}>{greetingTitle}</Text>
            <Text style={styles.greetingSub}>{greetingSub}</Text>
          </View>
        </View>
        <View style={[styles.contentSection, { flex: 1 }]}>
          <HomeScreenSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7D055" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Yellow Header Section */}
        <View style={styles.headerSection}>
          <DashboardHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <View style={styles.greetingWrapper}>
            <Text style={styles.greetingTitle}>{greetingTitle}</Text>
            <Text style={styles.greetingSub}>{greetingSub}</Text>
          </View>
        </View>

        {/* White Content Section */}
        <View style={styles.contentSection}>
          {/* 1. What's On Your Mind? Cravings Story Circles */}
          <HomeCravings
            onSelectCraving={() => navigation.navigate('MainTabs', { screen: 'FoodMenu' })}
          />

          {/* 2. Interactive Filter Chips */}
          <HomePerksFilter
            selectedFilter={selectedQuickFilter}
            onSelectFilter={setSelectedQuickFilter}
          />

          {/* 3. Promotional Banner Carousel */}
          <HomeBannerCarousel
            banners={DEFAULT_BANNERS}
            onPressBanner={() => navigation.navigate('MainTabs', { screen: 'FoodMenu' })}
          />

          {/* 4. Pocket-Friendly Deals & Flash Offers */}
          <HomeFlashDeals
            items={flashDeals.length > 0 ? flashDeals : bestSellers.slice(0, 4)}
            onPressItem={handleOpenFoodItem}
            onAddToCart={handleAddToCart}
            onViewAll={() => navigation.navigate('MainTabs', { screen: 'FoodMenu' })}
          />

          {/* 5. Best Sellers Section */}
          <HomeBestSellers
            items={bestSellers}
            loading={loading}
            onPressItem={handleOpenFoodItem}
            onAddToCart={handleAddToCart}
            onViewAll={() => navigation.getParent()?.navigate('BestSeller')}
          />

          {/* 6. Express Under 25 Mins */}
          <HomeExpressDelivery
            items={expressItems.length > 0 ? expressItems : recommendations.slice(0, 4)}
            onPressItem={handleOpenFoodItem}
            onAddToCart={handleAddToCart}
            onViewAll={() => navigation.navigate('MainTabs', { screen: 'FoodMenu' })}
          />

          {/* 7. Explore Categories */}
          <HomeCategories
            categories={categoriesList}
            onSelectCategory={() => navigation.navigate('MainTabs', { screen: 'FoodMenu' })}
            onViewAll={() => navigation.navigate('MainTabs', { screen: 'FoodMenu' })}
          />

          {/* 8. Top Restaurants Near You */}
          <HomeRestaurants
            restaurants={restaurants}
            onPressRestaurant={handleOpenRestaurant}
            onViewAll={() => navigation.navigate('MainTabs', { screen: 'FoodMenu' })}
          />

          {/* 9. Guilt-Free & Healthy Corner */}
          <HomeHealthyCorner
            items={healthyItems.length > 0 ? healthyItems : recommendations.slice(0, 4)}
            onPressItem={handleOpenFoodItem}
            onAddToCart={handleAddToCart}
            onViewAll={() => navigation.navigate('MainTabs', { screen: 'FoodMenu' })}
          />

          {/* 10. Chef's Special Recommendations Grid */}
          <HomeRecommendations
            items={recommendations}
            onPressItem={handleOpenFoodItem}
            onAddToCart={handleAddToCart}
            onViewAll={() => navigation.getParent()?.navigate('Recommendations')}
          />

          {/* 11. Flipkart-Style "Recently Viewed Items" */}
          <HomeRecentlyViewed
            items={recentItems}
            onPressItem={handleOpenFoodItem}
            onClear={handleClearRecents}
          />

          {/* 12. Trust & Safety Badges */}
          <HomeTrustBadges />

          {/* 13. App Footer & Copyright */}
          <AppFooter bottomSpacing={10} />
          <View style={{ height: 110 }} />
        </View>
      </ScrollView>

      {/* Full-Screen Dark Vintage Cinema "All Restaurants Closed" Overlay with Skip */}
      <CinemaClosedModal
        visible={allRestaurantsClosed && !dismissedClosedModal}
        onClose={() => setDismissedClosedModal(true)}
        onBrowseMenu={() => {
          setDismissedClosedModal(true);
          navigation.navigate('MainTabs', { screen: 'FoodMenu' });
        }}
        onRefreshStatus={() => {
          setDismissedClosedModal(false);
          onRefresh();
        }}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F7D055',
    },
    container: {
      flex: 1,
      backgroundColor: '#F7D055',
    },
    headerSection: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 25,
    },
    greetingWrapper: {
      marginTop: 10,
    },
    greetingTitle: {
      fontSize: 26,
      fontWeight: '900',
      color: '#FFFFFF',
      textShadowColor: 'rgba(0,0,0,0.15)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
      marginBottom: 2,
    },
    greetingSub: {
      fontSize: 14,
      color: '#A04000',
      fontWeight: '700',
    },
    contentSection: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingTop: 24,
    },
  });
