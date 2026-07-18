import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, Platform, StatusBar } from 'react-native';
import { useThemeColors } from '../../theme/colors';
import { API_URL } from '../../config/api';
import { authFetch } from '../../utils/authFetch';
import CustomLoader from '../../components/CustomLoader';
import CustomAlert from '../../components/CustomAlert';

interface Order {
  id: string;
  customerName: string;
  items: string;
  total: string;
  status: 'Placed' | 'Accepted' | 'Preparing' | 'OutForDelivery' | 'Delivered' | 'Cancelled';
}

export default function ShopkeeperDashboardScreen() {
  const colors = useThemeColors();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`${API_URL}/orders/pending-shopkeeper`);
      const data = await response.json();
      if (!response.ok) {
        showAlert('Error', data.message || 'Failed to fetch orders');
        return;
      }
      
      // Map API response to Component state structure
      const formatted: Order[] = data.map((o: any) => ({
        id: o.id || o._id,
        customerName: o.user?.name || 'Customer',
        items: o.items?.map((i: any) => `${i.quantity}x ${i.menuItem?.name || 'Item'}`).join(', ') || 'No Items',
        total: `₹${o.totalAmount.toFixed(2)}`,
        status: o.status,
      }));
      setOrders(formatted);
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, currentStatus: Order['status']) => {
    let nextStatus: Order['status'] = currentStatus;
    if (currentStatus === 'Placed') nextStatus = 'Accepted';
    else if (currentStatus === 'Accepted') nextStatus = 'Preparing';
    else if (currentStatus === 'Preparing') nextStatus = 'OutForDelivery';

    setLoading(true);
    try {
      const response = await authFetch(`${API_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        showAlert('Error', data.message || 'Failed to update status');
        return;
      }

      // Refresh list on success
      fetchOrders();
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={[styles.orderCard, { backgroundColor: colors.inputBackground }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.orderId, { color: colors.text }]}>Order #{item.id.slice(-6)}</Text>
        <Text style={[styles.statusBadge, { backgroundColor: colors.primary }]}>{item.status}</Text>
      </View>
      <Text style={[styles.customerName, { color: colors.textMuted }]}>To: {item.customerName}</Text>
      <Text style={[styles.itemsList, { color: colors.text }]}>{item.items}</Text>
      <View style={styles.cardFooter}>
        <Text style={[styles.totalText, { color: colors.primary }]}>{item.total}</Text>
        {item.status !== 'OutForDelivery' && item.status !== 'Delivered' && item.status !== 'Cancelled' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleUpdateStatus(item.id, item.status)}
          >
            <Text style={styles.actionButtonText}>
              {item.status === 'Placed'
                ? 'Accept Order'
                : item.status === 'Accepted'
                ? 'Start Preparing'
                : 'Out for Delivery'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryBackground }]}>
      {/* Reusable Custom Loader */}
      <CustomLoader visible={loading} message="Loading Orders..." />

      {/* Reusable Custom Alert Modal */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopkeeper Dashboard</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>Manage active orders and preparations</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No active orders at this time.</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: '#FFC72C', // Signature Gold
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerSub: {
    fontSize: 13,
    marginTop: 4,
  },
  listContent: {
    padding: 20,
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  customerName: {
    fontSize: 14,
    marginBottom: 6,
  },
  itemsList: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
});
