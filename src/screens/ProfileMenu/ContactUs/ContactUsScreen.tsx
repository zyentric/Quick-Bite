import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';

type ContactUsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ContactUs'>;

const CONTACT_METHODS = [
  { id: '1', title: 'Customer service', icon: '🎧' },
  { id: '2', title: 'Website', icon: '🌐' },
  { id: '3', title: 'Whatsapp', icon: '💬' },
  { id: '4', title: 'Facebook', icon: '📘' },
  { id: '5', title: 'Instagram', icon: '📸' },
];

export default function ContactUsScreen() {
  const navigation = useNavigation<ContactUsNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <Text style={styles.headerSubtitle}>How Can We Help You?</Text>
        </View>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        
        {/* Top Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, styles.tabInactive]}
            onPress={() => navigation.replace('HelpFAQ')}
          >
            <Text style={styles.tabTextInactive}>FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, styles.tabActive]}>
            <Text style={styles.tabTextActive}>Contact Us</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {CONTACT_METHODS.map((item, index) => (
            <TouchableOpacity key={item.id} style={styles.methodRow} activeOpacity={0.7}>
              <View style={styles.iconContainer}>
                <Text style={styles.methodIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.methodTitle}>{item.title}</Text>
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
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    marginBottom: 30,
    gap: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabInactive: {
    backgroundColor: colors.inputBackground, // Light peach/yellow
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabTextInactive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 80,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  iconContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  methodIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  methodTitle: {
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
