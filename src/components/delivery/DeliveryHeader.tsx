import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { Icons } from '../../constants/icons';
import {
  DeliveryBikeIcon,
  ShieldCheckIcon,
  LightningIcon,
} from '../icons/DeliveryIcons';

interface DeliveryHeaderProps {
  partnerName: string;
  vehicleNumber?: string;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  isOnline?: boolean;
  onToggleStatus?: () => void;
  activeCount: number;
  availableCount: number;
  totalEarnings: number;
  onOpenProfile: () => void;
  onLogoutPress: () => void;
}

export default function DeliveryHeader({
  partnerName,
  vehicleNumber,
  verificationStatus = 'verified',
  isOnline = true,
  onToggleStatus,
  activeCount,
  availableCount,
  totalEarnings,
  onOpenProfile,
  onLogoutPress,
}: DeliveryHeaderProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const getVerificationLabel = () => {
    switch (verificationStatus) {
      case 'verified':
        return { text: 'Verified Partner', color: '#10B981', bg: 'rgba(16, 185, 129, 0.2)', dot: '#10B981' };
      case 'pending':
        return { text: 'Under Admin Review', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)', dot: '#F59E0B' };
      case 'rejected':
        return { text: 'Verification Rejected', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.2)', dot: '#EF4444' };
      default:
        return { text: 'KYC Required', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.2)', dot: '#EF4444' };
    }
  };

  const kyc = getVerificationLabel();

  return (
    <View style={styles.header}>
      {/* Top Bar with Profile Info on Left & Action Icons on Right */}
      <View style={styles.topRow}>
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={onOpenProfile}
            activeOpacity={0.8}
          >
            <DeliveryBikeIcon size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.infoCol}>
            <View style={styles.partnerBadgeRow}>
              <Text style={styles.partnerLabel}>QuickBite Hero</Text>
              <View style={[styles.kycTag, { backgroundColor: kyc.bg }]}>
                <ShieldCheckIcon size={12} color={kyc.color} />
                <Text style={[styles.kycTagText, { color: kyc.color }]}>{kyc.text}</Text>
              </View>
            </View>

            {/* Partner Name */}
            <Text style={styles.partnerName} numberOfLines={1}>
              {partnerName}
            </Text>

            {/* Status Toggle Directly Below Name */}
            <TouchableOpacity
              style={[
                styles.statusPill,
                isOnline ? styles.statusPillOnline : styles.statusPillOffline,
              ]}
              onPress={onToggleStatus}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.statusIndicatorDot,
                  { backgroundColor: isOnline ? '#10B981' : '#F59E0B' },
                ]}
              />
              <Text
                style={[
                  styles.statusPillText,
                  { color: isOnline ? '#10B981' : '#F59E0B' },
                ]}
              >
                {isOnline ? 'Online for Delivery • Tap to Pause' : 'Offline • Tap to go Online'}
              </Text>
            </TouchableOpacity>

            {vehicleNumber ? (
              <Text style={styles.vehicleText}>{vehicleNumber}</Text>
            ) : null}
          </View>
        </View>

        {/* Top Right Action Buttons: Profile & Logout */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.profileIconBtn}
            onPress={onOpenProfile}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Image source={Icons.myProfile} style={styles.profileIconImg} />
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
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

      {/* KPI Performance Metrics Bar */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiBox}>
          <Text style={styles.kpiValue}>{activeCount}</Text>
          <Text style={styles.kpiLabel}>In Transit</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiBox}>
          <Text style={styles.kpiValue}>{availableCount}</Text>
          <Text style={styles.kpiLabel}>Pickups Ready</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiBox}>
          <Text style={styles.kpiValue}>₹{totalEarnings}</Text>
          <Text style={styles.kpiLabel}>Est. Earnings</Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      paddingHorizontal: 18,
      paddingTop: Platform.OS === 'ios' ? 12 : 16,
      paddingBottom: 22,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 12,
      elevation: 8,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    profileSection: {
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
      backgroundColor: 'rgba(255, 255, 255, 0.22)',
      borderWidth: 2,
      borderColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    partnerBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 3,
    },
    partnerLabel: {
      fontSize: 11,
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    kycTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
    },
    kycTagText: {
      fontSize: 10,
      fontWeight: '800',
    },
    partnerName: {
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
    statusPillOnline: {
      backgroundColor: 'rgba(16, 185, 129, 0.22)',
      borderColor: 'rgba(16, 185, 129, 0.5)',
    },
    statusPillOffline: {
      backgroundColor: 'rgba(245, 158, 11, 0.22)',
      borderColor: 'rgba(245, 158, 11, 0.5)',
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
    vehicleText: {
      fontSize: 11,
      color: 'rgba(255, 255, 255, 0.85)',
      fontWeight: '600',
      marginTop: 1,
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
      backgroundColor: 'rgba(255, 255, 255, 0.22)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    profileIconImg: {
      width: 19,
      height: 19,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
    statusDot: {
      position: 'absolute',
      top: -1,
      right: -1,
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: '#FFFFFF',
    },
    logoutBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
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
      backgroundColor: 'rgba(255, 255, 255, 0.16)',
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
      fontSize: 19,
      fontWeight: '900',
      color: '#FFFFFF',
    },
    kpiLabel: {
      fontSize: 11,
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '600',
      marginTop: 3,
    },
    kpiDivider: {
      width: 1,
      height: 26,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
  });
