import React from 'react';
import { View, StyleSheet } from 'react-native';
import OrderCardSkeleton from './OrderCardSkeleton';

interface MyOrdersSkeletonProps {
  count?: number;
}

export default function MyOrdersSkeleton({ count = 3 }: MyOrdersSkeletonProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <OrderCardSkeleton key={`order-skeleton-${index}`} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
