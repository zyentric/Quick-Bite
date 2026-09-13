import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, CustomerOrderSummary, RawOrderItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useUser } from '../../context/UserContext';
import { authFetch } from '../../utils/authFetch';
import { API_URL } from '../../config/api';
import {
  TrackingHeroBanner,
  TrackingMap,
  TrackingRiderCard,
  TrackingTimeline,
  TrackingAddressCard,
  TrackingItemsList,
  TrackingStep,
} from '../../components/tracking';

type DeliveryTimeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DeliveryTime'>;
type DeliveryTimeRouteProp = RouteProp<RootStackParamList, 'DeliveryTime'>;

const RESTAURANT_LAT = 19.076;
const RESTAURANT_LNG = 72.8777;
const CUSTOMER_DEFAULT_LAT = 19.1136;
const CUSTOMER_DEFAULT_LNG = 72.8697;

const STATUS_INFO: Record<
  string,
  { label: string; desc: string; eta: string; stepIdx: number }
> = {
  PendingPayment: {
    label: 'Payment Pending',
    desc: 'Waiting for payment confirmation',
    eta: '35-40 mins',
    stepIdx: 0,
  },
  Placed: {
    label: 'Order Confirmed',
    desc: 'Restaurant has received your order',
    eta: '30-35 mins',
    stepIdx: 0,
  },
  Accepted: {
    label: 'Order Accepted',
    desc: 'Restaurant accepted and sent to kitchen',
    eta: '25-30 mins',
    stepIdx: 1,
  },
  Preparing: {
    label: 'Preparing in Kitchen',
    desc: 'Chef is preparing your fresh meal 👨‍🍳',
    eta: '20-25 mins',
    stepIdx: 2,
  },
  ReadyForPickup: {
    label: 'Order Ready',
    desc: 'Food is packed & waiting for delivery partner 🥡',
    eta: '15-20 mins',
    stepIdx: 3,
  },
  OutForDelivery: {
    label: 'Out for Delivery',
    desc: 'Rider is on the way to your doorstep 🛵',
    eta: '10-15 mins',
    stepIdx: 4,
  },
  Delivered: {
    label: 'Delivered Successfully',
    desc: 'Delivered at your doorstep. Enjoy your meal! 🎉',
    eta: 'Delivered',
    stepIdx: 5,
  },
};

const TRACKING_STEPS: TrackingStep[] = [
  { id: 'placed', title: 'Order Confirmed', subtitle: 'Order received by restaurant' },
  { id: 'accepted', title: 'Order Accepted', subtitle: 'Kitchen started preparation' },
  { id: 'preparing', title: 'Food is Cooking', subtitle: 'Freshly made with care' },
  { id: 'ready', title: 'Packed & Ready', subtitle: 'Ready for rider pickup' },
  { id: 'out_delivery', title: 'Out for Delivery', subtitle: 'Rider heading to your address' },
  { id: 'delivered', title: 'Delivered', subtitle: 'Package handed over safely' },
];

export default function DeliveryTimeScreen() {
  const navigation = useNavigation<DeliveryTimeNavigationProp>();
  const route = useRoute<DeliveryTimeRouteProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { userProfile } = useUser();

  const {
    orderId,
    destLat: paramDestLat,
    destLng: paramDestLng,
    addressLabel: paramAddress,
    initialPin,
  } = route.params || {};

  const savedAddress = userProfile?.savedAddresses?.[0];
  const destLat = paramDestLat || savedAddress?.latitude || CUSTOMER_DEFAULT_LAT;
  const destLng = paramDestLng || savedAddress?.longitude || CUSTOMER_DEFAULT_LNG;
  const addressString =
    paramAddress ||
    (savedAddress
      ? `${savedAddress.addressLine1}, ${savedAddress.city}`
      : 'Registered Delivery Address');

  const [orderStatus, setOrderStatus] = useState<string>('OutForDelivery');
  const [orderItems, setOrderItems] = useState<RawOrderItem[]>([]);
  const [fetchedOrder, setFetchedOrder] = useState<CustomerOrderSummary | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await authFetch(`${API_URL}/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setFetchedOrder(data);
          setOrderStatus(data.status || 'OutForDelivery');
          setOrderItems(data.items || []);
        }
      } catch (e) {
        console.error('Failed to fetch order for tracking:', e);
      }
    };
    fetchOrder();

    const poll = setInterval(fetchOrder, 15000);
    return () => clearInterval(poll);
  }, [orderId]);

  const currentInfo = STATUS_INFO[orderStatus] || STATUS_INFO.OutForDelivery;
  const orderNum = orderId || fetchedOrder?.id || fetchedOrder?._id || '';
  const orderDisplayId = `#QB-${orderNum.slice(-6).toUpperCase() || '102938'}`;

  const deliveryOtp = fetchedOrder?.deliveryPin || initialPin;
  const isDelivered = orderStatus === 'Delivered';

  const deliveryMan = fetchedOrder?.deliveryMan;
  const isAssigned = !!deliveryMan || orderStatus === 'OutForDelivery' || isDelivered;
  const riderName = deliveryMan?.name || (isDelivered ? 'Delivery Completed' : 'Assigned Partner');
  const riderPhone = deliveryMan?.phone || '';
  const riderVehicle = deliveryMan?.vehicleNumber
    ? `${deliveryMan.vehicleType || 'Vehicle'} • ${deliveryMan.vehicleNumber}`
    : deliveryMan?.vehicleType || 'Delivery Partner';
  const riderAvatar = deliveryMan?.profilePicture;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Image source={require('../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <Text style={styles.headerSubtitle}>{orderDisplayId}</Text>
        </View>

        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() =>
            orderId && navigation.navigate('OrderDetails', { orderId, initialOrder: fetchedOrder || undefined })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.detailsBtnText}>Details</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Live ETA Hero Banner */}
          <TrackingHeroBanner
            eta={currentInfo.eta}
            statusDescription={currentInfo.desc}
            deliveryOtp={deliveryOtp}
            isDelivered={isDelivered}
          />

          {/* Interactive GPS Leaflet Map */}
          <TrackingMap
            startLat={RESTAURANT_LAT}
            startLng={RESTAURANT_LNG}
            destLat={destLat}
            destLng={destLng}
          />

          {/* Delivery Partner / Rider Card */}
          <TrackingRiderCard
            isAssigned={isAssigned}
            riderName={riderName}
            riderPhone={riderPhone}
            vehicleInfo={riderVehicle}
            profilePicture={riderAvatar}
            rating="4.9"
          />

          {/* Step Timeline */}
          <TrackingTimeline
            steps={TRACKING_STEPS}
            currentStepIdx={currentInfo.stepIdx}
          />

          {/* Delivery Address Card */}
          <TrackingAddressCard addressString={addressString} />

          {/* Itemized Dishes List */}
          <TrackingItemsList orderItems={orderItems} />
        </ScrollView>

        {/* Bottom Floating Navigation Buttons */}
        <View style={styles.bottomSection}>
          <View style={styles.bottomActionsRow}>
            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
              activeOpacity={0.8}
            >
              <Text style={styles.homeBtnText}>Return Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ordersBtn}
              onPress={() => navigation.navigate('MyOrders')}
              activeOpacity={0.85}
            >
              <Text style={styles.ordersBtnText}>My Orders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 20,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIconImg: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
    headerCenter: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: '#FFFFFF',
    },
    headerSubtitle: {
      fontSize: 12,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.85)',
      marginTop: 2,
    },
    detailsBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    detailsBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    contentContainer: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      overflow: 'hidden',
    },
    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 110,
    },
    bottomSection: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 20,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 8,
    },
    bottomActionsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    homeBtn: {
      flex: 1,
      backgroundColor: '#F3F4F6',
      paddingVertical: 13,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    homeBtnText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    ordersBtn: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 13,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
    ordersBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
  });
