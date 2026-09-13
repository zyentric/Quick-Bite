import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { authFetch } from '../../utils/authFetch';
import { API_URL } from '../../config/api';
import { Icons } from '../../constants/icons';
import CustomAlert from '../../components/CustomAlert';
import CustomLoader from '../../components/CustomLoader';
import {
  DeliveryBikeIcon,
  RestaurantIcon,
  LocationPinIcon,
  PhoneCallIcon,
  MapNavigationIcon,
  CashMoneyIcon,
  CardPaymentIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  WarningTriangleIcon,
} from '../../components/icons/DeliveryIcons';
import { VegIcon, NonVegIcon } from '../../components/icons/ShopkeeperIcons';
import { ChatBubbleIcon } from '../../components/icons';
import DeliveryConfirmModal from '../../components/delivery/DeliveryConfirmModal';
import { wsService } from '../../services/WebSocketService';

type DeliveryOrderDetailsNavProp = NativeStackNavigationProp<RootStackParamList, 'DeliveryOrderDetails'>;
type DeliveryOrderDetailsRouteProp = RouteProp<RootStackParamList, 'DeliveryOrderDetails'>;

const STATUS_STEPS = [
  { key: 'Placed', label: 'Placed' },
  { key: 'Preparing', label: 'In Kitchen' },
  { key: 'ReadyForPickup', label: 'Ready' },
  { key: 'OutForDelivery', label: 'On Way' },
  { key: 'Delivered', label: 'Delivered' },
];

const getStatusIndex = (status: string) => {
  switch (status) {
    case 'PendingPayment':
    case 'Placed':
      return 0;
    case 'Accepted':
    case 'Preparing':
      return 1;
    case 'ReadyForPickup':
      return 2;
    case 'OutForDelivery':
      return 3;
    case 'Delivered':
      return 4;
    default:
      return 0;
  }
};

export default function DeliveryOrderDetailsScreen() {
  const navigation = useNavigation<DeliveryOrderDetailsNavProp>();
  const route = useRoute<DeliveryOrderDetailsRouteProp>();
  const { orderId, initialOrder } = route.params;

  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { userId } = useUser();
  const { showToast } = useToast();

  const [order, setOrder] = useState<any>(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [isDeliverConfirmModalVisible, setDeliverConfirmModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const fetchOrderDetails = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (!order) setLoading(true);

    try {
      const res = await authFetch(`${API_URL}/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        showAlert('Error', 'Could not load order details');
      }
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Real-time order status updates listener
  useEffect(() => {
    const unsubscribe = wsService.subscribe((event) => {
      if (event.orderId === orderId) {
        fetchOrderDetails(true);
      }
    });
    return unsubscribe;
  }, [orderId, fetchOrderDetails]);

  const onRefresh = () => {
    fetchOrderDetails(true);
  };

  const handleCall = (phone?: string) => {
    if (!phone) {
      showAlert('Phone Unavailable', 'No phone number provided.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleNavigateMaps = (address: string) => {
    const encoded = encodeURIComponent(address);
    const url =
      Platform.OS === 'ios'
        ? `maps:0,0?q=${encoded}`
        : `geo:0,0?q=${encoded}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
    });
  };

  const handleOpenChat = (target: 'customer' | 'shopkeeper') => {
    if (!order) return;
    const orderNum = orderId.slice(-6).toUpperCase();

    if (target === 'customer') {
      const custId = order.user?._id || order.user?.id || order.user;
      const custName = order.user?.name || 'Customer';
      navigation.navigate('Chat', {
        orderId,
        orderNumber: orderNum,
        recipientId: custId ? custId.toString() : undefined,
        recipientName: custName,
        recipientRole: 'customer',
      });
    } else {
      const shopId = order.shopkeeper?._id || order.shopkeeper?.id || order.shopkeeper;
      const shopName = order.restaurant?.name || order.shopkeeper?.name || 'Kitchen Partner';
      navigation.navigate('Chat', {
        orderId,
        orderNumber: orderNum,
        recipientId: shopId ? shopId.toString() : undefined,
        recipientName: shopName,
        recipientRole: 'shopkeeper',
      });
    }
  };

  const handleClaim = async () => {
    setActionLoading(true);
    try {
      const response = await authFetch(`${API_URL}/orders/${orderId}/assign-delivery`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) {
        showAlert('Error', data.message || 'Could not claim delivery');
        return;
      }
      showToast({
        type: 'order',
        title: 'Delivery Claimed',
        message: `Order #${orderId.slice(-6).toUpperCase()} assigned to your route.`,
      });
      fetchOrderDetails(true);
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmMarkDelivered = async (enteredPin: string) => {
    setDeliverConfirmModalVisible(false);
    setActionLoading(true);
    try {
      const response = await authFetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Delivered', deliveryPin: enteredPin }),
      });
      const data = await response.json();
      if (!response.ok) {
        showAlert('Delivery Failed', data.message || 'Incorrect PIN or delivery could not be completed');
        return;
      }
      showAlert(
        'Delivery Completed',
        `Order #${orderId.slice(-6).toUpperCase()} has been successfully verified & delivered.`
      );
      showToast({
        type: 'success',
        title: 'Delivery Completed',
        message: `Order #${orderId.slice(-6).toUpperCase()} delivered successfully!`,
      });
      fetchOrderDetails(true);
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#1E1B18' }]} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#1E1B18" />
        <CustomLoader visible={true} message="Loading order details..." />
      </SafeAreaView>
    );
  }

  const orderDisplayId = orderId.slice(-6).toUpperCase();
  const currentStepIdx = getStatusIndex(order?.status || 'Placed');
  const isCOD = order?.paymentStatus === 'Pending';
  const customerName = order?.user?.name || 'Customer';
  const customerPhone = order?.user?.phone || '';
  const customerAddress =
    typeof order?.deliveryAddress === 'string'
      ? order.deliveryAddress
      : order?.deliveryAddress?.addressLine1 || order?.deliveryAddress?.address || 'Customer Delivery Address';

  const restaurantName = order?.restaurant?.name || order?.shopkeeper?.name || 'Partner Kitchen';
  const restaurantAddress = order?.shopkeeper?.address || order?.restaurant?.address || 'Kitchen Pickup Counter';
  const restaurantPhone = order?.shopkeeper?.phone || '';

  const isAssignedToMe =
    order?.deliveryMan === userId ||
    order?.deliveryMan?._id === userId ||
    order?.status === 'OutForDelivery';

  const isAvailableToClaim = order?.status !== 'OutForDelivery' && order?.status !== 'Delivered' && !isAssignedToMe;
  const isReadyToDeliver = order?.status === 'OutForDelivery' || isAssignedToMe;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#1E1B18' }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B18" />
      <CustomLoader visible={actionLoading} message="Updating status..." />

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={() => navigation.goBack()}
        >
          <Image source={Icons.back} style={styles.backIcon} />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerSub}>Delivery Task</Text>
          <Text style={styles.headerTitle}>Order #{orderDisplayId}</Text>
        </View>

        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFC72C" />
        }
      >
        {/* Status Stepper Card */}
        <View style={styles.card}>
          <View style={styles.statusHeaderRow}>
            <View>
              <Text style={styles.orderIdTitle}>Order #{orderDisplayId}</Text>
              <Text style={styles.orderDateText}>
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Recent Order'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isReadyToDeliver ? '#3B82F6' : '#10B981' }]}>
              <Text style={styles.statusBadgeText}>
                {order?.status === 'OutForDelivery' ? 'In Transit' : order?.status || 'Active'}
              </Text>
            </View>
          </View>

          {/* Stepper Flow */}
          <View style={styles.timelineWrapper}>
            <View style={styles.timelineBarBg}>
              <View
                style={[
                  styles.timelineBarFill,
                  {
                    width: `${Math.min(100, Math.max(0, (currentStepIdx / 4) * 100))}%` as any,
                    backgroundColor: order?.status === 'Delivered' ? '#10B981' : colors.primary,
                  },
                ]}
              />
            </View>

            <View style={styles.timelineNodesRow}>
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <View key={step.key} style={styles.nodeItem}>
                    <View
                      style={[
                        styles.nodeCircle,
                        isPassed && styles.nodeCirclePassed,
                        isCurrent && styles.nodeCircleCurrent,
                      ]}
                    >
                      {isPassed ? (
                        <Text style={styles.nodeCheckText}>✓</Text>
                      ) : (
                        <View style={styles.nodeDot} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.nodeLabel,
                        isPassed && styles.nodeLabelPassed,
                        isCurrent && styles.nodeLabelCurrent,
                      ]}
                      numberOfLines={1}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Customer Destination Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <LocationPinIcon size={18} color="#EF4444" />
              <Text style={styles.cardTitle}>Customer & Delivery Address</Text>
            </View>
          </View>

          <Text style={styles.sectionHeading}>{customerName}</Text>
          <Text style={styles.addressBodyText}>{customerAddress}</Text>

          {/* Customer Action Bar: Call, Maps & Live Chat */}
          <View style={styles.actionRow}>
            {customerPhone ? (
              <TouchableOpacity
                style={styles.subActionBtn}
                onPress={() => handleCall(customerPhone)}
                activeOpacity={0.8}
              >
                <PhoneCallIcon size={14} color="#10B981" />
                <Text style={styles.subActionBtnText}>Call</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.subActionBtn}
              onPress={() => handleNavigateMaps(customerAddress)}
              activeOpacity={0.8}
            >
              <MapNavigationIcon size={14} color="#3B82F6" />
              <Text style={styles.subActionBtnText}>Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subActionBtn, styles.chatActionBtn]}
              onPress={() => handleOpenChat('customer')}
              activeOpacity={0.8}
            >
              <ChatBubbleIcon size={15} color="#FFFFFF" />
              <Text style={[styles.subActionBtnText, { color: '#FFFFFF' }]}>Chat with Customer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Restaurant Pickup Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <RestaurantIcon size={18} color="#F59E0B" />
              <Text style={styles.cardTitle}>Restaurant Kitchen Pickup</Text>
            </View>
          </View>

          <Text style={styles.sectionHeading}>{restaurantName}</Text>
          <Text style={styles.addressBodyText}>{restaurantAddress}</Text>

          {/* Restaurant Action Bar: Call & Chat */}
          <View style={styles.actionRow}>
            {restaurantPhone ? (
              <TouchableOpacity
                style={styles.subActionBtn}
                onPress={() => handleCall(restaurantPhone)}
                activeOpacity={0.8}
              >
                <PhoneCallIcon size={14} color="#10B981" />
                <Text style={styles.subActionBtnText}>Call Kitchen</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.subActionBtn, styles.kitchenChatBtn]}
              onPress={() => handleOpenChat('shopkeeper')}
              activeOpacity={0.8}
            >
              <ChatBubbleIcon size={15} color="#FFFFFF" />
              <Text style={[styles.subActionBtnText, { color: '#FFFFFF' }]}>Chat with Kitchen</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ordered Food Items List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Items to Verify & Deliver ({(order?.items || []).length})
          </Text>

          <View style={styles.itemsListWrapper}>
            {(order?.items || []).map((item: any, idx: number) => {
              const dish = item.menuItem || item;
              const dishName = dish.name || item.name || 'Food Item';
              const dishImg = dish.image || item.image;
              const isVeg =
                dish.category?.toLowerCase() !== 'non-veg' &&
                dish.category?.toLowerCase() !== 'chicken' &&
                dish.category?.toLowerCase() !== 'meat';
              const qty = item.quantity || 1;
              const price = dish.price || item.price || 0;

              return (
                <View key={idx} style={styles.dishRow}>
                  {dishImg ? (
                    <Image source={{ uri: dishImg }} style={styles.dishThumbnail} />
                  ) : (
                    <View style={styles.dishPlaceholder}>
                      <RestaurantIcon size={18} color="#94A3B8" />
                    </View>
                  )}

                  <View style={styles.vegDot}>
                    {isVeg ? <VegIcon size={14} /> : <NonVegIcon size={14} />}
                  </View>

                  <View style={styles.dishDetails}>
                    <Text style={styles.dishTitle} numberOfLines={1}>
                      {dishName}
                    </Text>
                    {dish.category ? (
                      <Text style={styles.dishCategory}>{dish.category}</Text>
                    ) : null}
                  </View>

                  <Text style={styles.dishQty}>{qty}x</Text>
                  <Text style={styles.dishPrice}>₹{price * qty}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Payment & Cash Collection Notice */}
        <View style={[styles.paymentBanner, isCOD ? styles.paymentBannerCOD : styles.paymentBannerPaid]}>
          {isCOD ? (
            <CashMoneyIcon size={20} color="#E11D48" />
          ) : (
            <CardPaymentIcon size={20} color="#15803D" />
          )}
          <View style={{ flex: 1 }}>
            <Text style={isCOD ? styles.paymentTitleCOD : styles.paymentTitlePaid}>
              {isCOD ? 'CASH ON DELIVERY' : 'ONLINE PREPAID ORDER'}
            </Text>
            <Text style={isCOD ? styles.paymentDescCOD : styles.paymentDescPaid}>
              {isCOD
                ? `Collect ₹${order?.totalAmount} in cash from the customer at doorstep before handover.`
                : `Payment of ₹${order?.totalAmount} already completed online via UPI / Card.`}
            </Text>
          </View>
        </View>

        {/* Secure 4-Digit Delivery PIN Reminder */}
        <View style={styles.securityCard}>
          <ShieldCheckIcon size={22} color="#10B981" />
          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>Secure Delivery PIN Protection</Text>
            <Text style={styles.securityDesc}>
              To verify handover, the customer will provide their 4-digit Delivery PIN shown on their app.
            </Text>
          </View>
        </View>

        {/* Action Button Bar */}
        <View style={styles.actionContainer}>
          {isAvailableToClaim && (
            <TouchableOpacity
              style={[styles.mainActionBtn, { backgroundColor: colors.primary }]}
              onPress={handleClaim}
              activeOpacity={0.85}
            >
              <DeliveryBikeIcon size={18} color="#FFFFFF" />
              <Text style={styles.mainActionBtnText}>Claim Delivery Task</Text>
            </TouchableOpacity>
          )}

          {isReadyToDeliver && order?.status !== 'Delivered' && (
            <TouchableOpacity
              style={[styles.mainActionBtn, { backgroundColor: '#10B981' }]}
              onPress={() => setDeliverConfirmModalVisible(true)}
              activeOpacity={0.85}
            >
              <CheckCircleIcon size={18} color="#FFFFFF" />
              <Text style={styles.mainActionBtnText}>Verify PIN & Mark Delivered</Text>
            </TouchableOpacity>
          )}

          {order?.status === 'Delivered' && (
            <View style={styles.deliveredCompleteTag}>
              <CheckCircleIcon size={18} color="#10B981" />
              <Text style={styles.deliveredCompleteText}>Order Delivered Successfully</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Delivery PIN Confirmation Modal */}
      <DeliveryConfirmModal
        visible={isDeliverConfirmModalVisible}
        order={order ? { ...order, id: orderId } : null}
        onClose={() => setDeliverConfirmModalVisible(false)}
        onConfirm={confirmMarkDelivered}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1E1B18',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#2D2825',
    },
    backButton: {
      padding: 6,
    },
    backIcon: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
    headerTitleBox: {
      alignItems: 'center',
    },
    headerSub: {
      fontSize: 11,
      color: '#9E9D9B',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    rightPlaceholder: {
      width: 34,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: '#272320',
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#38332E',
    },
    statusHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    orderIdTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    orderDateText: {
      fontSize: 12,
      color: '#A8A29E',
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
    },
    statusBadgeText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 12,
    },
    timelineWrapper: {
      marginTop: 6,
      marginBottom: 6,
    },
    timelineBarBg: {
      height: 4,
      backgroundColor: '#3E3834',
      borderRadius: 2,
      marginHorizontal: 14,
      marginBottom: -10,
    },
    timelineBarFill: {
      height: 4,
      borderRadius: 2,
    },
    timelineNodesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    nodeItem: {
      alignItems: 'center',
      width: 58,
    },
    nodeCircle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#3E3834',
      borderWidth: 2,
      borderColor: '#272320',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    nodeCirclePassed: {
      backgroundColor: '#10B981',
      borderColor: '#10B981',
    },
    nodeCircleCurrent: {
      backgroundColor: '#FF7622',
      borderColor: '#FF7622',
    },
    nodeCheckText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: 'bold',
    },
    nodeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#6B7280',
    },
    nodeLabel: {
      fontSize: 10,
      color: '#78716C',
      textAlign: 'center',
      fontWeight: '600',
    },
    nodeLabelPassed: {
      color: '#E7E5E4',
    },
    nodeLabelCurrent: {
      color: '#FF7622',
      fontWeight: '700',
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    sectionHeading: {
      fontSize: 15,
      fontWeight: '700',
      color: '#F5F5F4',
      marginBottom: 4,
    },
    addressBodyText: {
      fontSize: 13,
      color: '#A8A29E',
      lineHeight: 18,
      marginBottom: 12,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    subActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: '#1E1B18',
      borderWidth: 1,
      borderColor: '#3E3834',
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 14,
    },
    chatActionBtn: {
      backgroundColor: '#2563EB',
      borderColor: '#3B82F6',
    },
    kitchenChatBtn: {
      backgroundColor: '#D97706',
      borderColor: '#F59E0B',
    },
    subActionBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#E7E5E4',
    },
    itemsListWrapper: {
      marginTop: 10,
      gap: 10,
    },
    dishRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: '#342E29',
    },
    dishThumbnail: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: '#1E1B18',
      marginRight: 10,
    },
    dishPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: '#1E1B18',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    vegDot: {
      marginRight: 8,
    },
    dishDetails: {
      flex: 1,
      paddingRight: 8,
    },
    dishTitle: {
      fontSize: 13.5,
      fontWeight: '700',
      color: '#F5F5F4',
    },
    dishCategory: {
      fontSize: 11,
      color: '#A8A29E',
      marginTop: 2,
    },
    dishQty: {
      fontSize: 13,
      fontWeight: '800',
      color: '#FF7622',
      marginRight: 10,
    },
    dishPrice: {
      fontSize: 13.5,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    paymentBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 14,
      marginBottom: 14,
    },
    paymentBannerCOD: {
      backgroundColor: 'rgba(225, 29, 72, 0.15)',
      borderWidth: 1,
      borderColor: '#FDA4AF',
    },
    paymentBannerPaid: {
      backgroundColor: 'rgba(21, 128, 61, 0.15)',
      borderWidth: 1,
      borderColor: '#86EFAC',
    },
    paymentTitleCOD: {
      color: '#E11D48',
      fontWeight: '800',
      fontSize: 13,
    },
    paymentDescCOD: {
      color: '#FDA4AF',
      fontSize: 12,
      marginTop: 2,
      lineHeight: 16,
    },
    paymentTitlePaid: {
      color: '#15803D',
      fontWeight: '800',
      fontSize: 13,
    },
    paymentDescPaid: {
      color: '#86EFAC',
      fontSize: 12,
      marginTop: 2,
      lineHeight: 16,
    },
    securityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: '#272320',
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: '#38332E',
      marginBottom: 20,
    },
    securityTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    securityDesc: {
      fontSize: 11.5,
      color: '#A8A29E',
      marginTop: 2,
      lineHeight: 16,
    },
    actionContainer: {
      marginTop: 6,
    },
    mainActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    mainActionBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    deliveredCompleteTag: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderWidth: 1,
      borderColor: '#10B981',
      paddingVertical: 12,
      borderRadius: 20,
    },
    deliveredCompleteText: {
      color: '#10B981',
      fontSize: 14,
      fontWeight: '700',
    },
  });
