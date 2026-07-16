import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';

type OrderConfirmedNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderConfirmed'>;

export default function OrderConfirmedScreen() {
  const navigation = useNavigation<OrderConfirmedNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        {/* Animated Circle / Success Graphic Placeholder */}
        <View style={styles.successGraphic}>
          <View style={styles.graphicInnerCircle}>
            <View style={styles.graphicDot} />
          </View>
        </View>

        <Text style={styles.titleText}>¡Order Confirmed!</Text>
        <Text style={styles.subtitleText}>Your order has been placed{'\n'}successfully</Text>
        
        <Text style={styles.deliveryText}>Delivery by Thu, 29th, 4:00 PM</Text>
        
        <TouchableOpacity onPress={() => navigation.navigate('DeliveryTime')}>
          <Text style={styles.trackOrderLink}>Track my order</Text>
        </TouchableOpacity>
      </View>
      
      {/* Footer Text & Bottom Tabs */}
      <View style={styles.bottomSection}>
        <Text style={styles.supportText}>If you have any questions, please reach out{'\n'}directly to our customer support</Text>
        
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

    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7D055', // Yellow background
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
  backButtonText: {
    fontSize: 24,
    color: colors.primary, // Orange back arrow
    fontWeight: 'bold',
  },
  rightPlaceholder: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  successGraphic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary, // Orange ring
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  graphicInnerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.inputBackground, // Light peach inner circle
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 15,
  },
  graphicDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: colors.primary,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
  deliveryText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 20,
  },
  trackOrderLink: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  supportText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 40,
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
