import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { authFetch } from '../../../utils/authFetch';
import { API_URL } from '../../../config/api';

type CancelOrderNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CancelOrder'>;
type CancelOrderRouteProp = RouteProp<RootStackParamList, 'CancelOrder'>;

const REASONS = [
  'Ordered by mistake',
  'Delivery is taking too long',
  'I want to change my order',
  'Restaurant is taking too long to confirm',
];

export default function CancelOrderScreen() {
  const navigation = useNavigation<CancelOrderNavigationProp>();
  const route = useRoute<CancelOrderRouteProp>();
  const { orderId } = route.params;
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [otherReason, setOtherReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const reason = selectedReason !== null
      ? REASONS[selectedReason]
      : otherReason.trim();

    if (!reason) {
      setError('Please select or enter a reason to cancel.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await authFetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to cancel order. Please try again.');
        return;
      }
      navigation.replace('CancelSuccess');
    } catch (e: any) {
      setError('Network error: ' + e.message);
    } finally {
      setSubmitting(false);
    }
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
            Please let us know why you want to cancel. Your feedback helps us improve our service.
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

          <Text style={styles.othersLabel}>Other reason</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Write your reason here..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={otherReason}
            onChangeText={(text) => {
              setOtherReason(text);
              if (text.length > 0) setSelectedReason(null); // deselect radio if typing
            }}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>Submit Cancellation</Text>
            }
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
    borderColor: '#E0E0E0',
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
    backgroundColor: colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: colors.inputText,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 13,
    color: '#d32f2f',
    marginBottom: 15,
    textAlign: 'center',
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
