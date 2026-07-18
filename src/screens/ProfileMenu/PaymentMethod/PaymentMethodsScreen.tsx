import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Modal, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';

type PaymentMethodsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PaymentMethods'>;

const PAYMENT_METHODS = [
  { id: '1', title: 'Debit Card', isCard: true },
  { id: '2', title: 'UPI ID', isCard: false },
];

export default function PaymentMethodsScreen() {
  const navigation = useNavigation<PaymentMethodsNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const [selectedId, setSelectedId] = useState<string>('1');
  const [upiModalVisible, setUpiModalVisible] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [tempUpiId, setTempUpiId] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../../assets/back.png')} style={styles.backIconImg} />
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
                    onPress={() => {
                      setSelectedId(item.id);
                      if (item.id === '2') {
                        setTempUpiId(upiId);
                        setUpiModalVisible(true);
                      }
                    }}
                  >
                    <View style={styles.iconContainer}>
                      {item.isCard ? (
                        <Image source={require('../../../assets/card.png')} style={styles.paymentIconImg} />
                      ) : (
                        <View style={styles.upiBadge}><Text style={styles.upiBadgeText}>UPI</Text></View>
                      )}
                    </View>
                    <Text style={styles.paymentTitle}>{item.id === '2' && upiId ? upiId : item.title}</Text>
                    
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
              <Text style={styles.addCardBtnText}>Add UPI ID or debit card</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>

      {/* UPI Input Modal */}
      <Modal visible={upiModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter UPI ID</Text>
            <TextInput
              style={styles.upiInput}
              placeholder="e.g. username@upi"
              value={tempUpiId}
              onChangeText={setTempUpiId}
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setUpiModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveBtn} 
                onPress={() => { 
                  setUpiId(tempUpiId); 
                  setUpiModalVisible(false); 
                }}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  },
  backIconImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  paymentIconImg: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: colors.text,
  },
  upiBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  upiBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  upiInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginRight: 10,
  },
  modalCancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginLeft: 10,
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
