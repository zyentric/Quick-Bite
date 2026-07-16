import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';

type DeliveryAddressNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DeliveryAddress'>;

const ADDRESSES = [
  { id: '1', title: 'My home', address: '778 Locust View Drive Oakland, CA' },
  { id: '2', title: 'My Office', address: '778 Locust View Drive Oakland, CA' },
  { id: '3', title: 'Parent\'s House', address: '778 Locust View Drive Oakland, CA' },
];

export default function DeliveryAddressScreen() {
  const navigation = useNavigation<DeliveryAddressNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const [selectedId, setSelectedId] = useState<string>('1');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Address</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.listContainer}>
            {ADDRESSES.map((item, index) => {
              const isSelected = selectedId === item.id;
              return (
                <View key={item.id}>
                  <TouchableOpacity 
                    style={styles.addressRow}
                    activeOpacity={0.7}
                    onPress={() => setSelectedId(item.id)}
                  >
                    <View style={styles.iconContainer}>
                      <Text style={styles.houseIcon}>🏠</Text>
                    </View>
                    <View style={styles.addressInfo}>
                      <Text style={styles.addressTitle}>{item.title}</Text>
                      <Text style={styles.addressText}>{item.address}</Text>
                    </View>
                    <View style={[styles.radioOutline, isSelected && styles.radioActiveOutline]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                  {index < ADDRESSES.length - 1 && <View style={styles.separator} />}
                </View>
              );
            })}
          </View>

          <View style={styles.addButtonContainer}>
            <TouchableOpacity 
              style={styles.addAddressBtn} 
              onPress={() => navigation.navigate('AddNewAddress')}
            >
              <Text style={styles.addAddressBtnText}>Add New Address</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rightPlaceholder: {
    width: 40, 
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    paddingTop: 30,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 80,
  },
  listContainer: {
    marginBottom: 40,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  iconContainer: {
    marginRight: 15,
  },
  houseIcon: {
    fontSize: 28,
    color: colors.primary,
    opacity: 0.8, // Make it look a bit like a line icon with color if it was SVG
  },
  addressInfo: {
    flex: 1,
    paddingRight: 10,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  radioOutline: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActiveOutline: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0', // Very light grey line between items
    width: '100%',
  },
  addButtonContainer: {
    alignItems: 'center',
  },
  addAddressBtn: {
    backgroundColor: colors.inputBackground, // Light orange tinted background
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  addAddressBtnText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  }
});
