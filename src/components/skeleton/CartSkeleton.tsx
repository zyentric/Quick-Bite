import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonPlaceholder from './SkeletonPlaceholder';

// ── Single Cart Item Row Skeleton ─────────────────────────────────────────────
export function CartItemSkeleton() {
  return (
    <View style={styles.cartItem}>
      <SkeletonPlaceholder width={72} height={72} borderRadius={16} style={styles.cartImg} />
      <View style={styles.cartInfo}>
        <SkeletonPlaceholder width="70%" height={15} borderRadius={6} style={styles.mb6} />
        <SkeletonPlaceholder width="45%" height={12} borderRadius={5} style={styles.mb8} />
        <SkeletonPlaceholder width={55} height={16} borderRadius={5} />
      </View>
      <View style={styles.cartQty}>
        <SkeletonPlaceholder width={28} height={28} borderRadius={14} />
        <SkeletonPlaceholder width={18} height={14} borderRadius={4} />
        <SkeletonPlaceholder width={28} height={28} borderRadius={14} />
      </View>
    </View>
  );
}

// ── Cart Summary Block Skeleton ────────────────────────────────────────────────
function CartSummarySkeleton() {
  return (
    <View style={styles.summary}>
      <SkeletonPlaceholder width={120} height={16} borderRadius={6} style={styles.mb12} />
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.summaryRow}>
          <SkeletonPlaceholder width="45%" height={13} borderRadius={5} />
          <SkeletonPlaceholder width={60} height={13} borderRadius={5} />
        </View>
      ))}
      <SkeletonPlaceholder width="100%" height={1} borderRadius={1} style={styles.divider} />
      <View style={styles.summaryRow}>
        <SkeletonPlaceholder width="35%" height={16} borderRadius={6} />
        <SkeletonPlaceholder width={75} height={16} borderRadius={6} />
      </View>
    </View>
  );
}

// ── Full Cart Screen Skeleton ──────────────────────────────────────────────────
export default function CartSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.section}>
          {Array.from({ length: count }).map((_, i) => (
            <CartItemSkeleton key={i} />
          ))}
        </View>

        {/* Summary */}
        <CartSummarySkeleton />
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Checkout CTA */}
      <View style={styles.ctaBar}>
        <SkeletonPlaceholder width="100%" height={54} borderRadius={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cartImg: { marginRight: 12 },
  cartInfo: { flex: 1 },
  cartQty: { flexDirection: 'column', alignItems: 'center', gap: 6 },
  summary: { margin: 16, padding: 16, backgroundColor: '#F9FAFB', borderRadius: 18 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  divider: { marginVertical: 12 },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },
  mb6: { marginBottom: 6 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
});
