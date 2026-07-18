import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { useUser } from '../../../context/UserContext';
import CustomAlert from '../../../components/CustomAlert';

type DeliveryAddressNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DeliveryAddress'>;

export default function DeliveryAddressScreen() {
  const navigation = useNavigation<DeliveryAddressNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { userProfile } = useUser();

  const [addresses, setAddresses] = useState<any[]>(userProfile?.savedAddresses || []);
  const [selectedId, setSelectedId] = useState<string>(
    userProfile?.savedAddresses?.[0]?.label || ''
  );

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };



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
            {addresses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No saved addresses yet.</Text>
                <Text style={styles.emptySubText}>Add an address to start ordering!</Text>
              </View>
            ) : (
              addresses.map((item, index) => {
                const isSelected = selectedId === item.label;
                const fullAddress = [item.addressLine1, item.addressLine2, item.city, item.zipCode].filter(Boolean).join(', ');
                return (
                  <View key={index}>
                    <TouchableOpacity 
                      style={styles.addressRow}
                      activeOpacity={0.7}
                      onPress={() => setSelectedId(item.label)}
                    >
                      <View style={styles.iconContainer}>
                        <Text style={styles.houseIcon}>
                          {item.label?.toLowerCase() === 'home' ? '🏠' : item.label?.toLowerCase() === 'work' || item.label?.toLowerCase() === 'office' ? '💼' : '📍'}
                        </Text>
                      </View>
                      <View style={styles.addressInfo}>
                        <Text style={styles.addressTitle}>{item.label}</Text>
                        <Text style={styles.addressText}>{fullAddress}</Text>
                      </View>
                      <View style={[styles.radioOutline, isSelected && styles.radioActiveOutline]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                    {index < addresses.length - 1 && <View style={styles.separator} />}
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.addButtonContainer}>
            <TouchableOpacity 
              style={styles.addAddressBtn} 
              onPress={() => {
                if (addresses.length >= 5) {
                  showAlert('Limit Reached', 'You can save a maximum of 5 delivery addresses.');
                  return;
                }
                navigation.navigate('AddNewAddress');
              }}
            >
              <Text style={styles.addAddressBtnText}>Add New Address</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
      <CustomAlert 
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    backgroundColor: colors.inputBackground,
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    color: colors.textMuted,
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
