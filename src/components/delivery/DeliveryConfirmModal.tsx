import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { PackageIcon, WarningTriangleIcon } from '../icons/DeliveryIcons';
import { LockIcon } from '../icons';
import { DeliveryOrder } from './DeliveryCard';

interface DeliveryConfirmModalProps {
  visible: boolean;
  order: DeliveryOrder | null;
  onClose: () => void;
  onConfirm: (pin: string) => void;
}

export default function DeliveryConfirmModal({
  visible,
  order,
  onClose,
  onConfirm,
}: DeliveryConfirmModalProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (visible) {
      setPin('');
      setErrorMsg('');
    }
  }, [visible]);

  if (!order) return null;

  const isCOD = order.paymentStatus === 'Pending';

  const handleConfirm = () => {
    if (pin.trim().length !== 4) {
      setErrorMsg('Please enter the complete 4-digit PIN');
      return;
    }
    setErrorMsg('');
    onConfirm(pin.trim());
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          <View style={styles.iconCircle}>
            <PackageIcon size={28} color={colors.primary} />
          </View>

          <Text style={styles.modalTitle}>Confirm Delivery with PIN</Text>

          <Text style={styles.modalMessage}>
            Ask the customer for the{' '}
            <Text style={{ fontWeight: 'bold', color: colors.text }}>
              4-digit Delivery PIN
            </Text>{' '}
            shown on their tracking screen to complete order{' '}
            <Text style={{ fontWeight: 'bold', color: colors.text }}>
              #{order.id.slice(-6).toUpperCase()}
            </Text>
            .
          </Text>

          {/* Secure 4-digit PIN input */}
          <View style={styles.pinContainer}>
            <View style={styles.pinHeaderRow}>
              <LockIcon size={14} color={colors.primary} />
              <Text style={styles.pinLabel}>Customer Delivery PIN</Text>
            </View>

            <TextInput
              style={styles.pinInput}
              placeholder="••••"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={4}
              value={pin}
              onChangeText={(val) => {
                setPin(val);
                if (errorMsg) setErrorMsg('');
              }}
              textAlign="center"
              autoFocus={true}
            />

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          </View>

          {isCOD && (
            <View style={styles.codWarningBox}>
              <WarningTriangleIcon size={18} color="#E11D48" />
              <Text style={styles.codWarningText}>
                Collect ₹{order.totalAmount} in Cash from customer before confirming!
              </Text>
            </View>
          )}

          <View style={styles.modalButtonsRow}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalConfirmBtn,
                {
                  backgroundColor: pin.trim().length === 4 ? '#10B981' : '#9CA3AF',
                },
              ]}
              onPress={handleConfirm}
              activeOpacity={0.85}
              disabled={pin.trim().length !== 4}
            >
              <Text style={styles.modalConfirmBtnText}>Verify & Deliver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    modalContent: {
      backgroundColor: colors.surface,
      width: '100%',
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 10,
    },
    iconCircle: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    modalMessage: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 16,
    },
    pinContainer: {
      width: '100%',
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
      alignItems: 'center',
    },
    pinHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },
    pinLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
    },
    pinInput: {
      width: 140,
      height: 50,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.primary,
      fontSize: 24,
      fontWeight: '900',
      color: colors.text,
      letterSpacing: 8,
      textAlign: 'center',
    },
    errorText: {
      color: '#EF4444',
      fontSize: 11,
      fontWeight: '700',
      marginTop: 6,
    },
    codWarningBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#FFE4E6',
      borderWidth: 1,
      borderColor: '#FDA4AF',
      padding: 10,
      borderRadius: 12,
      marginBottom: 18,
      width: '100%',
    },
    codWarningText: {
      fontSize: 12.5,
      fontWeight: '800',
      color: '#E11D48',
      flex: 1,
      lineHeight: 16,
    },
    modalButtonsRow: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    modalCancelBtn: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      borderRadius: 22,
      alignItems: 'center',
    },
    modalCancelBtnText: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 14,
    },
    modalConfirmBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 22,
      alignItems: 'center',
    },
    modalConfirmBtnText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 14,
    },
  });
