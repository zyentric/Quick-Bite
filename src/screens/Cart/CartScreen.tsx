import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import Icons from '../../constants/icons';
import CartSkeleton from '../../components/skeleton/CartSkeleton';

type CartNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

export default function CartScreen() {
  const navigation = useNavigation<CartNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const { cartItems, totalPrice, totalItems, updateQuantity, clearCart, isHydrated } = useCart();
  const { isAuthenticated } = useUser();

  const taxAndFees = cartItems.length > 0 ? 5.0 : 0;
  const deliveryFee = cartItems.length > 0 ? (totalPrice > 499 ? 0 : 25.0) : 0;
  const finalTotal = totalPrice + taxAndFees + deliveryFee;

  const canGoBack = navigation.canGoBack();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
      return;
    }
    navigation.navigate('Checkout');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#F7D055' }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7D055" />

      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            {canGoBack ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.headerBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Image source={Icons.back} style={styles.headerBtnIcon} />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerBtnPlaceholder} />
            )}

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>My Cart</Text>
              {totalItems > 0 && (
                <Text style={styles.headerSubtitle}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</Text>
              )}
            </View>

            {cartItems.length > 0 ? (
              <TouchableOpacity
                onPress={clearCart}
                style={styles.clearBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.headerBtnPlaceholder} />
            )}
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {!isHydrated ? (
            <CartSkeleton count={3} />
          ) : cartItems.length === 0 ? (
            /* Empty State */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Image source={Icons.cart} style={styles.emptyIconImg} />
              </View>
              <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
              <Text style={styles.emptySubtitle}>
                Looks like you haven't added anything delicious yet. Check out our menu!
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                activeOpacity={0.85}
                onPress={() => (navigation as any).navigate('FoodMenu')}
              >
                <Text style={styles.exploreBtnText}>Explore Food Menu</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Populated Cart */
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Items List */}
              <View style={styles.itemsSection}>
                <Text style={styles.sectionHeading}>Items in Cart</Text>
                {cartItems.map((item) => (
                  <View key={item.id} style={styles.cartItemCard}>
                    <Image
                      source={{ uri: item.image || 'https://via.placeholder.com/80' }}
                      style={styles.itemImage}
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.itemUnitPrice}>₹{item.price.toFixed(2)} each</Text>
                      <Text style={styles.itemSubtotal}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                    <View style={styles.qtyControlContainer}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Text style={styles.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Bill Details Card */}
              <View style={styles.billCard}>
                <Text style={styles.billTitle}>Bill Summary</Text>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Item Total</Text>
                  <Text style={styles.billValue}>₹{totalPrice.toFixed(2)}</Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Delivery Fee</Text>
                  <Text style={[styles.billValue, deliveryFee === 0 && styles.freeDeliveryText]}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                  </Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Taxes & Fees</Text>
                  <Text style={styles.billValue}>₹{taxAndFees.toFixed(2)}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>To Pay</Text>
                  <Text style={styles.totalValue}>₹{finalTotal.toFixed(2)}</Text>
                </View>
              </View>

              {/* Proceed to Checkout Button */}
              <TouchableOpacity
                style={styles.proceedBtn}
                activeOpacity={0.88}
                onPress={handleCheckout}
              >
                <View style={styles.proceedBtnLeft}>
                  <Text style={styles.proceedTotalLabel}>TOTAL</Text>
                  <Text style={styles.proceedTotalValue}>₹{finalTotal.toFixed(2)}</Text>
                </View>
                <View style={styles.proceedBtnRight}>
                  <Text style={styles.proceedBtnText}>Proceed to Checkout</Text>
                  <Text style={styles.proceedArrow}>➔</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
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
      backgroundColor: colors.primary,
    },
    headerSection: {
      backgroundColor: '#F7D055',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 24,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
    },
    headerBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    headerBtnIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      tintColor: colors.primary,
    },
    headerBtnPlaceholder: {
      width: 40,
    },
    headerTitleContainer: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    headerSubtitle: {
      fontSize: 12,
      fontWeight: '600',
      color: '#A04000',
      marginTop: 2,
    },
    clearBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    clearBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    contentSection: {
      flex: 1,
      backgroundColor: '#F8F9FA',
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      marginTop: -16,
      overflow: 'hidden',
    },
    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 130, // Ample clearance above the floating bottom tab bar
    },
    itemsSection: {
      marginBottom: 20,
    },
    sectionHeading: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 12,
      marginLeft: 4,
    },
    cartItemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    itemImage: {
      width: 64,
      height: 64,
      borderRadius: 14,
      backgroundColor: '#F3F4F6',
    },
    itemInfo: {
      flex: 1,
      marginLeft: 14,
      justifyContent: 'center',
    },
    itemName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    itemUnitPrice: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 4,
    },
    itemSubtotal: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.primary,
    },
    qtyControlContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF4EB',
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.2)',
    },
    qtyBtn: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    qtyBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
      lineHeight: 18,
    },
    qtyText: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.primary,
      marginHorizontal: 10,
      minWidth: 16,
      textAlign: 'center',
    },
    billCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 18,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    billTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 14,
    },
    billRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    billLabel: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '500',
    },
    billValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    freeDeliveryText: {
      color: '#10B981',
      fontWeight: '800',
    },
    divider: {
      height: 1,
      backgroundColor: '#E5E7EB',
      marginVertical: 12,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    totalValue: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.primary,
    },
    proceedBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.primary,
      borderRadius: 22,
      paddingVertical: 14,
      paddingHorizontal: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 6,
    },
    proceedBtnLeft: {
      borderRightWidth: 1,
      borderRightColor: 'rgba(255, 255, 255, 0.3)',
      paddingRight: 14,
    },
    proceedTotalLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: 'rgba(255, 255, 255, 0.8)',
    },
    proceedTotalValue: {
      fontSize: 16,
      fontWeight: '900',
      color: '#FFFFFF',
    },
    proceedBtnRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    proceedBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    proceedArrow: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingTop: 80,
    },
    emptyIconCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: '#FFF4EB',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 2,
      borderColor: 'rgba(232, 93, 34, 0.15)',
    },
    emptyIconImg: {
      width: 42,
      height: 42,
      resizeMode: 'contain',
      tintColor: colors.primary,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 19,
      marginBottom: 28,
    },
    exploreBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 24,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    exploreBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
  });
