import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');

// --- Dummy Data ---
const dummyCategories = [
  { id: '1', name: 'Snacks', icon: '🥨' },
  { id: '2', name: 'Meal', icon: '🍽️' },
  { id: '3', name: 'Vegan', icon: '🥗' },
  { id: '4', name: 'Dessert', icon: '🧁' },
  { id: '5', name: 'Drinks', icon: '🍹' },
];

const bestSellers = [
  { id: '1', name: 'Sushi', price: 103.00, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2670&auto=format&fit=crop' },
  { id: '2', name: 'Chicken', price: 50.00, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=2513&auto=format&fit=crop' },
  { id: '3', name: 'Lasagna', price: 12.99, image: 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?q=80&w=2574&auto=format&fit=crop' },
  { id: '4', name: 'Cupcake', price: 8.20, image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?q=80&w=2574&auto=format&fit=crop' },
];

const recommended = [
  { id: '1', name: 'Burger', price: 10.0, rating: '5.0', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2599&auto=format&fit=crop' },
  { id: '2', name: 'Spring Rolls', price: 25.0, rating: '5.0', image: 'https://images.unsplash.com/photo-1536521642388-441263f88a61?q=80&w=2670&auto=format&fit=crop' },
];

const banners = [
  { id: '1', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=2669&auto=format&fit=crop', text: 'Experience our\ndelicious new dish\n30% OFF' },
  { id: '2', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=2670&auto=format&fit=crop', text: 'Taco Tuesday\nBuy 1 Get 1 Free!' },
];

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBanner, setActiveBanner] = useState(0);
  
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const handleScroll = (e: any) => {
    const slide = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
    setActiveBanner(slide);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false} style={styles.container}>
        
        {/* Yellow Header Section */}
        <View style={styles.headerSection}>
          
          {/* Top Bar: Search and Icons */}
          <View style={styles.topBar}>
            <View style={styles.searchBox}>
              <TextInput 
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity 
                style={styles.filterIconBtn}
                onPress={() => navigation.getParent()?.navigate('Filter')}
              >
                <Text style={styles.filterIconText}>⚙️</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
                <Text style={styles.iconBtnText}>🛒</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconBtn}
                onPress={() => navigation.getParent()?.navigate('Notifications')}
              >
                <Text style={styles.iconBtnText}>🔔</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconBtn}
                onPress={() => navigation.getParent()?.navigate('ProfileMenu')}
              >
                <Text style={styles.iconBtnText}>👤</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Greeting */}
          <Text style={styles.greetingTitle}>Good Morning</Text>
          <Text style={styles.greetingSub}>Rise And Shine! It's Breakfast Time</Text>
        </View>

        {/* White Content Section (Rounded Top) */}
        <View style={styles.contentSection}>
          
          {/* Categories */}
          <View style={styles.categoriesWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
              {dummyCategories.map((cat) => (
                <TouchableOpacity key={cat.id} style={styles.categoryItem} activeOpacity={0.8}>
                  <View style={styles.categoryCircle}>
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
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
              <Text style={styles.viewAllText}>View All {'>'}</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bestSellerList}>
            {bestSellers.map(item => (
              <TouchableOpacity key={item.id} style={styles.bestSellerCard} activeOpacity={0.9}>
                <Image source={{ uri: item.image }} style={styles.bestSellerImg} />
                <View style={styles.priceBadge}>
                  <Text style={styles.priceText}>${item.price.toFixed(1)}</Text>
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
              {banners.map((banner, _index) => (
                <TouchableOpacity 
                  key={banner.id} 
                  style={styles.promoSlide}
                  onPress={() => {
                    const mockPromoItem = {
                      id: 'promo' + banner.id,
                      name: 'Pizza with Pepperoni and Cheese',
                      price: 14.00,
                      originalPrice: 20.00,
                      discountBadge: '-30%',
                      rating: 5.0,
                      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
                      image: banner.image, // using the banner image for demo
                      customizations: [
                        {
                          title: 'Personal portion',
                          options: [
                            { id: 'p1', name: 'Personal (4 Slides)', price: 0.00 },
                            { id: 'p2', name: 'Medium (8 Slides)', price: 3.00 },
                            { id: 'p3', name: 'Familiar (10 Slides)', price: 6.00 },
                            { id: 'p4', name: 'Jumbo (12 Slides)', price: 10.00 },
                          ]
                        }
                      ]
                    };
                    navigation.getParent()?.navigate('FoodDetails', { item: mockPromoItem });
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
              {banners.map((_, i) => (
                <View key={i} style={[styles.dot, activeBanner === i && styles.activeDot]} />
              ))}
            </View>
          </View>

          {/* Recommend */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommend</Text>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Recommendations')}>
              <Text style={styles.viewAllText}>View All {'>'}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recommendGrid}>
            {recommended.map(item => (
              <TouchableOpacity key={item.id} style={styles.recommendCard} activeOpacity={0.9}>
                <Image source={{ uri: item.image }} style={styles.recommendImg} />
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{item.rating} ⭐ ❤️</Text>
                </View>
                <View style={styles.priceBadgeLarge}>
                  <Text style={styles.priceText}>${item.price.toFixed(1)}</Text>
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FDF0D5', // Very light yellow
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F7C653',
  },
  categoryIcon: {
    fontSize: 24,
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
