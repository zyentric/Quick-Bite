import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DeliveryAddress } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { useUser } from '../../../context/UserContext';
import { useToast } from '../../../context/ToastContext';
import { authFetch } from '../../../utils/authFetch';
import { API_URL } from '../../../config/api';
import {
  LockIcon,
  HomeBuildingIcon,
  WorkBuildingIcon,
  LocationPinIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
} from '../../../components/icons';
import CustomAlert from '../../../components/CustomAlert';
import CustomLoader from '../../../components/CustomLoader';

type DeliveryAddressNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DeliveryAddress'>;

export default function DeliveryAddressScreen() {
  const navigation = useNavigation<DeliveryAddressNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { userProfile, isAuthenticated, refreshUserProfile } = useUser();
  const { showToast } = useToast();

  const addresses = userProfile?.savedAddresses || [];

  const [loading, setLoading] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<DeliveryAddress | null>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      refreshUserProfile();
    }, [refreshUserProfile])
  );

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleSetDefault = async (item: DeliveryAddress) => {
    const targetId = item._id || item.id || item.label;
    if (!targetId) return;

    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/users/addresses/${targetId}/default`, {
        method: 'PUT',
      });
      if (res.ok) {
        await refreshUserProfile();
        showToast({
          type: 'success',
          title: 'Default Address',
          message: `"${item.label}" is now your default delivery address`,
        });
      } else {
        const data = await res.json();
        showAlert('Error', data.message || 'Failed to set default address');
      }
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (item: DeliveryAddress) => {
    setAddressToDelete(item);
    setConfirmDeleteVisible(true);
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;
    const targetId = addressToDelete._id || addressToDelete.id || addressToDelete.label;
    if (!targetId) return;

    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/users/addresses/${targetId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshUserProfile();
        showToast({
          type: 'info',
          title: 'Address Removed',
          message: `"${addressToDelete.label}" was deleted successfully`,
        });
      } else {
        const data = await res.json();
        showAlert('Error', data.message || 'Failed to delete address');
      }
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setLoading(false);
      setAddressToDelete(null);
    }
  };

  const handleEdit = (item: DeliveryAddress, index: number) => {
    navigation.navigate('AddNewAddress', {
      addressToEdit: item,
      editIndex: index,
    });
  };

  const renderAddressTypeIcon = (label?: string) => {
    const l = (label || '').toLowerCase();
    if (l === 'home') {
      return <HomeBuildingIcon size={20} color={colors.primary} />;
    }
    if (l === 'work' || l === 'office') {
      return <WorkBuildingIcon size={20} color={colors.primary} />;
    }
    return <LocationPinIcon size={20} color={colors.primary} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBackground} />
      <CustomLoader visible={loading} message="Updating address..." />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require('../../../assets/back.png')}
            style={{ width: 20, height: 20, resizeMode: 'contain', tintColor: colors.primary }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Addresses</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        {!isAuthenticated ? (
          <View style={styles.guestContainer}>
            <View style={{ marginBottom: 20 }}>
              <LockIcon size={64} color={colors.primary} />
            </View>
            <Text style={styles.guestText}>Please log in to view delivery addresses.</Text>
            <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.listContainer}>
              {addresses.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No saved addresses yet.</Text>
                  <Text style={styles.emptySubText}>Add an address to start ordering tasty meals!</Text>
                </View>
              ) : (
                addresses.map((item, index) => {
                  const fullAddress = [item.addressLine1, item.addressLine2, item.city, item.zipCode]
                    .filter(Boolean)
                    .join(', ');
                  const isDefault = item.isDefault || index === 0;

                  return (
                    <View key={item._id?.toString() || index.toString()} style={styles.addressCard}>
                      <View style={styles.cardHeader}>
                        <View style={styles.titleRow}>
                          <View style={styles.iconCircle}>
                            {renderAddressTypeIcon(item.label)}
                          </View>
                          <Text style={styles.addressLabel}>{item.label}</Text>
                          {isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <Text style={styles.addressBodyText}>{fullAddress}</Text>

                      <View style={styles.cardActions}>
                        {!isDefault ? (
                          <TouchableOpacity
                            style={styles.setDefaultBtn}
                            onPress={() => handleSetDefault(item)}
                          >
                            <Text style={styles.setDefaultText}>Set as Default</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.activeDefaultPill}>
                            <CheckCircleIcon size={14} color="#10B981" />
                            <Text style={styles.activeDefaultText}>Default Active</Text>
                          </View>
                        )}

                        <View style={styles.actionButtonsGroup}>
                          <TouchableOpacity
                            style={styles.actionIconButton}
                            onPress={() => handleEdit(item, index)}
                            accessibilityLabel="Edit Address"
                          >
                            <EditIcon size={16} color={colors.primary} />
                            <Text style={[styles.actionBtnLabel, { color: colors.primary }]}>Edit</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionIconButton, styles.deleteActionBtn]}
                            onPress={() => confirmDelete(item)}
                            accessibilityLabel="Delete Address"
                          >
                            <TrashIcon size={16} color="#EF4444" />
                            <Text style={[styles.actionBtnLabel, { color: '#EF4444' }]}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                style={styles.addAddressBtn}
                onPress={() => {
                  if (addresses.length >= 8) {
                    showAlert('Limit Reached', 'You can save a maximum of 8 delivery addresses.');
                    return;
                  }
                  navigation.navigate('AddNewAddress');
                }}
              >
                <Text style={styles.addAddressBtnText}>+ Add New Address</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Confirmation modal for delete */}
      <CustomAlert
        visible={confirmDeleteVisible}
        title="Delete Address"
        message={`Are you sure you want to remove "${addressToDelete?.label || 'this address'}" from your saved addresses?`}
        showCancel={true}
        cancelText="Cancel"
        confirmText="Delete"
        onClose={() => setConfirmDeleteVisible(false)}
        onConfirm={handleDeleteAddress}
      />

      {/* General alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
      paddingBottom: 25,
    },
    backButton: {
      padding: 10,
    },
    headerTitle: {
      fontSize: 22,
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
      paddingTop: 24,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 60,
    },
    listContainer: {
      marginBottom: 24,
      gap: 14,
    },
    addressCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addressLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    defaultBadge: {
      backgroundColor: '#FF7622',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    defaultBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    addressBodyText: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 19,
      marginBottom: 14,
    },
    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    setDefaultBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    setDefaultText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    activeDefaultPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    activeDefaultText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#10B981',
    },
    actionButtonsGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionIconButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },
    deleteActionBtn: {
      backgroundColor: '#FEF2F2',
    },
    actionBtnLabel: {
      fontSize: 12,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 50,
      backgroundColor: colors.inputBackground,
      borderRadius: 20,
      borderStyle: 'dashed',
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 6,
    },
    emptySubText: {
      fontSize: 13,
      color: colors.textMuted,
    },
    addButtonContainer: {
      alignItems: 'center',
      marginTop: 10,
    },
    addAddressBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 25,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
      width: '100%',
      alignItems: 'center',
    },
    addAddressBtnText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 15,
    },
    guestContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      marginTop: -50,
    },
    guestText: {
      fontSize: 18,
      color: colors.primary,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 30,
    },
    loginButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 25,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    loginButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
