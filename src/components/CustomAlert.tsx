import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../theme/colors';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function CustomAlert({ visible, title, message, onClose }: CustomAlertProps) {
  const colors = useThemeColors();

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.primary }]}>{title}</Text>
          <Text style={[styles.modalMessage, { color: colors.text }]}>{message}</Text>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
