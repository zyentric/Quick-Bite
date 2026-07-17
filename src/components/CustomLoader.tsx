import React from 'react';
import { View, StyleSheet, ActivityIndicator, Modal, Text } from 'react-native';
import { useThemeColors } from '../theme/colors';

interface CustomLoaderProps {
  visible: boolean;
  message?: string;
}

export default function CustomLoader({ visible, message = 'Loading...' }: CustomLoaderProps) {
  const colors = useThemeColors();

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    minWidth: 150,
  },
  message: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600',
  },
});
