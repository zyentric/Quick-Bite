import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useThemeColors } from '../theme/colors';
import { GearIcon, CartIcon, BellIcon, UserIcon } from './VectorIcons';

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function DashboardHeader({ searchQuery, setSearchQuery }: DashboardHeaderProps) {
  const navigation = useNavigation<any>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.topBar}>
      <View style={styles.searchBox}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={styles.filterIconBtn}
          onPress={() => navigation.getParent()?.navigate('Filter')}
        >
          <GearIcon color="#fff" size={12} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
          <CartIcon color={colors.primary} size={16} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconBtn}
          onPress={() => navigation.getParent()?.navigate('Notifications')}
        >
          <BellIcon color={colors.primary} size={16} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconBtn}
          onPress={() => navigation.getParent()?.navigate('ProfileMenu')}
        >
          <UserIcon color={colors.primary} size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', 
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#333',
  },
  filterIconBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
