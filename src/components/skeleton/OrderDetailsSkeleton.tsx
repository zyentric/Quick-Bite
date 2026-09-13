import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonPlaceholder from './SkeletonPlaceholder';

// ── Order Timeline Step Skeleton ──────────────────────────────────────────────
function TimelineStepSkeleton({ isLast = false }: { isLast?: boolean }) {
  return (
    <View style={styles.timelineStep}>
      <View style={styles.timelineLeft}>
        <SkeletonPlaceholder width={32} height={32} borderRadius={16} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineRight}>
        <SkeletonPlaceholder width="55%" height={14} borderRadius={6} style={styles.mb4} />
        <SkeletonPlaceholder width="75%" height={11} borderRadius={5} />
      </View>
    </View>
  );
}

// ── Order Detail Address Card Skeleton ────────────────────────────────────────
function AddressCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <SkeletonPlaceholder width={18} height={18} borderRadius={9} />
        <SkeletonPlaceholder width={130} height={14} borderRadius={6} />
      </View>
      <SkeletonPlaceholder width="85%" height={12} borderRadius={5} style={styles.mb4} />
      <SkeletonPlaceholder width="65%" height={12} borderRadius={5} />
    </View>
  );
}

// ── Order Items Breakdown Skeleton ────────────────────────────────────────────
function ItemsCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <SkeletonPlaceholder width={18} height={18} borderRadius={9} />
        <SkeletonPlaceholder width={100} height={14} borderRadius={6} />
      </View>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.itemRow}>
          <SkeletonPlaceholder width={56} height={56} borderRadius={12} style={styles.itemImg} />
          <View style={styles.itemInfo}>
            <SkeletonPlaceholder width="65%" height={13} borderRadius={5} style={styles.mb4} />
            <SkeletonPlaceholder width="40%" height={11} borderRadius={5} />
          </View>
          <SkeletonPlaceholder width={50} height={14} borderRadius={5} />
        </View>
      ))}
    </View>
  );
}

// ── Payment Summary Skeleton ───────────────────────────────────────────────────
function PaymentCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonPlaceholder width={130} height={14} borderRadius={6} style={styles.mb12} />
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.payRow}>
          <SkeletonPlaceholder width="45%" height={12} borderRadius={5} />
          <SkeletonPlaceholder width={60} height={12} borderRadius={5} />
        </View>
      ))}
      <SkeletonPlaceholder width="100%" height={1} borderRadius={1} style={styles.divider} />
      <View style={styles.payRow}>
        <SkeletonPlaceholder width="35%" height={15} borderRadius={6} />
        <SkeletonPlaceholder width={70} height={15} borderRadius={6} />
      </View>
    </View>
  );
}

// ── Full Order Details Screen Skeleton ────────────────────────────────────────
export default function OrderDetailsSkeleton() {
  return (
    <View style={styles.container}>
      {/* Status badge hero */}
      <View style={styles.statusHero}>
        <SkeletonPlaceholder width={120} height={36} borderRadius={18} style={styles.mb8} />
        <SkeletonPlaceholder width={90} height={20} borderRadius={10} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Timeline */}
        <View style={styles.card}>
          {[0, 1, 2, 3].map((i) => (
            <TimelineStepSkeleton key={i} isLast={i === 3} />
          ))}
        </View>

        {/* Rider info */}
        <View style={styles.card}>
          <View style={styles.riderRow}>
            <SkeletonPlaceholder width={52} height={52} borderRadius={26} />
            <View style={styles.riderInfo}>
              <SkeletonPlaceholder width="60%" height={14} borderRadius={6} style={styles.mb6} />
              <SkeletonPlaceholder width="45%" height={11} borderRadius={5} />
            </View>
            <SkeletonPlaceholder width={70} height={34} borderRadius={17} />
          </View>
        </View>

        {/* Delivery PIN card */}
        <View style={[styles.card, styles.pinCard]}>
          <SkeletonPlaceholder width={90} height={12} borderRadius={5} style={styles.mb8} />
          <SkeletonPlaceholder width={110} height={38} borderRadius={12} />
        </View>

        {/* Address */}
        <AddressCardSkeleton />

        {/* Items */}
        <ItemsCardSkeleton />

        {/* Payment */}
        <PaymentCardSkeleton />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.actionBar}>
        <SkeletonPlaceholder width="47%" height={48} borderRadius={14} />
        <SkeletonPlaceholder width="47%" height={48} borderRadius={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  statusHero: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  scrollContent: { flex: 1, paddingHorizontal: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  // Timeline
  timelineStep: { flexDirection: 'row', marginBottom: 8 },
  timelineLeft: { alignItems: 'center', marginRight: 12 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#F0F0F0', marginTop: 4, minHeight: 22 },
  timelineRight: { flex: 1, paddingVertical: 4 },
  // Rider
  riderRow: { flexDirection: 'row', alignItems: 'center' },
  riderInfo: { flex: 1, marginLeft: 12 },
  // PIN
  pinCard: { alignItems: 'center', paddingVertical: 20 },
  // Items
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemImg: { marginRight: 12 },
  itemInfo: { flex: 1 },
  // Payment
  payRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  divider: { marginVertical: 10 },
  // Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },
  mb4: { marginBottom: 4 },
  mb6: { marginBottom: 6 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
});
