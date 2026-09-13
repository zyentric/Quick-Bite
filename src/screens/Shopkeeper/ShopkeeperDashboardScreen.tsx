import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useUser } from '../../context/UserContext';
import { authFetch } from '../../utils/authFetch';
import { API_URL } from '../../config/api';
import { wsService } from '../../services/WebSocketService';
import CustomLoader from '../../components/CustomLoader';
import CustomAlert from '../../components/CustomAlert';
import OrderCardSkeleton from '../../components/skeleton/OrderCardSkeleton';
import {
  ShopkeeperHeader,
  ShopkeeperTabs,
  ShopkeeperTabType,
  ShopkeeperCard,
  ShopkeeperOrder,
  ShopkeeperStoreModal,
  ShopkeeperEmptyState,
} from '../../components/shopkeeper';

type ShopkeeperDashboardNavProp = NativeStackNavigationProp<RootStackParamList, 'ShopkeeperDashboard'>;

function mapApiShopkeeperOrder(o: any): ShopkeeperOrder {
  const contactPhone =
    o.user?.phone ||
    (typeof o.deliveryAddress === 'object'
      ? o.deliveryAddress?.phone || o.deliveryAddress?.contactNumber
      : '') ||
    '';

  return {
    id: o.id || o._id,
    customerName: o.user?.name || 'Customer',
    customerPhone: contactPhone,
    address:
      typeof o.deliveryAddress === 'string'
        ? o.deliveryAddress
        : o.deliveryAddress?.addressLine1 || o.deliveryAddress?.address || 'Customer Delivery Address',
    status: o.status,
    paymentStatus: o.paymentStatus || 'Paid',
    totalAmount: Number(o.totalAmount || 0),
    items: (o.items || []).map((item: any) => {
      const m = item.menuItem || item;
      const itemName = m?.name || item.name || 'Food Item';
      const image = m?.image || item.image || '';
      const category = m?.category || item.category || '';
      const isVeg =
        m?.isVeg !== undefined
          ? m.isVeg
          : !(itemName || '').match(/chicken|meat|fish|mutton|beef|prawn|egg|bacon|ham/i);
      return {
        name: itemName,
        quantity: item.quantity || 1,
        price: m?.price || item.price || 0,
        isVeg,
        image,
        category,
      };
    }),
    deliveryManName: o.deliveryMan?.name,
    deliveryManPhone: o.deliveryMan?.phone,
    createdAt: o.createdAt || new Date().toISOString(),
  };
}

export default function ShopkeeperDashboardScreen() {
  const navigation = useNavigation<ShopkeeperDashboardNavProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const { isAuthenticated, logout, userProfile, refreshUserProfile } = useUser();

  const [activeTab, setActiveTab] = useState<ShopkeeperTabType>('Pending');
  const [activeOrders, setActiveOrders] = useState<ShopkeeperOrder[]>([]);
  const [historyOrders, setHistoryOrders] = useState<ShopkeeperOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isStoreModalVisible, setStoreModalVisible] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  // Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

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

  // Fetch Live Kitchen Orders
  const fetchActiveOrders = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await authFetch(`${API_URL}/orders/pending-shopkeeper`);
      if (res.ok) {
        const data = await res.json();
        setActiveOrders((Array.isArray(data) ? data : []).map(mapApiShopkeeperOrder));
      } else {
        const allRes = await authFetch(`${API_URL}/orders`);
        if (allRes.ok) {
          const allData = await allRes.json();
          const activeList = (Array.isArray(allData) ? allData : []).filter((o: any) =>
            ['Placed', 'Accepted', 'Preparing', 'ReadyForPickup', 'OutForDelivery'].includes(o.status)
          );
          setActiveOrders(activeList.map(mapApiShopkeeperOrder));
        }
      }
    } catch (e: any) {
      console.error('Failed to fetch kitchen orders:', e);
    }
  };

  // Fetch Completed/Cancelled History
  const fetchHistoryOrders = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await authFetch(`${API_URL}/orders/shopkeeper-history`);
      if (res.ok) {
        const data = await res.json();
        setHistoryOrders((Array.isArray(data) ? data : []).map(mapApiShopkeeperOrder));
      }
    } catch (e) {
      console.error('Failed to fetch history:', e);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchActiveOrders(), fetchHistoryOrders()]);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadAllData();
      const onBackPress = () => {
        if (isStoreModalVisible) {
          setStoreModalVisible(false);
          return true;
        }
        if (isLogoutModalVisible) {
          setLogoutModalVisible(false);
          return true;
        }
        if (alertVisible) {
          setAlertVisible(false);
          return true;
        }
        BackHandler.exitApp();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [isAuthenticated, isStoreModalVisible, isLogoutModalVisible, alertVisible])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchActiveOrders(), fetchHistoryOrders()]);
    setRefreshing(false);
  }, [isAuthenticated]);

  // WebSocket Live Updates subscription
  useEffect(() => {
    const unsubscribe = wsService.subscribe((event) => {
      fetchActiveOrders();
      fetchHistoryOrders();
    });
    return unsubscribe;
  }, [isAuthenticated]);

  // Update Status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert('Error', data.message || 'Failed to update status');
        return;
      }

      if (newStatus === 'Accepted') {
        showAlert('Order Accepted', 'Order moved to cooking queue in Kitchen.');
        setActiveTab('Preparing');
      } else if (newStatus === 'ReadyForPickup') {
        showAlert('Food Ready', 'Delivery Hero notified for pickup from your kitchen.');
        setActiveTab('Ready');
      } else if (newStatus === 'Cancelled') {
        showAlert('Order Declined', 'Order has been rejected.');
      }

      await Promise.all([fetchActiveOrders(), fetchHistoryOrders()]);
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Store Online/Offline
  const handleToggleStoreStatus = async () => {
    const nextStatus = !(userProfile?.isOnline ?? true);
    try {
      await authFetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: nextStatus }),
      });
      refreshUserProfile();
      showAlert(
        nextStatus ? 'Kitchen Open' : 'Kitchen Paused',
        nextStatus
          ? 'Your kitchen is now open and accepting customer orders.'
          : 'Your kitchen is now paused. No new orders will arrive.'
      );
    } catch (e: any) {
      showAlert('Error', e.message);
    }
  };

  // Segregate Orders by Tab
  const pendingList = activeOrders.filter((o) => o.status === 'Placed');
  const preparingList = activeOrders.filter((o) => o.status === 'Accepted' || o.status === 'Preparing');
  const readyList = activeOrders.filter((o) => o.status === 'ReadyForPickup' || o.status === 'OutForDelivery');
  const historyList = historyOrders;

  const currentList =
    activeTab === 'Pending'
      ? pendingList
      : activeTab === 'Preparing'
      ? preparingList
      : activeTab === 'Ready'
      ? readyList
      : historyList;

  // Calculate Today's Total Sales
  const totalSales = [...activeOrders, ...historyOrders]
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#1E1B18' }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B18" />

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <CustomLoader visible={actionLoading} message="Updating Kitchen Order..." />

        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />

        {/* Modular Shopkeeper Header */}
        <ShopkeeperHeader
          storeName={userProfile?.name || 'QuickBite Kitchen'}
          ownerName={userProfile?.name || 'Mario Owner'}
          isOpen={userProfile?.isOnline ?? true}
          onToggleStatus={handleToggleStoreStatus}
          newOrdersCount={pendingList.length}
          inKitchenCount={preparingList.length}
          readyCount={readyList.length}
          totalRevenue={totalSales}
          onOpenStoreModal={() => setStoreModalVisible(true)}
          onLogoutPress={handleLogoutPress}
        />

        {/* Modular Tabs */}
        <ShopkeeperTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingCount={pendingList.length}
          preparingCount={preparingList.length}
          readyCount={readyList.length}
          historyCount={historyList.length}
        />

        {/* Orders Feed / Skeletons */}
        {loading && activeOrders.length === 0 && historyOrders.length === 0 ? (
          <View style={styles.listContent}>
            {[0, 1, 2].map((idx) => (
              <OrderCardSkeleton key={idx} />
            ))}
          </View>
        ) : (
          <FlatList
            data={currentList}
            renderItem={({ item }) => (
              <ShopkeeperCard
                order={item}
                onPress={() => navigation.navigate('ShopkeeperOrderDetails', { orderId: item.id })}
                onAcceptPress={(orderId) => handleUpdateStatus(orderId, 'Accepted')}
                onRejectPress={(orderId) => handleUpdateStatus(orderId, 'Cancelled')}
                onMarkReadyPress={(orderId) => handleUpdateStatus(orderId, 'ReadyForPickup')}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
            }
            ListEmptyComponent={<ShopkeeperEmptyState activeTab={activeTab} />}
          />
        )}

        {/* Store Settings & Operation Modal */}
        <ShopkeeperStoreModal
          visible={isStoreModalVisible}
          onClose={() => setStoreModalVisible(false)}
          userProfile={userProfile}
          onProfileUpdated={refreshUserProfile}
          showAlert={showAlert}
        />

        {/* Logout Confirmation Modal */}
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
      backgroundColor: '#1E1B18', // Deep Charcoal
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
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
