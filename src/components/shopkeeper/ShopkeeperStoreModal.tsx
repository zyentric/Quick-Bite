import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { API_URL } from '../../config/api';
import { authFetch } from '../../utils/authFetch';
import { ChefHatIcon, StoreFrontIcon, CookingPanIcon } from '../icons/ShopkeeperIcons';
import { CardPaymentIcon, ShieldCheckIcon } from '../icons/DeliveryIcons';

interface ShopkeeperStoreModalProps {
  visible: boolean;
  onClose: () => void;
  userProfile: any;
  onProfileUpdated: () => void;
  showAlert: (title: string, message: string) => void;
}

export default function ShopkeeperStoreModal({
  visible,
  onClose,
  userProfile,
  onProfileUpdated,
  showAlert,
}: ShopkeeperStoreModalProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [saving, setSaving] = useState(false);
  const [storeName, setStoreName] = useState(userProfile?.name || 'QuickBite Kitchen');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [address, setAddress] = useState(
    userProfile?.savedAddresses?.[0]?.addressLine1 || '12 Spice Garden Lane, 100ft Road, Indiranagar'
  );
  const [isOpen, setIsOpen] = useState(userProfile?.isOnline ?? true);
  const [prepTime, setPrepTime] = useState('20 mins');
  const [fssaiLicense, setFssaiLicense] = useState('FSSAI-11223344556677');
  const [upiId, setUpiId] = useState(userProfile?.bankDetails?.upiId || 'kitchen@upi');
  const [accountNumber, setAccountNumber] = useState(userProfile?.bankDetails?.accountNumber || '');
  const [ifsc, setIfsc] = useState(userProfile?.bankDetails?.ifsc || '');

  useEffect(() => {
    if (userProfile) {
      setStoreName(userProfile.name || 'QuickBite Kitchen');
      setPhone(userProfile.phone || '');
      if (userProfile.savedAddresses?.[0]?.addressLine1) {
        setAddress(userProfile.savedAddresses[0].addressLine1);
      }
      setIsOpen(userProfile.isOnline ?? true);
      setUpiId(userProfile.bankDetails?.upiId || 'kitchen@upi');
      setAccountNumber(userProfile.bankDetails?.accountNumber || '');
      setIfsc(userProfile.bankDetails?.ifsc || '');
    }
  }, [userProfile]);

  const handleSaveStore = async () => {
    if (!storeName.trim()) {
      showAlert('Required', 'Please enter your kitchen/restaurant name.');
      return;
    }
    setSaving(true);
    try {
      const response = await authFetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeName,
          phone,
          isOnline: isOpen,
          bankDetails: {
            accountNumber,
            ifsc,
            upiId,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showAlert('Error', data.message || 'Failed to update kitchen details');
        return;
      }

      showAlert('Store Updated', 'Your kitchen details and online status have been saved.');
      onProfileUpdated();
      onClose();
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const prepTimes = ['15 mins', '20 mins', '30 mins', '45 mins'];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderTitleRow}>
              <View style={styles.headerIconCircle}>
                <ChefHatIcon size={20} color="#FFC72C" />
              </View>
              <View>
                <Text style={styles.sheetTitle}>Kitchen & Store Settings</Text>
                <Text style={styles.sheetSub}>Manage Restaurant Operations</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Live Store Status Switch */}
            <View style={styles.statusCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusCardTitle}>
                  {isOpen ? 'Kitchen is Open for Orders' : 'Kitchen is Closed'}
                </Text>
                <Text style={styles.statusCardDesc}>
                  {isOpen
                    ? 'Customers can place live delivery and takeaway orders.'
                    : 'Your kitchen is currently paused. No new orders will arrive.'}
                </Text>
              </View>
              <Switch
                value={isOpen}
                onValueChange={setIsOpen}
                trackColor={{ false: '#EF4444', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Section: Kitchen Details */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <StoreFrontIcon size={18} color="#FFC72C" />
                <Text style={styles.sectionTitle}>Kitchen Information</Text>
              </View>

              <Text style={styles.inputLabel}>Restaurant / Kitchen Name</Text>
              <TextInput
                style={styles.textInput}
                value={storeName}
                onChangeText={setStoreName}
                placeholder="e.g. QuickBite Express Kitchen"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.inputLabel}>Owner Contact Phone</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 9876543211"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Kitchen Location & Address</Text>
              <TextInput
                style={styles.textInput}
                value={address}
                onChangeText={setAddress}
                placeholder="12 Spice Garden Lane, Indiranagar"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Section: Prep Time & Food License */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <CookingPanIcon size={18} color="#FFC72C" />
                <Text style={styles.sectionTitle}>Kitchen Preparation</Text>
              </View>

              <Text style={styles.inputLabel}>Average Cooking Time</Text>
              <View style={styles.prepTimeRow}>
                {prepTimes.map((time) => {
                  const isSelected = prepTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[styles.prepPill, isSelected && styles.prepPillActive]}
                      onPress={() => setPrepTime(time)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.prepPillText, isSelected && styles.prepPillTextActive]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>FSSAI / Food Safety License</Text>
              <TextInput
                style={styles.textInput}
                value={fssaiLicense}
                onChangeText={setFssaiLicense}
                placeholder="e.g. FSSAI-11223344556677"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
              />
            </View>

            {/* Section: Payout Bank & UPI */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <CardPaymentIcon size={18} color="#10B981" />
                <Text style={styles.sectionTitle}>Settlement Bank & UPI</Text>
              </View>

              <Text style={styles.inputLabel}>UPI ID for Daily Settlement</Text>
              <TextInput
                style={styles.textInput}
                value={upiId}
                onChangeText={setUpiId}
                placeholder="kitchen@upi"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Bank Account Number</Text>
              <TextInput
                style={styles.textInput}
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="12-16 digit account number"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
              />

              <Text style={styles.inputLabel}>Bank IFSC Code</Text>
              <TextInput
                style={styles.textInput}
                value={ifsc}
                onChangeText={setIfsc}
                placeholder="HDFC0001234"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: '#1E1B18' }]}
              onPress={handleSaveStore}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFC72C" />
              ) : (
                <Text style={styles.saveBtnText}>Save Kitchen Settings</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
      justifyContent: 'flex-end',
    },
    sheetContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight: '92%',
      paddingTop: 18,
      paddingBottom: 24,
    },
    sheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sheetHeaderTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 199, 44, 0.18)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    sheetTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
    },
    sheetSub: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeBtnText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 30,
    },
    statusCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
      gap: 12,
    },
    statusCardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },
    statusCardDesc: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 3,
      lineHeight: 16,
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      marginTop: 10,
      marginBottom: 6,
    },
    textInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    prepTimeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    prepPill: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    prepPillActive: {
      backgroundColor: '#1E1B18',
      borderColor: '#1E1B18',
    },
    prepPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    prepPillTextActive: {
      color: '#FFC72C',
    },
    saveBtn: {
      paddingVertical: 14,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    saveBtnText: {
      color: '#FFC72C',
      fontWeight: '800',
      fontSize: 15,
    },
  });
