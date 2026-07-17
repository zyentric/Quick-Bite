import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { HomeIcon, MenuIcon, HeartIcon, ClipboardIcon, HelpIcon } from '../../components/VectorIcons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 columns with padding

type BestSellerNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BestSeller'>;

// Mock data based on the mockup
const BEST_SELLERS = [
  {
    id: 'bs1',
    name: 'Sunny Bruschetta',
    price: 15.00,
    rating: 5.0,
    description: 'Lorem ipsum dolor sit amet, consectetur...',
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=2574&auto=format&fit=crop', // Bruschetta
    categoryIcon: '🥨',
  },
  {
    id: 'bs2',
    name: 'Gourmet Grilled Skewers',
    price: 12.00,
    rating: 4.5,
    description: 'Lorem ipsum dolor sit amet, consectetur...',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2574&auto=format&fit=crop', // Skewers
    categoryIcon: '🥨',
  },
  {
    id: 'bs3',
    name: 'Barbecue tacos',
    price: 15.00,
    rating: 4.0,
    description: 'Lorem ipsum dolor sit amet, consectetur...',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=2670&auto=format&fit=crop', // Tacos
    categoryIcon: '🍽️',
  },
  {
    id: 'bs4',
    name: 'Broccoli lasagna',
    price: 12.00,
    rating: 3.5,
    description: 'Lorem ipsum dolor sit amet, consectetur...',
    image: 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?q=80&w=2574&auto=format&fit=crop', // Lasagna
    categoryIcon: '🥗',
  },
  {
    id: 'bs5',
    name: 'Iced Coffee',
    price: 15.00,
    rating: 4.8,
    description: 'Lorem ipsum dolor sit amet, consectetur...',
    image: 'https://images.unsplash.com/photo-1517701550927-30cfcb64db85?q=80&w=2670&auto=format&fit=crop', // Coffee
    categoryIcon: '🍹',
  },
  {
    id: 'bs6',
    name: 'Strawberry cake',
    price: 12.00,
    rating: 4.9,
    description: 'Lorem ipsum dolor sit amet, consectetur...',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=2670&auto=format&fit=crop', // Cake
    categoryIcon: '🧁',
  },
];

export default function BestSellerScreen() {
  const navigation = useNavigation<BestSellerNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const renderCard = (item: typeof BEST_SELLERS[0]) => (
    <View key={item.id} style={styles.cardContainer}>
      
      {/* Top Image Section */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        
        {/* Category Icon */}
        <View style={styles.categoryIconBadge}>
          <Text style={styles.categoryIconText}>{item.categoryIcon}</Text>
        </View>

        {/* Heart Icon */}
        <TouchableOpacity style={styles.heartBadge}>
          <Text style={styles.heartIconText}>♥</Text>
        </TouchableOpacity>

        {/* Price Tag */}
        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>${item.price.toFixed(2)}</Text>
        </View>
      </View>

      {/* Bottom Info Section */}
      <View style={styles.cardInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{item.rating.toFixed(1)} ★</Text>
          </View>
        </View>
        <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
        
        {/* Cart Icon */}
        <TouchableOpacity style={styles.cartBtn}>
          <Text style={styles.cartIconText}>🛒</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Best Seller</Text>
        <View style={{ width: 40 }} /> {/* Placeholder for balance */}
      </View>

      {/* White Content Container */}
      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.subtitle}>Discover our most popular dishes!</Text>

          {/* Grid */}
          <View style={styles.gridContainer}>
            {BEST_SELLERS.map(renderCard)}
          </View>

        </ScrollView>
      </View>
      
      {/* Bottom Tabs */}
      <View style={styles.bottomTabsContainer}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
          <HomeIcon color="#fff" size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate('FoodMenu')}>
          <MenuIcon color="#fff" size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Favorites' })}>
          <HeartIcon color="#fff" size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Orders' })}>
          <ClipboardIcon color="#fff" size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Help' })}>
          <HelpIcon color="#fff" size={20} />
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
    fontSize: 24,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    height: 120,
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  categoryIconBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconText: {
    fontSize: 14,
  },
  heartBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIconText: {
    color: colors.primary,
    fontSize: 12,
  },
  priceTag: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priceTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardInfo: {
    padding: 10,
    position: 'relative',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    paddingRight: 5,
  },
  ratingBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 5,
  },
  ratingText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 9,
    color: colors.textMuted,
    lineHeight: 12,
    marginBottom: 15,
  },
  cartBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIconText: {
    color: '#fff',
    fontSize: 12,
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
  }
});
