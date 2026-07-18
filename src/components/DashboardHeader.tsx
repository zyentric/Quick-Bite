import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../theme/colors';
import Icons from '../constants/icons';
import { SearchIcon } from './VectorIcons';

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
        <SearchIcon color="#999" size={16} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dishes, restaurants..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterIconBtn}
          onPress={() => navigation.navigate('Filter')}
        >
          <Image source={Icons.settings} style={styles.filterIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
          <Image source={Icons.cart} style={[styles.iconImg, { tintColor: colors.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.getParent()?.navigate('Notifications')}
        >
          <Image source={Icons.notification} style={[styles.iconImg, { tintColor: colors.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.getParent()?.navigate('ProfileMenu')}
        >
          <Image source={Icons.user} style={[styles.iconImg, { tintColor: colors.primary }]} />
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
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 42,
    marginRight: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 13,
    color: '#333',
  },
  filterIconBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    width: 14,
    height: 14,
    tintColor: '#fff',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconImg: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
});
