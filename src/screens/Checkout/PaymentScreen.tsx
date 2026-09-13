import React, { useState, useEffect, useCallback } from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import { API_URL } from '../../config/api';
import { RAZORPAY_KEY_ID } from '@env';
import { authFetch } from '../../utils/authFetch';
import CustomLoader from '../../components/CustomLoader';
import CustomAlert from '../../components/CustomAlert';
import Icons from '../../constants/icons';
import { HomeBuildingIcon, WorkBuildingIcon, LocationPinIcon } from '../../components/icons';

type PaymentNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;
type PaymentRouteProp = RouteProp<RootStackParamList, 'Payment'>;

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function PaymentScreen() {
  const navigation = useNavigation<PaymentNavigationProp>();
  const route = useRoute<PaymentRouteProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const { userProfile, refreshUserProfile } = useUser();
  const { cartItems, totalPrice, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  
  const [isAddressModalVisible, setAddressModalVisible] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'upi'>('card');

  useFocusEffect(
    useCallback(() => {
      refreshUserProfile();
    }, [refreshUserProfile])
  );

  const savedAddresses = userProfile?.savedAddresses || [];

  // Params passed from CheckoutScreen
  const {
    selectedAddress: routeAddress,
    deliveryFee: routeDeliveryFee,
    taxAndFees: routeTaxAndFees,
    finalTotal: routeFinalTotal,
    estimatedDeliveryTime: routeEstimatedTime,
  } = route.params || {};

  const activeSelectedAddress = routeAddress || savedAddresses[selectedAddressIndex] || savedAddresses[0];

  // Restaurant coordinates — Mumbai default
  const RESTAURANT_LAT = 19.0760;
  const RESTAURANT_LNG = 72.8777;

  const destLat = activeSelectedAddress?.latitude  || 19.1136;
  const destLng = activeSelectedAddress?.longitude || 72.8697;
  const distanceKm = getDistance(RESTAURANT_LAT, RESTAURANT_LNG, destLat, destLng);
  
  const estimatedDeliveryTime = routeEstimatedTime || Math.max(20, Math.ceil(20 + distanceKm * 4));
  const estimatedArrivalTime = new Date(Date.now() + estimatedDeliveryTime * 60000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const taxAndFees = routeTaxAndFees ?? (cartItems.length > 0 ? 15.0 : 0);
  const deliveryFee = routeDeliveryFee ?? (cartItems.length > 0 ? (totalPrice > 499 ? 0 : 25.0) : 0);
  const finalTotal = routeFinalTotal ?? (totalPrice + taxAndFees + deliveryFee);

  const formattedAddress = activeSelectedAddress
    ? [activeSelectedAddress.addressLine1, activeSelectedAddress.addressLine2, activeSelectedAddress.city, activeSelectedAddress.zipCode]
        .filter(Boolean)
        .join(', ')
    : 'No delivery address selected. Please add one.';

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const getAddressIcon = (label?: string) => {
    const l = (label || '').toLowerCase();
    if (l === 'home') return <HomeBuildingIcon size={20} color={colors.primary} />;
    if (l === 'work' || l === 'office') return <WorkBuildingIcon size={20} color={colors.primary} />;
    return <LocationPinIcon size={20} color={colors.primary} />;
  };

  const handlePayNow = async () => {
    if (cartItems.length === 0) {
      showAlert('Empty Cart', 'Please add some items to your cart first.');
      return;
    }

    setLoading(true);
    try {
      const itemsPayload = cartItems.map(item => ({
        menuItem: item.id,
        quantity: item.quantity,
      }));

      const deliveryAddressPayload = activeSelectedAddress || {
        label: 'Default Address',
        addressLine1: 'Main Street, Food Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        latitude: destLat,
        longitude: destLng,
      };

      const response = await authFetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: itemsPayload,
          totalAmount: finalTotal,
          deliveryAddress: deliveryAddressPayload,
          paymentMethod: paymentMethod,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        showAlert('Order Failure', resData.message || 'Could not place your order.');
        return;
      }

      const dbOrderId = resData.id || resData._id;
      setPlacedOrderId(dbOrderId);

      if (paymentMethod === 'cod') {
        const codRes = await authFetch(`${API_URL}/orders/${dbOrderId}/confirm-cod`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!codRes.ok) {
          const codErr = await codRes.json();
          showAlert('Order Error', codErr.message || 'Could not confirm your COD order.');
          return;
        }
        clearCart();
        navigation.navigate('OrderConfirmed', {
          orderId: dbOrderId,
          destLat,
          destLng,
          addressLabel: formattedAddress,
        });
        return;
      }

      // 2. Create Razorpay Order
      const rzpOrderRes = await authFetch(`${API_URL}/orders/create-razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal })
      });
      const rzpOrderData = await rzpOrderRes.json();
      
      if (!rzpOrderRes.ok) {
        showAlert('Payment Init Failed', rzpOrderData.message || 'Could not initialize payment.');
        return;
      }

      // 3. Open Razorpay Checkout
      const options = {
        description: 'QuickBite Food Delivery',
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: rzpOrderData.currency || 'INR',
        key: RAZORPAY_KEY_ID || 'rzp_test_T9PQfyBmr3B9g0',
        amount: rzpOrderData.amount,
        name: 'QuickBite',
        order_id: rzpOrderData.id,
        prefill: {
          email: userProfile?.email || 'user@example.com',
          contact: userProfile?.phone || '9999999999',
          name: userProfile?.name || 'QuickBite Customer'
        },
        theme: { color: colors.primary }
      };

      RazorpayCheckout.open(options).then(async (data: any) => {
        // 4. Verify Payment on Backend
        const verifyRes = await authFetch(`${API_URL}/orders/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature,
            order_id: dbOrderId
          })
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          clearCart();
          navigation.navigate('OrderConfirmed', {
            orderId: dbOrderId,
            destLat,
            destLng,
            addressLabel: formattedAddress,
          });
        } else {
          showAlert('Payment Failed', verifyData.message || 'Signature verification failed.');
        }
      }).catch((error: any) => {
        showAlert('Payment Cancelled', `Payment was not completed. ${error.description || ''}`);
      });

    } catch (e: any) {
      showAlert('Network Issue', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#F7D055" />
      <CustomLoader visible={loading} message="Placing Order..." />

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={Icons.back} style={styles.backIconImg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout & Pay</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Estimated Delivery Banner */}
          <View style={styles.deliveryTimeBanner}>
            <View style={styles.deliveryTimeIconCircle}>
              <Image source={Icons.deliverymen} style={styles.deliveryTimeIcon} />
            </View>
            <View style={styles.deliveryTimeInfo}>
              <Text style={styles.deliveryTimeTitle}>Estimated Delivery: {estimatedDeliveryTime} Mins</Text>
              <Text style={styles.deliveryTimeSub}>Arriving by {estimatedArrivalTime}</Text>
            </View>
            <View style={styles.expressBadge}>
              <Text style={styles.expressBadgeText}>⚡ Live Tracking</Text>
            </View>
          </View>

          {/* Delivery Location Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Delivering To</Text>
            <TouchableOpacity onPress={() => setAddressModalVisible(true)} style={styles.editBtn}>
              <Text style={styles.editBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressBox}>
            <View style={styles.addressHeaderRow}>
              <View style={styles.addressTypeBadge}>
                {getAddressIcon(activeSelectedAddress?.label)}
                <Text style={styles.addressTypeText}>{activeSelectedAddress?.label || 'Delivery Address'}</Text>
              </View>
            </View>
            <Text style={styles.addressText}>{formattedAddress}</Text>
          </View>

          {/* Payment Method Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => setPaymentModalVisible(true)}>
              <Text style={styles.editBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.paymentBox}>
            <View style={styles.paymentMethodRow}>
              <View style={styles.paymentMethodIconCircle}>
                <Image
                  source={
                    paymentMethod === 'card'
                      ? Icons.card
                      : paymentMethod === 'upi'
                      ? require('../../assets/fingerprint.png')
                      : Icons.order
                  }
                  style={styles.paymentMethodIcon}
                />
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodName}>
                  {paymentMethod === 'card'
                    ? 'Online Payment (Razorpay / Card / NetBanking)'
                    : paymentMethod === 'upi'
                    ? 'UPI (Google Pay, PhonePe, Paytm)'
                    : 'Cash on Delivery (COD)'}
                </Text>
                <Text style={styles.paymentMethodDesc}>
                  {paymentMethod === 'cod'
                    ? 'Pay cash or UPI to driver on arrival'
                    : '100% Safe & Secure Encrypted Payment'}
                </Text>
              </View>
            </View>
          </View>

          {/* Order Items Preview */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Order Summary ({cartItems.length} items)</Text>
          </View>
          <View style={styles.summaryBox}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.summaryItemRow}>
                <Text style={styles.summaryItemName} numberOfLines={1}>
                  {item.name} <Text style={styles.summaryItemQty}>× {item.quantity}</Text>
                </Text>
                <Text style={styles.summaryItemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Detailed Payment Breakdown */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Bill Breakdown</Text>
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
              <Text style={styles.totalLabel}>Taxes & Restaurant Charges</Text>
              <Text style={styles.totalValue}>₹{taxAndFees.toFixed(2)}</Text>
            </View>
            <View style={styles.dottedLine} />
            <View style={styles.totalRow}>
              <Text style={styles.finalTotalLabel}>Total to Pay</Text>
              <Text style={styles.finalTotalValue}>₹{finalTotal.toFixed(2)}</Text>
            </View>
          </View>

        </ScrollView>
        
        {/* Bottom Pay Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={styles.payNowBtn} 
            activeOpacity={0.88}
            onPress={handlePayNow}
          >
            <View style={styles.btnLeftTotal}>
              <Text style={styles.btnTotalLabel}>TOTAL</Text>
              <Text style={styles.btnTotalValue}>₹{finalTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.btnRightAction}>
              <Text style={styles.payNowBtnText}>
                {paymentMethod === 'cod' ? 'Place COD Order' : 'Pay with Razorpay'}
              </Text>
              <Text style={styles.btnArrow}>➔</Text>
            </View>
          </TouchableOpacity>
        </View>

      </View>
    
      {/* Address Selection Modal */}
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
              {savedAddresses.map((addr: any, index: number) => {
                const isSelected = activeSelectedAddress?.addressLine1 === addr.addressLine1;
                const fullText = [addr.addressLine1, addr.addressLine2, addr.city, addr.zipCode].filter(Boolean).join(', ');
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.modalItem, isSelected && styles.modalItemActive]}
                    onPress={() => {
                      setSelectedAddressIndex(index);
                      setAddressModalVisible(false);
                    }}
                  >
                    <View style={styles.modalItemHeader}>
                      {getAddressIcon(addr.label)}
                      <Text style={styles.modalLabel}>{addr.label || 'Address'}</Text>
                    </View>
                    <Text style={styles.modalSubText}>{fullText}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity 
                style={styles.addBtn} 
                onPress={() => {
                  setAddressModalVisible(false);
                  navigation.navigate('AddNewAddress');
                }}
              >
                <Text style={styles.addBtnText}>+ Add New Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Payment Selection Modal */}
      {isPaymentModalVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackgroundTouch} 
            activeOpacity={1} 
            onPress={() => setPaymentModalVisible(false)} 
          />
          <View style={styles.bottomSheetSmall}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.modalItem, paymentMethod === 'card' && styles.modalItemActive]}
              onPress={() => {
                setPaymentMethod('card');
                setPaymentModalVisible(false);
              }}
            >
              <Text style={styles.modalLabel}>💳 Online Payment / Card / NetBanking</Text>
              <Text style={styles.modalSubText}>Razorpay secure checkout</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalItem, paymentMethod === 'upi' && styles.modalItemActive]}
              onPress={() => {
                setPaymentMethod('upi');
                setPaymentModalVisible(false);
              }}
            >
              <Text style={styles.modalLabel}>📱 UPI (Google Pay, PhonePe, Paytm)</Text>
              <Text style={styles.modalSubText}>Direct instant UPI payment</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalItem, paymentMethod === 'cod' && styles.modalItemActive]}
              onPress={() => {
                setPaymentMethod('cod');
                setPaymentModalVisible(false);
              }}
            >
              <Text style={styles.modalLabel}>💵 Cash on Delivery (COD)</Text>
              <Text style={styles.modalSubText}>Pay cash or UPI to rider on arrival</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F7D055',
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
    backIconImg: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      tintColor: colors.primary,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    rightPlaceholder: {
      width: 40,
    },
    contentContainer: {
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
      paddingBottom: 120,
    },
    deliveryTimeBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF4EB',
      borderRadius: 18,
      padding: 14,
      marginBottom: 18,
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
      marginBottom: 10,
      marginTop: 6,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
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
      marginBottom: 16,
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
    paymentBox: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#EFEFEF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    paymentMethodRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    paymentMethodIconCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#FFF4EB',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    paymentMethodIcon: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
      tintColor: colors.primary,
    },
    paymentMethodInfo: {
      flex: 1,
    },
    paymentMethodName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    paymentMethodDesc: {
      fontSize: 11,
      color: colors.textMuted,
    },
    summaryBox: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#EFEFEF',
    },
    summaryItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    summaryItemName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: 10,
    },
    summaryItemQty: {
      color: colors.primary,
      fontWeight: '700',
    },
    summaryItemPrice: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
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
    bottomSection: {
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
    payNowBtn: {
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
    payNowBtnText: {
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
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight: '75%',
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 20,
    },
    bottomSheetSmall: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 20,
      paddingBottom: 34,
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
      marginBottom: 18,
    },
    sheetTitle: {
      fontSize: 17,
      fontWeight: '800',
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
    modalItem: {
      borderWidth: 1.2,
      borderColor: '#E5E7EB',
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      backgroundColor: '#FFFFFF',
    },
    modalItemActive: {
      borderColor: colors.primary,
      backgroundColor: '#FFF4EB',
    },
    modalItemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 6,
    },
    modalLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    modalSubText: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 16,
    },
    addBtn: {
      backgroundColor: '#FFF4EB',
      padding: 14,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 6,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.25)',
    },
    addBtnText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '800',
    },
  });
