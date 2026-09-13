import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { StarIcon, ClockIcon } from '../icons';
import { useThemeColors, ThemeColors } from '../../theme/colors';

interface TrackingRiderCardProps {
  riderName?: string;
  riderPhone?: string;
  rating?: string;
  vehicleInfo?: string;
  profilePicture?: string;
  isAssigned?: boolean;
}

export default function TrackingRiderCard({
  riderName,
  riderPhone,
  rating = '4.9',
  vehicleInfo = 'Delivery Partner',
  profilePicture,
  isAssigned = true,
}: TrackingRiderCardProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  if (!isAssigned) {
    return (
      <View style={styles.riderCard}>
        <View style={styles.searchingRow}>
          <View style={styles.searchingIconCircle}>
            <ClockIcon size={22} color={colors.primary} />
          </View>
          <View style={styles.searchingInfoCol}>
            <Text style={styles.searchingTitle}>Assigning Delivery Partner</Text>
            <Text style={styles.searchingSubtitle}>
              Connecting to the nearest verified rider near restaurant...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const displayName = riderName || 'Assigned Partner';
  const displayPhone = riderPhone || '';

  return (
    <View style={styles.riderCard}>
      <View style={styles.riderHeader}>
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.riderAvatarImg} />
        ) : (
          <View style={styles.riderAvatar}>
            <Text style={styles.riderAvatarText}>🛵</Text>
          </View>
        )}
        <View style={styles.riderInfoCol}>
          <View style={styles.riderNameRow}>
            <Text style={styles.riderName} numberOfLines={1}>
              {displayName}
            </Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
            </View>
          </View>
          <View style={styles.riderMetaRow}>
            <View style={styles.ratingBadge}>
              <StarIcon size={12} color="#F59E0B" />
              <Text style={styles.ratingText}> {rating}</Text>
            </View>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.vehicleText} numberOfLines={1}>
              {vehicleInfo}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Contact Buttons */}
      <View style={styles.contactRow}>
        <TouchableOpacity
          style={[styles.callButton, !displayPhone && { opacity: 0.5 }]}
          onPress={() => displayPhone && Linking.openURL(`tel:${displayPhone}`)}
          activeOpacity={0.8}
          disabled={!displayPhone}
        >
          <Text style={styles.callButtonText}>📞 Call Partner</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.msgButton, !displayPhone && { opacity: 0.5 }]}
          onPress={() => displayPhone && Linking.openURL(`sms:${displayPhone}`)}
          activeOpacity={0.8}
          disabled={!displayPhone}
        >
          <Text style={styles.msgButtonText}>💬 Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    riderCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 22,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#F1F3F5',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    searchingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 6,
    },
    searchingIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#FFF4EB',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.25)',
    },
    searchingInfoCol: {
      flex: 1,
    },
    searchingTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 2,
    },
    searchingSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 16,
    },
    riderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    riderAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#FFF4EB',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      borderWidth: 1.5,
      borderColor: 'rgba(232, 93, 34, 0.25)',
    },
    riderAvatarImg: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    riderAvatarText: {
      fontSize: 22,
    },
    riderInfoCol: {
      flex: 1,
    },
    riderNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    riderName: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      flexShrink: 1,
    },
    verifiedBadge: {
      backgroundColor: '#ECFDF5',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    verifiedBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#059669',
    },
    riderMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
      gap: 6,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#D97706',
    },
    metaDot: {
      color: colors.textMuted,
      fontSize: 10,
    },
    vehicleText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
      flexShrink: 1,
    },
    contactRow: {
      flexDirection: 'row',
      gap: 10,
    },
    callButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 10,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    callButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },
    msgButton: {
      flex: 1,
      backgroundColor: '#F3F4F6',
      paddingVertical: 10,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    msgButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
  });
