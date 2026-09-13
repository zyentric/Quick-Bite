import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonPlaceholder from './SkeletonPlaceholder';

export function NotificationItemSkeleton() {
  return (
    <View style={styles.notificationCard}>
      <View style={styles.iconWrapper}>
        <SkeletonPlaceholder width={44} height={44} borderRadius={22} />
      </View>
      <View style={styles.textContent}>
        <SkeletonPlaceholder width="60%" height={15} borderRadius={6} style={{ marginBottom: 6 }} />
        <SkeletonPlaceholder width="90%" height={12} borderRadius={4} style={{ marginBottom: 4 }} />
        <SkeletonPlaceholder width="40%" height={10} borderRadius={4} />
      </View>
    </View>
  );
}

export default function NotificationSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {Array.from({ length: count }).map((_, i) => (
        <NotificationItemSkeleton key={i} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconWrapper: {
    marginRight: 15,
  },
  textContent: {
    flex: 1,
  },
});
