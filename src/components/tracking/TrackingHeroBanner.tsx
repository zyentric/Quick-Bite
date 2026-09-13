import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FastDeliveryIcon } from '../icons';
import { useThemeColors, ThemeColors } from '../../theme/colors';

interface TrackingHeroBannerProps {
  eta: string;
  statusDescription: string;
  deliveryOtp?: string;
  isDelivered?: boolean;
}

export default function TrackingHeroBanner({
  eta,
  statusDescription,
  deliveryOtp,
  isDelivered = false,
}: TrackingHeroBannerProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.heroBanner}>
      <View style={styles.heroBannerTop}>
        <View>
          <View style={styles.liveTagRow}>
            <Animated.View style={[styles.liveDot, isDelivered ? { backgroundColor: '#059669', opacity: 1 } : { opacity: pulseAnim }]} />
            <Text style={[styles.liveTagText, isDelivered && { color: '#059669' }]}>
              {isDelivered ? 'COMPLETED' : 'LIVE TRACKING'}
            </Text>
          </View>
          <Text style={[styles.etaText, isDelivered && { fontSize: 22, color: '#059669' }]}>
            {eta}
          </Text>
        </View>

        {isDelivered ? (
          <View style={[styles.otpBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Text style={[styles.otpLabel, { color: '#059669' }]}>STATUS</Text>
            <Text style={[styles.otpValue, { color: '#059669', fontSize: 14, marginTop: 4 }]}>DELIVERED ✓</Text>
          </View>
        ) : deliveryOtp ? (
          <View style={styles.otpBox}>
            <Text style={styles.otpLabel}>DELIVERY PIN</Text>
            <Text style={styles.otpValue}>{deliveryOtp}</Text>
          </View>
        ) : (
          <View style={styles.otpBox}>
            <Text style={styles.otpLabel}>DELIVERY PIN</Text>
            <Text style={styles.otpValue}>••••</Text>
          </View>
        )}
      </View>

      <View style={styles.heroDivider} />

      <View style={styles.statusDescRow}>
        <FastDeliveryIcon size={18} color={colors.primary} />
        <Text style={styles.statusDescText}>{statusDescription}</Text>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    heroBanner: {
      backgroundColor: '#FFFFFF',
      borderRadius: 22,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#F1F3F5',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    heroBannerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    liveTagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#10B981',
    },
    liveTagText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#10B981',
      letterSpacing: 0.5,
    },
    etaText: {
      fontSize: 26,
      fontWeight: '900',
      color: colors.primary,
    },
    otpBox: {
      backgroundColor: '#FFF4EB',
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.2)',
    },
    otpLabel: {
      fontSize: 9,
      fontWeight: '800',
      color: '#E85D22',
      letterSpacing: 0.5,
    },
    otpValue: {
      fontSize: 18,
      fontWeight: '900',
      color: '#E85D22',
      marginTop: 2,
    },
    heroDivider: {
      height: 1,
      backgroundColor: '#F3F4F6',
      marginVertical: 12,
    },
    statusDescRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusDescText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
  });
