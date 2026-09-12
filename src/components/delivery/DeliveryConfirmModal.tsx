import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { PackageIcon, WarningTriangleIcon } from '../icons/DeliveryIcons';
import { DeliveryOrder } from './DeliveryCard';

interface DeliveryConfirmModalProps {
  visible: boolean;
  order: DeliveryOrder | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeliveryConfirmModal({
  visible,
  order,
  onClose,
  onConfirm,
}: DeliveryConfirmModalProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  if (!order) return null;

  const isCOD = order.paymentStatus === 'Pending';

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

          <Text style={styles.modalTitle}>Confirm Order Delivery</Text>

          <Text style={styles.modalMessage}>
            Are you at the customer's address and ready to complete order{' '}
            <Text style={{ fontWeight: 'bold', color: colors.text }}>
              #{order.id.slice(-6).toUpperCase()}
            </Text>
            ?
          </Text>

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
              style={[styles.modalConfirmBtn, { backgroundColor: '#10B981' }]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.modalConfirmBtnText}>Yes, Delivered</Text>
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
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 16,
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
