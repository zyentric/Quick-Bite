import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';

type AddCardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddCard'>;

export default function AddCardScreen() {
  const navigation = useNavigation<AddCardNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const [cardHolder, setCardHolder] = useState('John Smith');
  const [cardNumber, setCardNumber] = useState('000 000 000 00');
  const [expiry, setExpiry] = useState('04/28');
  const [cvv, setCvv] = useState('0000');

  const handleSave = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Card</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Mock Credit Card Graphic */}
          <View style={styles.cardGraphic}>
            {/* Top-left Orange Triangle Decoration */}
            <View style={styles.cardTriangleTopLeft} />
            {/* Top-right Light Yellow Triangle Decoration */}
            <View style={styles.cardTriangleTopRight} />

            <View style={styles.cardTopRow}>
              <View style={styles.cardChipPlaceholder} />
            </View>

            <Text style={styles.cardGraphicNumber}>{cardNumber || '000 000 000 00'}</Text>

            <View style={styles.cardGraphicFooter}>
              <View>
                <Text style={styles.cardGraphicLabel}>Card Holder Name</Text>
                <Text style={styles.cardGraphicValue}>{cardHolder || 'Name'}</Text>
              </View>
              <View>
                <Text style={styles.cardGraphicLabel}>Expiry Date</Text>
                <Text style={styles.cardGraphicValue}>{expiry || 'MM/YY'}</Text>
              </View>
              <Text style={styles.cardGraphicIcon}>💳</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Card holder name</Text>
            <TextInput 
              style={styles.textInput}
              value={cardHolder}
              onChangeText={setCardHolder}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput 
              style={styles.textInput}
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth, { paddingRight: 10 }]}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput 
                style={styles.textInput}
                value={expiry}
                onChangeText={setExpiry}
              />
            </View>
            <View style={[styles.formGroup, styles.halfWidth, { paddingLeft: 10 }]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput 
                style={styles.textInput}
                value={cvv}
                onChangeText={setCvv}
                keyboardType="number-pad"
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Card</Text>
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
  cardGraphic: {
    backgroundColor: '#F3C556', // Base yellow of the card
    borderRadius: 15,
    padding: 20,
    height: 180,
    marginBottom: 40,
    justifyContent: 'flex-end',
    overflow: 'hidden', // To clip the triangles
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTriangleTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    borderTopWidth: 100,
    borderTopColor: colors.primary, // Orange triangle
    borderRightWidth: 150,
    borderRightColor: 'transparent',
  },
  cardTriangleTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 50,
    borderTopColor: '#FEE085', // Lighter yellow triangle
    borderLeftWidth: 100,
    borderLeftColor: 'transparent',
  },
  cardTopRow: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  cardChipPlaceholder: {
    width: 40,
    height: 25,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 5,
  },
  cardGraphicNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 2,
    marginBottom: 15,
  },
  cardGraphicFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardGraphicLabel: {
    fontSize: 8,
    color: '#555',
    marginBottom: 2,
    fontWeight: '600',
  },
  cardGraphicValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  cardGraphicIcon: {
    fontSize: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: colors.inputBackground, 
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 14,
    color: colors.inputText,
    fontWeight: '500',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
