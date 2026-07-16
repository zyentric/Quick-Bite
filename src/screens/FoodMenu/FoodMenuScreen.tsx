import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');

type FoodMenuNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodMenu'>;

const CATEGORIES = [
  { id: 'Snacks', icon: '🥨' },
  { id: 'Meal', icon: '🍽️' },
  { id: 'Vegan', icon: '🥗' },
  { id: 'Dessert', icon: '🧁' },
  { id: 'Drinks', icon: '🍹' },
];

const MOCK_FOOD_DATA: Record<string, MenuItem[]> = {
  'Snacks': [
    {
      id: 'snack1',
      name: 'Mexican Appetizer',
      price: 15.00,
      rating: 5.0,
      description: 'Tortilla Chips With Toppins, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
      image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?q=80&w=2670&auto=format&fit=crop',
      customizations: [
        {
          title: 'Toppings',
          options: [
            { id: 't1', name: 'Guacamole', price: 2.99 },
            { id: 't2', name: 'Jalapeños', price: 0.99 },
            { id: 't3', name: 'Ground Beef', price: 3.99 },
            { id: 't4', name: 'Pico de Gallo', price: 1.99 },
          ]
        }
      ]
    },
    {
      id: 'snack2',
      name: 'Pork Skewer',
      price: 12.99,
      rating: 4.8,
      description: 'Marinated in a rich blend of herbs and spices, then grilled to perfection, served with a side of zesty dipping sauce.',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2574&auto=format&fit=crop',
    }
  ],
  'Meal': [
    {
      id: 'meal1',
      name: 'Fresh Prawn Ceviche',
      price: 50.00,
      rating: 4.7,
      description: 'Shrimp marinated in zesty lime juice, mixed with crisp onions, tomatoes, and cilantro.',
      image: 'https://images.unsplash.com/photo-1594954005886-f131a4794e79?q=80&w=2574&auto=format&fit=crop',
      customizations: [
        {
          title: 'Add on ingredients',
          options: [
            { id: 'm1', name: 'Shrimp', price: 2.99 },
            { id: 'm2', name: 'Crisp Onion', price: 0.99 },
            { id: 'm3', name: 'Sweet Corn', price: 3.99 },
            { id: 'm4', name: 'Pico de Gallo', price: 2.99 },
          ]
        }
      ]
    },
    {
      id: 'meal2',
      name: 'Chicken Burger',
      price: 12.99,
      rating: 4.4,
      description: 'Tender grilled chicken breast, topped with crisp lettuce, ripe tomato, and creamy mayo, all nestled between a soft, toasted bun.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2599&auto=format&fit=crop',
    }
  ],
  'Vegan': [
    {
      id: 'vegan1',
      name: 'Mushroom Risotto',
      price: 15.00,
      rating: 5.0,
      description: 'Creamy mushroom risotto, cooked to perfection with arborio rice, wild mushrooms, Parmesan cheese, and white wine.',
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2669&auto=format&fit=crop',
    },
    {
      id: 'vegan2',
      name: 'Broccoli Lasagna',
      price: 12.99,
      rating: 4.9,
      description: 'Tender broccoli florets, creamy ricotta cheese, savory marinara sauce, and topped with melted mozzarella.',
      image: 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?q=80&w=2574&auto=format&fit=crop',
    },
    {
      id: 'vegan3',
      name: 'Bean and Vegetable Burger',
      price: 50.00,
      rating: 4.7,
      description: 'Vegan Mayo, Sliced Tomatoes, Whole Wheat Buns, Bell Peppers.',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2565&auto=format&fit=crop',
      customizations: [
        {
          title: 'Add on ingredients',
          options: [
            { id: 'v1', name: 'Vegan Mayo', price: 1.99 },
            { id: 'v2', name: 'Sliced Tomatoes', price: 1.99 },
            { id: 'v3', name: 'Whole Wheat Buns', price: 2.00 },
            { id: 'v4', name: 'Bell Peppers', price: 1.25 },
          ]
        }
      ]
    }
  ],
  'Dessert': [
    {
      id: 'dessert1',
      name: 'Chocolate Brownie',
      price: 15.00,
      rating: 5.0,
      description: 'Premium cocoa, melted chocolate, and a hint of vanilla, creating a moist, fudgy center with a crisp, crackly top.',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=2574&auto=format&fit=crop',
    },
    {
      id: 'dessert2',
      name: 'Macarons',
      price: 12.99,
      rating: 4.9,
      description: 'Delicate vanilla and chocolate macarons, featuring a crisp outer shell and a smooth, rich filling.',
      image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=2670&auto=format&fit=crop',
    },
    {
      id: 'dessert3',
      name: 'Strawberry Cheesecake',
      price: 22.00,
      rating: 4.0,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=2670&auto=format&fit=crop',
      customizations: [
        {
          title: 'Add on ingredients',
          options: [
            { id: 'd1', name: 'Sliced Nuts', price: 3.99 },
            { id: 'd2', name: 'Whipped Cream', price: 1.00 },
            { id: 'd3', name: 'Sliced Strawberries', price: 4.00 },
            { id: 'd4', name: 'Lemon Zest', price: 1.25 },
          ]
        }
      ]
    }
  ],
  'Drinks': [
    {
      id: 'drink1',
      name: 'Mojito',
      price: 15.00,
      rating: 5.0,
      description: 'Made with white rum, fresh mint leaves, lime juice, simple syrup, and a splash of soda water.',
      image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=2565&auto=format&fit=crop',
    },
    {
      id: 'drink2',
      name: 'Iced Coffee',
      price: 12.99,
      rating: 4.0,
      description: 'Espresso, chilled milk, and a touch of sweetness, served over ice for a smooth, refreshing treat.',
      image: 'https://images.unsplash.com/photo-1517701550927-30cfcb64db85?q=80&w=2670&auto=format&fit=crop',
    },
    {
      id: 'drink3',
      name: 'Fruit and Berry Tea',
      price: 15.00,
      rating: 4.2,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
      image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?q=80&w=2670&auto=format&fit=crop',
      customizations: [
        {
          title: 'Choose your base tea',
          options: [
            { id: 'dr1', name: 'Green Tea', price: 5.00 },
            { id: 'dr2', name: 'White Tea', price: 10.00 },
            { id: 'dr3', name: 'Black Tea', price: 6.10 },
            { id: 'dr4', name: 'Herbal Infusion', price: 5.25 },
          ]
        }
      ]
    }
  ]
};

export default function FoodMenuScreen() {
  const navigation = useNavigation<FoodMenuNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Snacks');
  
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const renderFoodItem = (item: MenuItem) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.foodCard}
      onPress={() => navigation.navigate('FoodDetails', { item })}
    >
      <Image source={{ uri: item.image }} style={styles.foodImage} />
      <View style={styles.foodInfo}>
        <View style={styles.foodHeader}>
          <Text style={styles.foodTitle}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {item.rating?.toFixed(1)}</Text>
          </View>
          <Text style={styles.foodPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <Text style={styles.foodDescription} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Yellow Header Area */}
        <View style={styles.headerSection}>
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
        </View>

        {/* Orange Curved Content Area */}
        <View style={styles.contentSection}>
          
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
                  onPress={() => setActiveTab(cat.id)}
                >
                  <View style={[styles.categoryCircle, isActive ? styles.categoryCircleActive : null]}>
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
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
            <Text style={styles.sortLabel}>Sort By <Text style={styles.sortHighlight}>Popular</Text></Text>
            <TouchableOpacity style={styles.sortIconBtn}>
              <Text style={styles.sortIconText}>🔃</Text>
            </TouchableOpacity>
          </View>

          {/* Food List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {MOCK_FOOD_DATA[activeTab]?.map(renderFoodItem)}
          </ScrollView>
        </View>

        {/* Bottom Tabs */}
        <View style={styles.bottomTabsContainer}>
          <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.tabIcon}>🏠</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabBtn}>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    flex: 1,
    marginRight: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: '#000',
    fontSize: 14,
  },
  filterIconBtn: {
    marginLeft: 5,
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
  },
  iconBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconBtnText: {
    fontSize: 16,
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
    height: 100, // Fixed height to not interfere with scroll
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#FDE1D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryCircleActive: {
    backgroundColor: '#F7D055',
    borderColor: '#F7D055',
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  categoryLabelActive: {
    fontWeight: 'bold',
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
    padding: 5,
    borderRadius: 15,
  },
  sortIconText: {
    fontSize: 14,
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
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginHorizontal: 8,
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
  }
});
