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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { authFetch } from '../../utils/authFetch';
import { API_URL } from '../../config/api';
import { Icons } from '../../constants/icons';
import CustomAlert from '../../components/CustomAlert';
import OrderDetailsSkeleton from '../../components/skeleton/OrderDetailsSkeleton';
import { CookingPanIcon, VegIcon, NonVegIcon } from '../../components/icons/ShopkeeperIcons';
import {
  DeliveryBikeIcon,
  PhoneCallIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from '../../components/icons/DeliveryIcons';
import { ChatBubbleIcon } from '../../components/icons';

type OrderDetailsNavProp = NativeStackNavigationProp<RootStackParamList, 'ShopkeeperOrderDetails'>;
type OrderDetailsRouteProp = RouteProp<RootStackParamList, 'ShopkeeperOrderDetails'>;

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2424&auto=format&fit=crop';

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

export default function ShopkeeperOrderDetailsScreen() {
  const navigation = useNavigation<OrderDetailsNavProp>();
  const route = useRoute<OrderDetailsRouteProp>();
  const { orderId } = route.params;

  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Alert Modal
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const fetchOrderDetails = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await authFetch(`${API_URL}/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        const allRes = await authFetch(`${API_URL}/orders`);
        if (allRes.ok) {
          const allData = await allRes.json();
          const found = allData.find((o: any) => o.id === orderId || o._id === orderId);
          setOrder(found);
        }
      }
    } catch (e) {
      console.error('Fetch order detail error:', e);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const onRefresh = useCallback(() => {
    fetchOrderDetails(true);
  }, [orderId]);

  const updateOrderStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await authFetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert('Update Failed', data.message || 'Unable to update order status');
        return;
      }

      setOrder((prev: any) => ({ ...prev, status: newStatus }));

      if (newStatus === 'Accepted') {
        showAlert('Order Accepted', 'Food moved to cooking queue in your kitchen.');
      } else if (newStatus === 'ReadyForPickup') {
        showAlert('Food Ready', 'Delivery partner has been notified for pickup from counter.');
      } else if (newStatus === 'Cancelled') {
        showAlert('Order Declined', 'The order has been cancelled.');
        setTimeout(() => {
          navigation.goBack();
        }, 1200);
      }
    } catch (e: any) {
      console.error('Failed to update status:', e);
      showAlert('Network Error', e.message || 'Please check your internet connection.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCallCustomer = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleChatWithCustomer = () => {
    if (!order) return;
    const custId = order.user?._id || order.user?.id || order.user;
    navigation.navigate('Chat', {
      orderId,
      orderNumber: orderId.slice(-6).toUpperCase(),
      recipientId: custId ? custId.toString() : undefined,
      recipientName: order.user?.name || 'Customer',
      recipientRole: 'customer',
    });
  };

  const handleChatWithDriver = () => {
    if (!order?.deliveryMan) return;
    const driverId = order.deliveryMan._id || order.deliveryMan.id || order.deliveryMan;
    navigation.navigate('Chat', {
      orderId,
      orderNumber: orderId.slice(-6).toUpperCase(),
      recipientId: driverId ? driverId.toString() : undefined,
      recipientName: order.deliveryMan.name || 'Delivery Hero',
      recipientRole: 'delivery_man',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#1E1B18' }]} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#1E1B18" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => navigation.goBack()}
          >
            <Image source={Icons.back} style={styles.backIcon} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerSub}>Order Details</Text>
            <Text style={styles.headerTitle}>Loading...</Text>
          </View>
          <View style={styles.rightPlaceholder} />
        </View>
        <OrderDetailsSkeleton />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#1E1B18' }]} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#1E1B18" />
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>Order not found.</Text>
          <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.goBackBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusDisplay = () => {
    switch (order.status) {
      case 'Placed':
        return { label: 'New Order Placed', color: '#E85D22', bg: 'rgba(232, 93, 34, 0.15)' };
      case 'Accepted':
      case 'Preparing':
        return { label: 'Cooking in Kitchen', color: '#D97706', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'ReadyForPickup':
        return { label: 'Ready for Hero Pickup', color: '#2563EB', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'OutForDelivery':
        return { label: 'In-Transit with Hero', color: '#7C3AED', bg: 'rgba(139, 92, 246, 0.15)' };
      case 'Delivered':
        return { label: 'Delivered & Completed', color: '#059669', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'Cancelled':
        return { label: 'Order Cancelled', color: '#DC2626', bg: 'rgba(239, 68, 68, 0.15)' };
      default:
        return { label: order.status, color: colors.textMuted, bg: colors.border };
    }
  };

  const statusBadge = getStatusDisplay();

  const customerPhone =
    order.user?.phone ||
    (typeof order.deliveryAddress === 'object'
      ? order.deliveryAddress?.phone || order.deliveryAddress?.contactNumber
      : '') ||
    '';

  const currentStepIdx = getStatusIndex(order.status);
  const items = order.items || [];
  const subtotal = items.reduce(
    (sum: number, it: any) =>
      sum + Number(it.menuItem?.price || it.price || 0) * Number(it.quantity || 1),
    0
  );
  const packagingFee = 10;
  const taxes = Number((subtotal * 0.05).toFixed(2));
  const grandTotal = Number(order.totalAmount || subtotal + packagingFee + taxes);
  const totalItemCount = items.reduce((sum: number, it: any) => sum + Number(it.quantity || 1), 0);
  const orderDisplayId = order.id?.slice(-6).toUpperCase() || order._id?.slice(-6).toUpperCase() || '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#1E1B18' }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B18" />

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
          <Text style={styles.headerSub}>Order Details</Text>
          <Text style={styles.headerTitle}>#{orderDisplayId}</Text>
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
        {/* Order Status & Progress Stepper Card */}
        <View style={styles.card}>
          <View style={styles.statusHeaderRow}>
            <View>
              <Text style={styles.orderIdTitle}>Order #{orderDisplayId}</Text>
              <Text style={styles.orderDateText}>{formattedDate}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
                {statusBadge.label}
              </Text>
            </View>
          </View>

          {/* Stepper for Order Status Flow */}
          {order.status !== 'Cancelled' ? (
            <View style={styles.timelineWrapper}>
              <View style={styles.timelineBarBg}>
                <View
                  style={[
                    styles.timelineBarFill,
                    {
                      width: `${Math.min(100, Math.max(0, (currentStepIdx / 4) * 100))}%` as any,
                      backgroundColor: order.status === 'Delivered' ? '#10B981' : colors.primary,
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
          ) : (
            <View style={styles.cancelledAlertBox}>
              <Text style={styles.cancelledAlertText}>
                This order was declined or cancelled.
              </Text>
            </View>
          )}
        </View>

        {/* Food Items Ordered with Product Image */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Items Ordered ({items.length})</Text>
            <View style={styles.itemCountPill}>
              <Text style={styles.itemCountPillText}>{totalItemCount} total qty</Text>
            </View>
          </View>

          {items.map((item: any, index: number) => {
            const m = item.menuItem || item;
            const itemName = m?.name || item.name || 'Food Item';
            const itemPrice = Number(m?.price || item.price || 0);
            const quantity = Number(item.quantity || 1);
            const imgUri = m?.image || item.image || FALLBACK_IMAGE;
            const category = m?.category || item.category || '';
            const description = m?.description || item.description || '';
            const isVeg =
              m?.isVeg !== undefined
                ? m.isVeg
                : !(itemName || '').match(/chicken|meat|fish|mutton|beef|prawn|egg|bacon|ham/i);

            return (
              <View key={index}>
                <View style={styles.itemCardRow}>
                  {/* Product Image Thumbnail */}
                  <Image
                    source={{ uri: imgUri }}
                    style={styles.productThumbnail}
                    resizeMode="cover"
                  />

                  {/* Product Information */}
                  <View style={styles.productInfoCol}>
                    <View style={styles.productTitleRow}>
                      {isVeg ? <VegIcon size={14} /> : <NonVegIcon size={14} />}
                      <Text style={styles.productTitleText} numberOfLines={2}>
                        {itemName}
                      </Text>
                    </View>

                    {category ? (
                      <Text style={styles.productCategoryText}>{category}</Text>
                    ) : null}

                    {description ? (
                      <Text style={styles.productDescText} numberOfLines={1}>
                        {description}
                      </Text>
                    ) : null}

                    <View style={styles.productPricingRow}>
                      <View style={styles.qtyPill}>
                        <Text style={styles.qtyPillText}>{quantity}x</Text>
                      </View>
                      <Text style={styles.unitPriceText}>
                        ₹{itemPrice.toFixed(0)} each
                      </Text>
                    </View>
                  </View>

                  {/* Total for this line item */}
                  <Text style={styles.itemLineTotal}>
                    ₹{(itemPrice * quantity).toFixed(2)}
                  </Text>
                </View>

                {index < items.length - 1 && <View style={styles.itemDivider} />}
              </View>
            );
          })}
        </View>

        {/* Customer & Delivery Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Customer & Delivery Address</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: 'rgba(37, 99, 235, 0.15)', borderColor: '#3B82F6' }]}
                onPress={handleChatWithCustomer}
                activeOpacity={0.8}
              >
                <ChatBubbleIcon size={13} color="#3B82F6" />
                <Text style={[styles.callBtnText, { color: '#3B82F6' }]}>Chat</Text>
              </TouchableOpacity>
              {customerPhone ? (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCallCustomer(customerPhone)}
                  activeOpacity={0.8}
                >
                  <PhoneCallIcon size={14} color="#10B981" />
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <Text style={styles.customerName}>{order.user?.name || 'Customer'}</Text>
          {customerPhone ? (
            <Text style={styles.phoneSubText}>Phone: {customerPhone}</Text>
          ) : null}

          {order.deliveryAddress && (
            <View style={styles.addressRow}>
              <Image source={Icons.location} style={styles.locationIcon} />
              <Text style={styles.addressText}>
                {typeof order.deliveryAddress === 'string'
                  ? order.deliveryAddress
                  : `${order.deliveryAddress.addressLine1 || order.deliveryAddress.address || ''}, ${
                      order.deliveryAddress.city || ''
                    }`}
              </Text>
            </View>
          )}
        </View>

        {/* Assigned Delivery Hero Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <DeliveryBikeIcon size={18} color="#7C3AED" />
              <Text style={styles.cardTitle}>Delivery Hero</Text>
            </View>
            {order.deliveryMan ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TouchableOpacity
                  style={[styles.callBtn, { backgroundColor: 'rgba(124, 58, 237, 0.15)', borderColor: '#7C3AED' }]}
                  onPress={handleChatWithDriver}
                  activeOpacity={0.8}
                >
                  <ChatBubbleIcon size={13} color="#7C3AED" />
                  <Text style={[styles.callBtnText, { color: '#7C3AED' }]}>Chat Hero</Text>
                </TouchableOpacity>
                {order.deliveryMan?.phone ? (
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCallCustomer(order.deliveryMan?.phone)}
                    activeOpacity={0.8}
                  >
                    <PhoneCallIcon size={14} color="#10B981" />
                    <Text style={styles.callBtnText}>Call</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>

          {order.deliveryMan ? (
            <View>
              <Text style={styles.customerName}>{order.deliveryMan.name || 'Delivery Partner'}</Text>
              {order.deliveryMan.phone ? (
                <Text style={styles.phoneSubText}>Phone: {order.deliveryMan.phone}</Text>
              ) : null}
              {order.deliveryMan.vehicleNumber ? (
                <Text style={styles.vehicleText}>
                  Vehicle: {order.deliveryMan.vehicleNumber} ({order.deliveryMan.vehicleType || 'Bike'})
                </Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.driverUnassignedText}>
              Delivery partner will be assigned automatically upon kitchen preparation.
            </Text>
          )}
        </View>

        {/* Secure Handover Verification PIN notice */}
        <View style={styles.securityCard}>
          <ShieldCheckIcon size={22} color="#10B981" />
          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>Secure Delivery PIN Protection</Text>
            <Text style={styles.securityDesc}>
              Customer holds a secure 4-digit PIN on their screen. Delivery partner verifies this PIN at doorstep to mark delivery complete.
            </Text>
          </View>
        </View>

        {/* Bill Breakdown Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill Breakdown</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Subtotal</Text>
            <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Kitchen Packaging & Handling</Text>
            <Text style={styles.billValue}>₹{packagingFee.toFixed(2)}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes & GST (5%)</Text>
            <Text style={styles.billValue}>₹{taxes.toFixed(2)}</Text>
          </View>

          <View style={styles.billDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{grandTotal.toFixed(2)}</Text>
          </View>

          <View style={styles.paymentMethodBanner}>
            <Text style={styles.paymentMethodText}>
              Payment Status:{' '}
              <Text style={{ fontWeight: '900', color: colors.primary }}>
                {order.paymentStatus === 'Paid' ? 'PAID ONLINE (UPI / CARD)' : order.paymentStatus || 'CASH ON DELIVERY'}
              </Text>
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {order.status === 'Placed' && (
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => updateOrderStatus('Cancelled')}
                disabled={updating}
                activeOpacity={0.8}
              >
                <Text style={styles.rejectBtnText}>Decline Order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
                onPress={() => updateOrderStatus('Accepted')}
                disabled={updating}
                activeOpacity={0.85}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <CookingPanIcon size={18} color="#FFFFFF" />
                    <Text style={styles.acceptBtnText}>Accept & Cook</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {(order.status === 'Accepted' || order.status === 'Preparing') && (
            <TouchableOpacity
              style={styles.readyBtn}
              onPress={() => updateOrderStatus('ReadyForPickup')}
              disabled={updating}
              activeOpacity={0.85}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#FFC72C" />
              ) : (
                <>
                  <CheckCircleIcon size={20} color="#FFC72C" />
                  <Text style={styles.readyBtnText}>Mark Food as Ready for Pickup</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {order.status === 'ReadyForPickup' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                Food is packed and ready. Waiting for delivery partner arrival.
              </Text>
            </View>
          )}

          {order.status === 'OutForDelivery' && (
            <View style={[styles.infoBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Text style={[styles.infoBoxText, { color: '#7C3AED' }]}>
                Order picked up and currently in transit with the delivery hero.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1E1B18', // Deep Charcoal
    },
    centerBox: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 16,
    },
    goBackBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
    },
    goBackBtnText: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 8 : 12,
      paddingBottom: 16,
      backgroundColor: '#1E1B18',
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      tintColor: '#FFC72C',
    },
    headerTitleBox: {
      alignItems: 'center',
    },
    headerSub: {
      fontSize: 11,
      color: '#FFC72C',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: '#FFFFFF',
    },
    rightPlaceholder: {
      width: 38,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    statusHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    orderIdTitle: {
      fontSize: 16,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 2,
    },
    orderDateText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
    },
    statusBadge: {
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
      backgroundColor: colors.border,
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
      width: 58,
    },
    nodeCircle: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    nodeCirclePassed: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    nodeCircleCurrent: {
      backgroundColor: '#FFC72C',
      borderColor: '#1E1B18',
    },
    nodeCheckText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '900',
      lineHeight: 12,
    },
    nodeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
    },
    nodeLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textMuted,
      textAlign: 'center',
    },
    nodeLabelPassed: {
      color: colors.text,
      fontWeight: '700',
    },
    nodeLabelCurrent: {
      color: colors.primary,
      fontWeight: '900',
    },
    cancelledAlertBox: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: 12,
      padding: 10,
      marginTop: 8,
    },
    cancelledAlertText: {
      fontSize: 12,
      color: '#DC2626',
      fontWeight: '700',
      textAlign: 'center',
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },
    itemCountPill: {
      backgroundColor: 'rgba(255, 199, 44, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    itemCountPillText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#B45309',
    },
    itemCardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
    },
    productThumbnail: {
      width: 56,
      height: 56,
      borderRadius: 14,
      backgroundColor: colors.background,
      marginRight: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    productInfoCol: {
      flex: 1,
      marginRight: 10,
    },
    productTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 3,
    },
    productTitleText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    productCategoryText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '600',
      marginBottom: 3,
    },
    productDescText: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: 3,
    },
    productPricingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    qtyPill: {
      backgroundColor: 'rgba(255, 199, 44, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    qtyPillText: {
      fontSize: 11,
      fontWeight: '900',
      color: '#B45309',
    },
    unitPriceText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
    },
    itemLineTotal: {
      fontSize: 15,
      fontWeight: '900',
      color: colors.text,
    },
    itemDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    callBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    callBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#10B981',
    },
    customerName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    phoneSubText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: 3,
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      marginTop: 4,
    },
    locationIcon: {
      width: 15,
      height: 15,
      resizeMode: 'contain',
      tintColor: colors.primary,
      marginTop: 2,
    },
    addressText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
      flex: 1,
      fontWeight: '500',
    },
    vehicleText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#7C3AED',
      marginTop: 2,
    },
    driverUnassignedText: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    securityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: 'rgba(16, 185, 129, 0.08)',
      borderRadius: 16,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    securityTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: '#059669',
      marginBottom: 2,
    },
    securityDesc: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 16,
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
    billDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 10,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },
    totalValue: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.primary,
    },
    paymentMethodBanner: {
      backgroundColor: 'rgba(255, 199, 44, 0.12)',
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 10,
      marginTop: 12,
    },
    paymentMethodText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    actionSection: {
      marginTop: 4,
    },
    buttonGroup: {
      flexDirection: 'row',
      gap: 10,
    },
    rejectBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: '#EF4444',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rejectBtnText: {
      color: '#EF4444',
      fontWeight: '800',
      fontSize: 14,
    },
    acceptBtn: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 20,
      gap: 8,
    },
    acceptBtnText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 14,
    },
    readyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1E1B18',
      paddingVertical: 15,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: '#FFC72C',
      gap: 10,
    },
    readyBtnText: {
      color: '#FFC72C',
      fontWeight: '800',
      fontSize: 15,
    },
    infoBox: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      padding: 14,
      borderRadius: 16,
      alignItems: 'center',
    },
    infoBoxText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#2563EB',
      textAlign: 'center',
      lineHeight: 18,
    },
  });
