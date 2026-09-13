import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DeliveryAddress, RawOrderItem, CustomerOrderSummary } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { useUser } from '../../../context/UserContext';
import { useCart } from '../../../context/CartContext';
import { authFetch } from '../../../utils/authFetch';
import { API_URL } from '../../../config/api';
import { DocumentIcon, LockIcon, FastDeliveryIcon, CheckCircleIcon, CancelCircleIcon, ClockIcon } from '../../../components/icons';
import { MyOrdersSkeleton, OrderCardSkeleton } from '../../../components/skeleton';
import AppFooter from '../../../components/common/AppFooter';
import Icons from '../../../constants/icons';

type MyOrdersNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyOrders'>;

type TabType = 'Active' | 'Completed' | 'Cancelled';

interface OrderItem {
  id: string;
  orderNumber: string;
  name: string;
  itemsSummary: string;
  rawItems: RawOrderItem[];
  date: string;
  itemsCount: number;
  price: number;
  image: string;
  status: string;
  deliveryAddress?: DeliveryAddress;
  paymentStatus?: string;
  deliveryPin?: string;
}

const ACTIVE_STATUSES = [
  'PendingPayment',
  'Placed',
  'Accepted',
  'Preparing',
  'ReadyForPickup',
  'OutForDelivery',
];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2424&auto=format&fit=crop';

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Preparing':
      return {
        label: 'Preparing Food',
        bg: '#FEF3C7',
        text: '#D97706',
        borderColor: '#FDE68A',
        Icon: ClockIcon,
      };
    case 'OutForDelivery':
      return {
        label: 'Out For Delivery',
        bg: '#FFF4EB',
        text: '#E85D22',
        borderColor: 'rgba(232, 93, 34, 0.3)',
        Icon: FastDeliveryIcon,
      };
    case 'ReadyForPickup':
      return {
        label: 'Ready For Pickup',
        bg: '#F3E8FF',
        text: '#7E22CE',
        borderColor: '#E9D5FF',
        Icon: ClockIcon,
      };
    case 'Accepted':
    case 'Placed':
      return {
        label: 'Order Confirmed',
        bg: '#EFF6FF',
        text: '#2563EB',
        borderColor: '#BFDBFE',
        Icon: ClockIcon,
      };
    case 'Delivered':
      return {
        label: 'Delivered',
        bg: '#ECFDF5',
        text: '#059669',
        borderColor: '#A7F3D0',
        Icon: CheckCircleIcon,
      };
    case 'Cancelled':
      return {
        label: 'Cancelled',
        bg: '#FEE2E2',
        text: '#DC2626',
        borderColor: '#FECACA',
        Icon: CancelCircleIcon,
      };
    default:
      return {
        label: status,
        bg: '#F3F4F6',
        text: '#4B5563',
        borderColor: '#E5E7EB',
        Icon: ClockIcon,
      };
  }
};

interface ApiOrderPayload {
  id?: string;
  _id?: string;
  items?: RawOrderItem[];
  createdAt?: string;
  totalAmount?: number;
  status?: string;
  deliveryAddress?: DeliveryAddress;
  paymentStatus?: string;
  deliveryPin?: string;
}

function mapApiOrder(o: ApiOrderPayload): OrderItem {
  const items = o.items || [];
  const firstItem = items[0]?.menuItem;
  const name = firstItem?.name || 'QuickBite Meal';
  const image = firstItem?.image || FALLBACK_IMAGE;

  const itemsSummary = items
    .map((i: RawOrderItem) => `${i.quantity || 1}x ${i.menuItem?.name || 'Item'}`)
    .join(', ');

  const date = o.createdAt
    ? new Date(o.createdAt).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent Order';

  const orderId = o.id || o._id || '';
  const orderNumber = orderId.slice(-6).toUpperCase() || '102938';

  return {
    id: orderId,
    orderNumber: `#QB-${orderNumber}`,
    name,
    itemsSummary: itemsSummary || `${items.length} items ordered`,
    rawItems: items,
    date,
    itemsCount: items.reduce((acc: number, i: RawOrderItem) => acc + (i.quantity || 1), 0) || 1,
    price: o.totalAmount || 0,
    image,
    status: o.status || 'Placed',
    deliveryAddress: o.deliveryAddress,
    paymentStatus: o.paymentStatus,
    deliveryPin: o.deliveryPin,
  };
}

export default function MyOrdersScreen() {
  const navigation = useNavigation<MyOrdersNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { addToCart } = useCart();
  const { isAuthenticated } = useUser();

  const [activeTab, setActiveTab] = useState<TabType>('Active');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isFirstLoadRef = React.useRef(true);

  const fetchOrders = async (isRefresh = false, pageNum = 1) => {
    if (!isAuthenticated) return;
    
    if (isRefresh) {
      setRefreshing(true);
      pageNum = 1;
    } else if (pageNum > 1) {
      setLoadingMore(true);
    } else if (isFirstLoadRef.current && orders.length === 0) {
      setLoading(true);
    }

    try {
      const res = await authFetch(`${API_URL}/orders?page=${pageNum}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : (data.orders || data.items || []);
        const mapped = rawList.map(mapApiOrder);

        if (pageNum === 1) {
          setOrders(mapped);
        } else {
          setOrders((prev) => {
            const existingIds = new Set(prev.map((o) => o.id));
            const fresh = mapped.filter((o: any) => !existingIds.has(o.id));
            return [...prev, ...fresh];
          });
        }

        setPage(pageNum);

        if (Array.isArray(data)) {
          setHasMore(mapped.length >= 10);
        } else {
          setHasMore(data.hasMore ?? (pageNum < (data.totalPages || 1)));
        }
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      isFirstLoadRef.current = false;
      if (isRefresh) setRefreshing(false);
      else if (pageNum > 1) setLoadingMore(false);
      else setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && !refreshing && hasMore) {
      fetchOrders(false, page + 1);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders(false, 1);
    }, [isAuthenticated])
  );

  const handleReorder = (order: OrderItem) => {
    if (order.rawItems && order.rawItems.length > 0) {
      order.rawItems.forEach((item) => {
        if (item.menuItem) {
          const isObj = typeof item.menuItem === 'object' && item.menuItem !== null;
          const dishId = isObj ? (item.menuItem.id || item.menuItem._id || '') : String(item.menuItem);
          const dishName = (isObj && item.menuItem.name) ? item.menuItem.name : order.name;
          const dishPrice = (isObj && typeof item.menuItem.price === 'number') ? item.menuItem.price : order.price / (order.itemsCount || 1);
          const dishDesc = (isObj && item.menuItem.description) ? item.menuItem.description : '';
          const dishImg = (isObj && item.menuItem.image) ? item.menuItem.image : order.image;
          const dishRating = (isObj && typeof item.menuItem.rating === 'number') ? item.menuItem.rating : 4.8;
          const dishCat = (isObj && item.menuItem.category) ? item.menuItem.category : 'Special';

          addToCart({
            id: dishId,
            name: dishName,
            price: dishPrice,
            description: dishDesc,
            image: dishImg,
            rating: dishRating,
            category: dishCat,
          });
        }
      });
    }
    navigation.navigate('Cart');
  };

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => o.status === 'Delivered');
  const cancelledOrders = orders.filter((o) => o.status === 'Cancelled');

  const currentList =
    activeTab === 'Active'
      ? activeOrders
      : activeTab === 'Completed'
      ? completedOrders
      : cancelledOrders;

  const renderEmptyState = () => {
    const isAct = activeTab === 'Active';
    const isComp = activeTab === 'Completed';

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <DocumentIcon size={44} color={colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>
          {isAct
            ? 'No Active Orders'
            : isComp
            ? 'No Completed Orders Yet'
            : 'No Cancelled Orders'}
        </Text>
        <Text style={styles.emptySubText}>
          {isAct
            ? 'Craving something delicious? Explore our top restaurants and place an order now!'
            : 'Your past delivered meals and food orders will appear here.'}
        </Text>
        {isAct && (
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'FoodMenu' })}
            activeOpacity={0.85}
          >
            <Text style={styles.exploreBtnText}>Browse Food Menu ➔</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderOrderCard = (order: OrderItem) => {
    const statusCfg = getStatusConfig(order.status);
    const StatusIcon = statusCfg.Icon;

    return (
      <View key={order.id} style={styles.orderCard}>
        {/* Clickable Header & Body: Opens OrderDetails for ALL order statuses */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() =>
            navigation.navigate('OrderDetails', {
              orderId: order.id,
              initialOrder: order,
            })
          }
        >
          {/* Card Header: ID, Date & Status Pill */}
          <View style={styles.cardHeader}>
            <View>
              <View style={styles.orderIdRow}>
                <Text style={styles.orderIdText}>{order.orderNumber}</Text>
                <Text style={styles.dateDot}>•</Text>
                <Text style={styles.dateText}>{order.date}</Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusCfg.bg, borderColor: statusCfg.borderColor },
              ]}
            >
              <StatusIcon size={12} color={statusCfg.text} />
              <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>
                {' '}{statusCfg.label}
              </Text>
            </View>
          </View>

          {/* Card Body: Image, Dish Name, Summary, Bill & Details Hint */}
          <View style={styles.cardBody}>
            <Image source={{ uri: order.image }} style={styles.orderImage} />
            <View style={styles.orderInfo}>
              <View style={styles.orderTitleRow}>
                <Text style={styles.orderName} numberOfLines={1}>
                  {order.name}
                </Text>
                <Text style={styles.viewDetailsArrow}>›</Text>
              </View>
              <Text style={styles.itemsSummary} numberOfLines={2}>
                {order.itemsSummary}
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Total Bill</Text>
                <Text style={styles.priceValue}>₹{order.price.toFixed(2)}</Text>
                <Text style={styles.detailsHint}>• View details</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Card Actions Footer */}
        <View style={styles.cardFooter}>
          {activeTab === 'Active' && (
            <View style={styles.actionButtonGroup}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => navigation.navigate('CancelOrder', { orderId: order.id })}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.trackBtn}
                onPress={() =>
                  navigation.navigate('DeliveryTime', {
                    orderId: order.id,
                    destLat: order.deliveryAddress?.lat,
                    destLng: order.deliveryAddress?.lng,
                    addressLabel: order.deliveryAddress?.label || order.deliveryAddress?.address,
                    initialPin: order.deliveryPin,
                  })
                }
                activeOpacity={0.85}
              >
                <FastDeliveryIcon size={16} color="#FFFFFF" />
                <Text style={styles.trackBtnText}> Live Track Order ➔</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'Completed' && (
            <View style={styles.actionButtonGroup}>
              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={() =>
                  navigation.navigate('LeaveReview', {
                    orderId: order.id,
                    orderName: order.name,
                    orderImage: order.image,
                  })
                }
                activeOpacity={0.8}
              >
                <Text style={styles.reviewBtnText}>★ Rate & Review</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reorderBtn}
                onPress={() => handleReorder(order)}
                activeOpacity={0.85}
              >
                <Text style={styles.reorderBtnText}>↻ Order Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'Cancelled' && (
            <View style={styles.actionButtonGroup}>
              <View style={styles.refundInfoBox}>
                <Text style={styles.refundText}>Refund processed to original method</Text>
              </View>

              <TouchableOpacity
                style={styles.reorderBtn}
                onPress={() => handleReorder(order)}
                activeOpacity={0.85}
              >
                <Text style={styles.reorderBtnText}>↻ Reorder</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBackground} />

      {/* Header */}
      <View style={styles.header}>
        {navigation.canGoBack() ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Image source={require('../../../assets/back.png')} style={styles.backIconImg} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Orders</Text>
          {activeOrders.length > 0 && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>{activeOrders.length} Active</Text>
            </View>
          )}
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {!isAuthenticated ? (
          <View style={styles.guestContainer}>
            <View style={styles.guestIconCircle}>
              <LockIcon size={44} color={colors.primary} />
            </View>
            <Text style={styles.guestTitle}>Sign In to View Orders</Text>
            <Text style={styles.guestSubText}>
              Keep track of live deliveries, view past orders, and reorder your favorite meals.
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>Log In to Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Segmented Tabs Bar */}
            <View style={styles.tabsWrapper}>
              {(['Active', 'Completed', 'Cancelled'] as TabType[]).map((tab) => {
                const isActive = activeTab === tab;
                const count =
                  tab === 'Active'
                    ? activeOrders.length
                    : tab === 'Completed'
                    ? completedOrders.length
                    : cancelledOrders.length;

                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabButton, isActive && styles.tabButtonActive]}
                    onPress={() => setActiveTab(tab)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                      {tab}
                    </Text>
                    {count > 0 && (
                      <View style={[styles.tabCountPill, isActive && styles.tabCountPillActive]}>
                        <Text style={[styles.tabCountText, isActive && styles.tabCountTextActive]}>
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Orders Scroll List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchOrders(true, 1)}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              onScroll={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 120;
                if (isCloseToBottom) {
                  handleLoadMore();
                }
              }}
              scrollEventThrottle={16}
            >
              {loading ? (
                <MyOrdersSkeleton count={3} />
              ) : currentList.length === 0 ? (
                renderEmptyState()
              ) : (
                <>
                  {currentList.map(renderOrderCard)}
                  {loadingMore && (
                    <View style={{ marginTop: 10, marginBottom: 20 }}>
                      <OrderCardSkeleton />
                    </View>
                  )}
                  {!hasMore && currentList.length > 5 && (
                    <View style={styles.endOfListRow}>
                      <Text style={styles.endOfListText}>You've reached the end of your orders</Text>
                    </View>
                  )}
                </>
              )}

              {/* App Footer at bottom of scroll */}
              {/* <AppFooter bottomSpacing={20} /> */}
            </ScrollView>
          </>
        )}
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
    headerSpacer: {
      width: 40,
    },
    headerCenter: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: '#FFFFFF',
    },
    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginTop: 4,
      gap: 5,
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#10B981',
    },
    liveBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
    },
    contentContainer: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      overflow: 'hidden',
      paddingTop: 18,
    },
    tabsWrapper: {
      flexDirection: 'row',
      backgroundColor: '#F3F4F6',
      borderRadius: 24,
      padding: 4,
      marginHorizontal: 16,
      marginBottom: 16,
    },
    tabButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 20,
      gap: 6,
    },
    tabButtonActive: {
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
    },
    tabTextActive: {
      color: colors.primary,
      fontWeight: '900',
    },
    tabCountPill: {
      backgroundColor: '#E5E7EB',
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 10,
    },
    tabCountPillActive: {
      backgroundColor: '#FFF4EB',
    },
    tabCountText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textMuted,
    },
    tabCountTextActive: {
      color: colors.primary,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 130, // Clearance for bottom navigation bar
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 60,
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '600',
    },
    orderCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 22,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#F1F3F5',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderColor: '#F3F4F6',
      marginBottom: 12,
    },
    orderIdRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    orderIdText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.text,
    },
    dateDot: {
      fontSize: 12,
      color: colors.textMuted,
    },
    dateText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 10,
      borderWidth: 1,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    cardBody: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    orderImage: {
      width: 72,
      height: 72,
      borderRadius: 16,
      backgroundColor: '#F3F4F6',
      marginRight: 14,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    orderInfo: {
      flex: 1,
    },
    orderTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    orderName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 3,
    },
    viewDetailsArrow: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textMuted,
      marginLeft: 6,
    },
    itemsSummary: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 16,
      marginBottom: 6,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
    },
    priceLabel: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '600',
    },
    priceValue: {
      fontSize: 16,
      fontWeight: '900',
      color: colors.primary,
    },
    detailsHint: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: '700',
      marginLeft: 4,
    },
    cardFooter: {
      paddingTop: 12,
      borderTopWidth: 1,
      borderColor: '#F3F4F6',
    },
    actionButtonGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    cancelBtn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 14,
      backgroundColor: '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelBtnText: {
      color: '#6B7280',
      fontSize: 13,
      fontWeight: '700',
    },
    trackBtn: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 3,
    },
    trackBtnText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },
    reviewBtn: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: '#FFF4EB',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.25)',
    },
    reviewBtnText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '800',
    },
    reorderBtn: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    reorderBtnText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },
    refundInfoBox: {
      flex: 1,
    },
    refundText: {
      fontSize: 11,
      color: '#059669',
      fontWeight: '700',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
      paddingHorizontal: 30,
    },
    emptyIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#FFF4EB',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 6,
      textAlign: 'center',
    },
    emptySubText: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 19,
      marginBottom: 24,
    },
    exploreBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 28,
      borderRadius: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 3,
    },
    exploreBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
    guestContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
      marginTop: 60,
    },
    guestIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#FFF4EB',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    guestTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    guestSubText: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 19,
      marginBottom: 26,
    },
    loginButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 22,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    endOfListRow: {
      alignItems: 'center',
      paddingVertical: 20,
      opacity: 0.6,
    },
    endOfListText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
  });
