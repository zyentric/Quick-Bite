import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');

type CartNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

export default function CartScreen() {
  const navigation = useNavigation<CartNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const { cartItems, totalPrice, totalItems, updateQuantity } = useCart();

  const taxAndFees = cartItems.length > 0 ? 5.00 : 0;
  const deliveryFee = cartItems.length > 0 ? 3.00 : 0;
  const finalTotal = totalPrice + taxAndFees + deliveryFee;

  return (
    <SafeAreaView style={styles.container}>
      {/* Left side transparent overlay */}
      <TouchableOpacity 
        style={styles.leftOverlay} 
        activeOpacity={1} 
        onPress={() => navigation.goBack()}
      />

      {/* Right side curved container */}
      <View style={styles.rightCurvedContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('../../assets/cart.png')} style={styles.headerIconImg} />
          <Text style={styles.headerTitle}>Cart</Text>
        </View>

        {/* Content */}
        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptySeparator} />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <View style={styles.emptySeparator} />
            
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.addPromptText}>Want To Add{'\n'}Something?</Text>
          </View>
        ) : (
          <View style={styles.populatedContainer}>
            <Text style={styles.itemsCountText}>You have {totalItems} items in the cart</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.cartItemRow}>
                  <Image source={{ uri: item.image || 'https://via.placeholder.com/60' }} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemDate}>29/11/24{'\n'}12:00</Text>
                    <View style={styles.qtyControl}>
                      <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Text style={styles.qtyBtn}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Text style={styles.qtyBtn}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>₹{totalPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax and Fees</Text>
                <Text style={styles.totalValue}>₹{taxAndFees.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Delivery</Text>
                <Text style={styles.totalValue}>₹{deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.dottedLine} />
              <View style={styles.totalRow}>
                <Text style={styles.finalTotalLabel}>Total</Text>
                <Text style={styles.finalTotalValue}>₹{finalTotal.toFixed(2)}</Text>
              </View>

              <TouchableOpacity 
                style={styles.checkoutBtn}
                onPress={() => navigation.navigate('Checkout')}
              >
                <Text style={styles.checkoutBtnText}>Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FDD7C4', // Transparent or match home
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
    justifyContent: 'center',
    marginBottom: 40,
  },
  headerIconImg: {
    width: 24,
    height: 24,
    tintColor: '#fff',
    marginRight: 10,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptySeparator: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  addBtnText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '200',
  },
  addPromptText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  populatedContainer: {
    flex: 1,
    paddingHorizontal: 25,
  },
  itemsCountText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemPrice: {
    color: '#fff',
    fontSize: 14,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    textAlign: 'right',
    marginBottom: 10,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  qtyBtn: {
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 5,
  },
  qtyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  totalsContainer: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
    marginVertical: 15,
  },
  finalTotalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finalTotalValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutBtn: {
    backgroundColor: '#FDD7C4', // Light yellow/peach from mockup
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 30,
  },
  checkoutBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
