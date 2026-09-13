import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import NotificationSkeleton from '../../components/skeleton/NotificationSkeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { authFetch } from '../../utils/authFetch';
import { API_URL } from '../../config/api';
import Icons from '../../constants/icons';

type NotificationsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

const getIconForType = (type?: string) => {
  switch (type) {
    case 'order':
      return Icons.order;
    case 'delivery':
      return Icons.deliverymen;
    case 'promotion':
      return Icons.favorite;
    default:
      return Icons.notification;
  }
};

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationsNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_URL}/notifications`);
        if (res.ok) {
          const data = await res.json();
          // Backend returns { notifications: [], unreadCount: number }
          setNotifications(data.notifications || data || []);
          setUnreadCount(data.unreadCount || 0);
          // Mark all as read after fetching
          authFetch(`${API_URL}/notifications/mark-read`, { method: 'PUT' }).catch(() => {});
        }
      } catch (e) {
        console.error('Failed to fetch notifications:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#F7D055' }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7D055" />

      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image source={Icons.back} style={styles.backIconImg} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={styles.backBtnPlaceholder} />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {loading ? (
            <NotificationSkeleton count={5} />
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Image source={Icons.notification} style={styles.emptyIconImg} />
              </View>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySubtitle}>You're all caught up! We'll notify you when there's an update.</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {notifications.map((item, index) => (
                <View key={item._id || item.id || index} style={styles.notificationCard}>
                  <View style={styles.iconWrapper}>
                    <Image source={getIconForType(item.type)} style={styles.listIconImg} />
                  </View>
                  <View style={styles.textContent}>
                    <Text style={styles.notificationTitle}>{item.title || 'Order Update'}</Text>
                    <Text style={styles.notificationText}>{item.message || item.text || ''}</Text>
                    {item.createdAt && (
                      <Text style={styles.timeText}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F7D055',
    },
    container: {
      flex: 1,
      backgroundColor: colors.primary,
    },
    headerSection: {
      backgroundColor: '#F7D055',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 24,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    backIconImg: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      tintColor: colors.primary,
    },
    backBtnPlaceholder: {
      width: 40,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    contentSection: {
      flex: 1,
      backgroundColor: '#F8F9FA',
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      marginTop: -16,
      overflow: 'hidden',
    },
    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 40,
    },
    notificationCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: 14,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    iconWrapper: {
      backgroundColor: '#FFF4EB',
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    listIconImg: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
      tintColor: colors.primary,
    },
    textContent: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 3,
    },
    notificationText: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
      marginBottom: 4,
    },
    timeText: {
      fontSize: 11,
      color: '#9CA3AF',
      fontWeight: '500',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingTop: 80,
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
    emptyIconImg: {
      width: 36,
      height: 36,
      resizeMode: 'contain',
      tintColor: colors.primary,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 6,
    },
    emptySubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
    },
  });
