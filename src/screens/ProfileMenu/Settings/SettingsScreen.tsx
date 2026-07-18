import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { useAppTheme } from '../../../context/ThemeContext';

type SettingsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const SETTING_ITEMS = [
  { id: '1', title: 'Notification Setting', icon: require('../../../assets/notification.png'), screen: 'NotificationSetting' },
  { id: '2', title: 'Password Setting', icon: require('../../../assets/keysetting.png'), screen: 'PasswordSetting' },
  { id: '3', title: 'Delete Account', icon: require('../../../assets/user.png'), screen: 'DeleteAccount' },
];

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const { themePreference, setThemePreference } = useAppTheme();
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity style={styles.themeButton} onPress={() => setThemeModalVisible(true)}>
          <Image source={require('../../../assets/settings.png')} style={styles.themeIconImg} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={themeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setThemeModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Theme</Text>
            
            {(['light', 'dark', 'system'] as const).map(pref => (
              <TouchableOpacity 
                key={pref} 
                style={[styles.themeOption, themePreference === pref && { backgroundColor: colors.primary + '20' }]} 
                onPress={() => {
                  setThemePreference(pref);
                  setThemeModalVisible(false);
                }}
              >
                <Text style={[styles.themeOptionText, { color: colors.text }, themePreference === pref && { color: colors.primary, fontWeight: 'bold' }]}>
                  {pref.charAt(0).toUpperCase() + pref.slice(1)} {pref === 'system' && 'Setting'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {SETTING_ITEMS.map((item, _index) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.settingRow} 
              activeOpacity={0.7}
              onPress={() => {
                if (item.screen === 'NotificationSetting') {
                  navigation.navigate('NotificationSetting');
                } else if (item.screen === 'PasswordSetting') {
                  navigation.navigate('PasswordSetting');
                } else {
                  console.log('Delete account pressed');
                }
              }}
            >
              <View style={styles.iconContainer}>
                <Image source={item.icon} style={styles.settingIconImg} />
              </View>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Image source={require('../../../assets/next.png')} style={styles.chevronImg} />
            </TouchableOpacity>
          ))}
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
  backIconImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rightPlaceholder: {
    width: 40, 
  },
  themeButton: {
    padding: 10,
  },
  themeIconImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  themeOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  themeOptionText: {
    fontSize: 16,
    textAlign: 'center',
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
    paddingHorizontal: 30,
    paddingBottom: 80,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  settingIconImg: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  chevronImg: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
    tintColor: colors.primary,
  }
});
