import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import {
  RestaurantIcon,
  LocationPinIcon,
  PhoneCallIcon,
  MapNavigationIcon,
  CashMoneyIcon,
  CardPaymentIcon,
  CheckCircleIcon,
  DeliveryBikeIcon,
} from '../icons/DeliveryIcons';
import { VegIcon, NonVegIcon } from '../icons/ShopkeeperIcons';

export interface OrderFoodItem {
  name: string;
  quantity: number;
  price?: number;
  image?: string;
  category?: string;
  isVeg?: boolean;
}

export interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  address: string;
  restaurant: string;
  restaurantAddress?: string;
  status: 'PendingPayment' | 'Placed' | 'Accepted' | 'Preparing' | 'ReadyForPickup' | 'OutForDelivery' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  totalAmount: number;
  items: OrderFoodItem[];
  isAssignedToMe: boolean;
  createdAt?: string;
  updatedAt?: string;
}

import { ChatBubbleIcon } from '../icons';

interface DeliveryCardProps {
  item: DeliveryOrder;
  isAvailableTab: boolean;
  isActiveTab: boolean;
  isHistoryTab: boolean;
  onPress?: (order: DeliveryOrder) => void;
  onClaimPress: (orderId: string) => void;
  onDeliveredPress: (order: DeliveryOrder) => void;
  onCallPress: (phone?: string) => void;
  onNavigatePress: (address: string) => void;
  onChatPress?: (order: DeliveryOrder) => void;
}

export default function DeliveryCard({
  item,
  isAvailableTab,
  isActiveTab,
  isHistoryTab,
  onPress,
  onClaimPress,
  onDeliveredPress,
  onCallPress,
  onNavigatePress,
  onChatPress,
}: DeliveryCardProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const [isExpanded, setIsExpanded] = useState(false);

  const isCOD = item.paymentStatus === 'Pending';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ReadyForPickup':
        return { label: 'Ready for Pickup', bg: '#10B981', color: '#FFFFFF' };
      case 'OutForDelivery':
        return { label: 'In Transit', bg: '#3B82F6', color: '#FFFFFF' };
      case 'Delivered':
        return { label: 'Delivered', bg: '#6B7280', color: '#FFFFFF' };
      case 'Accepted':
      case 'Preparing':
        return { label: 'Kitchen Preparing', bg: '#F59E0B', color: '#FFFFFF' };
      default:
        return { label: status, bg: colors.primary, color: '#FFFFFF' };
    }
  };

  const badge = getStatusBadge(item.status);

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.92}
      onPress={() => onPress && onPress(item)}
    >
      {/* Top Header: Order ID & Live Status Badge */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderIdText}>Order #{item.id.slice(-6).toUpperCase()}</Text>
          {item.createdAt && (
            <Text style={styles.orderTimeText}>
              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      {/* Restaurant Pickup & Customer Destination */}
      <View style={styles.routeSection}>
        {/* Restaurant */}
        <View style={styles.routeRow}>
          <View style={styles.iconWrapper}>
            <RestaurantIcon size={18} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationTitle}>{item.restaurant}</Text>
            <Text style={styles.locationSub}>{item.restaurantAddress || 'Restaurant Kitchen'}</Text>
          </View>
        </View>

        {/* Route Connecting Line */}
        <View style={styles.routeLineContainer}>
          <View style={styles.routeDottedLine} />
        </View>

        {/* Customer Address */}
        <View style={styles.routeRow}>
          <View style={styles.iconWrapper}>
            <LocationPinIcon size={18} color="#EF4444" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationTitle}>{item.customerName}</Text>
            <Text style={styles.locationSub}>{item.address}</Text>
          </View>
        </View>
      </View>

      {/* Payment Method & Cash Alert Badge */}
      <View style={[styles.paymentBanner, isCOD ? styles.paymentBannerCOD : styles.paymentBannerPaid]}>
        {isCOD ? (
          <CashMoneyIcon size={16} color="#E11D48" />
        ) : (
          <CardPaymentIcon size={16} color="#15803D" />
        )}
        <Text style={isCOD ? styles.paymentTextCOD : styles.paymentTextPaid}>
          {isCOD
            ? `Collect Cash on Delivery: ₹${item.totalAmount}`
            : `Prepaid Online: ₹${item.totalAmount}`}
        </Text>
      </View>

      {/* Expandable Order Items List */}
      <TouchableOpacity
        style={styles.itemsToggleRow}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.itemsToggleText}>
          {item.items.length} Food Item{item.items.length > 1 ? 's' : ''}{' '}
          {isExpanded ? '(Hide Details)' : '(Verify Items)'}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.itemsListContainer}>
          {item.items.map((food, idx) => (
            <View key={idx} style={styles.itemRow}>
              {food.image ? (
                <Image source={{ uri: food.image }} style={styles.foodThumb} />
              ) : (
                <View style={styles.foodThumbPlaceholder}>
                  <RestaurantIcon size={14} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.vegIconContainer}>
                {food.isVeg !== false ? <VegIcon size={12} /> : <NonVegIcon size={12} />}
              </View>
              <View style={styles.foodDetails}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {food.name}
                </Text>
                {food.category ? (
                  <Text style={styles.itemCategory}>{food.category}</Text>
                ) : null}
              </View>
              <Text style={styles.itemQuantity}>{food.quantity}x</Text>
              {food.price ? (
                <Text style={styles.itemPrice}>₹{food.price * food.quantity}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {/* Card Action Buttons Bar */}
      <View style={styles.cardActionsBar}>
        {/* Quick Call Button */}
        {item.customerPhone ? (
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => onCallPress(item.customerPhone)}
            activeOpacity={0.8}
          >
            <PhoneCallIcon size={15} color="#10B981" />
            <Text style={styles.quickActionBtnText}>Call</Text>
          </TouchableOpacity>
        ) : null}

        {/* Quick Map Navigation Button */}
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => onNavigatePress(item.address)}
          activeOpacity={0.8}
        >
          <MapNavigationIcon size={15} color="#3B82F6" />
          <Text style={styles.quickActionBtnText}>Maps</Text>
        </TouchableOpacity>

        {/* Quick Chat Button */}
        {onChatPress ? (
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => onChatPress(item)}
            activeOpacity={0.8}
          >
            <ChatBubbleIcon size={14} color="#3B82F6" />
            <Text style={styles.quickActionBtnText}>Chat</Text>
          </TouchableOpacity>
        ) : null}

        {/* Primary State Transition Button */}
        {isAvailableTab && (
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
            onPress={() => onClaimPress(item.id)}
            activeOpacity={0.85}
          >
            <DeliveryBikeIcon size={16} color="#FFFFFF" />
            <Text style={styles.primaryActionBtnText}>Claim Delivery</Text>
          </TouchableOpacity>
        )}

        {isActiveTab && (
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: '#10B981' }]}
            onPress={() => onDeliveredPress(item)}
            activeOpacity={0.85}
          >
            <CheckCircleIcon size={16} color="#FFFFFF" />
            <Text style={styles.primaryActionBtnText}>Mark Delivered</Text>
          </TouchableOpacity>
        )}

        {isHistoryTab && (
          <View style={styles.completedTag}>
            <CheckCircleIcon size={14} color="#4B5563" />
            <Text style={styles.completedTagText}>Delivered</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    cardContainer: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    orderIdText: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    orderTimeText: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    routeSection: {
      backgroundColor: colors.background,
      borderRadius: 14,
      padding: 12,
      marginBottom: 10,
    },
    routeRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconWrapper: {
      width: 28,
      alignItems: 'center',
      marginTop: 2,
      marginRight: 6,
    },
    locationTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    locationSub: {
      fontSize: 12.5,
      color: colors.textMuted,
      marginTop: 2,
      lineHeight: 18,
    },
    routeLineContainer: {
      paddingLeft: 12,
      marginVertical: 4,
    },
    routeDottedLine: {
      width: 2,
      height: 14,
      backgroundColor: colors.border,
      borderRadius: 1,
    },
    paymentBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      marginBottom: 8,
    },
    paymentBannerCOD: {
      backgroundColor: '#FFE4E6',
      borderWidth: 1,
      borderColor: '#FDA4AF',
    },
    paymentBannerPaid: {
      backgroundColor: '#DCFCE7',
      borderWidth: 1,
      borderColor: '#86EFAC',
    },
    paymentTextCOD: {
      color: '#E11D48',
      fontWeight: '800',
      fontSize: 12.5,
    },
    paymentTextPaid: {
      color: '#15803D',
      fontWeight: '700',
      fontSize: 12.5,
    },
    itemsToggleRow: {
      paddingVertical: 6,
      alignItems: 'center',
      marginBottom: 4,
    },
    itemsToggleText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    itemsListContainer: {
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 10,
      marginBottom: 10,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
      paddingVertical: 2,
    },
    foodThumb: {
      width: 38,
      height: 38,
      borderRadius: 8,
      backgroundColor: colors.inputBackground,
      marginRight: 8,
    },
    foodThumbPlaceholder: {
      width: 38,
      height: 38,
      borderRadius: 8,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    vegIconContainer: {
      marginRight: 6,
    },
    foodDetails: {
      flex: 1,
      paddingRight: 6,
    },
    itemName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    itemCategory: {
      fontSize: 10.5,
      color: colors.textMuted,
      marginTop: 1,
    },
    itemQuantity: {
      fontSize: 12.5,
      fontWeight: '800',
      color: colors.primary,
      marginRight: 6,
    },
    itemPrice: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.text,
    },
    cardActionsBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 6,
    },
    quickActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 9,
      paddingHorizontal: 12,
      borderRadius: 18,
    },
    quickActionBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
    },
    primaryActionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 2,
    },
    primaryActionBtnText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 13,
    },
    completedTag: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: '#E5E7EB',
      paddingVertical: 10,
      borderRadius: 18,
    },
    completedTagText: {
      color: '#4B5563',
      fontWeight: '700',
      fontSize: 13,
    },
  });
