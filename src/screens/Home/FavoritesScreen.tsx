import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import Icons from '../../constants/icons';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Favorites'>;

const FAVORITE_ITEMS: MenuItem[] = [
  {
    id: 'fav1',
    name: 'Chicken Curry',
    price: 15.00,
    rating: 5.0,
    description: 'Lorem ipsum dolor sit amet, consectetur.',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=2513&auto=format&fit=crop',
    category: 'Meal',
  },
  {
    id: 'fav2',
    name: 'Chicken Burger',
    price: 12.99,
    rating: 4.8,
    description: 'Lorem ipsum dolor sit amet, consectetur.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2599&auto=format&fit=crop',
    category: 'Meal',
  },
  {
    id: 'fav3',
    name: 'Broccoli Lasagna',
    price: 12.99,
    rating: 4.9,
    description: 'Lorem ipsum dolor sit amet, consectetur.',
    image: 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?q=80&w=2574&auto=format&fit=crop',
    category: 'Vegan',
  },
  {
    id: 'fav4',
    name: 'Mexican Appetizer',
    price: 15.00,
    rating: 5.0,
    description: 'Lorem ipsum dolor sit amet, consectetur.',
    image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?q=80&w=2670&auto=format&fit=crop',
    category: 'Snacks',
  },
  {
    id: 'fav5',
    name: 'Wings',
    price: 12.99,
    rating: 4.5,
    description: 'Lorem ipsum dolor sit amet, consectetur.',
    image: 'https://images.unsplash.com/photo-1569692484730-843867c4ec3e?q=80&w=2574&auto=format&fit=crop',
    category: 'Snacks',
  },
  {
    id: 'fav6',
    name: 'Milkshake',
    price: 8.99,
    rating: 4.9,
    description: 'Lorem ipsum dolor sit amet, consectetur.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=2574&auto=format&fit=crop',
    category: 'Drinks',
  },
];

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'Meal': return Icons.meal;
    case 'Vegan': return Icons.vegan;
    case 'Snacks': return Icons.snacks;
    case 'Dessert': return Icons.dessert;
    case 'Drinks': return Icons.drinks;
    default: return Icons.meal;
  }
};

export default function FavoritesScreen() {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const renderItem = (item: MenuItem) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.card}
      onPress={() => navigation.navigate('FoodDetails', { item })}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.categoryBadge}>
          <Image source={getCategoryIcon(item.category)} style={styles.categoryBadgeIcon} />
        </View>
        <TouchableOpacity style={styles.favoriteBadge}>
          <Text style={styles.favoriteBadgeText}>❤️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Yellow Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.backBtn}>
              <Image source={require('../../assets/back.png')} style={styles.backIconImg} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Favorites</Text>
            <View style={styles.backBtn} />
          </View>
        </View>

        {/* White Content Section */}
        <View style={styles.contentSection}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.subtitle}>It's time to buy your favorite dish.</Text>
            
            <View style={styles.grid}>
              {FAVORITE_ITEMS.map(renderItem)}
            </View>
            
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7D055', 
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary, 
  },
  headerSection: {
    backgroundColor: '#F7D055',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30, 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIconImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryBadgeIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteBadgeText: {
    fontSize: 14,
    color: colors.primary,
  },
  cardContent: {
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    lineHeight: 14,
  },
});
