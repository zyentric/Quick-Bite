import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, Platform, StatusBar } from 'react-native';
import { useThemeColors } from '../../theme/colors';
import { API_URL } from '../../config/api';
import { authFetch } from '../../utils/authFetch';
import CustomLoader from '../../components/CustomLoader';
import CustomAlert from '../../components/CustomAlert';

interface Delivery {
  id: string;
  customerName: string;
  address: string;
  restaurant: string;
  status: 'Placed' | 'Accepted' | 'Preparing' | 'OutForDelivery' | 'Delivered' | 'Cancelled';
}

export default function DeliveryDashboardScreen() {
  const colors = useThemeColors();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
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

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`${API_URL}/orders/pending-delivery`);
      const data = await response.json();
      if (!response.ok) {
        showAlert('Error', data.message || 'Failed to fetch deliveries');
        return;
      }
      
      const formatted: Delivery[] = data.map((o: any) => ({
        id: o.id || o._id,
        customerName: o.user?.name || 'Customer',
        address: o.deliveryAddress?.addressLine1 || 'No Address Listed',
        restaurant: 'Restaurant Kitchen',
        status: o.status,
      }));
      setDeliveries(formatted);
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDeliveries();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleUpdateStatus = async (id: string, currentStatus: Delivery['status']) => {
    setLoading(true);
    try {
      let response;
      if (currentStatus === 'Preparing' || currentStatus === 'Accepted') {
        // Claim and assign driver, transition status to OutForDelivery
        response = await authFetch(`${API_URL}/orders/${id}/assign-delivery`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // Transition status to Delivered
        response = await authFetch(`${API_URL}/orders/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Delivered' }),
        });
      }

      if (!response.ok) {
        const data = await response.json();
        showAlert('Error', data.message || 'Failed to update delivery');
        return;
      }

      fetchDeliveries();
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDeliveryItem = ({ item }: { item: Delivery }) => (
    <View style={[styles.deliveryCard, { backgroundColor: colors.inputBackground }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.deliveryId, { color: colors.text }]}>Delivery #{item.id.slice(-6)}</Text>
        <Text style={[styles.statusBadge, { backgroundColor: colors.primary }]}>{item.status}</Text>
      </View>
      <Text style={[styles.infoText, { color: colors.textMuted }]}>From: {item.restaurant}</Text>
      <Text style={[styles.infoText, { color: colors.textMuted }]}>To: {item.customerName}</Text>
      <Text style={[styles.addressText, { color: colors.text }]}>📍 {item.address}</Text>
      <View style={styles.cardFooter}>
        {item.status !== 'Delivered' && item.status !== 'Cancelled' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleUpdateStatus(item.id, item.status)}
          >
            <Text style={styles.actionButtonText}>
              {item.status === 'Preparing' || item.status === 'Accepted' ? 'Claim & Start Delivery' : 'Mark as Delivered'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryBackground }]}>
      {/* Reusable Custom Loader */}
      <CustomLoader visible={loading} message="Loading Deliveries..." />

      {/* Reusable Custom Alert Modal */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Delivery Dashboard</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>Track and update delivery assignments</Text>
      </View>
      <FlatList
        data={deliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No deliveries available at this time.</Text>
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
  deliveryCard: {
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
  deliveryId: {
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
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  actionButton: {
    paddingHorizontal: 20,
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
