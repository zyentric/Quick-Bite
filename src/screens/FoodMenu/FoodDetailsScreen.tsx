import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';

type FoodDetailsRouteProp = RouteProp<RootStackParamList, 'FoodDetails'>;
type FoodDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodDetails'>;

export default function FoodDetailsScreen() {
  const navigation = useNavigation<FoodDetailsNavigationProp>();
  const route = useRoute<FoodDetailsRouteProp>();
  const { item } = route.params;
  
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});

  const handleToggleAddOn = (id: string) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddToCart = () => {
    // In a real app we'd calculate the final price with add-ons and create a unique cart item
    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }
    navigation.navigate('Cart');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{item.name}</Text>
        <TouchableOpacity style={styles.heartBtn}>
          <Image source={require('../../assets/favorite.png')} style={styles.favoriteIconImg} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.ratingBadgeHeader}>
        <Text style={styles.ratingTextHeader}>★ {item.rating?.toFixed(1)}</Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Image Box */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.mainImage} resizeMode="cover" />
            
            {/* Discount Badge */}
            {item.discountBadge && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{item.discountBadge}</Text>
              </View>
            )}
          </View>

          {/* Price & Quantity Row */}
          <View style={styles.priceRow}>
            <View style={styles.priceLeftContainer}>
              <Text style={styles.priceText}>₹{item.price.toFixed(2)}</Text>
              {item.originalPrice && (
                <Text style={styles.originalPriceText}>₹{item.originalPrice.toFixed(2)}</Text>
              )}
            </View>
            
            <View style={styles.qtyControl}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                <Text style={styles.qtyBtn}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                <Text style={styles.qtyBtn}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.descriptionText}>{item.description}</Text>

          {/* Customizations / Add-ons */}
          {item.customizations && item.customizations.map((section, idx) => (
            <View key={idx} style={styles.customizationSection}>
              <Text style={styles.customizationTitle}>{section.title}</Text>
              
              {section.options.map(option => (
                <View key={option.id} style={styles.optionRow}>
                  <Text style={styles.optionName}>{option.name}</Text>
                  <View style={styles.optionRight}>
                    <Text style={styles.optionPrice}>₹{option.price.toFixed(2)}</Text>
                    <TouchableOpacity onPress={() => handleToggleAddOn(option.id)}>
                      <View style={[styles.radioOuter, selectedAddOns[option.id] && styles.radioOuterSelected]}>
                        {selectedAddOns[option.id] && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
          
        </ScrollView>
        
        {/* Add to Cart Button */}
        <View style={styles.bottomBtnContainer}>
          <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
            <Image source={require('../../assets/cart.png')} style={styles.cartIconImg} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>


    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7D055', // Yellow header area
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 10,
  },
  backIconImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  heartBtn: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIconImg: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  ratingBadgeHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: -5,
  },
  ratingTextHeader: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    paddingBottom: 150, // Space for button and tabs
  },
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: -5,
    right: 15,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30, // Making it circular for simplicity, though mockup is jagged
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '15deg' }], // Slight tilt
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  discountBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  priceLeftContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 10,
  },
  originalPriceText: {
    fontSize: 14,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    fontSize: 20,
    color: '#fff',
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  descriptionText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 25,
  },
  customizationSection: {
    marginBottom: 20,
  },
  customizationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    borderStyle: 'dashed',
    paddingBottom: 5,
  },
  optionName: {
    fontSize: 12,
    color: colors.textMuted,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionPrice: {
    fontSize: 12,
    color: colors.textMuted,
    marginRight: 10,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  bottomBtnContainer: {
    position: 'absolute',
    bottom: 80, // Above tabs
    width: '100%',
    alignItems: 'center',
  },
  addToCartBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
  },
  cartIconImg: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#fff',
    marginRight: 10,
  },
  addToCartText: {
    color: '#fff',
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
    position: 'absolute',
    bottom: 0,
  },
  tabBtn: {
    padding: 5,
  },
  tabIcon: {
    fontSize: 20,
    color: '#fff',
  }
});
