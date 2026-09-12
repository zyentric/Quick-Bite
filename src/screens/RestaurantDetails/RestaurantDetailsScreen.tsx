import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { API_URL } from '../../config/api';
import { StarIcon } from '../../components/icons';

type RestaurantDetailsRouteProp = RouteProp<RootStackParamList, 'RestaurantDetails'>;
type RestaurantDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RestaurantDetails'>;

export default function RestaurantDetailsScreen() {
  const route = useRoute<RestaurantDetailsRouteProp>();
  const navigation = useNavigation<RestaurantDetailsNavigationProp>();
  const insets = useSafeAreaInsets();
  const { restaurant } = route.params;

  const { addToCart, totalItems, totalPrice } = useCart();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMenu = async () => {
      try {
        // Fetch the full restaurant including its menu
        const res = await fetch(`${API_URL}/restaurants`);
        if (res.ok) {
          const allRestaurants = await res.json();
          // Find matching restaurant by name/id to get its menu
          const matched = allRestaurants.find(
            (r: any) => r.name === restaurant.name || r.id === restaurant.id
          );
          const items = matched?.menu || [];
          setMenuItems(items.map((item: any) => ({
            id: item.id || item._id,
            name: item.name,
            price: item.price,
            description: item.description,
            image: item.image,
            customizations: item.customizations || [],
          })));
        } else {
          // Fallback: load all menu items
          const fallback = await fetch(`${API_URL}/menu-items`);
          if (fallback.ok) {
            const data = await fallback.json();
            setMenuItems(data.map((item: any) => ({
              id: item.id || item._id,
              name: item.name,
              price: item.price,
              description: item.description,
              image: item.image,
              customizations: item.customizations || [],
            })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch menu', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [restaurant.name, restaurant.id]);

  const renderMenuItem = (item: MenuItem) => (
    <View key={item.id} style={styles.menuItem}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.menuItemImage} />
      ) : (
        <View style={[styles.menuItemImage, styles.menuItemImagePlaceholder]}>
          <Image source={require('../../assets/spoons.png')} style={styles.menuItemPlaceholderIcon} />
        </View>
      )}
      <View style={styles.menuInfo}>
        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.menuPrice}>₹{item.price.toFixed(2)}</Text>
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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: restaurant.image }} style={styles.headerImage} />

        {/* Back button overlaid on the image with dynamic safe area inset */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image source={require('../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{restaurant.name}</Text>
            <View style={styles.ratingBadge}>
              <StarIcon size={14} color="#D97706" />
              <Text style={styles.ratingText}> {restaurant.rating}</Text>
            </View>
          </View>

          <Text style={styles.cuisineInfo}>{restaurant.cuisine} • 20–35 min • Free Delivery</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Menu</Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : menuItems.length === 0 ? (
            <Text style={styles.emptyText}>No menu items available.</Text>
          ) : (
            menuItems.map(renderMenuItem)
          )}

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
            <Text style={styles.cartPrice}>₹{totalPrice.toFixed(2)}</Text>
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  menuItemPlaceholderIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    tintColor: colors.primary,
    opacity: 0.5,
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
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  menuItemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  menuItemImagePlaceholder: {
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  menuDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
    lineHeight: 18,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: colors.textMuted,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginTop: -2,
  },
  bottomSpacer: {
    height: 120,
  },
  cartBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 30,
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
