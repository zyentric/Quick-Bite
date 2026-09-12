import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import {
  DeliveryBikeIcon,
  PackageIcon,
  ClockHistoryIcon,
} from '../icons/DeliveryIcons';

export type DeliveryTabType = 'active' | 'available' | 'history';

interface DeliveryTabsProps {
  activeTab: DeliveryTabType;
  onSelectTab: (tab: DeliveryTabType) => void;
  activeCount: number;
  availableCount: number;
  historyCount: number;
}

export default function DeliveryTabs({
  activeTab,
  onSelectTab,
  activeCount,
  availableCount,
  historyCount,
}: DeliveryTabsProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {/* Active Tab */}
      <TouchableOpacity
        style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]}
        onPress={() => onSelectTab('active')}
        activeOpacity={0.8}
      >
        <DeliveryBikeIcon
          size={16}
          color={activeTab === 'active' ? '#FFFFFF' : colors.textMuted}
        />
        <Text
          style={[styles.tabBtnText, activeTab === 'active' && styles.tabBtnTextActive]}
        >
          Active ({activeCount})
        </Text>
      </TouchableOpacity>

      {/* Available Pickups Tab */}
      <TouchableOpacity
        style={[styles.tabBtn, activeTab === 'available' && styles.tabBtnActive]}
        onPress={() => onSelectTab('available')}
        activeOpacity={0.8}
      >
        <PackageIcon
          size={16}
          color={activeTab === 'available' ? '#FFFFFF' : colors.textMuted}
        />
        <Text
          style={[styles.tabBtnText, activeTab === 'available' && styles.tabBtnTextActive]}
        >
          Pickups ({availableCount})
        </Text>
      </TouchableOpacity>

      {/* History Tab */}
      <TouchableOpacity
        style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
        onPress={() => onSelectTab('history')}
        activeOpacity={0.8}
      >
        <ClockHistoryIcon
          size={16}
          color={activeTab === 'history' ? '#FFFFFF' : colors.textMuted}
        />
        <Text
          style={[styles.tabBtnText, activeTab === 'history' && styles.tabBtnTextActive]}
        >
          History ({historyCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      gap: 8,
    },
    tabBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 22,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
    tabBtnText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.textMuted,
    },
    tabBtnTextActive: {
      color: '#FFFFFF',
    },
  });
