import React, { useState } from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import { API_URL } from '../../config/api';
import { authFetch } from '../../utils/authFetch';
import CustomLoader from '../../components/CustomLoader';
import CustomAlert from '../../components/CustomAlert';

type PaymentNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;


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
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const { cartItems, totalPrice, clearCart } = useCart();
  const { userId } = useUser();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  
  const [isAddressModalVisible, setAddressModalVisible] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'upi'>('card');

  const { userProfile } = useUser();
  const savedAddresses = userProfile?.savedAddresses || [];
  const selectedAddress = savedAddresses[selectedAddressIndex];
  const addressDisplayString = selectedAddress 
    ? `${selectedAddress.addressLine1}, ${selectedAddress.city}`
    : 'No address selected. Please add one.';
    
  // Restaurant coordinates: [37.7944, -122.2912]
  const destLat = selectedAddress?.location?.lat || 37.8044;
  const destLng = selectedAddress?.location?.lng || -122.2712;
  const distanceKm = getDistance(37.7944, -122.2912, destLat, destLng);
  
  const estimatedDeliveryTime = Math.max(15, Math.ceil(15 + distanceKm * 5));

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const taxAndFees = cartItems.length > 0 ? 5.00 : 0;
  const deliveryFee = cartItems.length > 0 ? 3.00 : 0;
  const finalTotal = totalPrice + taxAndFees + deliveryFee;

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

      const response = await authFetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: itemsPayload,
          totalAmount: finalTotal,
          deliveryAddress: selectedAddress || {
            addressLine1: '778 Locust View Drive Oaklanda, CA',
            city: 'Oakland',
            state: 'CA',
            zipCode: '94612',
          },
          paymentMethod: paymentMethod,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        showAlert('Order Failure', resData.message || 'Could not place your order.');
        return;
      }

      const dbOrderId = resData.id || resData._id;

      if (paymentMethod === 'cod') {
        clearCart();
        navigation.navigate('OrderConfirmed');
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
        key: 'rzp_test_1234567890', // Replace with real key in production
        amount: rzpOrderData.amount,
        name: 'QuickBite',
        order_id: rzpOrderData.id,
        prefill: {
          email: 'user@example.com',
          contact: '9999999999',
          name: 'QuickBite Customer'
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
          navigation.navigate('OrderConfirmed');
        } else {
          showAlert('Payment Failed', verifyData.message || 'Signature verification failed.');
        }
      }).catch((error: any) => {
        showAlert('Payment Cancelled', `Payment was not completed. ${error.description || ''}`);
      });


      // clearCart and navigation handled in Razorpay success callback
    } catch (e: any) {
      showAlert('Network Issue', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Reusable Custom Loader */}
      <CustomLoader visible={loading} message="Placing Order..." />

      {/* Reusable Custom Alert Modal */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Shipping Address */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <TouchableOpacity onPress={() => setAddressModalVisible(true)} style={styles.editBtn}>
              <Image source={require('../../assets/pencil.png')} style={styles.pencilIconImg} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>{addressDisplayString}</Text>
          </View>

          {/* Order Summary (condensed) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.editBtn}>
              <Image source={require('../../assets/pencil.png')} style={styles.pencilIconImg} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.summaryBox}>
            <View style={styles.summaryItems}>
              {cartItems.map(item => (
                <View key={item.id} style={styles.summaryItemRow}>
                  <Text style={styles.summaryItemName}>{item.name}</Text>
                  <Text style={styles.summaryItemQty}>{item.quantity} items</Text>
                </View>
              ))}
            </View>
            <Text style={styles.summaryTotalText}>₹{finalTotal.toFixed(2)}</Text>
          </View>

          {/* Payment Method */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => setPaymentModalVisible(true)}>
              <Image source={require('../../assets/pencil.png')} style={styles.pencilIconImg} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.paymentBox}>
            <View style={styles.cardInfo}>
              {paymentMethod === 'card' ? (
                <Image source={require('../../assets/card.png')} style={styles.cardIconImg} />
              ) : paymentMethod === 'upi' ? null : (
                <Text style={styles.cardIcon}>💵</Text>
              )}
              <Text style={styles.cardType}>
                {paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
              </Text>
            </View>
            {paymentMethod === 'card' && (
              <View style={styles.cardDetailsBox}>
                <Text style={styles.cardNumber}>*** *** *** 43</Text>
                <Text style={styles.cardExpiry}>/00 /000</Text>
              </View>
            )}
          </View>

          {/* Delivery Time */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Delivery Time</Text>
          </View>
          <View style={styles.deliveryBox}>
            <Text style={styles.deliverySub}>Estimated Delivery</Text>
            <Text style={styles.deliveryTime}>{estimatedDeliveryTime} mins</Text>
          </View>

        </ScrollView>
        
        {/* Bottom Tabs matching mockup + Pay Now Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={styles.payNowBtn} 
            onPress={handlePayNow}
          >
            <Text style={styles.payNowBtnText}>Pay Now</Text>
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
              {savedAddresses.map((addr: any, index: number) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.modalItem, selectedAddressIndex === index && styles.modalItemActive]}
                  onPress={() => {
                    setSelectedAddressIndex(index);
                    setAddressModalVisible(false);
                  }}
                >
                  <Text style={styles.modalLabel}>{addr.label || 'Address'}</Text>
                  <Text style={styles.modalSubText}>
                    {addr.addressLine1}, {addr.city}
                  </Text>
                </TouchableOpacity>
              ))}
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
              <Text style={styles.modalLabel}>Credit Card</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalItem, paymentMethod === 'cod' && styles.modalItemActive]}
              onPress={() => {
                setPaymentMethod('cod');
                setPaymentModalVisible(false);
              }}
            >
              <Text style={styles.modalLabel}>Cash on Delivery</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalItem, paymentMethod === 'upi' && styles.modalItemActive]}
              onPress={() => {
                setPaymentMethod('upi');
                setPaymentModalVisible(false);
              }}
            >
              <Text style={styles.modalLabel}>UPI (GPay, PhonePe, etc.)</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
    paddingBottom: 150, // Space for bottom section
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  addressBox: {
    backgroundColor: colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  addressText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryItems: {
    flex: 1,
  },
  summaryItemRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  summaryItemName: {
    color: colors.textMuted,
    fontSize: 12,
    marginRight: 10,
  },
  summaryItemQty: {
    color: colors.primary,
    fontSize: 12,
  },
  summaryTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  paymentBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  cardType: {
    fontSize: 14,
    color: colors.textMuted,
  },
  cardDetailsBox: {
    flexDirection: 'row',
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  cardNumber: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  cardExpiry: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  deliveryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  deliverySub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  deliveryTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  payNowBtn: {
    backgroundColor: colors.inputBackground, // Light peach button
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginBottom: 20, // Space between btn and tabs
  },
  payNowBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backIconImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  pencilIconImg: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    tintColor: colors.primary,
    marginRight: 5,
  },
  cardIconImg: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: colors.text,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    zIndex: 100,
  },
  modalBackgroundTouch: {
    flex: 1,
    width: '100%',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    height: '50%',
  },
  bottomSheetSmall: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    height: '35%',
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
    color: colors.text,
    padding: 5,
  },
  sheetScroll: {
    flex: 1,
  },
  modalItem: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  modalItemActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF8F5',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  modalSubText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  addBtn: {
    backgroundColor: colors.inputBackground,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  addBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
