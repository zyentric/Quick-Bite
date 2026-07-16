import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';

type CancelOrderNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CancelOrder'>;

const REASONS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Praesent pellentesque congue lorem, vel tincidunt.',
  'Duis aute irure dolor in reprehenderit.',
  'Excepteur sint occaecat cupidatat non proident.'
];

export default function CancelOrderScreen() {
  const navigation = useNavigation<CancelOrderNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [otherReason, setOtherReason] = useState('');

  const handleSubmit = () => {
    navigation.replace('CancelSuccess');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancel Order</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.instructionText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent pellentesque congue lorem, vel tincidunt auctor.
          </Text>

          {REASONS.map((reason, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.reasonRow}
              activeOpacity={0.7}
              onPress={() => setSelectedReason(index)}
            >
              <Text style={styles.reasonText}>{reason}</Text>
              <View style={[styles.radioOutline, selectedReason === index && styles.radioActiveOutline]}>
                {selectedReason === index && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}

          <Text style={styles.othersLabel}>Others</Text>
          <TextInput 
            style={styles.textInput}
            placeholder="Other reason ..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={otherReason}
            onChangeText={setOtherReason}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Submit</Text>
          </TouchableOpacity>

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
    paddingBottom: 40,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 30,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingRight: 20,
  },
  radioOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0', // light grey outline
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActiveOutline: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  othersLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: colors.inputBackground, // Light yellow/grey
    borderRadius: 15,
    padding: 15,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: colors.inputText,
    marginBottom: 40,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
