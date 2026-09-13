import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonPlaceholder from './SkeletonPlaceholder';

// ── Single Favorite Grid Card Skeleton ─────────────────────────────────────────
export function FavoriteCardSkeleton() {
  return (
    <View style={styles.card}>
      {/* 1:1 Aspect Ratio Image Box */}
      <View style={styles.imageContainer}>
        <SkeletonPlaceholder width="100%" height="100%" borderRadius={20} />

        {/* Top-left category icon circle */}
        <View style={styles.topLeftBadge}>
          <SkeletonPlaceholder width={32} height={32} borderRadius={16} />
        </View>

        {/* Top-right heart button circle */}
        <View style={styles.topRightBadge}>
          <SkeletonPlaceholder width={32} height={32} borderRadius={16} />
        </View>

        {/* Bottom-right price badge */}
        <View style={styles.priceBadge}>
          <SkeletonPlaceholder width={44} height={20} borderRadius={10} />
        </View>
      </View>

      {/* Card Details */}
      <View style={styles.cardContent}>
        <SkeletonPlaceholder width="80%" height={15} borderRadius={6} style={{ marginBottom: 6 }} />
        <View style={styles.metaRow}>
          <SkeletonPlaceholder width={36} height={12} borderRadius={4} />
          <SkeletonPlaceholder width={50} height={12} borderRadius={4} style={{ marginLeft: 6 }} />
        </View>
      </View>
    </View>
  );
}

// ── Full Favorites Screen Skeleton Grid ────────────────────────────────────────
export default function FavoritesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Subtitle skeleton */}
      <View style={styles.headerSubtitleBox}>
        <SkeletonPlaceholder width={220} height={14} borderRadius={7} />
      </View>

      {/* 2-Column Grid */}
      <View style={styles.grid}>
        {Array.from({ length: count }).map((_, i) => (
          <FavoriteCardSkeleton key={i} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
  },
  headerSubtitleBox: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  topLeftBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  topRightBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  priceBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  cardContent: {
    paddingHorizontal: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
