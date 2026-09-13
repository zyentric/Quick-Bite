import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { CookingPanIcon, OrderBellIcon, VegIcon, NonVegIcon } from '../icons/ShopkeeperIcons';
import { DeliveryBikeIcon, CheckCircleIcon, WarningTriangleIcon } from '../icons/DeliveryIcons';

export interface ShopkeeperOrderItem {
  name: string;
  quantity: number;
  price: number;
  isVeg?: boolean;
  image?: string;
  category?: string;
}

export interface ShopkeeperOrder {
  id: string;
  customerName: string;
  customerPhone?: string;
  address: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  items: ShopkeeperOrderItem[];
  deliveryManName?: string;
  deliveryManPhone?: string;
  createdAt: string;
}

interface ShopkeeperCardProps {
  order: ShopkeeperOrder;
  onPress: () => void;
  onAcceptPress: (orderId: string) => void;
  onRejectPress: (orderId: string) => void;
  onMarkReadyPress: (orderId: string) => void;
}

export default function ShopkeeperCard({
  order,
  onPress,
  onAcceptPress,
  onRejectPress,
  onMarkReadyPress,
}: ShopkeeperCardProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusBadge = () => {
    switch (order.status) {
      case 'Placed':
        return { label: 'New Order', bg: 'rgba(232, 93, 34, 0.15)', color: colors.primary };
      case 'Accepted':
      case 'Preparing':
        return { label: 'Cooking in Kitchen', bg: 'rgba(245, 158, 11, 0.15)', color: '#D97706' };
      case 'ReadyForPickup':
        return { label: 'Ready for Pickup', bg: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' };
      case 'OutForDelivery':
        return { label: 'In Transit with Hero', bg: 'rgba(139, 92, 246, 0.15)', color: '#7C3AED' };
      case 'Delivered':
        return { label: 'Completed', bg: 'rgba(16, 185, 129, 0.15)', color: '#059669' };
      case 'Cancelled':
        return { label: 'Cancelled', bg: 'rgba(239, 68, 68, 0.15)', color: '#DC2626' };
      default:
        return { label: order.status, bg: colors.border, color: colors.textMuted };
    }
  };

  const badge = getStatusBadge();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Card Header: Order ID + Status Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.orderIdRow}>
          <Text style={styles.orderIdText}>
            #{order.id.slice(-6).toUpperCase()}
          </Text>
          <Text style={styles.orderTimeText}>{formattedDate}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      {/* Customer & Address Row */}
      <View style={styles.customerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.customerName}>{order.customerName}</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {order.address}
          </Text>
        </View>
        <Text style={styles.totalPrice}>₹{order.totalAmount.toFixed(2)}</Text>
      </View>

      {/* Items Summary */}
      <View style={styles.itemsBox}>
        {order.items.slice(0, 3).map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.itemThumbMini}
              />
            ) : null}
            <View style={styles.itemLeftGroup}>
              {item.isVeg !== undefined && (
                item.isVeg ? <VegIcon size={13} /> : <NonVegIcon size={13} />
              )}
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(0)}</Text>
          </View>
        ))}
        {order.items.length > 3 && (
          <Text style={styles.moreItemsText}>
            +{order.items.length - 3} more item(s)...
          </Text>
        )}
      </View>

      {/* Delivery Hero Info if Assigned */}
      {order.deliveryManName && (
        <View style={styles.driverRow}>
          <DeliveryBikeIcon size={16} color="#7C3AED" />
          <Text style={styles.driverText}>
            Hero: <Text style={{ fontWeight: '800' }}>{order.deliveryManName}</Text>
            {order.deliveryManPhone ? ` (${order.deliveryManPhone})` : ''}
          </Text>
        </View>
      )}

      {/* Action Buttons based on Status */}
      <View style={styles.actionRow}>
        {order.status === 'Placed' && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => onRejectPress(order.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.rejectBtnText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
              onPress={() => onAcceptPress(order.id)}
              activeOpacity={0.85}
            >
              <CookingPanIcon size={16} color="#FFFFFF" />
              <Text style={styles.acceptBtnText}>Accept & Cook</Text>
            </TouchableOpacity>
          </View>
        )}

        {(order.status === 'Accepted' || order.status === 'Preparing') && (
          <TouchableOpacity
            style={styles.readyBtn}
            onPress={() => onMarkReadyPress(order.id)}
            activeOpacity={0.85}
          >
            <CheckCircleIcon size={18} color="#FFFFFF" />
            <Text style={styles.readyBtnText}>Mark as Food Ready for Pickup</Text>
          </TouchableOpacity>
        )}

        {order.status === 'ReadyForPickup' && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              Food is packed and ready. Waiting for delivery partner arrival.
            </Text>
          </View>
        )}

        {order.status === 'OutForDelivery' && (
          <View style={[styles.infoBanner, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
            <Text style={[styles.infoBannerText, { color: '#7C3AED' }]}>
              Delivery in progress with delivery partner.
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    orderIdRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    orderIdText: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    orderTimeText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '600',
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    customerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    customerName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    addressText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    totalPrice: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.primary,
    },
    itemsBox: {
      backgroundColor: colors.background,
      borderRadius: 14,
      padding: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemThumbMini: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.surface,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemLeftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 8,
      gap: 6,
    },
    itemQuantity: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
    },
    itemName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    itemPrice: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    moreItemsText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
      marginTop: 2,
    },
    driverRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      marginBottom: 10,
    },
    driverText: {
      fontSize: 12,
      color: '#7C3AED',
    },
    actionRow: {
      marginTop: 2,
    },
    buttonGroup: {
      flexDirection: 'row',
      gap: 10,
    },
    rejectBtn: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: '#EF4444',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rejectBtnText: {
      color: '#EF4444',
      fontWeight: '800',
      fontSize: 13,
    },
    acceptBtn: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 11,
      borderRadius: 16,
      gap: 6,
    },
    acceptBtnText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 13,
    },
    readyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1E1B18', // Deep Charcoal
      paddingVertical: 12,
      borderRadius: 16,
      gap: 8,
    },
    readyBtnText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 13,
    },
    infoBanner: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    infoBannerText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#2563EB',
      textAlign: 'center',
    },
  });
