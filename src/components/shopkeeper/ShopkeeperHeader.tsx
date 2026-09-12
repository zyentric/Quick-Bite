import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { Icons } from '../../constants/icons';
import { ChefHatIcon, StoreFrontIcon } from '../icons/ShopkeeperIcons';

interface ShopkeeperHeaderProps {
  storeName: string;
  ownerName: string;
  isOpen: boolean;
  onToggleStatus: () => void;
  newOrdersCount: number;
  inKitchenCount: number;
  readyCount: number;
  totalRevenue: number;
  onOpenStoreModal: () => void;
  onLogoutPress: () => void;
}

export default function ShopkeeperHeader({
  storeName,
  ownerName,
  isOpen = true,
  onToggleStatus,
  newOrdersCount,
  inKitchenCount,
  readyCount,
  totalRevenue,
  onOpenStoreModal,
  onLogoutPress,
}: ShopkeeperHeaderProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.header}>
      {/* Top Row: Store Info & Action Icons */}
      <View style={styles.topRow}>
        <View style={styles.storeInfoSection}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={onOpenStoreModal}
            activeOpacity={0.8}
          >
            <ChefHatIcon size={26} color="#FFC72C" />
          </TouchableOpacity>

          <View style={styles.infoCol}>
            <View style={styles.badgeRow}>
              <Text style={styles.vendorSubtitle}>QuickBite Partner Kitchen</Text>
            </View>

            {/* Restaurant Name */}
            <Text style={styles.storeTitle} numberOfLines={1}>
              {storeName || ownerName || 'My Kitchen'}
            </Text>

            {/* Status Toggle Directly Below Store Name */}
            <TouchableOpacity
              style={[
                styles.statusPill,
                isOpen ? styles.statusPillOpen : styles.statusPillClosed,
              ]}
              onPress={onToggleStatus}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.statusIndicatorDot,
                  { backgroundColor: isOpen ? '#10B981' : '#EF4444' },
                ]}
              />
              <Text
                style={[
                  styles.statusPillText,
                  { color: isOpen ? '#10B981' : '#EF4444' },
                ]}
              >
                {isOpen ? 'Open for Orders • Tap to Pause' : 'Kitchen Closed • Tap to Open'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Right Action Buttons: Kitchen Settings & Logout */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.profileIconBtn}
            onPress={onOpenStoreModal}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Image source={Icons.myProfile} style={styles.profileIconImg} />
            <View style={[styles.dotBadge, { backgroundColor: isOpen ? '#10B981' : '#EF4444' }]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={onLogoutPress}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Image source={Icons.logout} style={styles.logoutIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* KPI Metrics Ribbon */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiBox}>
          <Text style={styles.kpiValue}>₹{totalRevenue.toFixed(0)}</Text>
          <Text style={styles.kpiLabel}>Today's Sales</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiBox}>
          <Text style={[styles.kpiValue, newOrdersCount > 0 && { color: '#FFD166' }]}>
            {newOrdersCount}
          </Text>
          <Text style={styles.kpiLabel}>New Placed</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiBox}>
          <Text style={styles.kpiValue}>{inKitchenCount}</Text>
          <Text style={styles.kpiLabel}>In Kitchen</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiBox}>
          <Text style={styles.kpiValue}>{readyCount}</Text>
          <Text style={styles.kpiLabel}>Dispatched</Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      backgroundColor: '#1E1B18', // Deep Charcoal Brand
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      paddingHorizontal: 18,
      paddingTop: Platform.OS === 'ios' ? 12 : 16,
      paddingBottom: 22,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    storeInfoSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
    },
    infoCol: {
      flex: 1,
    },
    avatarCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: 'rgba(255, 199, 44, 0.18)',
      borderWidth: 2,
      borderColor: '#FFC72C',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 3,
    },
    vendorSubtitle: {
      fontSize: 11,
      color: '#FFC72C',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    storeTitle: {
      fontSize: 19,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 0.2,
      marginBottom: 4,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 14,
      marginTop: 2,
      marginBottom: 4,
      borderWidth: 1,
    },
    statusPillOpen: {
      backgroundColor: 'rgba(16, 185, 129, 0.22)',
      borderColor: 'rgba(16, 185, 129, 0.5)',
    },
    statusPillClosed: {
      backgroundColor: 'rgba(239, 68, 68, 0.22)',
      borderColor: 'rgba(239, 68, 68, 0.5)',
    },
    statusIndicatorDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginRight: 6,
    },
    statusPillText: {
      fontSize: 11,
      fontWeight: '800',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    profileIconBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    profileIconImg: {
      width: 19,
      height: 19,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
    dotBadge: {
      position: 'absolute',
      top: -1,
      right: -1,
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: '#1E1B18',
    },
    logoutBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoutIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
    kpiContainer: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 20,
      paddingVertical: 14,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    kpiBox: {
      alignItems: 'center',
      flex: 1,
    },
    kpiValue: {
      fontSize: 18,
      fontWeight: '900',
      color: '#FFFFFF',
    },
    kpiLabel: {
      fontSize: 11,
      color: 'rgba(255, 255, 255, 0.85)',
      fontWeight: '600',
      marginTop: 3,
    },
    kpiDivider: {
      width: 1,
      height: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  });
