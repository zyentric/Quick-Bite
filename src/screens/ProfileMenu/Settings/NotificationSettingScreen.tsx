import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import AppFooter from '../../../components/common/AppFooter';

type NotificationSettingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NotificationSetting'>;

export default function NotificationSettingScreen() {
  const navigation = useNavigation<NotificationSettingNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [orderAlerts, setOrderAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [promoOffers, setPromoOffers] = useState(true);
  const [specialDeals, setSpecialDeals] = useState(false);
  const [cashbackAlerts, setCashbackAlerts] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Image source={require('../../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section 1: Order Updates */}
          <Text style={styles.sectionLabel}>Order & Delivery Alerts</Text>
          <View style={styles.sectionBox}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Live Order Updates</Text>
                <Text style={styles.settingSubtitle}>Track food prep, pickup & live rider location</Text>
              </View>
              <Switch
                trackColor={{ false: '#E5E7EB', true: colors.primary }}
                thumbColor={'#FFFFFF'}
                onValueChange={setOrderAlerts}
                value={orderAlerts}
              />
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Sound & Ringtone</Text>
                <Text style={styles.settingSubtitle}>Play sound when rider arrives or status updates</Text>
              </View>
              <Switch
                trackColor={{ false: '#E5E7EB', true: colors.primary }}
                thumbColor={'#FFFFFF'}
                onValueChange={setSoundEnabled}
                value={soundEnabled}
              />
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Vibration Alert</Text>
                <Text style={styles.settingSubtitle}>Vibrate device on incoming delivery partner call</Text>
              </View>
              <Switch
                trackColor={{ false: '#E5E7EB', true: colors.primary }}
                thumbColor={'#FFFFFF'}
                onValueChange={setVibrateEnabled}
                value={vibrateEnabled}
              />
            </View>
          </View>

          {/* Section 2: Promotional Offers */}
          <Text style={styles.sectionLabel}>Offers & Recommendations</Text>
          <View style={styles.sectionBox}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Promo & Discounts</Text>
                <Text style={styles.settingSubtitle}>Exclusive restaurant coupons & flash deals</Text>
              </View>
              <Switch
                trackColor={{ false: '#E5E7EB', true: colors.primary }}
                thumbColor={'#FFFFFF'}
                onValueChange={setPromoOffers}
                value={promoOffers}
              />
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Pocket-Friendly Recommendations</Text>
                <Text style={styles.settingSubtitle}>Daily meal suggestions tailored to your taste</Text>
              </View>
              <Switch
                trackColor={{ false: '#E5E7EB', true: colors.primary }}
                thumbColor={'#FFFFFF'}
                onValueChange={setSpecialDeals}
                value={specialDeals}
              />
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Cashback & Rewards</Text>
                <Text style={styles.settingSubtitle}>Notifications when wallet cashback is credited</Text>
              </View>
              <Switch
                trackColor={{ false: '#E5E7EB', true: colors.primary }}
                thumbColor={'#FFFFFF'}
                onValueChange={setCashbackAlerts}
                value={cashbackAlerts}
              />
            </View>
          </View>

          {/* App Footer & Copyright */}
          <AppFooter bottomSpacing={20} />
        </ScrollView>
      </View>
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
    backIconImg: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
      tintColor: colors.primary,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFFFFF',
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
    sectionLabel: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 10,
      marginTop: 8,
      marginLeft: 4,
    },
    sectionBox: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      paddingHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#F3F4F6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
    },
    settingTextContainer: {
      flex: 1,
      paddingRight: 14,
    },
    settingTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    settingSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 16,
    },
    rowDivider: {
      height: 1,
      backgroundColor: '#F3F4F6',
    },
    versionContainer: {
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 10,
    },
    versionText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      marginBottom: 2,
    },
    versionSubText: {
      fontSize: 10,
      color: colors.textMuted,
      opacity: 0.7,
    },
  });
