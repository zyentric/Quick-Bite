import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonPlaceholder from './SkeletonPlaceholder';

// ── Product Detail Screen Skeleton ────────────────────────────────────────────
export default function ProductDetailSkeleton() {
  return (
    <View style={styles.container}>
      {/* Hero Image Banner */}
      <SkeletonPlaceholder width="100%" height={280} borderRadius={0} />

      {/* Back + Fav buttons overlay */}
      <View style={styles.heroOverlay}>
        <SkeletonPlaceholder width={40} height={40} borderRadius={20} />
        <SkeletonPlaceholder width={40} height={40} borderRadius={20} />
      </View>

      {/* Content Card */}
      <ScrollView style={styles.contentCard} showsVerticalScrollIndicator={false}>
        {/* Category badge + Title */}
        <View style={styles.badgeRow}>
          <SkeletonPlaceholder width={70} height={22} borderRadius={11} />
          <SkeletonPlaceholder width={55} height={22} borderRadius={11} />
        </View>

        <SkeletonPlaceholder width="85%" height={24} borderRadius={8} style={styles.mb8} />
        <SkeletonPlaceholder width="60%" height={17} borderRadius={6} style={styles.mb16} />

        {/* Rating + delivery info */}
        <View style={styles.metaRow}>
          <SkeletonPlaceholder width={60} height={28} borderRadius={14} />
          <SkeletonPlaceholder width={1} height={20} borderRadius={1} />
          <SkeletonPlaceholder width={70} height={14} borderRadius={5} />
          <SkeletonPlaceholder width={1} height={20} borderRadius={1} />
          <SkeletonPlaceholder width={55} height={14} borderRadius={5} />
        </View>

        {/* Divider */}
        <SkeletonPlaceholder width="100%" height={1} borderRadius={1} style={styles.divider} />

        {/* Description */}
        <SkeletonPlaceholder width={110} height={16} borderRadius={6} style={styles.mb8} />
        <SkeletonPlaceholder width="100%" height={12} borderRadius={5} style={styles.mb6} />
        <SkeletonPlaceholder width="95%" height={12} borderRadius={5} style={styles.mb6} />
        <SkeletonPlaceholder width="80%" height={12} borderRadius={5} style={styles.mb16} />

        {/* Spice level / tags row */}
        <View style={styles.tagsRow}>
          {[65, 70, 55, 80].map((w, i) => (
            <SkeletonPlaceholder key={i} width={w} height={28} borderRadius={14} />
          ))}
        </View>

        {/* Add-ons section */}
        <SkeletonPlaceholder width={130} height={16} borderRadius={6} style={styles.mb12} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.addonRow}>
            <View style={styles.addonLeft}>
              <SkeletonPlaceholder width={20} height={20} borderRadius={10} />
              <SkeletonPlaceholder width={110} height={13} borderRadius={5} />
            </View>
            <SkeletonPlaceholder width={45} height={13} borderRadius={5} />
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA Bar */}
      <View style={styles.ctaBar}>
        <View style={styles.ctaQty}>
          <SkeletonPlaceholder width={28} height={28} borderRadius={14} />
          <SkeletonPlaceholder width={24} height={18} borderRadius={5} />
          <SkeletonPlaceholder width={28} height={28} borderRadius={14} />
        </View>
        <SkeletonPlaceholder width="65%" height={50} borderRadius={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  heroOverlay: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentCard: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  addonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addonLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },
  ctaQty: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  divider: { marginVertical: 16 },
  mb6: { marginBottom: 6 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
});
