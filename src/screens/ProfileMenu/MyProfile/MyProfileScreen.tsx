import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { useUser } from '../../../context/UserContext';
import { API_URL } from '../../../config/api';
import CustomLoader from '../../../components/CustomLoader';
import CustomAlert from '../../../components/CustomAlert';

type MyProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyProfile'>;

const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export default function MyProfileScreen() {
  const navigation = useNavigation<MyProfileNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { userId } = useUser();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [dob, setDob] = useState('09 / 10 / 1991');
  const [phone, setPhone] = useState('+123 567 89000');
  
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: {
            'user-id': userId,
          }
        });
        if (res.ok) {
          const data = await res.json();
          setFullName(data.name || '');
          setEmail(data.email || '');
          setProfilePicture(data.profilePicture || '');
          setPhone(data.phone || '');
        } else {
          showAlert('Error', 'Failed to fetch profile details');
        }
      } catch (e: any) {
        showAlert('Network Error', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleUpdate = async () => {
    if (!userId) return;
    if (!fullName.trim()) {
      showAlert('Required', 'Full Name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId,
        },
        body: JSON.stringify({
          name: fullName,
          profilePicture: profilePicture,
          phone: phone,
        })
      });
      if (res.ok) {
        // Success
        navigation.goBack();
      } else {
        const errData = await res.json();
        showAlert('Error', errData.message || 'Failed to update profile');
      }
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const openImageModal = () => {
    setTempImageUrl(profilePicture);
    setImageModalVisible(true);
  };

  const saveImageUrl = () => {
    setProfilePicture(tempImageUrl);
    setImageModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomLoader visible={loading} message="Processing..." />
      <CustomAlert 
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My profile</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.avatarContainer}>
            {profilePicture ? (
              <Image 
                source={{ uri: profilePicture }} 
                style={styles.avatarImage} 
              />
            ) : (
              <View style={[styles.avatarImage, styles.avatarInitialsContainer]}>
                <Text style={styles.avatarInitialsText}>
                  {getInitials(fullName || 'John Smith')}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraIconContainer} onPress={openImageModal}>
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput 
              style={styles.textInput}
              value={dob}
              onChangeText={setDob}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
              style={[styles.textInput, styles.disabledInput]}
              value={email}
              editable={false}
              selectTextOnFocus={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput 
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
              <Text style={styles.updateBtnText}>Update Profile</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>

      {/* Profile Picture URL Editor Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Profile Picture URL</Text>
            <TextInput 
              style={styles.modalInput}
              placeholder="Paste Image URL here"
              placeholderTextColor="#999"
              value={tempImageUrl}
              onChangeText={setTempImageUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setImageModalVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={saveImageUrl}>
                <Text style={styles.modalBtnConfirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 40,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 80, // Padding for bottom tab bar
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 25,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraIcon: {
    fontSize: 14,
    color: '#fff',
  },
  formGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: colors.inputBackground, // Light yellow/grey
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 14,
    color: colors.inputText,
    fontWeight: '500',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  updateBtn: {
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
  updateBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  avatarInitialsContainer: {
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.8,
    borderColor: colors.primary,
  },
  avatarInitialsText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
  },
  disabledInput: {
    opacity: 0.65,
    backgroundColor: '#eaeaea',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '85%',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalBtnConfirm: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalBtnConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
