import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
import { authFetch } from '../../utils/authFetch';
import { API_URL } from '../../config/api';
import { Icons } from '../../constants/icons';
import { CookingPanIcon } from '../../components/icons/ShopkeeperIcons';
import { DeliveryBikeIcon, PhoneCallIcon, CheckCircleIcon, WarningTriangleIcon } from '../../components/icons/DeliveryIcons';

type OrderDetailsNavProp = NativeStackNavigationProp<RootStackParamList, 'ShopkeeperOrderDetails'>;
type OrderDetailsRouteProp = RouteProp<RootStackParamList, 'ShopkeeperOrderDetails'>;

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
      if (res.ok) {
        navigation.goBack();
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setUpdating(false);
    }
  };

  const handleCallCustomer = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#1E1B18' }]} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#1E1B18" />
        <View style={styles.centerBox}>
          <ActivityIndicator color="#FFC72C" size="large" />
          <Text style={styles.loadingText}>Loading Order Details...</Text>
        </View>
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
        return { label: 'In-Transit with Delivery Hero', color: '#7C3AED', bg: 'rgba(139, 92, 246, 0.15)' };
      case 'Delivered':
        return { label: 'Delivered & Completed', color: '#059669', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'Cancelled':
        return { label: 'Order Cancelled', color: '#DC2626', bg: 'rgba(239, 68, 68, 0.15)' };
      default:
        return { label: order.status, color: colors.textMuted, bg: colors.border };
    }
  };

  const statusBadge = getStatusDisplay();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#1E1B18' }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B18" />

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
          <Text style={styles.headerTitle}>
            #{order.id?.slice(-6).toUpperCase() || order._id?.slice(-6).toUpperCase()}
          </Text>
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
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: statusBadge.bg }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusCardLabel}>Current Kitchen Status</Text>
            <Text style={[styles.statusCardValue, { color: statusBadge.color }]}>
              {statusBadge.label}
            </Text>
          </View>
          <Text style={styles.orderPlacedTime}>{formattedDate}</Text>
        </View>

        {/* Customer Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Customer Details</Text>
            {order.user?.phone && (
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleCallCustomer(order.user?.phone)}
                activeOpacity={0.8}
              >
                <PhoneCallIcon size={14} color="#10B981" />
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.customerName}>{order.user?.name || 'Customer'}</Text>
          {order.deliveryAddress && (
            <Text style={styles.addressText}>
              {typeof order.deliveryAddress === 'string'
                ? order.deliveryAddress
                : `${order.deliveryAddress.addressLine1 || order.deliveryAddress.address || ''}, ${
                    order.deliveryAddress.city || ''
                  }`}
            </Text>
          )}
        </View>

        {/* Delivery Hero Info if Assigned */}
        {order.deliveryMan && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <DeliveryBikeIcon size={18} color="#7C3AED" />
                <Text style={styles.cardTitle}>Assigned Delivery Hero</Text>
              </View>
              {order.deliveryMan?.phone && (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCallCustomer(order.deliveryMan?.phone)}
                  activeOpacity={0.8}
                >
                  <PhoneCallIcon size={14} color="#10B981" />
                  <Text style={styles.callBtnText}>Call Hero</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.customerName}>{order.deliveryMan?.name || 'Delivery Partner'}</Text>
          </View>
        )}

        {/* Food Items Ordered */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items & Bill</Text>
          {order.items?.map((item: any, index: number) => {
            const itemName = item.menuItem?.name || item.name || 'Food Item';
            const itemPrice = Number(item.price || item.menuItem?.price || 0);
            const quantity = item.quantity || 1;
            return (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemQtyBadge}>
                  <Text style={styles.itemQtyText}>{quantity}x</Text>
                </View>
                <Text style={styles.itemName}>{itemName}</Text>
                <Text style={styles.itemPrice}>₹{(itemPrice * quantity).toFixed(2)}</Text>
              </View>
            );
          })}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{Number(order.totalAmount || 0).toFixed(2)}</Text>
          </View>
          <Text style={styles.paymentMethod}>
            Payment: <Text style={{ fontWeight: '800' }}>{order.paymentStatus || 'Paid'}</Text>
          </Text>
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
                Food is ready. Waiting for delivery partner to pickup and deliver to customer.
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
    loadingText: {
      color: '#FFC72C',
      fontWeight: '700',
      marginTop: 12,
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
    statusCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderRadius: 18,
      marginBottom: 14,
    },
    statusCardLabel: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    statusCardValue: {
      fontSize: 16,
      fontWeight: '900',
      marginTop: 2,
    },
    orderPlacedTime: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
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
    addressText: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      gap: 10,
    },
    itemQtyBadge: {
      backgroundColor: 'rgba(255, 199, 44, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
    },
    itemQtyText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#B45309',
    },
    itemName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    itemPrice: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
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
    paymentMethod: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 6,
    },
    actionSection: {
      marginTop: 6,
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
