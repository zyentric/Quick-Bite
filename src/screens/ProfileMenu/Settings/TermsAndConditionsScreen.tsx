import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import AppFooter from '../../../components/common/AppFooter';

export default function TermsAndConditionsScreen() {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const sections = [
    {
      title: '1. Introduction & Acceptance',
      content:
        'By downloading, accessing, or using the QuickBite application, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you must not use our services.',
    },
    {
      title: '2. User Accounts & Security',
      content:
        'You must provide accurate, current, and complete information during registration. You are responsible for safeguarding your login credentials and for all activities that occur under your account.',
    },
    {
      title: '3. Orders, Pricing & Delivery',
      content:
        'All orders placed through QuickBite are subject to restaurant acceptance and item availability. Prices listed in the app include applicable restaurant pricing and taxes. Delivery estimates are approximations subject to traffic, weather, and restaurant preparation times.',
    },
    {
      title: '4. Payments & Refunds',
      content:
        'Payments can be made via UPI, Debit/Credit Cards, Net Banking, and Cash on Delivery (where available). Cancellations are only permitted before the restaurant begins preparation. Approved refunds are processed to the original payment source within 3–5 business days.',
    },
    {
      title: '5. User Conduct & Prohibited Uses',
      content:
        'You agree not to misuse the service, provide fraudulent order information, harass delivery partners or restaurant staff, or attempt unauthorized access to our systems or servers.',
    },
    {
      title: '6. Limitation of Liability',
      content:
        'QuickBite is a food ordering and delivery technology platform. While we partner with licensed restaurants, food quality and hygiene are the responsibility of the respective culinary establishments.',
    },
    {
      title: '7. Amendments & Modifications',
      content:
        'QuickBite reserves the right to revise these terms at any time. Continued use of the application following updates constitutes your formal acceptance of the modified Terms and Conditions.',
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
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
            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>Version 2.4</Text>
            </View>
            <Text style={styles.lastUpdatedText}>Effective: September 2026</Text>
          </View>

          <Text style={styles.introText}>
            Please review these Terms and Conditions carefully before ordering food or using any
            services offered by QuickBite.
          </Text>

          {/* Sections */}
          {sections.map((sec, index) => (
            <View key={index} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{sec.title}</Text>
              <Text style={styles.sectionContent}>{sec.content}</Text>
            </View>
          ))}

          {/* Contact Box */}
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Questions or Concerns?</Text>
            <Text style={styles.contactText}>
              If you have any questions regarding these terms, please contact our legal and support team at{' '}
              <Text style={styles.linkText}>support@quickbite.com</Text>
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
    versionBadge: {
      backgroundColor: '#FFF4EB',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.2)',
    },
    versionBadgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
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
      backgroundColor: '#FFFBF2',
      borderRadius: 18,
      padding: 16,
      marginTop: 8,
      borderWidth: 1,
      borderColor: '#FCE7A6',
    },
    contactTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 6,
    },
    contactText: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 18,
    },
    linkText: {
      color: colors.primary,
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
