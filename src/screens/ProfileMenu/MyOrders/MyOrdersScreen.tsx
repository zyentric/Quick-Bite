import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { authFetch } from '../../../utils/authFetch';
import { API_URL } from '../../../config/api';

type MyOrdersNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyOrders'>;

type TabType = 'Active' | 'Completed' | 'Cancelled';

interface Order {
  id: string;
  name: string;
  date: string;
  itemsCount: number;
  price: number;
  image: string;
  status: string;
}

const ACTIVE_STATUSES = ['Placed', 'Accepted', 'Preparing', 'OutForDelivery'];
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2424&auto=format&fit=crop';

function mapApiOrder(o: any): Order {
  const firstItem = o.items?.[0];
  const name = firstItem?.menuItem?.name || 'Order';
  const image = firstItem?.menuItem?.image || FALLBACK_IMAGE;
  const date = new Date(o.createdAt).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
  return {
    id: o.id || o._id,
    name,
    date,
    itemsCount: o.items?.reduce((acc: number, i: any) => acc + (i.quantity || 1), 0) || 1,
    price: o.totalAmount,
    image,
    status: o.status,
  };
}

export default function MyOrdersScreen() {
  const navigation = useNavigation<MyOrdersNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const [activeTab, setActiveTab] = useState<TabType>('Active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch real orders from backend whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchOrders = async () => {
        setLoading(true);
        try {
          const res = await authFetch(`${API_URL}/orders`);
          if (res.ok) {
            const data = await res.json();
            setOrders(data.map(mapApiOrder));
          }
        } catch (e) {
          console.error('Failed to fetch orders:', e);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }, [])
  );

  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'Delivered');
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {(['Active', 'Completed', 'Cancelled'] as TabType[]).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderEmptyState = (message: string) => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📄</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  const renderActiveList = () => {
    if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
    if (activeOrders.length === 0) return renderEmptyState("You don't have any\nactive orders at this time");

    return activeOrders.map(order => (
      <View key={order.id} style={styles.orderCard}>
        <Image source={{ uri: order.image }} style={styles.orderImage} />
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderName}>{order.name}</Text>
            <Text style={styles.orderPrice}>₹{order.price.toFixed(2)}</Text>
          </View>
          <View style={styles.orderSubInfo}>
            <Text style={styles.orderDate}>{order.date}</Text>
            <Text style={styles.orderItems}>{order.itemsCount} items</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusBadge}>{order.status}</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => navigation.navigate('CancelOrder', { orderId: order.id })}
            >
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.trackBtn}>
              <Text style={styles.trackBtnText}>Track Driver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ));
  };

  const renderCompletedList = () => {
    if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
    if (completedOrders.length === 0) return renderEmptyState("No completed orders yet");

    return completedOrders.map(order => (
      <View key={order.id} style={styles.orderCard}>
        <Image source={{ uri: order.image }} style={styles.orderImage} />
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderName}>{order.name}</Text>
            <Text style={styles.orderPrice}>₹{order.price.toFixed(2)}</Text>
          </View>
          <View style={styles.orderSubInfo}>
            <Text style={styles.orderDate}>{order.date}</Text>
            <Text style={styles.orderItems}>{order.itemsCount} items</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => navigation.navigate('LeaveReview')}
            >
              <Text style={styles.reviewBtnText}>Leave a review</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orderAgainBtn}>
              <Text style={styles.orderAgainBtnText}>Order Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ));
  };

  const renderCancelledList = () => {
    if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
    if (cancelledOrders.length === 0) return renderEmptyState("No cancelled orders");

    return cancelledOrders.map(order => (
      <View key={order.id} style={styles.orderCard}>
        <Image source={{ uri: order.image }} style={styles.orderImage} />
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderName}>{order.name}</Text>
            <Text style={styles.orderPrice}>₹{order.price.toFixed(2)}</Text>
          </View>
          <View style={styles.orderSubInfo}>
            <Text style={styles.orderDate}>{order.date}</Text>
            <Text style={styles.orderItems}>{order.itemsCount} items</Text>
          </View>
          <Text style={styles.cancelledStatus}>❌ Order cancelled</Text>
        </View>
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        {renderTabs()}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {activeTab === 'Active' && renderActiveList()}
          {activeTab === 'Completed' && renderCompletedList()}
          {activeTab === 'Cancelled' && renderCancelledList()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
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
    paddingBottom: 30,
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
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    paddingTop: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyIcon: {
    fontSize: 100,
    marginBottom: 20,
    opacity: 0.2,
  },
  emptyText: {
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: 26,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderImage: {
    width: 70,
    height: 70,
    borderRadius: 15,
    marginRight: 15,
  },
  orderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  orderSubInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  orderItems: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statusRow: {
    marginBottom: 8,
  },
  statusBadge: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    backgroundColor: colors.inputBackground,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
    flex: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  trackBtn: {
    backgroundColor: colors.inputBackground,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
    flex: 1,
    alignItems: 'center',
  },
  trackBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 15,
    flex: 1,
    alignItems: 'center',
  },
  reviewBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  orderAgainBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
    flex: 1,
    alignItems: 'center',
  },
  orderAgainBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cancelledStatus: {
    fontSize: 12,
    color: colors.textMuted,
  }
});
