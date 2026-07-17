import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';

type CheckoutNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateDeliveryFee(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): number {
  const distance = getDistance(startLat, startLng, endLat, endLng);
  const baseFee = 2.00; // $2.00 base fare
  const baseDistance = 2.0; // first 2 km included
  const perKmCharge = 0.50; // $0.50 per additional km
  
  if (distance <= baseDistance) {
    return baseFee;
  }
  return baseFee + (distance - baseDistance) * perKmCharge;
}

export default function CheckoutScreen() {
  const navigation = useNavigation<CheckoutNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const { cartItems, totalPrice, updateQuantity } = useCart();
  const taxAndFees = cartItems.length > 0 ? 5.00 : 0;

  // Restaurant coordinates: [37.7944, -122.2912]
  // Customer coordinates: [37.8044, -122.2712]
  const deliveryFee = cartItems.length > 0
    ? calculateDeliveryFee(37.7944, -122.2912, 37.8044, -122.2712)
    : 0;

  const finalTotal = totalPrice + taxAndFees + deliveryFee;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Order</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Shipping Address */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <TouchableOpacity><Text style={styles.editIcon}>✏️</Text></TouchableOpacity>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>778 Locust View Drive Oaklanda, CA</Text>
          </View>

          {/* Order Summary */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItemRow}>
              <Image source={{ uri: item.image || 'https://via.placeholder.com/60' }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDate}>29 Nov, 12:00 pm</Text>
                <TouchableOpacity style={styles.cancelOrderBtn}>
                  <Text style={styles.cancelOrderText}>Cancel Order</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.trashIcon}>🗑️</Text>
                <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
                <Text style={styles.itemCountText}>{item.quantity} items</Text>
                
                <View style={styles.qtyControl}>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Text style={styles.qtyIcon}>✏️ -</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyNumber}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Text style={styles.qtyAddIcon}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₹{totalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax and Fees</Text>
              <Text style={styles.totalValue}>₹{taxAndFees.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery</Text>
              <Text style={styles.totalValue}>₹{deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.dottedLine} />
            <View style={styles.totalRow}>
              <Text style={styles.finalTotalLabel}>Total</Text>
              <Text style={styles.finalTotalValue}>₹{finalTotal.toFixed(2)}</Text>
            </View>
          </View>

        </ScrollView>
        
        {/* Bottom Button */}
        <View style={styles.bottomBtnContainer}>
          <TouchableOpacity style={styles.placeOrderBtn} onPress={() => navigation.navigate('Payment')}>
            <Text style={styles.placeOrderBtnText}>Place Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7D055', // Yellow from mockup
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
  rightPlaceholder: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 100,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  editIcon: {
    fontSize: 14,
  },
  editBtn: {
    backgroundColor: colors.inputBackground, // Light peach
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  editBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  addressBox: {
    backgroundColor: colors.inputBackground, // light yellow/peach
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  addressText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  cartItemRow: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 15,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  itemDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
  },
  cancelOrderBtn: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  cancelOrderText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  trashIcon: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  itemCountText: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 10,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyIcon: {
    fontSize: 14,
    color: colors.primary,
  },
  qtyNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  qtyAddIcon: {
    fontSize: 16,
    color: colors.primary,
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
    overflow: 'hidden',
  },
  totalsContainer: {
    marginTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  totalLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderStyle: 'dashed',
    marginVertical: 15,
  },
  finalTotalLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  finalTotalValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomBtnContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  placeOrderBtn: {
    backgroundColor: colors.inputBackground, // Light peach button
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  placeOrderBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
