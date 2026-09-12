import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';

export type ShopkeeperTabType = 'Pending' | 'Preparing' | 'Ready' | 'History';

interface ShopkeeperTabsProps {
  activeTab: ShopkeeperTabType;
  onSelectTab: (tab: ShopkeeperTabType) => void;
  pendingCount: number;
  preparingCount: number;
  readyCount: number;
  historyCount: number;
}

export default function ShopkeeperTabs({
  activeTab,
  onSelectTab,
  pendingCount,
  preparingCount,
  readyCount,
  historyCount,
}: ShopkeeperTabsProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const tabs: { key: ShopkeeperTabType; label: string; count: number }[] = [
    { key: 'Pending', label: 'New', count: pendingCount },
    { key: 'Preparing', label: 'In Kitchen', count: preparingCount },
    { key: 'Ready', label: 'Ready', count: readyCount },
    { key: 'History', label: 'History', count: historyCount },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, isActive && styles.tabBtnActive]}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View
                style={[
                  styles.badge,
                  isActive ? styles.badgeActive : styles.badgeInactive,
                  tab.key === 'Pending' && styles.badgeHighlight,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isActive ? styles.badgeTextActive : styles.badgeTextInactive,
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginTop: 14,
      marginBottom: 10,
      borderRadius: 18,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    tabBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 14,
      gap: 5,
    },
    tabBtnActive: {
      backgroundColor: '#1E1B18', // Deep Charcoal
    },
    tabLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
    },
    tabLabelActive: {
      color: '#FFC72C', // Gold
      fontWeight: '800',
    },
    badge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeHighlight: {
      backgroundColor: colors.primary,
    },
    badgeActive: {
      backgroundColor: colors.primary,
    },
    badgeInactive: {
      backgroundColor: colors.border,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '900',
    },
    badgeTextActive: {
      color: '#FFFFFF',
    },
    badgeTextInactive: {
      color: colors.textMuted,
    },
  });
