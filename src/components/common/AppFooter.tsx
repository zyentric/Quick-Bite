import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { APP_VERSION } from '../../constants/appConfig';
import { HeartIcon } from '../icons';

interface AppFooterProps {
  bottomSpacing?: number;
  showTagline?: boolean;
}

export default function AppFooter({
  bottomSpacing = 24,
  showTagline = true,
}: AppFooterProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={[styles.container, { marginBottom: bottomSpacing }]}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>QUICKBITE</Text>
        </View>
        <View style={styles.line} />
      </View>

      <Text style={styles.versionText}>QuickBite App v{APP_VERSION}</Text>
      <Text style={styles.copyrightText}>
        © 2026 QuickBite Food Delivery. All Rights Reserved.
      </Text>

      {showTagline && (
        <View style={styles.taglineRow}>
          <Text style={styles.taglineText}>Crafted with</Text>
          <HeartIcon size={12} color="#EF4444" filled />
          <Text style={styles.taglineText}>for Food Lovers</Text>
        </View>
      )}
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      marginTop: 24,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '70%',
      marginBottom: 10,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: '#E5E7EB',
    },
    badgePill: {
      backgroundColor: '#FFF4EB',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.2)',
    },
    badgeText: {
      fontSize: 9,
      fontWeight: '900',
      color: colors.primary,
      letterSpacing: 0.8,
    },
    versionText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
      marginBottom: 3,
    },
    copyrightText: {
      fontSize: 10,
      color: colors.textMuted,
      textAlign: 'center',
      opacity: 0.8,
    },
    taglineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 6,
    },
    taglineText: {
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: '500',
    },
  });
