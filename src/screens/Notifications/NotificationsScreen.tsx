import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { authFetch } from '../../utils/authFetch';
import { API_URL } from '../../config/api';

const { width } = Dimensions.get('window');

type NotificationsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

const getIconForType = (type?: string) => {
  switch (type) {
    case 'order': return require('../../assets/order.png');
    case 'delivery': return require('../../assets/deliverymen.png');
    case 'promotion': return require('../../assets/favorite.png');
    default: return require('../../assets/notification.png');
  }
};

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationsNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_URL}/notifications`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
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
    <SafeAreaView style={styles.container}>
      {/* Left side transparent area */}
      <TouchableOpacity
        style={styles.leftOverlay}
        activeOpacity={1}
        onPress={() => navigation.goBack()}
      />

      {/* Right side curved container */}
      <View style={styles.rightCurvedContainer}>

        {/* Header */}
        <View style={styles.header}>
          <Image source={require('../../assets/notification.png')} style={styles.headerIconImg} />
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        {/* Notification List */}
        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
        ) : notifications.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 16 }}>No notifications yet.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {notifications.map((item, index) => (
              <View key={item._id || item.id || index}>
                <TouchableOpacity style={styles.notificationRow} activeOpacity={0.7}>
                  <View style={styles.iconWrapper}>
                    <Image source={getIconForType(item.type)} style={styles.listIconImg} />
                  </View>
                  <Text style={styles.notificationText}>{item.title || item.message}</Text>
                </TouchableOpacity>
                {index < notifications.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FDD7C4',
  },
  leftOverlay: {
    width: width * 0.15,
  },
  rightCurvedContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    paddingTop: 60,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  headerIconImg: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#fff',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 80,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconWrapper: {
    backgroundColor: '#fff',
    width: 45,
    height: 45,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  listIconImg: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
  }
});
