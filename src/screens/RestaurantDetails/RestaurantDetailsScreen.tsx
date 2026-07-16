import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { useThemeColors, ThemeColors } from '../../theme/colors';

const dummyMenu: MenuItem[] = [
  { id: '1', name: 'Classic Burger', price: 8.99, description: 'Beef patty with lettuce, tomato, and cheese' },
  { id: '2', name: 'Fries', price: 3.99, description: 'Crispy golden fries' },
  { id: '3', name: 'Soda', price: 1.99, description: 'Refreshing cola' },
  { id: '4', name: 'Onion Rings', price: 4.99, description: 'Battered and deep-fried onion rings' },
  { id: '5', name: 'Milkshake', price: 5.99, description: 'Creamy vanilla milkshake' },
];

type RestaurantDetailsRouteProp = RouteProp<RootStackParamList, 'RestaurantDetails'>;
type RestaurantDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RestaurantDetails'>;

export default function RestaurantDetailsScreen() {
  const route = useRoute<RestaurantDetailsRouteProp>();
  const navigation = useNavigation<RestaurantDetailsNavigationProp>();
  const { restaurant } = route.params;
  
  const { addToCart, totalItems, totalPrice } = useCart();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      <View style={styles.menuInfo}>
        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuDesc}>{item.description}</Text>
        <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.addButton} 
        activeOpacity={0.7}
        onPress={() => addToCart(item)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: restaurant.image }} style={styles.headerImage} />
        
        <View style={styles.contentContainer}>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{restaurant.name}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {restaurant.rating}</Text>
            </View>
          </View>
          
          <Text style={styles.cuisineInfo}>{restaurant.cuisine} • 20-30 min • Free Delivery</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Menu</Text>
          
          {dummyMenu.map((item) => (
            <React.Fragment key={item.id}>
              {renderMenuItem({ item })}
            </React.Fragment>
          ))}
          
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {totalItems > 0 && (
        <View style={styles.cartBarContainer}>
          <TouchableOpacity 
            style={styles.cartBar}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Cart')}
          >
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
            <Text style={styles.cartText}>View Cart</Text>
            <Text style={styles.cartPrice}>${totalPrice.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerImage: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },
  cuisineInfo: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    color: colors.text,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuInfo: {
    flex: 1,
    paddingRight: 20,
  },
  menuName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  menuDesc: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 10,
    lineHeight: 20,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.inputBackground,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '600',
    marginTop: -2,
  },
  bottomSpacer: {
    height: 100, // Space for the sticky cart bar
  },
  cartBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 30, // SafeArea padding
    backgroundColor: 'transparent',
  },
  cartBar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cartBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartText: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartPrice: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

