import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';

export interface HomePerksFilterProps {
  selectedFilter: string;
  onSelectFilter: (filterId: string) => void;
}

const PERK_OPTIONS = [
  { id: 'all', label: 'All Dishes' },
  { id: 'top_rated', label: 'Top Rated' },
  { id: 'deals', label: 'Offers & Deals' },
  { id: 'vegan', label: 'Fresh & Vegan' },
];

export default function HomePerksFilter({ selectedFilter, onSelectFilter }: HomePerksFilterProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {PERK_OPTIONS.map((option) => {
        const isActive = selectedFilter === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelectFilter(option.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {option.label}
            </Text>
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
      paddingHorizontal: 16,
      marginBottom: 16,
      justifyContent: 'space-between',
    },
    chip: {
      backgroundColor: '#FFF8E7',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#F7D055',
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    label: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
    },
    labelActive: {
      color: '#FFFFFF',
    },
  });
