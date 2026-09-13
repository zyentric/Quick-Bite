import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, CustomerOrderSummary, RawOrderItem } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { useCart } from '../../../context/CartContext';
import { authFetch } from '../../../utils/authFetch';
import { API_URL } from '../../../config/api';
import {
  FastDeliveryIcon,
  CheckCircleIcon,
  CancelCircleIcon,
  ClockIcon,
  LocationPinIcon,
  CreditCardIcon,
  StarIcon,
  DeliveryBikeIcon,
  ChatBubbleIcon,
  PhoneCallIcon,
} from '../../../components/icons';
import AppFooter from '../../../components/common/AppFooter';
import Icons from '../../../constants/icons';
import OrderDetailsSkeleton from '../../../components/skeleton/OrderDetailsSkeleton';

type OrderDetailsNavProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetails'>;
type OrderDetailsRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2424&auto=format&fit=crop';

const STATUS_STEPS = [
  { key: 'Placed', label: 'Order Placed' },
  { key: 'Preparing', label: 'Preparing Food' },
  { key: 'ReadyForPickup', label: 'Ready for Pickup' },
  { key: 'OutForDelivery', label: 'Out for Delivery' },
  { key: 'Delivered', label: 'Delivered' },
];

const getStatusIndex = (status: string) => {
  switch (status) {
    case 'PendingPayment':
    case 'Placed':
    case 'Accepted':
      return 0;
    case 'Preparing':
      return 1;
    case 'ReadyForPickup':
      return 2;
    case 'OutForDelivery':
      return 3;
    case 'Delivered':
      return 4;
    case 'Cancelled':
      return -1;
    default:
      return 0;
  }
};

const getStatusTheme = (status: string) => {
  switch (status) {
    case 'Preparing':
      return { label: 'Preparing Food', bg: '#FEF3C7', text: '#D97706', Icon: ClockIcon };
    case 'OutForDelivery':
      return { label: 'Out for Delivery', bg: '#FFF4EB', text: '#E85D22', Icon: FastDeliveryIcon };
    case 'ReadyForPickup':
      return { label: 'Ready for Pickup', bg: '#F3E8FF', text: '#7E22CE', Icon: ClockIcon };
    case 'Accepted':
    case 'Placed':
      return { label: 'Order Confirmed', bg: '#EFF6FF', text: '#2563EB', Icon: ClockIcon };
    case 'Delivered':
      return { label: 'Delivered Successfully', bg: '#ECFDF5', text: '#059669', Icon: CheckCircleIcon };
    case 'Cancelled':
      return { label: 'Order Cancelled', bg: '#FEE2E2', text: '#DC2626', Icon: CancelCircleIcon };
    default:
      return { label: status, bg: '#F3F4F6', text: '#4B5563', Icon: ClockIcon };
  }
};

export default function OrderDetailsScreen() {
  const navigation = useNavigation<OrderDetailsNavProp>();
  const route = useRoute<OrderDetailsRouteProp>();
  const { orderId, initialOrder } = route.params || {};

  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { addToCart } = useCart();

  const [order, setOrder] = useState<CustomerOrderSummary | null>(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!orderId) return;
      try {
        const res = await authFetch(`${API_URL}/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (e) {
        console.error('Failed to load order details:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [orderId]);

  if (loading && !order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBackground} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={require('../../../assets/back.png')} style={styles.backIconImg} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <OrderDetailsSkeleton />
      </SafeAreaView>
    );
  }

  const items: RawOrderItem[] = order?.items || order?.rawItems || [];
  const status = order?.status || 'Placed';
  const statusTheme = getStatusTheme(status);
  const StatusIcon = statusTheme.Icon;
  const currentStepIdx = getStatusIndex(status);

  const orderNum = order?.id || order?._id || orderId || '';
  const orderDisplayId = `#QB-${orderNum.slice(-6).toUpperCase() || '102938'}`;

  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : order?.date || 'Recent Order';

  const subtotal = items.reduce(
    (sum: number, i: RawOrderItem) => sum + (i.menuItem?.price || i.price || 0) * (i.quantity || 1),
    0
  );
  const deliveryFee = order?.totalAmount && subtotal ? Math.max(0, order.totalAmount - subtotal - 5) : 25;
  const grandTotal = order?.totalAmount || order?.price || subtotal + deliveryFee + 5;

  const deliveryAddress =
    order?.deliveryAddress?.address ||
    order?.deliveryAddress?.addressLine1 ||
    order?.deliveryAddress?.label ||
    'Registered Delivery Address';

  const handleReorder = () => {
    if (items.length > 0) {
      items.forEach((item: RawOrderItem) => {
        const m = item.menuItem || (item as any);
        addToCart({
          id: m?.id || m?._id || 'item',
          name: m?.name || 'Delicious Dish',
          price: m?.price || 150,
          description: m?.description || '',
          image: m?.image || FALLBACK_IMAGE,
          rating: m?.rating || 4.8,
          category: m?.category || 'Special',
        });
      });
    }
    navigation.navigate('Cart');
  };

  const isActive = ['PendingPayment', 'Placed', 'Accepted', 'Preparing', 'ReadyForPickup', 'OutForDelivery'].includes(status);
  const isDelivered = status === 'Delivered';
  const isCancelled = status === 'Cancelled';

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
          <Image source={require('../../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{orderDisplayId}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Order Summary Status Hero Card */}
          <View style={styles.heroStatusCard}>
            <View style={styles.heroStatusTop}>
              <View>
                <Text style={styles.heroOrderId}>{orderDisplayId}</Text>
                <Text style={styles.heroOrderDate}>{orderDate}</Text>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
                <StatusIcon size={14} color={statusTheme.text} />
                <Text style={[styles.statusBadgeText, { color: statusTheme.text }]}>
                  {' '}{statusTheme.label}
                </Text>
              </View>
            </View>

            {/* Stepper (for non-cancelled orders) */}
            {!isCancelled && (
              <View style={styles.timelineWrapper}>
                <View style={styles.timelineBarBg}>
                  <View
                    style={[
                      styles.timelineBarFill,
                      {
                        width: `${Math.min(100, Math.max(0, (currentStepIdx / 4) * 100))}%` as any,
                        backgroundColor: isDelivered ? '#10B981' : colors.primary,
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
            )}

            {!isCancelled && !isDelivered && order?.deliveryPin && (
              <View style={styles.pinBanner}>
                <View style={styles.pinBannerLeft}>
                  <Text style={styles.pinBannerTitle}>Delivery Verification PIN</Text>
                  <Text style={styles.pinBannerSubtitle}>Share this 4-digit PIN with rider upon arrival</Text>
                </View>
                <View style={styles.pinBadge}>
                  <Text style={styles.pinBadgeText}>{order.deliveryPin}</Text>
                </View>
              </View>
            )}

            {isCancelled && (
              <View style={styles.cancelledAlertBox}>
                <CancelCircleIcon size={18} color="#DC2626" />
                <Text style={styles.cancelledAlertText}>
                  This order was cancelled. 100% refund has been credited to your source payment method.
                </Text>
              </View>
            )}
          </View>

          {/* Assigned Delivery Partner (if assigned) */}
          {order?.deliveryMan && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <FastDeliveryIcon size={18} color={colors.primary} />
                <Text style={styles.sectionHeading}>Assigned Delivery Partner</Text>
              </View>
              <View style={styles.riderDetailRow}>
                <View style={styles.riderAvatarMini}>
                  <DeliveryBikeIcon size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.riderDetailName}>{order.deliveryMan.name || 'Delivery Partner'}</Text>
                  <Text style={styles.riderDetailVehicle}>
                    {order.deliveryMan.vehicleNumber
                      ? `${order.deliveryMan.vehicleType || 'Vehicle'} • ${order.deliveryMan.vehicleNumber}`
                      : order.deliveryMan.vehicleType || 'Verified Partner'}
                  </Text>
                </View>
                <View style={styles.riderBtnGroup}>
                  <TouchableOpacity
                    style={styles.riderChatMiniBtn}
                    onPress={() =>
                      navigation.navigate('Chat', {
                        orderId: (order?._id || order?.id || orderId) as string,
                        recipientName: order.deliveryMan?.name || 'Delivery Partner',
                        recipientRole: 'delivery_man',
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <ChatBubbleIcon size={12} color="#FFFFFF" />
                    <Text style={styles.riderCallMiniText}>Chat</Text>
                  </TouchableOpacity>
                  {order.deliveryMan?.phone && (
                    <TouchableOpacity
                      style={styles.riderCallMiniBtn}
                      onPress={() => Linking.openURL(`tel:${order.deliveryMan?.phone}`)}
                      activeOpacity={0.8}
                    >
                      <PhoneCallIcon size={12} color="#FFFFFF" />
                      <Text style={styles.riderCallMiniText}>Call</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Restaurant / Kitchen Chat (if active) */}
          {order?.shopkeeper && isActive && (
            <View style={[styles.sectionCard, styles.kitchenChatCard]}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.kitchenChatTitle}>Questions for Restaurant?</Text>
                <Text style={styles.kitchenChatSubtitle}>Chat directly with {order.shopkeeper?.name || 'the kitchen team'}</Text>
              </View>
              <TouchableOpacity
                style={styles.kitchenChatBtn}
                onPress={() =>
                  navigation.navigate('Chat', {
                    orderId: (order?._id || order?.id || orderId) as string,
                    recipientName: order.shopkeeper?.name || 'Restaurant Kitchen',
                    recipientRole: 'shopkeeper',
                  })
                }
                activeOpacity={0.8}
              >
                <ChatBubbleIcon size={13} color={colors.primary} />
                <Text style={styles.kitchenChatBtnText}>Chat Kitchen</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Delivery Location Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <LocationPinIcon size={18} color={colors.primary} />
              <Text style={styles.sectionHeading}>Delivery Address</Text>
            </View>
            <Text style={styles.addressText}>{deliveryAddress}</Text>
          </View>

          {/* Items Breakdown Card */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Items Ordered ({items.length})</Text>

            {items.map((item: any, idx: number) => {
              const m = item.menuItem || item;
              const imgUri = m.image || FALLBACK_IMAGE;
              const unitPrice = m.price || item.price || 0;
              const qty = item.quantity || 1;
              const itemTotal = unitPrice * qty;

              return (
                <View key={idx}>
                  <View style={styles.itemRow}>
                    <Image source={{ uri: imgUri }} style={styles.itemImage} />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {m.name || 'QuickBite Item'}
                      </Text>
                      <Text style={styles.itemQtyPrice}>
                        ₹{unitPrice.toFixed(0)} × {qty}
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>₹{itemTotal.toFixed(2)}</Text>
                  </View>
                  {idx < items.length - 1 && <View style={styles.itemDivider} />}
                </View>
              );
            })}
          </View>

          {/* Bill Summary & Payment Card */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Bill Breakdown</Text>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Total</Text>
              <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Partner Fee</Text>
              <Text style={[styles.billValue, deliveryFee === 0 && styles.freeText]}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Taxes & Restaurant Packaging</Text>
              <Text style={styles.billValue}>₹5.00</Text>
            </View>

            <View style={styles.billDivider} />

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Paid</Text>
              <Text style={styles.grandTotalValue}>₹{grandTotal.toFixed(2)}</Text>
            </View>

            <View style={styles.paymentMethodStrip}>
              <CreditCardIcon size={18} color="#2563EB" />
              <Text style={styles.paymentMethodText}>
                {order?.paymentStatus === 'Paid'
                  ? 'Paid Securely via Online Payment / UPI'
                  : 'Cash On Delivery'}
              </Text>
            </View>
          </View>

          {/* Action CTAs */}
          <View style={styles.actionsContainer}>
            {isActive && (
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() =>
                  navigation.navigate('DeliveryTime', {
                    orderId: orderId || order?.id,
                    destLat: order?.deliveryAddress?.lat,
                    destLng: order?.deliveryAddress?.lng,
                    addressLabel: order?.deliveryAddress?.label || order?.deliveryAddress?.address,
                    initialPin: order?.deliveryPin,
                  })
                }
                activeOpacity={0.88}
              >
                <FastDeliveryIcon size={18} color="#FFFFFF" />
                <Text style={styles.primaryActionBtnText}> Live Track Order on Map ➔</Text>
              </TouchableOpacity>
            )}

            {isDelivered && (
              <View style={styles.doubleBtnRow}>
                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={() =>
                    navigation.navigate('LeaveReview', {
                      orderId: orderId || order?.id,
                      orderName: items[0]?.menuItem?.name || 'Your Meal',
                      orderImage: items[0]?.menuItem?.image || FALLBACK_IMAGE,
                    })
                  }
                  activeOpacity={0.8}
                >
                  <StarIcon size={16} color={colors.primary} />
                  <Text style={styles.secondaryActionBtnText}> Rate Order</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={handleReorder}
                  activeOpacity={0.88}
                >
                  <Text style={styles.primaryActionBtnText}>↻ Order Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {isCancelled && (
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={handleReorder}
                activeOpacity={0.88}
              >
                <Text style={styles.primaryActionBtnText}>↻ Reorder Items</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* App Footer */}
          <AppFooter bottomSpacing={20} />
        </ScrollView>
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
      paddingTop: 10,
      paddingBottom: 22,
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
    headerTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: '#FFFFFF',
    },
    loadingWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '600',
    },
    contentContainer: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      overflow: 'hidden',
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 60,
    },
    heroStatusCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 22,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#F1F3F5',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    heroStatusTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    heroOrderId: {
      fontSize: 17,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 2,
    },
    heroOrderDate: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: '800',
    },
    timelineWrapper: {
      marginTop: 8,
      marginBottom: 4,
    },
    timelineBarBg: {
      height: 4,
      backgroundColor: '#E5E7EB',
      borderRadius: 2,
      marginHorizontal: 16,
      position: 'relative',
    },
    timelineBarFill: {
      height: 4,
      borderRadius: 2,
    },
    timelineNodesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: -10,
    },
    nodeItem: {
      alignItems: 'center',
      width: 60,
    },
    nodeCircle: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#E5E7EB',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    nodeCirclePassed: {
      backgroundColor: colors.primary,
    },
    nodeCircleCurrent: {
      backgroundColor: colors.primary,
      borderWidth: 3,
      borderColor: '#FFF4EB',
    },
    nodeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#9CA3AF',
    },
    nodeCheckText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '900',
    },
    nodeLabel: {
      fontSize: 9,
      color: colors.textMuted,
      textAlign: 'center',
      fontWeight: '500',
    },
    nodeLabelPassed: {
      color: colors.text,
      fontWeight: '700',
    },
    nodeLabelCurrent: {
      color: colors.primary,
      fontWeight: '800',
    },
    pinBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFF4EB',
      borderRadius: 14,
      padding: 12,
      marginTop: 14,
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.25)',
    },
    pinBannerLeft: {
      flex: 1,
      marginRight: 10,
    },
    pinBannerTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: '#E85D22',
      marginBottom: 2,
    },
    pinBannerSubtitle: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
    },
    pinBadge: {
      backgroundColor: '#E85D22',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },
    pinBadgeText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '900',
      letterSpacing: 2,
    },
    cancelledAlertBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEE2E2',
      borderRadius: 14,
      padding: 12,
      gap: 10,
      borderWidth: 1,
      borderColor: '#FECACA',
    },
    cancelledAlertText: {
      fontSize: 12,
      color: '#DC2626',
      fontWeight: '600',
      flex: 1,
      lineHeight: 16,
    },
    riderDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F9FAFB',
      borderRadius: 14,
      padding: 12,
      gap: 12,
    },
    riderAvatarMini: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#FFF4EB',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.25)',
    },
    riderDetailName: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 2,
    },
    riderDetailVehicle: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
    },
    riderBtnGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    riderChatMiniBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#2563EB',
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 12,
    },
    riderCallMiniBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 12,
    },
    riderCallMiniText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },
    kitchenChatCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFF7ED',
      borderColor: '#FED7AA',
    },
    kitchenChatTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: '#9A3412',
    },
    kitchenChatSubtitle: {
      fontSize: 11,
      color: '#C2410C',
      marginTop: 2,
    },
    kitchenChatBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: '#FFFFFF',
      borderWidth: 1.2,
      borderColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    kitchenChatBtnText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '800',
    },
    sectionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#F1F3F5',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    sectionHeading: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 12,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    addressText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
      fontWeight: '500',
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    itemImage: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: '#F3F4F6',
      marginRight: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    itemDetails: {
      flex: 1,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    itemQtyPrice: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    itemTotal: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },
    itemDivider: {
      height: 1,
      backgroundColor: '#F3F4F6',
    },
    billRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
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
    freeText: {
      color: '#10B981',
      fontWeight: '900',
    },
    billDivider: {
      height: 1,
      backgroundColor: '#E5E7EB',
      marginVertical: 10,
    },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    grandTotalLabel: {
      fontSize: 15,
      fontWeight: '900',
      color: colors.text,
    },
    grandTotalValue: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.primary,
    },
    paymentMethodStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#EFF6FF',
      borderRadius: 12,
      padding: 10,
      gap: 8,
      borderWidth: 1,
      borderColor: '#DBEAFE',
    },
    paymentMethodText: {
      fontSize: 12,
      color: '#1E40AF',
      fontWeight: '700',
    },
    actionsContainer: {
      marginTop: 6,
      marginBottom: 10,
    },
    primaryActionBtn: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    primaryActionBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '900',
    },
    doubleBtnRow: {
      flexDirection: 'row',
      gap: 12,
    },
    secondaryActionBtn: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: '#FFF4EB',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.2,
      borderColor: 'rgba(232, 93, 34, 0.3)',
    },
    secondaryActionBtnText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '800',
    },
  });
