import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from './SkeletonPlaceholder';

interface OrderCardSkeletonProps {
  cardStyle?: object;
}

export default function OrderCardSkeleton({ cardStyle }: OrderCardSkeletonProps) {
  return (
    <View style={[styles.card, cardStyle]}>
      {/* Header: Order ID & Status Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.orderIdRow}>
          <SkeletonPlaceholder width={85} height={16} borderRadius={6} />
          <SkeletonPlaceholder width={6} height={6} borderRadius={3} />
          <SkeletonPlaceholder width={70} height={14} borderRadius={6} />
        </View>
        <SkeletonPlaceholder width={90} height={24} borderRadius={12} />
      </View>

      {/* Body: Dish Thumbnail + Details */}
      <View style={styles.cardBody}>
        <SkeletonPlaceholder width={72} height={72} borderRadius={16} style={styles.imagePlaceholder} />
        <View style={styles.infoCol}>
          <SkeletonPlaceholder width="75%" height={18} borderRadius={6} style={styles.titlePlaceholder} />
          <SkeletonPlaceholder width="95%" height={13} borderRadius={5} style={styles.subPlaceholder} />
          <SkeletonPlaceholder width="50%" height={13} borderRadius={5} style={styles.subPlaceholder} />
          <View style={styles.priceRow}>
            <SkeletonPlaceholder width={50} height={14} borderRadius={4} />
            <SkeletonPlaceholder width={60} height={18} borderRadius={6} />
          </View>
        </View>
      </View>

      {/* Footer: Action Buttons */}
      <View style={styles.cardFooter}>
        <SkeletonPlaceholder width={80} height={38} borderRadius={14} />
        <SkeletonPlaceholder width="68%" height={38} borderRadius={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  imagePlaceholder: {
    marginRight: 14,
  },
  infoCol: {
    flex: 1,
  },
  titlePlaceholder: {
    marginBottom: 8,
  },
  subPlaceholder: {
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    gap: 10,
  },
});
