import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';

type SettingsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const SETTING_ITEMS = [
  { id: '1', title: 'Notification Setting', icon: '🔔', screen: 'NotificationSetting' },
  { id: '2', title: 'Password Setting', icon: '🔑', screen: 'PasswordSetting' },
  { id: '3', title: 'Delete Account', icon: '👤', screen: 'DeleteAccount' }, // We can just alert for this one or create a dummy screen later
];

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.rightPlaceholder} />
      </View>

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
                <Text style={styles.settingIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.chevron}>˅</Text>
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
  settingIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  chevron: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  }
});
