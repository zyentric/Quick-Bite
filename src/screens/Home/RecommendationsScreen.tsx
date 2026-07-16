import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 columns with padding

type RecommendationsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Recommendations'>;

// Mock data based on the mockup
const FEATURED_ITEM = {
  id: 'r1',
  name: 'Chocolate and Fresh Fruit Crepes',
  price: 15.00,
  rating: 5.0,
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=2574&auto=format&fit=crop', // Crepes
  categoryIcon: '🧁',
  isNew: true,
};

const GRID_ITEMS = [
  {
    id: 'r2',
    name: 'Bean and vegetable burger',
    price: 15.00,
    rating: 4.0,
    description: 'Lorem ipsum dolor sit amet, consectetur...',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2565&auto=format&fit=crop',
    categoryIcon: '🥗',
  },
  {
    id: 'r3',
    name: 'Creamy milkshakes',
    price: 15.00,
    rating: 4.5,
    description: 'Lorem ipsum dolor sit amet, consectetur...',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=2574&auto=format&fit=crop',
    categoryIcon: '🍹',
  },
  {
    id: 'r4',
    name: 'Chicken Curry',
    price: 18.00,
    rating: 4.8,
    description: 'Lorem ipsum dolor sit amet, consectetur...',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=2513&auto=format&fit=crop',
    categoryIcon: '🍽️',
  },
  {
    id: 'r5',
    name: 'Beef Stew',
    price: 20.00,
    rating: 4.6,
    description: 'Lorem ipsum dolor sit amet, consectetur...',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2669&auto=format&fit=crop',
    categoryIcon: '🍽️',
  },
];

export default function RecommendationsScreen() {
  const navigation = useNavigation<RecommendationsNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getQuantity = (id: string) => quantities[id] || 1;
  const updateQuantity = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const renderGridCard = (item: typeof GRID_ITEMS[0]) => (
    <View key={item.id} style={styles.gridCardContainer}>
      
      {/* Top Image Section */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.image }} style={styles.gridCardImage} />
        
        {/* Category Icon */}
        <View style={styles.categoryIconBadge}>
          <Text style={styles.categoryIconText}>{item.categoryIcon}</Text>
        </View>

        {/* Rating Badge (Bottom Left on Image) */}
        <View style={styles.ratingBadgeImg}>
          <Text style={styles.ratingTextImg}>{item.rating.toFixed(1)} ★</Text>
        </View>
      </View>

      {/* Bottom Info Section */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
        
        {/* Price & Cart Row */}
        <View style={styles.priceCartRow}>
          <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
          
          <View style={styles.qtyControlSmall}>
            <TouchableOpacity onPress={() => updateQuantity(item.id, -1)}>
              <View style={styles.qtyBtnSmall}><Text style={styles.qtyBtnTextSmall}>-</Text></View>
            </TouchableOpacity>
            <Text style={styles.qtyTextSmall}>{getQuantity(item.id)}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item.id, 1)}>
              <View style={styles.qtyBtnSmall}><Text style={styles.qtyBtnTextSmall}>+</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartBtnSmall}>
              <Text style={styles.cartIconTextSmall}>🛒</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Yellow Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recommendations</Text>
        <View style={{ width: 40 }} /> {/* Placeholder */}
      </View>

      {/* White Content Container */}
      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.subtitle}>Discover the dishes{'\n'}recommended by the chef.</Text>

          {/* Featured Item */}
          <View style={styles.featuredContainer}>
            <View style={styles.featuredImageWrapper}>
              <Image source={{ uri: FEATURED_ITEM.image }} style={styles.featuredImage} />
              <View style={styles.categoryIconBadge}>
                <Text style={styles.categoryIconText}>{FEATURED_ITEM.categoryIcon}</Text>
              </View>
              <View style={styles.ratingBadgeImg}>
                <Text style={styles.ratingTextImg}>{FEATURED_ITEM.rating.toFixed(1)} ★</Text>
              </View>
            </View>
            
            <View style={styles.featuredInfo}>
              {FEATURED_ITEM.isNew && (
                <View style={styles.newProductBadge}>
                  <Text style={styles.newProductText}>New Product</Text>
                  {/* CSS triangle for ribbon tail effect could be added here, using basic rounded rectangle for now */}
                </View>
              )}
              <Text style={styles.featuredTitle}>{FEATURED_ITEM.name}</Text>
              <Text style={styles.featuredDescription}>{FEATURED_ITEM.description}</Text>
              
              <View style={styles.priceCartRow}>
                <Text style={styles.priceText}>${FEATURED_ITEM.price.toFixed(2)}</Text>
                
                <View style={styles.qtyControlSmall}>
                  <TouchableOpacity onPress={() => updateQuantity(FEATURED_ITEM.id, -1)}>
                    <View style={styles.qtyBtnSmall}><Text style={styles.qtyBtnTextSmall}>-</Text></View>
                  </TouchableOpacity>
                  <Text style={styles.qtyTextSmall}>{getQuantity(FEATURED_ITEM.id)}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(FEATURED_ITEM.id, 1)}>
                    <View style={styles.qtyBtnSmall}><Text style={styles.qtyBtnTextSmall}>+</Text></View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cartBtnSmall}>
                    <Text style={styles.cartIconTextSmall}>🛒</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Grid */}
          <View style={styles.gridContainer}>
            {GRID_ITEMS.map(renderGridCard)}
          </View>

        </ScrollView>
      </View>
      
      {/* Bottom Tabs */}
      <View style={styles.bottomTabsContainer}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.tabIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate('FoodMenu')}>
          <Text style={styles.tabIcon}>🍽️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn}>
          <Text style={styles.tabIcon}>🤍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn}>
          <Text style={styles.tabIcon}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn}>
          <Text style={styles.tabIcon}>🎧</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7D055', // Yellow header area
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary, // Orange back arrow
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 100, // Space for bottom tabs
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary, // Orange subtitle
    textAlign: 'center',
    marginBottom: 25,
  },
  
  // Featured Layout
  featuredContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 25,
    alignItems: 'center',
  },
  featuredImageWrapper: {
    width: 140,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 15,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  newProductBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderTopRightRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  newProductText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  featuredDescription: {
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 14,
    marginBottom: 10,
  },
  
  // Grid Layout
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCardContainer: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
  },
  imageWrapper: {
    position: 'relative',
    height: 140,
    width: '100%',
    marginBottom: 10,
  },
  gridCardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  categoryIconBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconText: {
    fontSize: 12,
  },
  ratingBadgeImg: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingTextImg: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardInfo: {
    paddingHorizontal: 5,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 9,
    color: colors.textMuted,
    lineHeight: 12,
    marginBottom: 10,
  },
  
  // Shared Price & Cart Row
  priceCartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  qtyControlSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtnSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FDE1D3', // Light orange bg for buttons
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnTextSmall: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
  qtyTextSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
  cartBtnSmall: {
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  cartIconTextSmall: {
    color: '#fff',
    fontSize: 10,
  },
  
  // Tabs
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
  }
});
