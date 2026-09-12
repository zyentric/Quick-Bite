import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';

export interface CategoryItem {
  id: string;
  name: string;
  icon: any;
  tab?: string;
}

export interface HomeCategoriesProps {
  categories: CategoryItem[];
  onSelectCategory: (category: CategoryItem) => void;
  onViewAll: () => void;
}

export default function HomeCategories({
  categories,
  onSelectCategory,
  onViewAll,
}: HomeCategoriesProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Categories</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>See All ({categories.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.item}
            activeOpacity={0.8}
            onPress={() => onSelectCategory(cat)}
          >
            <View style={styles.circle}>
              <Image source={cat.icon} style={styles.icon} />
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 14,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    viewAll: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    list: {
      paddingHorizontal: 15,
    },
    item: {
      alignItems: 'center',
      marginHorizontal: 10,
      width: 68,
    },
    circle: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: '#FFF9E6',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
      borderWidth: 1.5,
      borderColor: '#F7D055',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    icon: {
      width: 30,
      height: 30,
      resizeMode: 'contain',
    },
    name: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
  });
