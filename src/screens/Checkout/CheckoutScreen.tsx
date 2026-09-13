import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import Icons from '../../constants/icons';
import { HomeBuildingIcon, WorkBuildingIcon, LocationPinIcon } from '../../components/icons';

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
  const baseFee = 25.0; // ₹25 base fare
  const baseDistance = 3.0; // first 3 km included
  const perKmCharge = 8.0; // ₹8 per additional km
  
  if (distance <= baseDistance) {
    return baseFee;
  }
  return Math.round(baseFee + (distance - baseDistance) * perKmCharge);
}

export default function CheckoutScreen() {
  const navigation = useNavigation<CheckoutNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const { userProfile, refreshUserProfile } = useUser();
  const { cartItems, totalPrice, updateQuantity } = useCart();
  
  const [isAddressModalVisible, setAddressModalVisible] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      refreshUserProfile();
    }, [refreshUserProfile])
  );

  const savedAddresses = userProfile?.savedAddresses || [];
  const selectedAddress = savedAddresses[selectedAddressIndex] || savedAddresses[0];

  useEffect(() => {
    if (savedAddresses.length > 0 && selectedAddressIndex >= savedAddresses.length) {
      setSelectedAddressIndex(0);
    }
  }, [savedAddresses, selectedAddressIndex]);

  // Restaurant coordinates — Mumbai default
  const RESTAURANT_LAT = 19.0760;
  const RESTAURANT_LNG = 72.8777;

  const destLat = selectedAddress?.latitude || 19.1136;
  const destLng = selectedAddress?.longitude || 72.8697;
  const distanceKm = getDistance(RESTAURANT_LAT, RESTAURANT_LNG, destLat, destLng);
  
  const estimatedDeliveryTime = Math.max(20, Math.ceil(20 + distanceKm * 4));
  const estimatedArrivalTime = new Date(Date.now() + estimatedDeliveryTime * 60000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const taxAndFees = cartItems.length > 0 ? 15.0 : 0;
  const deliveryFee = cartItems.length > 0 ? (totalPrice > 499 ? 0 : calculateDeliveryFee(RESTAURANT_LAT, RESTAURANT_LNG, destLat, destLng)) : 0;
  const finalTotal = totalPrice + taxAndFees + deliveryFee;

  const handleProceedToPayment = () => {
    navigation.navigate('Payment', {
      selectedAddress,
      deliveryFee,
      taxAndFees,
      finalTotal,
      estimatedDeliveryTime,
    });
  };

  const getAddressIcon = (label?: string) => {
    const l = (label || '').toLowerCase();
    if (l === 'home') return <HomeBuildingIcon size={20} color={colors.primary} />;
    if (l === 'work' || l === 'office') return <WorkBuildingIcon size={20} color={colors.primary} />;
    return <LocationPinIcon size={20} color={colors.primary} />;
  };

  const formattedAddress = selectedAddress
    ? [selectedAddress.addressLine1, selectedAddress.addressLine2, selectedAddress.city, selectedAddress.zipCode]
        .filter(Boolean)
        .join(', ')
    : 'No saved address found. Tap Change to add your delivery address.';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#F7D055" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={Icons.back} style={styles.backIconImg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Order</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Estimated Delivery Time Banner */}
          <View style={styles.deliveryTimeBanner}>
            <View style={styles.deliveryTimeIconCircle}>
              <Image source={Icons.deliverymen} style={styles.deliveryTimeIcon} />
            </View>
            <View style={styles.deliveryTimeInfo}>
              <Text style={styles.deliveryTimeTitle}>Estimated Delivery: {estimatedDeliveryTime} Mins</Text>
              <Text style={styles.deliveryTimeSub}>Arriving around {estimatedArrivalTime}</Text>
            </View>
            <View style={styles.expressBadge}>
              <Text style={styles.expressBadgeText}>⚡ Fast</Text>
            </View>
          </View>

          {/* Shipping Address */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Delivery Location</Text>
            <TouchableOpacity onPress={() => setAddressModalVisible(true)} style={styles.editBtn}>
              <Text style={styles.editBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressBox}>
            <View style={styles.addressHeaderRow}>
              <View style={styles.addressTypeBadge}>
                {getAddressIcon(selectedAddress?.label)}
                <Text style={styles.addressTypeText}>{selectedAddress?.label || 'Delivery Address'}</Text>
              </View>
            </View>
            <Text style={styles.addressText}>{formattedAddress}</Text>
          </View>

          {/* Order Summary */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Order Items ({cartItems.length})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit Cart</Text>
            </TouchableOpacity>
          </View>

          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItemRow}>
              <Image source={{ uri: item.image || 'https://via.placeholder.com/60' }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPriceText}>₹{item.price.toFixed(2)} × {item.quantity}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemSubtotalText}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                
                <View style={styles.qtyControl}>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                    <View style={styles.qtyBtnContainer}>
                      <Text style={styles.qtyBtnText}>−</Text>
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.qtyNumber}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                    <View style={styles.qtyBtnContainer}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {/* Payment Breakdown */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Payment Breakdown</Text>
          </View>

          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Item Total</Text>
              <Text style={styles.totalValue}>₹{totalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery Fee</Text>
              <Text style={[styles.totalValue, deliveryFee === 0 && styles.freeDeliveryValue]}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Taxes & Restaurant Packaging</Text>
              <Text style={styles.totalValue}>₹{taxAndFees.toFixed(2)}</Text>
            </View>
            <View style={styles.dottedLine} />
            <View style={styles.totalRow}>
              <Text style={styles.finalTotalLabel}>Grand Total</Text>
              <Text style={styles.finalTotalValue}>₹{finalTotal.toFixed(2)}</Text>
            </View>
          </View>

        </ScrollView>
        
        {/* Bottom Button */}
        <View style={styles.bottomBtnContainer}>
          <TouchableOpacity style={styles.placeOrderBtn} activeOpacity={0.88} onPress={handleProceedToPayment}>
            <View style={styles.btnLeftTotal}>
              <Text style={styles.btnTotalLabel}>TO PAY</Text>
              <Text style={styles.btnTotalValue}>₹{finalTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.btnRightAction}>
              <Text style={styles.placeOrderBtnText}>Proceed to Payment</Text>
              <Text style={styles.btnArrow}>➔</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Address Selection Bottom Sheet Modal */}
      <React.Fragment>
        {isAddressModalVisible && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackgroundTouch} 
              activeOpacity={1} 
              onPress={() => setAddressModalVisible(false)} 
            />
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Select Delivery Address</Text>
                <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.sheetScroll}>
                {savedAddresses.map((addr: any, index: number) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.addressItem, selectedAddressIndex === index && styles.addressItemActive]}
                    onPress={() => {
                      setSelectedAddressIndex(index);
                      setAddressModalVisible(false);
                    }}
                  >
                    <Text style={styles.addressLabel}>{addr.label || 'Address'}</Text>
                    <Text style={styles.addressFullText}>
                      {addr.addressLine1}, {addr.city}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                  style={styles.addNewAddressBtn} 
                  onPress={() => {
                    setAddressModalVisible(false);
                    navigation.navigate('AddNewAddress');
                  }}
                >
                  <Text style={styles.addNewAddressText}>+ Add New Address</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        )}
      </React.Fragment>

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
  backIconImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: colors.primary,
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110,
  },
  deliveryTimeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EB',
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(232, 93, 34, 0.25)',
  },
  deliveryTimeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryTimeIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  deliveryTimeInfo: {
    flex: 1,
  },
  deliveryTimeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  deliveryTimeSub: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  expressBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expressBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  editBtn: {
    backgroundColor: '#FFF4EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 34, 0.2)',
  },
  editBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  addressBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  addressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  addressTypeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  addressText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemImage: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  itemPriceText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemSubtotalText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EB',
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  qtyBtnContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
    lineHeight: 14,
  },
  qtyNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginHorizontal: 8,
    minWidth: 12,
    textAlign: 'center',
  },
  totalsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  totalValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  freeDeliveryValue: {
    color: '#10B981',
    fontWeight: '800',
  },
  dottedLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  finalTotalLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  finalTotalValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  bottomBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  btnLeftTotal: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    paddingRight: 14,
  },
  btnTotalLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  btnTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  btnRightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  btnArrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  modalBackgroundTouch: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '70%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeBtn: {
    fontSize: 20,
    color: colors.textMuted,
    padding: 5,
  },
  sheetScroll: {
    flexGrow: 0,
  },
  addressItem: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  addressItemActive: {
    borderColor: colors.primary,
    backgroundColor: '#fff5ec',
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  addressFullText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  addNewAddressBtn: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  addNewAddressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
