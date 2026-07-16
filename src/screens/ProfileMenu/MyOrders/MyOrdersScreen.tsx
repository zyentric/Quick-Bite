import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';

const { width } = Dimensions.get('window');

type MyOrdersNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyOrders'>;

type TabType = 'Active' | 'Completed' | 'Cancelled';

const activeOrdersMock = [
  { id: '1', name: 'Strawberry shake', date: '29 Nov, 01:20 pm', itemsCount: 2, price: 20.0, image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=2670&auto=format&fit=crop' }
];

const completedOrdersMock = [
  { id: '2', name: 'Chicken Curry', date: '29 Nov, 01:20 pm', itemsCount: 2, price: 50.0, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2424&auto=format&fit=crop' },
  { id: '3', name: 'Bean and Vegetable Burger', date: '10 Nov, 01:05 pm', itemsCount: 2, price: 50.0, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2565&auto=format&fit=crop' },
  { id: '4', name: 'Coffee Latte', date: '10 Nov, 02:00 am', itemsCount: 1, price: 8.0, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=2564&auto=format&fit=crop' },
  { id: '5', name: 'Strawberry Cheesecake', date: '03 Oct, 03:40 pm', itemsCount: 2, price: 22.0, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=2565&auto=format&fit=crop' }
];

const cancelledOrdersMock = [
  { id: '6', name: 'Sushi Wave', date: '02 Nov, 06:00 am', itemsCount: 3, price: 103.0, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2670&auto=format&fit=crop' },
  { id: '7', name: 'Fruit and Berry Tea', date: '12 Oct, 03:15 pm', itemsCount: 2, price: 15.0, image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2671&auto=format&fit=crop' }
];


export default function MyOrdersScreen() {
  const navigation = useNavigation<MyOrdersNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const [activeTab, setActiveTab] = useState<TabType>('Active');

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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📄</Text>
      <Text style={styles.emptyText}>You don't have any{'\n'}active orders at this time</Text>
    </View>
  );

  const renderActiveList = () => {
    if (activeOrdersMock.length === 0) return renderEmptyState();
    
    return activeOrdersMock.map(order => (
      <View key={order.id} style={styles.orderCard}>
        <Image source={{uri: order.image}} style={styles.orderImage} />
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderName}>{order.name}</Text>
            <Text style={styles.orderPrice}>${order.price.toFixed(2)}</Text>
          </View>
          <View style={styles.orderSubInfo}>
            <Text style={styles.orderDate}>{order.date}</Text>
            <Text style={styles.orderItems}>{order.itemsCount} items</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={() => navigation.navigate('CancelOrder')}
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
    return completedOrdersMock.map(order => (
      <View key={order.id} style={styles.orderCard}>
        <Image source={{uri: order.image}} style={styles.orderImage} />
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderName}>{order.name}</Text>
            <Text style={styles.orderPrice}>${order.price.toFixed(2)}</Text>
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
    return cancelledOrdersMock.map(order => (
      <View key={order.id} style={styles.orderCard}>
        <Image source={{uri: order.image}} style={styles.orderImage} />
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderName}>{order.name}</Text>
            <Text style={styles.orderPrice}>${order.price.toFixed(2)}</Text>
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
          <Text style={styles.backButtonText}>{'<'}</Text>
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
    backgroundColor: colors.primaryBackground, // Yellow top
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
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rightPlaceholder: {
    width: 40, // Match back button to perfectly center title
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background, // White background
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
    backgroundColor: colors.inputBackground, // Light grey/yellow
  },
  tabButtonActive: {
    backgroundColor: colors.primary, // Orange
  },
  tabText: {
    fontSize: 14,
    color: colors.primary, // Orange text when inactive (mockup style)
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
    opacity: 0.2, // Watermark style
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
    backgroundColor: '#fff', // Or colors.surface
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
    color: colors.primary, // Orange
  },
  orderSubInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  orderItems: {
    fontSize: 12,
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Using space-between to match mockup
    gap: 10, // If using gap
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
    backgroundColor: colors.inputBackground, // Light orange tint based on mockup
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
