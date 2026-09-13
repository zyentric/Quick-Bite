import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { FastDeliveryIcon, ShieldCheckIcon, CreditCardIcon, HeartIcon } from '../icons';

const { width } = Dimensions.get('window');

export default function HomeTrustBadges() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const trustItems = [
    {
      id: 'superfast',
      title: 'Superfast Delivery',
      subtitle: '⚡ 20–30 Mins • Live GPS Tracking',
      tag: 'LIGHTNING FAST',
      tagBg: '#FEF3C7',
      tagColor: '#D97706',
      iconBg: '#FFF4EB',
      iconColor: colors.primary,
      Icon: FastDeliveryIcon,
    },
    {
      id: 'safe',
      title: '100% Safe & Clean',
      subtitle: '🛡️ FSSAI Certified • Tamper-proof pack',
      tag: 'HYGIENIC',
      tagBg: '#DCFCE7',
      tagColor: '#16A34A',
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      Icon: ShieldCheckIcon,
    },
    {
      id: 'easypay',
      title: 'Easy & Secure Pay',
      subtitle: '💳 UPI, Cards, COD • Instant Refund',
      tag: 'ZERO HASSLE',
      tagBg: '#DBEAFE',
      tagColor: '#2563EB',
      iconBg: '#EFF6FF',
      iconColor: '#3B82F6',
      Icon: CreditCardIcon,
    },
  ];

  return (
    <View style={styles.wrapper}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>★ QUICKBITE PROMISE</Text>
        </View>
        <Text style={styles.headerTitle}>Why Food Lovers Trust Us</Text>
        <Text style={styles.headerSubtitle}>
          Top quality food, lightning speed delivery, and guaranteed happiness.
        </Text>
      </View>

      {/* Grid of Trust Cards */}
      <View style={styles.cardsContainer}>
        {trustItems.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
              <item.Icon size={24} color={item.iconColor} />
            </View>

            <View style={styles.cardContent}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.tagPill, { backgroundColor: item.tagBg }]}>
                  <Text style={[styles.tagText, { color: item.tagColor }]}>{item.tag}</Text>
                </View>
              </View>
              <Text style={styles.cardSub}>{item.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footer Assurance Banner */}
      <View style={styles.footerBanner}>
        <View style={styles.footerRow}>
          <HeartIcon size={14} color="#EF4444" filled />
          <Text style={styles.footerText}>
            Crafted with passion for authentic taste & great memories.
          </Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      marginTop: 20,
      marginBottom: 10,
      marginHorizontal: 16,
      backgroundColor: '#FFFDF9',
      borderRadius: 24,
      borderWidth: 1.2,
      borderColor: '#FDECC2',
      padding: 18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    header: {
      alignItems: 'center',
      marginBottom: 16,
    },
    headerBadge: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: '#FDE68A',
    },
    headerBadgeText: {
      fontSize: 10,
      fontWeight: '900',
      color: '#B45309',
      letterSpacing: 0.8,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '900',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 3,
    },
    headerSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 16,
      paddingHorizontal: 10,
    },
    cardsContainer: {
      gap: 10,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: 12,
      borderWidth: 1,
      borderColor: '#F3F4F6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    iconCircle: {
      width: 46,
      height: 46,
      borderRadius: 23,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    cardContent: {
      flex: 1,
    },
    cardTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 3,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },
    tagPill: {
      paddingHorizontal: 7,
      paddingVertical: 2.5,
      borderRadius: 6,
    },
    tagText: {
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.4,
    },
    cardSub: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
      lineHeight: 15,
    },
    footerBanner: {
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderColor: '#F5E6C8',
      alignItems: 'center',
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    footerText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '600',
    },
  });
