import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, SafeAreaView, Dimensions, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { API_URL } from '../../config/api';
import DashboardHeader from '../../components/DashboardHeader';
import Icons from '../../constants/icons';

const { width } = Dimensions.get('window');

// --- Dummy Data ---
const dummyCategories = [
  { id: '1', name: 'Snacks',  icon: Icons.snacks,  tab: 'Snacks' },
  { id: '2', name: 'Meal',    icon: Icons.meal,    tab: 'Meal' },
  { id: '3', name: 'Vegan',   icon: Icons.vegan,   tab: 'Vegan' },
  { id: '4', name: 'Dessert', icon: Icons.dessert, tab: 'Dessert' },
  { id: '5', name: 'Drinks',  icon: Icons.drinks,  tab: 'Drinks' },
];

const DEFAULT_BEST_SELLERS = [
  { id: '1', name: 'Sushi', price: 103.00, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2670&auto=format&fit=crop', rating: '5.0', description: 'Delicious sushi roles.', customizations: [] },
  { id: '2', name: 'Chicken', price: 50.00, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=2513&auto=format&fit=crop', rating: '4.8', description: 'Roasted herb chicken.', customizations: [] },
  { id: '3', name: 'Lasagna', price: 12.99, image: 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?q=80&w=2574&auto=format&fit=crop', rating: '4.0', description: 'Cheesy beef lasagna.', customizations: [] },
  { id: '4', name: 'Cupcake', price: 8.20, image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?q=80&w=2574&auto=format&fit=crop', rating: '4.9', description: 'Creamy chocolate cupcake.', customizations: [] },
];

const DEFAULT_RECOMMENDED = [
  { id: '1', name: 'Burger', price: 10.0, rating: '5.0', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2599&auto=format&fit=crop', description: 'Gourmet beef burger.', customizations: [] },
  { id: '2', name: 'Spring Rolls', price: 25.0, rating: '5.0', image: 'https://images.unsplash.com/photo-1536521642388-441263f88a61?q=80&w=2670&auto=format&fit=crop', description: 'Crispy vegetable spring rolls.', customizations: [] },
];

const DEFAULT_BANNERS = [
  { id: '1', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=2669&auto=format&fit=crop', text: 'Experience our\ndelicious new dish\n30% OFF' },
  { id: '2', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=2670&auto=format&fit=crop', text: 'Taco Tuesday\nBuy 1 Get 1 Free!' },
];

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('snack')) return Icons.snacks;
  if (cat.includes('vegan')) return Icons.vegan;
  if (cat.includes('dessert')) return Icons.dessert;
  if (cat.includes('drink')) return Icons.drinks;
  return Icons.meal;
};

import { useUser } from '../../context/UserContext';
import ShopkeeperDashboardScreen from './ShopkeeperDashboardScreen';
import DeliveryDashboardScreen from './DeliveryDashboardScreen';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { role } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBanner, setActiveBanner] = useState(0);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { title: 'Good Morning', sub: "Rise And Shine! It's Breakfast Time" };
    if (hour < 18) return { title: 'Good Afternoon', sub: "Hope you're having a great day!" };
    return { title: 'Good Evening', sub: "Time to relax and enjoy dinner." };
  };

  const { title: greetingTitle, sub: greetingSub } = getGreeting();

  const fetchMenuItems = async () => {
    if (role === 'shopkeeper' || role === 'delivery_man') return;
    try {
      const res = await fetch(`${API_URL}/menu-items`);
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (err) {
      console.error("Error fetching menu items:", err);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [role]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMenuItems();
    setRefreshing(false);
  }, [role]);

  const currentBestSellers = menuItems.length > 0 
    ? [...menuItems].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10).map(item => ({
        id: item.id || item._id,
        name: item.name,
        price: item.price,
        rating: item.rating?.toString() || '5.0',
        image: item.image || 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2670&auto=format&fit=crop',
        description: item.description,
        customizations: item.customizations || []
      }))
    : DEFAULT_BEST_SELLERS;

  const currentRecommended = menuItems.length > 0
    ? [...menuItems].reverse().slice(0, 6).map(item => ({
        id: item.id || item._id,
        name: item.name,
        price: item.price,
        rating: item.rating?.toFixed(1) || '5.0',
        image: item.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2599&auto=format&fit=crop',
        description: item.description,
        customizations: item.customizations || []
      }))
    : DEFAULT_RECOMMENDED;

  const currentBanners = menuItems.length > 0
    ? menuItems.slice(0, 4).map((item, idx) => {
        const discountPrice = item.price * 0.7; // 30% off
        const promoItem = {
          id: item.id || item._id,
          name: item.name,
          price: idx === 0 ? parseFloat(discountPrice.toFixed(2)) : item.price,
          originalPrice: idx === 0 ? item.price : undefined,
          discountBadge: idx === 0 ? '-30%' : undefined,
          rating: item.rating || 5.0,
          description: item.description || 'Delicious freshly prepared dish.',
          image: item.image,
          customizations: item.customizations || []
        };
        return {
          id: item.id || item._id,
          image: item.image,
          text: idx === 0 
            ? `Experience our\ndelicious new ${item.name}\n30% OFF` 
            : `${item.name}\nSpecial Offer!`,
          item: promoItem
        };
      })
    : DEFAULT_BANNERS.map((b, idx) => ({
        id: b.id,
        image: b.image,
        text: b.text,
        item: {
          id: 'promo' + b.id,
          name: idx === 0 ? 'Pizza with Pepperoni and Cheese' : 'Taco Tuesday Special',
          price: idx === 0 ? 14.00 : 15.00,
          originalPrice: idx === 0 ? 20.00 : undefined,
          discountBadge: idx === 0 ? '-30%' : undefined,
          rating: 5.0,
          description: 'Delicious hot food item.',
          image: b.image,
          customizations: []
        }
      }));

  const uniqueCategories = menuItems.length > 0 
    ? Array.from(new Set(menuItems.map(item => item.category).filter(Boolean)))
    : [];

  const currentCategories = uniqueCategories.length > 0
    ? uniqueCategories.map((cat, idx) => ({
        id: String(idx + 1),
        name: cat,
        icon: getCategoryIcon(cat),
        tab: cat
      }))
    : dummyCategories;

  const handleScroll = (e: any) => {
    const slide = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
    setActiveBanner(slide);
  };

  if (role === 'shopkeeper') {
    return <ShopkeeperDashboardScreen />;
  }

  if (role === 'delivery_man') {
    return <DeliveryDashboardScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
          
          {/* Top Bar: Search and Icons */}
          <DashboardHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

          {/* Greeting */}
          <Text style={styles.greetingTitle}>{greetingTitle}</Text>
          <Text style={styles.greetingSub}>{greetingSub}</Text>
        </View>

        {/* White Content Section (Rounded Top) */}
        <View style={styles.contentSection}>
          
          {/* Categories */}
          <View style={styles.categoriesWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
              {currentCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryItem}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('MainTabs', { screen: 'FoodMenu' })}
                >
                  <View style={styles.categoryCircle}>
                    <Image source={cat.icon} style={styles.categoryIcon} />
                  </View>
                  <Text style={styles.categoryText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Best Seller */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Best Seller</Text>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate('BestSeller')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bestSellerList}>
            {currentBestSellers.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.bestSellerCard} 
                activeOpacity={0.9}
                onPress={() => {
                  const foodItem = {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    rating: parseFloat(item.rating || '5.0'),
                    description: item.description || 'Delicious freshly prepared dish.',
                    image: item.image,
                    customizations: item.customizations || []
                  };
                  navigation.getParent()?.navigate('FoodDetails', { item: foodItem });
                }}
              >
                <Image source={{ uri: item.image }} style={styles.bestSellerImg} />
                <View style={styles.priceBadge}>
                  <Text style={styles.priceText}>₹{item.price.toFixed(0)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Promotional Banner Carousel */}
          <View style={styles.promoWrapper}>
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false} 
              onMomentumScrollEnd={handleScroll}
            >
              {currentBanners.map((banner, _index) => (
                <TouchableOpacity 
                  key={banner.id} 
                  style={styles.promoSlide}
                  onPress={() => {
                    navigation.getParent()?.navigate('FoodDetails', { item: banner.item });
                  }}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: banner.image }} style={styles.promoImg} />
                  <View style={styles.promoOverlay}>
                    <Text style={styles.promoText}>{banner.text}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Dots */}
            <View style={styles.dotsContainer}>
              {currentBanners.map((_, i) => (
                <View key={i} style={[styles.dot, activeBanner === i && styles.activeDot]} />
              ))}
            </View>
          </View>

          {/* Recommend */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommend</Text>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Recommendations')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recommendGrid}>
            {currentRecommended.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.recommendCard} 
                activeOpacity={0.9}
                onPress={() => {
                  const foodItem = {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    rating: parseFloat(item.rating || '5.0'),
                    description: item.description || 'Delicious freshly prepared dish.',
                    image: item.image,
                    customizations: item.customizations || []
                  };
                  navigation.getParent()?.navigate('FoodDetails', { item: foodItem });
                }}
              >
                <Image source={{ uri: item.image }} style={styles.recommendImg} />
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{item.rating} ⭐ ❤️</Text>
                </View>
                <View style={styles.priceBadgeLarge}>
                  <Text style={styles.priceText}>₹{item.price.toFixed(0)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primaryBackground, 
  },
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground, 
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40, 
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', 
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#333',
  },
  filterIconBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIconText: {
    fontSize: 12,
    color: '#fff',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnText: {
    fontSize: 14,
  },
  greetingTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
    marginBottom: 4,
  },
  greetingSub: {
    fontSize: 14,
    color: '#D35400', // A darker orange/red based on mockup
    fontWeight: 'bold',
  },
  contentSection: {
    flex: 1,
    backgroundColor: colors.surface, // Typically white in light mode
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    minHeight: Dimensions.get('window').height * 0.7,
  },
  categoriesWrapper: {
    marginBottom: 25,
  },
  categoriesList: {
    paddingHorizontal: 15,
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
  categoryIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  categoryText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  bestSellerList: {
    paddingHorizontal: 15,
    marginBottom: 30,
  },
  bestSellerCard: {
    width: 80,
    height: 100,
    borderRadius: 16,
    marginHorizontal: 5,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  bestSellerImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopLeftRadius: 10,
  },
  priceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  promoWrapper: {
    marginBottom: 30,
    alignItems: 'center',
  },
  promoSlide: {
    width: width - 40,
    marginHorizontal: 20,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  promoImg: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  promoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 93, 34, 0.5)', // Orange tint
  },
  promoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  dot: {
    width: 20,
    height: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 3,
    borderRadius: 2,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  recommendGrid: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  recommendCard: {
    width: (width - 40) / 2, // Half width minus padding
    height: 150,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 5,
    backgroundColor: colors.background,
  },
  recommendImg: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  priceBadgeLarge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopLeftRadius: 15,
  },
});
