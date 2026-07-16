import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';

type PaymentMethodsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PaymentMethods'>;

const PAYMENT_METHODS = [
  { id: '1', title: '*** *** *** 43', icon: '💳' },
  { id: '2', title: 'Apple Play', icon: '🍏' },
  { id: '3', title: 'Paypal', icon: '🅿️' },
  { id: '4', title: 'Google Play', icon: '▶️' },
];

export default function PaymentMethodsScreen() {
  const navigation = useNavigation<PaymentMethodsNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const [selectedId, setSelectedId] = useState<string>('1');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.listContainer}>
            {PAYMENT_METHODS.map((item, index) => {
              const isSelected = selectedId === item.id;
              return (
                <View key={item.id}>
                  <TouchableOpacity 
                    style={styles.paymentRow}
                    activeOpacity={0.7}
                    onPress={() => setSelectedId(item.id)}
                  >
                    <View style={styles.iconContainer}>
                      <Text style={styles.paymentIcon}>{item.icon}</Text>
                    </View>
                    <Text style={styles.paymentTitle}>{item.title}</Text>
                    
                    <View style={[styles.radioOutline, isSelected && styles.radioActiveOutline]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                  {index < PAYMENT_METHODS.length - 1 && <View style={styles.separator} />}
                </View>
              );
            })}
          </View>

          <View style={styles.addButtonContainer}>
            <TouchableOpacity 
              style={styles.addCardBtn} 
              onPress={() => navigation.navigate('AddCard')}
            >
              <Text style={styles.addCardBtnText}>Add New Card</Text>
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
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  paymentIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  paymentTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
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
    backgroundColor: '#F0F0F0', // Very light grey line
    width: '100%',
  },
  addButtonContainer: {
    alignItems: 'center',
  },
  addCardBtn: {
    backgroundColor: colors.inputBackground, // Light orange tinted background
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  addCardBtnText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  }
});
