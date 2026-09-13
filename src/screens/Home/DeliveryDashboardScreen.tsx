import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  Linking,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { API_URL } from '../../config/api';
import { authFetch } from '../../utils/authFetch';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { wsService } from '../../services/WebSocketService';
import CustomLoader from '../../components/CustomLoader';
import CustomAlert from '../../components/CustomAlert';
import {
  DeliveryHeader,
  DeliveryTabs,
  DeliveryTabType,
  DeliveryCard,
  DeliveryOrder,
  DeliveryProfileModal,
  DeliveryConfirmModal,
  DeliveryEmptyState,
} from '../../components/delivery';

export default function DeliveryDashboardScreen() {
  const navigation = useNavigation<any>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { userProfile, userId, logout, refreshUserProfile } = useUser();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<DeliveryTabType>('active');
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [historyDeliveries, setHistoryDeliveries] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<DeliveryOrder | null>(null);
  const [isDeliverConfirmModalVisible, setDeliverConfirmModalVisible] = useState(false);

  // Alert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const fetchDeliveries = async () => {
    try {
      const response = await authFetch(`${API_URL}/orders/pending-delivery`);
      const data = await response.json();
      if (!response.ok) {
        showAlert('Error', data.message || 'Failed to fetch deliveries');
        return;
      }

      const formatted: DeliveryOrder[] = (Array.isArray(data) ? data : []).map((o: any) => ({
        id: o.id || o._id,
        customerName: o.user?.name || 'Customer',
        customerPhone: o.user?.phone || '',
        customerEmail: o.user?.email || '',
        address:
          typeof o.deliveryAddress === 'string'
            ? o.deliveryAddress
            : o.deliveryAddress?.addressLine1 || o.deliveryAddress?.address || 'Customer Delivery Address',
        restaurant: o.restaurant?.name || o.restaurantName || o.shopkeeper?.name || 'QuickBite Partner Kitchen',
        restaurantAddress: o.shopkeeper?.address || 'Indiranagar Counter',
        status: o.status,
        paymentStatus: o.paymentStatus || 'Paid',
        totalAmount: Number(o.totalAmount || 0),
        items: (o.items || []).map((item: any) => ({
          name: item.menuItem?.name || item.name || 'Food Item',
          quantity: item.quantity || 1,
          price: item.menuItem?.price || item.price || 0,
          image: item.menuItem?.image || item.image,
          category: item.menuItem?.category || item.category,
          isVeg:
            item.menuItem?.category?.toLowerCase() !== 'non-veg' &&
            item.menuItem?.category?.toLowerCase() !== 'chicken' &&
            item.menuItem?.category?.toLowerCase() !== 'meat',
        })),
        isAssignedToMe: o.deliveryMan === userId || o.deliveryMan?._id === userId || o.status === 'OutForDelivery',
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      }));

      setDeliveries(formatted);

      // Auto-switch to active if available is empty but active has orders
      const activeCount = formatted.filter((d) => d.status === 'OutForDelivery' || d.isAssignedToMe).length;
      const availableCount = formatted.filter((d) => d.status !== 'OutForDelivery' && !d.isAssignedToMe).length;
      if (activeCount > 0 && availableCount === 0 && activeTab === 'available') {
        setActiveTab('active');
      }
    } catch (e: any) {
      showAlert('Network Error', e.message);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await authFetch(`${API_URL}/orders/delivery-history`);
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        const formatted: DeliveryOrder[] = data.map((o: any) => ({
          id: o.id || o._id,
          customerName: o.user?.name || 'Customer',
          customerPhone: o.user?.phone || '',
          customerEmail: o.user?.email || '',
          address:
            typeof o.deliveryAddress === 'string'
              ? o.deliveryAddress
              : o.deliveryAddress?.addressLine1 || o.deliveryAddress?.address || 'Customer Address',
          restaurant: o.restaurant?.name || o.restaurantName || 'QuickBite Kitchen',
          status: o.status,
          paymentStatus: o.paymentStatus || 'Paid',
          totalAmount: Number(o.totalAmount || 0),
          items: (o.items || []).map((item: any) => ({
            name: item.menuItem?.name || item.name || 'Food Item',
            quantity: item.quantity || 1,
            price: item.menuItem?.price || item.price || 0,
            image: item.menuItem?.image || item.image,
            category: item.menuItem?.category || item.category,
            isVeg:
              item.menuItem?.category?.toLowerCase() !== 'non-veg' &&
              item.menuItem?.category?.toLowerCase() !== 'chicken' &&
              item.menuItem?.category?.toLowerCase() !== 'meat',
          })),
          isAssignedToMe: true,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        }));
        setHistoryDeliveries(formatted);
      }
    } catch (e) {
      console.log('Failed to fetch history:', e);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchDeliveries(), fetchHistory()]);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchDeliveries(), fetchHistory()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadAllData();
  }, []);

  // WebSocket Live Updates subscription
  useEffect(() => {
    const unsubscribe = wsService.subscribe((event) => {
      console.log('[DeliveryDashboardScreen] Live event:', event.type);
      fetchDeliveries();
      fetchHistory();
    });
    return unsubscribe;
  }, []);

  // Exit app on hardware back press when on Delivery Dashboard root
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  // Claim Order
  const handleClaimDelivery = async (orderId: string) => {
    const status = userProfile?.verificationStatus;
    if (status === 'pending') {
      showAlert(
        'Verification In Progress',
        'Your profile has been submitted and is awaiting Admin review. You will be able to claim deliveries once approved.'
      );
      return;
    }
    if (status === 'unverified' || status === 'rejected') {
      showAlert(
        'Verification Required',
        'Please tap the Profile icon on the top right to submit your vehicle and KYC details for Admin approval.'
      );
      setProfileModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch(`${API_URL}/orders/${orderId}/assign-delivery`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) {
        showAlert('Error', data.message || 'Could not claim order');
        return;
      }
      showAlert('Delivery Claimed', 'Order assigned to your route. Proceed to restaurant for pickup.');
      showToast({
        type: 'order',
        title: 'Delivery Claimed',
        message: `Order #${orderId.slice(-6).toUpperCase()} added to your active deliveries.`,
      });
      setActiveTab('active');
      fetchDeliveries();
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark Delivered Modal Trigger
  const handleMarkDeliveredPress = (item: DeliveryOrder) => {
    setSelectedOrderForDelivery(item);
    setDeliverConfirmModalVisible(true);
  };

  // Confirm Mark Delivered with PIN
  const confirmMarkDelivered = async (enteredPin: string) => {
    if (!selectedOrderForDelivery) return;
    setDeliverConfirmModalVisible(false);
    setLoading(true);
    try {
      const response = await authFetch(`${API_URL}/orders/${selectedOrderForDelivery.id}/status`, {
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
        `Order #${selectedOrderForDelivery.id.slice(-6).toUpperCase()} has been successfully verified & delivered.`
      );
      showToast({
        type: 'success',
        title: 'Delivery Completed',
        message: `Order #${selectedOrderForDelivery.id.slice(-6).toUpperCase()} delivered successfully!`,
      });
      setSelectedOrderForDelivery(null);
      await Promise.all([fetchDeliveries(), fetchHistory()]);
      setActiveTab('history');
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout handlers
  const handleLogoutPress = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    try {
      setLogoutModalVisible(false);
      await logout();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        })
      );
    } catch (e) {
      console.error('Logout error:', e);
      navigation.navigate('Welcome' as never);
    }
  };

  // Phone Call Action
  const handleCallCustomer = (phone?: string) => {
    if (!phone) {
      showAlert('Phone Unavailable', 'No phone number provided for this customer.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  // GPS Maps Action
  const handleOpenMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const url =
      Platform.OS === 'ios'
        ? `maps:0,0?q=${encodedAddress}`
        : `geo:0,0?q=${encodedAddress}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
    });
  };

  const handleCardPress = (order: DeliveryOrder) => {
    navigation.navigate('DeliveryOrderDetails', {
      orderId: order.id,
      initialOrder: order,
    });
  };

  const handleChatPress = (order: DeliveryOrder) => {
    navigation.navigate('Chat', {
      orderId: order.id,
      orderNumber: order.id.slice(-6).toUpperCase(),
      recipientName: order.customerName,
      recipientRole: 'customer',
    });
  };

  // Segregated orders
  const availableOrders = deliveries.filter((d) => d.status !== 'OutForDelivery' && !d.isAssignedToMe);
  const activeOrders = deliveries.filter((d) => d.status === 'OutForDelivery' || d.isAssignedToMe);
  const completedOrders = historyDeliveries;

  const currentList =
    activeTab === 'available'
      ? availableOrders
      : activeTab === 'active'
      ? activeOrders
      : completedOrders;

  const totalEarnings = completedOrders.length * 50; // ₹50 standard payout per completed delivery

  // Toggle Delivery Online/Offline Status
  const handleToggleDeliveryStatus = async () => {
    const nextStatus = !(userProfile?.isOnline ?? true);
    try {
      await authFetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: nextStatus }),
      });
      refreshUserProfile();
      showAlert(
        nextStatus ? 'You are Online' : 'You are Offline',
        nextStatus
          ? 'You will now receive incoming delivery requests.'
          : 'Status set to offline. You will not receive new deliveries until you go online.'
      );
    } catch (e: any) {
      showAlert('Status Error', e.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <CustomLoader visible={loading} message="Updating Live Deliveries..." />

        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />

      {/* Modular Delivery Header */}
      <DeliveryHeader
        partnerName={userProfile?.name || 'Delivery Partner'}
        vehicleNumber={userProfile?.vehicleNumber}
        verificationStatus={userProfile?.verificationStatus || 'unverified'}
        isOnline={userProfile?.isOnline ?? true}
        onToggleStatus={handleToggleDeliveryStatus}
        activeCount={activeOrders.length}
        availableCount={availableOrders.length}
        totalEarnings={totalEarnings}
        onOpenProfile={() => setProfileModalVisible(true)}
        onLogoutPress={handleLogoutPress}
      />

      {/* Modular Segmented Tabs */}
      <DeliveryTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeCount={activeOrders.length}
        availableCount={availableOrders.length}
        historyCount={completedOrders.length}
      />

      {/* Delivery Cards Feed */}
      <FlatList
        data={currentList}
        renderItem={({ item }) => (
          <DeliveryCard
            item={item}
            isAvailableTab={activeTab === 'available'}
            isActiveTab={activeTab === 'active'}
            isHistoryTab={activeTab === 'history'}
            onPress={handleCardPress}
            onClaimPress={handleClaimDelivery}
            onDeliveredPress={handleMarkDeliveredPress}
            onCallPress={handleCallCustomer}
            onNavigatePress={handleOpenMaps}
            onChatPress={handleChatPress}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={<DeliveryEmptyState activeTab={activeTab} />}
      />

      {/* Driver KYC & Document Verification Modal */}
      <DeliveryProfileModal
        visible={isProfileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        userProfile={userProfile}
        onProfileUpdated={refreshUserProfile}
        showAlert={showAlert}
      />

      {/* Delivery Confirmation Modal */}
      <DeliveryConfirmModal
        visible={isDeliverConfirmModalVisible}
        order={selectedOrderForDelivery}
        onClose={() => setDeliverConfirmModalVisible(false)}
        onConfirm={confirmMarkDelivered}
      />

      {/* Logout Confirmation Modal - Matching Customer Sidebar Theme */}
      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setLogoutModalVisible(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure you want{'\n'}to sign out?</Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnConfirm}
                onPress={confirmLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnConfirmText}>Yes, sign out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 40,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      backgroundColor: colors.surface,
      width: '90%',
      padding: 26,
      borderRadius: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 10,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    modalButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 12,
    },
    modalBtnCancel: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
    },
    modalBtnCancelText: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 14,
    },
    modalBtnConfirm: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
    },
    modalBtnConfirmText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
  });
