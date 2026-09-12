import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import Icons from '../../constants/icons';

export interface CravingItem {
  id: string;
  name: string;
  subtitle: string;
  icon: any;
  category: string;
}

const CRAVING_ITEMS: CravingItem[] = [
  { id: '1', name: 'Pizza & Pasta', subtitle: 'Cheesy Bakes', icon: Icons.meal, category: 'Meal' },
  { id: '2', name: 'Crispy Snacks', subtitle: 'Finger Food', icon: Icons.snacks, category: 'Snacks' },
  { id: '3', name: 'Sweet Desserts', subtitle: 'Cakes & Treats', icon: Icons.dessert, category: 'Dessert' },
  { id: '4', name: 'Chilled Drinks', subtitle: 'Shakes & Sodas', icon: Icons.drinks, category: 'Drinks' },
  { id: '5', name: 'Clean & Vegan', subtitle: 'Salads & Greens', icon: Icons.vegan, category: 'Vegan' },
];

export interface HomeCravingsProps {
  onSelectCraving: (category: string) => void;
}

export default function HomeCravings({ onSelectCraving }: HomeCravingsProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What's On Your Mind?</Text>
        <Text style={styles.subtitle}>Explore curated cravings & top picks</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {CRAVING_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            activeOpacity={0.8}
            onPress={() => onSelectCraving(item.category)}
          >
            <View style={styles.ringOuter}>
              <View style={styles.ringInner}>
                <Image source={item.icon} style={styles.icon} />
              </View>
            </View>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.sub} numberOfLines={1}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginBottom: 26,
    },
    header: {
      paddingHorizontal: 20,
      marginBottom: 14,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    list: {
      paddingHorizontal: 16,
    },
    item: {
      alignItems: 'center',
      marginHorizontal: 8,
      width: 78,
    },
    ringOuter: {
      width: 66,
      height: 66,
      borderRadius: 33,
      padding: 2.5,
      backgroundColor: '#F7D055',
      marginBottom: 6,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    ringInner: {
      flex: 1,
      borderRadius: 30,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      width: 32,
      height: 32,
      resizeMode: 'contain',
    },
    name: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    sub: {
      fontSize: 10,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 1,
    },
  });
