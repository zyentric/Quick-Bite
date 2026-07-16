import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';

type NotificationSettingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NotificationSetting'>;

const INITIAL_SETTINGS = [
  { id: '1', title: 'General Notification', enabled: true },
  { id: '2', title: 'Sound', enabled: true },
  { id: '3', title: 'Sound Call', enabled: true },
  { id: '4', title: 'Vibrate', enabled: false },
  { id: '5', title: 'Special Offers', enabled: false },
  { id: '6', title: 'Payments', enabled: false },
  { id: '7', title: 'Promo and discount', enabled: false },
  { id: '8', title: 'Cashback', enabled: false },
];

export default function NotificationSettingScreen() {
  const navigation = useNavigation<NotificationSettingNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  const toggleSwitch = (id: string) => {
    setSettings(prev => 
      prev.map(item => 
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Setting</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {settings.map((item) => (
            <View key={item.id} style={styles.settingRow}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Switch
                trackColor={{ false: '#f0f0f0', true: colors.primary }}
                thumbColor={'#ffffff'}
                ios_backgroundColor="#f0f0f0"
                onValueChange={() => toggleSwitch(item.id)}
                value={item.enabled}
              />
            </View>
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
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});
