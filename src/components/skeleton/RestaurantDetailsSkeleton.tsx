import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonPlaceholder from './SkeletonPlaceholder';

// ── Single Restaurant Menu Item Row Skeleton ──────────────────────────────────
export function RestaurantMenuItemSkeleton() {
  return (
    <View style={styles.menuItem}>
      <SkeletonPlaceholder width={80} height={80} borderRadius={12} style={styles.menuImg} />
      <View style={styles.menuInfo}>
        <SkeletonPlaceholder width="70%" height={15} borderRadius={6} style={styles.mb6} />
        <SkeletonPlaceholder width="90%" height={11} borderRadius={5} style={styles.mb4} />
        <SkeletonPlaceholder width="55%" height={11} borderRadius={5} style={styles.mb8} />
        <SkeletonPlaceholder width={50} height={15} borderRadius={5} />
      </View>
      <SkeletonPlaceholder width={36} height={36} borderRadius={18} />
    </View>
  );
}

// ── Full Restaurant Details Screen Skeleton ───────────────────────────────────
export default function RestaurantDetailsSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <SkeletonPlaceholder width="100%" height={220} borderRadius={0} />

      {/* Back button */}
      <View style={styles.backBtn}>
        <SkeletonPlaceholder width={40} height={40} borderRadius={20} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <View style={styles.infoBlock}>
          <View style={styles.nameRow}>
            <SkeletonPlaceholder width="60%" height={22} borderRadius={8} />
            <SkeletonPlaceholder width={55} height={26} borderRadius={13} />
          </View>
          <SkeletonPlaceholder width="75%" height={13} borderRadius={5} style={styles.mb12} />
          <View style={styles.divider} />
          <SkeletonPlaceholder width={80} height={18} borderRadius={6} style={styles.mb12} />
        </View>

        {/* Menu Items */}
        {[0, 1, 2, 3, 4].map((i) => (
          <RestaurantMenuItemSkeleton key={i} />
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  backBtn: { position: 'absolute', top: 50, left: 16 },
  content: { flex: 1 },
  infoBlock: { padding: 16 },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
  },
  menuImg: { marginRight: 12 },
  menuInfo: { flex: 1 },
  mb4: { marginBottom: 4 },
  mb6: { marginBottom: 6 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
});
