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
} from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { API_URL } from '../../config/api';
import { authFetch } from '../../utils/authFetch';
import {
  ShieldCheckIcon,
  DocumentIdIcon,
  DeliveryBikeIcon,
  CardPaymentIcon,
  CheckCircleIcon,
  WarningTriangleIcon,
  ClockHistoryIcon,
} from '../icons/DeliveryIcons';

interface DeliveryProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userProfile: any;
  onProfileUpdated: () => void;
  showAlert: (title: string, message: string) => void;
}

export default function DeliveryProfileModal({
  visible,
  onClose,
  userProfile,
  onProfileUpdated,
  showAlert,
}: DeliveryProfileModalProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [saving, setSaving] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // Personal Info
  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(userProfile?.email || '');

  // Vehicle Info
  const [vehicleType, setVehicleType] = useState(userProfile?.vehicleType || 'Motorcycle');
  const [vehicleNumber, setVehicleNumber] = useState(userProfile?.vehicleNumber || '');

  // KYC Documents
  const [drivingLicense, setDrivingLicense] = useState(userProfile?.documents?.drivingLicense || '');
  const [vehicleRc, setVehicleRc] = useState(userProfile?.documents?.vehicleRc || '');
  const [nationalId, setNationalId] = useState(userProfile?.documents?.nationalId || '');

  // Bank Info
  const [accountNumber, setAccountNumber] = useState(userProfile?.bankDetails?.accountNumber || '');
  const [ifsc, setIfsc] = useState(userProfile?.bankDetails?.ifsc || '');
  const [upiId, setUpiId] = useState(userProfile?.bankDetails?.upiId || '');

  const verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected' =
    userProfile?.verificationStatus || 'unverified';

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setPhone(userProfile.phone || '');
      setEmail(userProfile.email || '');
      setVehicleType(userProfile.vehicleType || 'Motorcycle');
      setVehicleNumber(userProfile.vehicleNumber || '');
      setDrivingLicense(userProfile.documents?.drivingLicense || '');
      setVehicleRc(userProfile.documents?.vehicleRc || '');
      setNationalId(userProfile.documents?.nationalId || '');
      setAccountNumber(userProfile.bankDetails?.accountNumber || '');
      setIfsc(userProfile.bankDetails?.ifsc || '');
      setUpiId(userProfile.bankDetails?.upiId || '');
    }
  }, [userProfile]);

  // General Profile Save
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      showAlert('Required Field', 'Please enter your full name.');
      return;
    }
    setSaving(true);
    try {
      const response = await authFetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          vehicleType,
          vehicleNumber,
          documents: {
            drivingLicense,
            vehicleRc,
            nationalId,
          },
          bankDetails: {
            accountNumber,
            ifsc,
            upiId,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showAlert('Error', data.message || 'Failed to update profile');
        return;
      }

      showAlert('Profile Saved', 'Your delivery profile details have been updated.');
      onProfileUpdated();
      onClose();
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  // Submit Application for Admin Verification
  const handleApplyVerification = async () => {
    if (!vehicleNumber.trim()) {
      showAlert('Missing Vehicle', 'Please provide your vehicle registration number.');
      return;
    }
    if (!drivingLicense.trim()) {
      showAlert('Missing License', 'Please provide your Driving License number for verification.');
      return;
    }

    setSubmittingVerification(true);
    try {
      const response = await authFetch(`${API_URL}/users/apply-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          vehicleType,
          vehicleNumber,
          documents: {
            drivingLicense,
            vehicleRc,
            nationalId,
          },
          bankDetails: {
            accountNumber,
            ifsc,
            upiId,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showAlert('Submission Failed', data.message || 'Could not submit verification request');
        return;
      }

      showAlert(
        'Application Submitted',
        'Your profile and KYC documents are now under review by QuickBite Admin. You will receive an approval notification once verified.'
      );
      onProfileUpdated();
      onClose();
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setSubmittingVerification(false);
    }
  };

  const vehicleOptions = ['Motorcycle', 'Scooter', 'Electric Bike', 'Bicycle'];

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
          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderTitleRow}>
              <View
                style={[
                  styles.headerIconCircle,
                  verificationStatus === 'verified'
                    ? { backgroundColor: 'rgba(16, 185, 129, 0.15)' }
                    : verificationStatus === 'pending'
                    ? { backgroundColor: 'rgba(245, 158, 11, 0.15)' }
                    : { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
                ]}
              >
                {verificationStatus === 'verified' ? (
                  <ShieldCheckIcon size={20} color="#10B981" />
                ) : verificationStatus === 'pending' ? (
                  <ClockHistoryIcon size={20} color="#F59E0B" />
                ) : (
                  <WarningTriangleIcon size={20} color="#EF4444" />
                )}
              </View>
              <View>
                <Text style={styles.sheetTitle}>Delivery Partner Profile</Text>
                <Text style={styles.sheetSub}>KYC Details & Admin Verification</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Status Banner based on Verification Status */}
            {verificationStatus === 'verified' && (
              <View style={[styles.statusBanner, styles.bannerVerified]}>
                <View style={[styles.statusBannerIcon, { backgroundColor: '#DCFCE7' }]}>
                  <CheckCircleIcon size={22} color="#15803D" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statusBannerTitle, { color: '#15803D' }]}>
                    Verified Delivery Hero
                  </Text>
                  <Text style={[styles.statusBannerDesc, { color: '#166534' }]}>
                    Your account and vehicle documents are fully approved by Admin. You are eligible for live order dispatch and instant payouts.
                  </Text>
                </View>
              </View>
            )}

            {verificationStatus === 'pending' && (
              <View style={[styles.statusBanner, styles.bannerPending]}>
                <View style={[styles.statusBannerIcon, { backgroundColor: '#FEF3C7' }]}>
                  <ClockHistoryIcon size={22} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statusBannerTitle, { color: '#B45309' }]}>
                    Verification Under Admin Review
                  </Text>
                  <Text style={[styles.statusBannerDesc, { color: '#92400E' }]}>
                    Your details have been submitted. QuickBite Admin is verifying your documents. Approvals typically take 12-24 hours.
                  </Text>
                </View>
              </View>
            )}

            {(verificationStatus === 'unverified' || verificationStatus === 'rejected') && (
              <View style={[styles.statusBanner, styles.bannerUnverified]}>
                <View style={[styles.statusBannerIcon, { backgroundColor: '#FEE2E2' }]}>
                  <WarningTriangleIcon size={22} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statusBannerTitle, { color: '#B91C1C' }]}>
                    {verificationStatus === 'rejected' ? 'Verification Rejected' : 'Admin Verification Required'}
                  </Text>
                  <Text style={[styles.statusBannerDesc, { color: '#991B1B' }]}>
                    {verificationStatus === 'rejected'
                      ? 'Admin requested document corrections. Please update the details below and re-apply.'
                      : 'Complete your vehicle, license, and bank details below, then submit your application for Admin approval.'}
                  </Text>
                </View>
              </View>
            )}

            {/* Section: Personal Details */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <DocumentIdIcon size={18} color={colors.primary} />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.inputLabel}>Registered Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. +91 9876543210"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, opacity: 0.8 }]}
                value={email}
                editable={false}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Section: Vehicle Details */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <DeliveryBikeIcon size={18} color={colors.primary} />
                <Text style={styles.sectionTitle}>Vehicle Information</Text>
              </View>

              <Text style={styles.inputLabel}>Vehicle Type</Text>
              <View style={styles.vehicleTypeRow}>
                {vehicleOptions.map((type) => {
                  const isSelected = vehicleType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typePill, isSelected && styles.typePillActive]}
                      onPress={() => setVehicleType(type as any)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.typePillText, isSelected && styles.typePillTextActive]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Vehicle Registration / Plate Number</Text>
              <TextInput
                style={styles.textInput}
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
                placeholder="e.g. KA-05-AB-1234"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
              />
            </View>

            {/* Section: KYC Document Verification */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <ShieldCheckIcon size={18} color={colors.primary} />
                <Text style={styles.sectionTitle}>KYC & Legal Verification</Text>
              </View>

              {/* Driving License */}
              <View style={styles.docItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>Driving License Number</Text>
                  <TextInput
                    style={styles.docInput}
                    value={drivingLicense}
                    onChangeText={setDrivingLicense}
                    placeholder="Enter Driving License (e.g. DL-KA-05-9821)"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                  />
                </View>
                <View
                  style={[
                    styles.docBadge,
                    drivingLicense ? styles.docBadgeFilled : styles.docBadgeEmpty,
                  ]}
                >
                  <Text
                    style={[
                      styles.docBadgeText,
                      drivingLicense ? styles.docBadgeTextFilled : styles.docBadgeTextEmpty,
                    ]}
                  >
                    {drivingLicense ? 'Uploaded' : 'Required'}
                  </Text>
                </View>
              </View>

              {/* Vehicle RC */}
              <View style={styles.docItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>Vehicle RC Number</Text>
                  <TextInput
                    style={styles.docInput}
                    value={vehicleRc}
                    onChangeText={setVehicleRc}
                    placeholder="Enter RC Certificate Number"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                  />
                </View>
                <View
                  style={[
                    styles.docBadge,
                    vehicleRc ? styles.docBadgeFilled : styles.docBadgeEmpty,
                  ]}
                >
                  <Text
                    style={[
                      styles.docBadgeText,
                      vehicleRc ? styles.docBadgeTextFilled : styles.docBadgeTextEmpty,
                    ]}
                  >
                    {vehicleRc ? 'Uploaded' : 'Optional'}
                  </Text>
                </View>
              </View>

              {/* National ID */}
              <View style={styles.docItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>Aadhaar / National ID</Text>
                  <TextInput
                    style={styles.docInput}
                    value={nationalId}
                    onChangeText={setNationalId}
                    placeholder="Enter Aadhaar Number (XXXX-XXXX-XXXX)"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View
                  style={[
                    styles.docBadge,
                    nationalId ? styles.docBadgeFilled : styles.docBadgeEmpty,
                  ]}
                >
                  <Text
                    style={[
                      styles.docBadgeText,
                      nationalId ? styles.docBadgeTextFilled : styles.docBadgeTextEmpty,
                    ]}
                  >
                    {nationalId ? 'Uploaded' : 'Required'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Section: Payout Bank & UPI Details */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <CardPaymentIcon size={18} color={colors.primary} />
                <Text style={styles.sectionTitle}>Payout Account & Bank Details</Text>
              </View>

              <Text style={styles.inputLabel}>UPI ID (for instant daily payouts)</Text>
              <TextInput
                style={styles.textInput}
                value={upiId}
                onChangeText={setUpiId}
                placeholder="e.g. mobile@upi"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Bank Account Number</Text>
              <TextInput
                style={styles.textInput}
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="Enter 12-16 digit account number"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
              />

              <Text style={styles.inputLabel}>Bank IFSC Code</Text>
              <TextInput
                style={styles.textInput}
                value={ifsc}
                onChangeText={setIfsc}
                placeholder="e.g. HDFC0001234"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
              />
            </View>

            {/* Application & Save Buttons */}
            <View style={styles.actionButtonsContainer}>
              {/* If Unverified or Rejected, highlight Apply for Admin Verification */}
              {verificationStatus !== 'verified' && (
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                  onPress={handleApplyVerification}
                  disabled={submittingVerification || saving}
                  activeOpacity={0.85}
                >
                  {submittingVerification ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryActionBtnText}>
                      {verificationStatus === 'pending'
                        ? 'Re-Submit for Admin Verification'
                        : 'Apply for Admin Verification'}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {/* Save / Update Changes Button */}
              <TouchableOpacity
                style={[
                  styles.secondaryActionBtn,
                  verificationStatus === 'verified' && { backgroundColor: colors.primary, borderWidth: 0 },
                ]}
                onPress={handleSaveProfile}
                disabled={saving || submittingVerification}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator
                    size="small"
                    color={verificationStatus === 'verified' ? '#FFFFFF' : colors.text}
                  />
                ) : (
                  <Text
                    style={[
                      styles.secondaryActionBtnText,
                      verificationStatus === 'verified' && { color: '#FFFFFF' },
                    ]}
                  >
                    {verificationStatus === 'verified' ? 'Save Profile Details' : 'Save Details as Draft'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
    statusBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      padding: 14,
      marginBottom: 16,
      gap: 12,
      borderWidth: 1,
    },
    bannerVerified: {
      backgroundColor: '#DCFCE7',
      borderColor: '#86EFAC',
    },
    bannerPending: {
      backgroundColor: '#FEF3C7',
      borderColor: '#FCD34D',
    },
    bannerUnverified: {
      backgroundColor: '#FEE2E2',
      borderColor: '#FCA5A5',
    },
    statusBannerIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusBannerTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    statusBannerDesc: {
      fontSize: 12,
      marginTop: 3,
      lineHeight: 17,
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
    vehicleTypeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    typePill: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 14,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    typePillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    typePillText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    typePillTextActive: {
      color: '#FFFFFF',
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
    docItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    docTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    docInput: {
      fontSize: 13,
      color: colors.text,
      paddingVertical: 4,
      fontWeight: '600',
    },
    docBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    docBadgeFilled: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    docBadgeEmpty: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
    },
    docBadgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    docBadgeTextFilled: {
      color: '#10B981',
    },
    docBadgeTextEmpty: {
      color: '#EF4444',
    },
    actionButtonsContainer: {
      gap: 10,
      marginTop: 8,
      marginBottom: 10,
    },
    primaryActionBtn: {
      paddingVertical: 14,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryActionBtnText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 15,
    },
    secondaryActionBtn: {
      paddingVertical: 12,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryActionBtnText: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 14,
    },
  });
