import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import AppFooter from '../../../components/common/AppFooter';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const sections = [
    {
      title: '1. Information We Collect',
      content:
        'We collect information you provide directly to us when you create an account, update your profile, place an order, or contact support. This includes your name, email address, phone number, saved delivery addresses, GPS location, and order history.',
    },
    {
      title: '2. How We Use Your Information',
      content:
        'We use the collected information to process and deliver your food orders, track live deliveries on the map, provide customer support, send important updates/notifications, detect & prevent fraud, and personalize your food recommendations.',
    },
    {
      title: '3. Location Data & Permissions',
      content:
        'With your permission, we collect precise GPS coordinates to identify nearby restaurants, calculate accurate delivery durations, and route delivery partners directly to your doorstep. You can enable or disable location services anytime in your device settings.',
    },
    {
      title: '4. Information Sharing & Third Parties',
      content:
        'We share necessary information (such as your delivery address and contact number) with assigned delivery partners and restaurants strictly to fulfill your order. We never sell your personal information to third parties.',
    },
    {
      title: '5. Data Security & Storage',
      content:
        'We implement industry-standard encryption protocols (including HTTPS/TLS and secure token management) to protect your personal and payment information against unauthorized access, loss, or disclosure.',
    },
    {
      title: '6. Your Privacy Rights & Controls',
      content:
        'You have full control over your personal data. You may review, edit, or delete your saved delivery addresses, update account details, or request full account deletion directly within the QuickBite application settings.',
    },
    {
      title: '7. Policy Updates',
      content:
        'We may update this Privacy Policy periodically to reflect changes in our services or legal requirements. Significant updates will be communicated through in-app notifications.',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBackground} />

      {/* Header matching SettingsScreen */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Image source={require('../../../assets/back.png')} style={styles.backIconImg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Badge */}
          <View style={styles.badgeRow}>
            <View style={styles.shieldBadge}>
              <Text style={styles.shieldBadgeText}>🛡️ 100% Secure & Encrypted</Text>
            </View>
            <Text style={styles.lastUpdatedText}>Updated: September 2026</Text>
          </View>

          <Text style={styles.introText}>
            At QuickBite, your privacy and personal data security are our highest priorities.
            This Privacy Policy explains how we collect, use, and protect your information.
          </Text>

          {/* Policy Sections */}
          {sections.map((sec, index) => (
            <View key={index} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{sec.title}</Text>
              <Text style={styles.sectionContent}>{sec.content}</Text>
            </View>
          ))}

          {/* Privacy Officer Contact */}
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Data Privacy Officer</Text>
            <Text style={styles.contactText}>
              For any questions regarding your data, GDPR/data rights, or privacy practices, reach us at{' '}
              <Text style={styles.linkText}>privacy@quickbite.com</Text>
            </Text>
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
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    shieldBadge: {
      backgroundColor: '#ECFDF5',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#A7F3D0',
    },
    shieldBadgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#059669',
    },
    lastUpdatedText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
    },
    introText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 20,
      opacity: 0.85,
    },
    sectionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#F3F4F6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    sectionContent: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 20,
    },
    contactCard: {
      backgroundColor: '#EFF6FF',
      borderRadius: 18,
      padding: 16,
      marginTop: 8,
      borderWidth: 1,
      borderColor: '#BFDBFE',
    },
    contactTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#1E40AF',
      marginBottom: 6,
    },
    contactText: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 18,
    },
    linkText: {
      color: '#2563EB',
      fontWeight: '700',
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
