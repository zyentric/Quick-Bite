import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import RatingBottomSheet from '../../components/RatingBottomSheet';

type OrderConfirmedNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderConfirmed'>;
type OrderConfirmedRouteProp = RouteProp<RootStackParamList, 'OrderConfirmed'>;

export default function OrderConfirmedScreen() {
  const navigation = useNavigation<OrderConfirmedNavigationProp>();
  const route = useRoute<OrderConfirmedRouteProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const { orderId, destLat, destLng, addressLabel } = route.params || {};
  const [ratingSheetVisible, setRatingSheetVisible] = useState<boolean>(false);

  const goHome = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
    );
  };

  const goToOrders = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
    );
    setTimeout(() => navigation.navigate('MyOrders'), 100);
  };

  const trackOrder = () => {
    navigation.navigate('DeliveryTime', { orderId, destLat, destLng, addressLabel });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7D055" />
      <View style={styles.contentContainer}>
        {/* Success Graphic */}
        <View style={styles.successGraphic}>
          <View style={styles.graphicInnerCircle}>
            <Text style={styles.successEmoji}>✓</Text>
          </View>
        </View>

        <Text style={styles.titleText}>Order Confirmed!</Text>
        <Text style={styles.subtitleText}>
          Your order has been placed{'\n'}successfully. We're preparing it now!
        </Text>

        <TouchableOpacity onPress={trackOrder} style={styles.trackButton} activeOpacity={0.8}>
          <Text style={styles.trackButtonText}>Track My Order 🛵</Text>
        </TouchableOpacity>

        {/* Optional quick rate experience pill */}
        <TouchableOpacity
          onPress={() => setRatingSheetVisible(true)}
          style={styles.rateExperienceBtn}
          activeOpacity={0.75}
        >
          <Text style={styles.rateExperienceText}>⭐ Rate Ordering Experience</Text>
        </TouchableOpacity>
      </View>

      {/* Footer CTAs */}
      <View style={styles.bottomSection}>
        <Text style={styles.supportText}>
          If you have any questions, please reach out{'\n'}directly to our customer support.
        </Text>

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={goToOrders} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>My Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={goHome} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>

      <RatingBottomSheet
        visible={ratingSheetVisible}
        orderId={orderId || ''}
        orderNumber={orderId ? orderId.slice(-6).toUpperCase() : undefined}
        orderName="Placed Order"
        onClose={() => setRatingSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7D055' },
  contentContainer: {
    flex: 1, alignItems: 'center', paddingTop: 80, paddingHorizontal: 30,
  },
  successGraphic: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 4, borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 40, backgroundColor: 'rgba(255,255,255,0.3)',
  },
  graphicInnerCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  successEmoji: { fontSize: 44, color: '#fff', fontWeight: '900' },
  titleText: {
    fontSize: 30, fontWeight: 'bold', color: colors.text,
    marginBottom: 14, textAlign: 'center',
  },
  subtitleText: {
    fontSize: 15, color: colors.text, textAlign: 'center',
    marginBottom: 36, lineHeight: 22, opacity: 0.8,
  },
  trackButton: {
    backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 25, shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3,
    shadowRadius: 8, elevation: 5,
    marginBottom: 16,
  },
  trackButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  rateExperienceBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  rateExperienceText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  bottomSection: { paddingHorizontal: 24, paddingBottom: 30, alignItems: 'center' },
  supportText: {
    fontSize: 13, color: colors.textMuted, textAlign: 'center',
    lineHeight: 18, marginBottom: 20,
  },
  ctaRow: { flexDirection: 'row', gap: 14, width: '100%' },
  secondaryBtn: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 25,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 2, borderColor: colors.primary,
  },
  secondaryBtnText: { color: colors.primary, fontSize: 15, fontWeight: 'bold' },
  primaryBtn: {
    flex: 1, backgroundColor: colors.primary, borderRadius: 25,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
