import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';

type PaymentNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;

export default function PaymentScreen() {
  const navigation = useNavigation<PaymentNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const { cartItems, totalPrice } = useCart();
  const taxAndFees = cartItems.length > 0 ? 5.00 : 0;
  const deliveryFee = cartItems.length > 0 ? 3.00 : 0;
  const finalTotal = totalPrice + taxAndFees + deliveryFee;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Shipping Address */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <TouchableOpacity><Text style={styles.editIcon}>✏️</Text></TouchableOpacity>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>778 Locust View Drive Oaklanda, CA</Text>
          </View>

          {/* Order Summary (condensed) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.summaryBox}>
            <View style={styles.summaryItems}>
              {cartItems.map(item => (
                <View key={item.id} style={styles.summaryItemRow}>
                  <Text style={styles.summaryItemName}>{item.name}</Text>
                  <Text style={styles.summaryItemQty}>{item.quantity} items</Text>
                </View>
              ))}
            </View>
            <Text style={styles.summaryTotalText}>${finalTotal.toFixed(2)}</Text>
          </View>

          {/* Payment Method */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.paymentBox}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardIcon}>💳</Text>
              <Text style={styles.cardType}>Credit Card</Text>
            </View>
            <View style={styles.cardDetailsBox}>
              <Text style={styles.cardNumber}>*** *** *** 43</Text>
              <Text style={styles.cardExpiry}>/00 /000</Text>
            </View>
          </View>

          {/* Delivery Time */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Delivery Time</Text>
          </View>
          <View style={styles.deliveryBox}>
            <Text style={styles.deliverySub}>Estimated Delivery</Text>
            <Text style={styles.deliveryTime}>25 mins</Text>
          </View>

        </ScrollView>
        
        {/* Bottom Tabs matching mockup + Pay Now Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={styles.payNowBtn} 
            onPress={() => navigation.navigate('OrderConfirmed')}
          >
            <Text style={styles.payNowBtnText}>Pay Now</Text>
          </TouchableOpacity>

          <View style={styles.bottomTabsContainer}>
            <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate('MainTabs')}>
              <Text style={styles.tabIcon}>🏠</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn}>
              <Text style={styles.tabIcon}>🍽️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn}>
              <Text style={styles.tabIcon}>🤍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn}>
              <Text style={styles.tabIcon}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn}>
              <Text style={styles.tabIcon}>🎧</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7D055', // Yellow from mockup
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary, // Orange back arrow
    fontWeight: 'bold',
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 150, // Space for bottom section
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  editIcon: {
    fontSize: 14,
  },
  editBtn: {
    backgroundColor: colors.inputBackground, // Light peach
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  editBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  addressBox: {
    backgroundColor: colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  addressText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryItems: {
    flex: 1,
  },
  summaryItemRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  summaryItemName: {
    color: colors.textMuted,
    fontSize: 12,
    marginRight: 10,
  },
  summaryItemQty: {
    color: colors.primary,
    fontSize: 12,
  },
  summaryTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  paymentBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  cardType: {
    fontSize: 14,
    color: colors.textMuted,
  },
  cardDetailsBox: {
    flexDirection: 'row',
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  cardNumber: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  cardExpiry: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  deliveryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  deliverySub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  deliveryTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  payNowBtn: {
    backgroundColor: colors.inputBackground, // Light peach button
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginBottom: 20, // Space between btn and tabs
  },
  payNowBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomTabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  tabBtn: {
    padding: 5,
  },
  tabIcon: {
    fontSize: 20,
    color: '#fff',
  }
});
