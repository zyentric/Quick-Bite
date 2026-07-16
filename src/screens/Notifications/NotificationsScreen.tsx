import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');

type NotificationsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

const NOTIFICATIONS = [
  { id: '1', title: 'We have added\na product you\nmight like.', icon: '🍽️' },
  { id: '2', title: 'One of your\nfavorite is on\npromotion.', icon: '🤍' },
  { id: '3', title: 'Your order has\nbeen delivered', icon: '🛍️' },
  { id: '4', title: 'The delivery is\non his way', icon: '🛵' },
];

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationsNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* Left side transparent area to allow clicking back or showing background */}
      <TouchableOpacity 
        style={styles.leftOverlay} 
        activeOpacity={1} 
        onPress={() => navigation.goBack()}
      />

      {/* Right side curved container */}
      <View style={styles.rightCurvedContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🔔</Text>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        {/* Notification List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {NOTIFICATIONS.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity style={styles.notificationRow} activeOpacity={0.7}>
                <View style={styles.iconWrapper}>
                  <Text style={styles.iconText}>{item.icon}</Text>
                </View>
                <Text style={styles.notificationText}>{item.title}</Text>
              </TouchableOpacity>
              {index < NOTIFICATIONS.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    // Using a transparent background so the previous screen shows through if we use a transparent modal presentation.
    // Otherwise, we'll just give it a solid background matching the Home screen for now.
    backgroundColor: '#FDD7C4', // Match home background for now
  },
  leftOverlay: {
    width: width * 0.15, // 15% width, similar to Profile Menu
  },
  rightCurvedContainer: {
    flex: 1, 
    backgroundColor: colors.primary, // Orange
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
  headerIcon: {
    fontSize: 24,
    color: '#fff',
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
  iconText: {
    fontSize: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white line
    width: '100%',
  }
});
