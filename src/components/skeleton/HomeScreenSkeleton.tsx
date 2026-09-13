import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonPlaceholder from './SkeletonPlaceholder';

// ── FoodCard Skeleton (155px wide, horizontal list) ──────────────────────────
export function FoodCardSkeleton({ width = 155 }: { width?: number }) {
  return (
    <View style={[styles.foodCard, { width }]}>
      {/* Image + rating badge */}
      <View style={styles.foodImageWrapper}>
        <SkeletonPlaceholder width="100%" height={105} borderRadius={0} />
        <View style={styles.foodRatingBadge}>
          <SkeletonPlaceholder width={38} height={14} borderRadius={7} />
        </View>
      </View>
      {/* Content */}
      <View style={styles.foodContent}>
        <SkeletonPlaceholder width="75%" height={14} borderRadius={6} style={{ marginBottom: 5 }} />
        <SkeletonPlaceholder width="90%" height={11} borderRadius={5} style={{ marginBottom: 10 }} />
        <View style={styles.foodBottomRow}>
          <SkeletonPlaceholder width={40} height={14} borderRadius={5} />
          <SkeletonPlaceholder width={28} height={28} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}

// ── RestaurantCard Skeleton (220px wide, horizontal list) ─────────────────────
export function RestaurantCardSkeleton({ width = 220 }: { width?: number }) {
  return (
    <View style={[styles.restCard, { width }]}>
      {/* Banner image */}
      <SkeletonPlaceholder width="100%" height={110} borderRadius={0} />
      {/* Info block */}
      <View style={styles.restInfo}>
        <View style={styles.restTitleRow}>
          <SkeletonPlaceholder width="60%" height={14} borderRadius={6} />
          <SkeletonPlaceholder width={38} height={18} borderRadius={9} />
        </View>
        <SkeletonPlaceholder width="45%" height={11} borderRadius={5} style={{ marginVertical: 5 }} />
        <View style={styles.restMetaRow}>
          <SkeletonPlaceholder width={70} height={18} borderRadius={9} />
          <SkeletonPlaceholder width={55} height={14} borderRadius={5} />
        </View>
      </View>
    </View>
  );
}

// ── Section Header Skeleton ────────────────────────────────────────────────────
function SectionHeaderSkeleton() {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <SkeletonPlaceholder width={140} height={16} borderRadius={7} style={{ marginBottom: 5 }} />
        <SkeletonPlaceholder width={100} height={11} borderRadius={5} />
      </View>
      <SkeletonPlaceholder width={55} height={22} borderRadius={11} />
    </View>
  );
}

// ── Category Pill Row Skeleton ─────────────────────────────────────────────────
function CategoriesSkeleton() {
  return (
    <View style={styles.pillRow}>
      {[80, 70, 65, 80, 72].map((w, i) => (
        <SkeletonPlaceholder key={i} width={w} height={36} borderRadius={18} style={styles.pill} />
      ))}
    </View>
  );
}

// ── Banner Carousel Skeleton ───────────────────────────────────────────────────
function BannerSkeleton() {
  return (
    <View style={styles.bannerWrapper}>
      <SkeletonPlaceholder width="100%" height={150} borderRadius={20} />
    </View>
  );
}

// ── Quick Filter Row Skeleton ──────────────────────────────────────────────────
function FilterRowSkeleton() {
  return (
    <View style={styles.pillRow}>
      {[60, 80, 70, 65, 55].map((w, i) => (
        <SkeletonPlaceholder key={i} width={w} height={32} borderRadius={16} style={styles.pill} />
      ))}
    </View>
  );
}

// ── Full Home Screen Skeleton ──────────────────────────────────────────────────
export default function HomeScreenSkeleton() {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    >
      {/* Banner Carousel */}
      <BannerSkeleton />

      {/* Cravings / Story Circles */}
      <View style={styles.cravingsRow}>
        {[52, 52, 52, 52, 52].map((s, i) => (
          <View key={i} style={styles.cravingItem}>
            <SkeletonPlaceholder width={s} height={s} borderRadius={26} />
            <SkeletonPlaceholder width={44} height={9} borderRadius={4} style={{ marginTop: 5 }} />
          </View>
        ))}
      </View>

      {/* Filter row */}
      <FilterRowSkeleton />

      {/* Flash Deals section */}
      <SectionHeaderSkeleton />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
        {[0, 1, 2, 3].map((i) => (
          <FoodCardSkeleton key={i} width={155} />
        ))}
      </ScrollView>

      {/* Best Sellers section */}
      <SectionHeaderSkeleton />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
        {[0, 1, 2, 3].map((i) => (
          <FoodCardSkeleton key={i} width={155} />
        ))}
      </ScrollView>

      {/* Categories */}
      <SectionHeaderSkeleton />
      <CategoriesSkeleton />

      {/* Top Restaurants */}
      <SectionHeaderSkeleton />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
        {[0, 1, 2].map((i) => (
          <RestaurantCardSkeleton key={i} width={220} />
        ))}
      </ScrollView>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8 },
  // FoodCard
  foodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 6,
  },
  foodImageWrapper: { position: 'relative' },
  foodRatingBadge: { position: 'absolute', bottom: 6, right: 6 },
  foodContent: { padding: 10 },
  foodBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  // RestaurantCard
  restCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 6,
  },
  restInfo: { padding: 10 },
  restTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  restMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 8,
  },
  // Shared
  hList: { paddingHorizontal: 14, paddingBottom: 4 },
  pillRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 20,
  },
  pill: { flexShrink: 0 },
  bannerWrapper: { paddingHorizontal: 16, marginBottom: 20 },
  cravingsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 16,
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  cravingItem: { alignItems: 'center' },
});
