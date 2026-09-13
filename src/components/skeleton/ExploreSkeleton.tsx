import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonPlaceholder from './SkeletonPlaceholder';

// ── Single Explore Vertical Food Card Skeleton ────────────────────────────────
export function ExploreFoodCardSkeleton() {
  return (
    <View style={styles.foodCard}>
      {/* 180px banner image */}
      <SkeletonPlaceholder width="100%" height={180} borderRadius={0} />

      {/* Info section */}
      <View style={styles.foodInfo}>
        <View style={styles.foodHeader}>
          <SkeletonPlaceholder width="50%" height={16} borderRadius={6} />
          <SkeletonPlaceholder width={46} height={18} borderRadius={9} />
          <SkeletonPlaceholder width={60} height={16} borderRadius={6} />
        </View>

        <SkeletonPlaceholder width="90%" height={12} borderRadius={5} style={{ marginTop: 10, marginBottom: 5 }} />
        <SkeletonPlaceholder width="75%" height={12} borderRadius={5} />
      </View>
    </View>
  );
}

// ── Full Explore Screen Skeleton ───────────────────────────────────────────────
export default function ExploreSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.container}>
      {/* Horizontal Categories Row */}
      <View style={styles.categoriesRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.categoryItem}>
            <SkeletonPlaceholder width={64} height={64} borderRadius={32} />
            <SkeletonPlaceholder width={44} height={12} borderRadius={4} style={{ marginTop: 8 }} />
          </View>
        ))}
      </View>

      {/* Sort Row */}
      <View style={styles.sortRow}>
        <SkeletonPlaceholder width={110} height={14} borderRadius={5} />
        <SkeletonPlaceholder width={32} height={32} borderRadius={16} />
      </View>

      {/* Vertical Food Card List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {Array.from({ length: count }).map((_, i) => (
          <ExploreFoodCardSkeleton key={i} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 15,
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  foodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
    paddingBottom: 15,
  },
  foodInfo: {
    paddingHorizontal: 15,
    paddingTop: 12,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
