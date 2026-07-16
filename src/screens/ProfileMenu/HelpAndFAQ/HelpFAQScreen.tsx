import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';

type HelpFAQNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HelpFAQ'>;

type FilterType = 'General' | 'Account' | 'Services';

const FAQS = [
  { id: '1', question: 'Lorem ipsum dolor sit amet?', answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent pellentesque congue lorem, vel tincidunt tortor placerat a. Proin ac diam quam. Aenean in sagittis magna, ut feugiat diam.' },
  { id: '2', question: 'Lorem ipsum dolor sit amet?', answer: '' },
  { id: '3', question: 'Lorem ipsum dolor sit amet?', answer: '' },
  { id: '4', question: 'Lorem ipsum dolor sit amet?', answer: '' },
  { id: '5', question: 'Lorem ipsum dolor sit amet?', answer: '' },
  { id: '6', question: 'Lorem ipsum dolor sit amet?', answer: '' },
];

export default function HelpFAQScreen() {
  const navigation = useNavigation<HelpFAQNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [activeFilter, setActiveFilter] = useState<FilterType>('General');
  const [expandedId, setExpandedId] = useState<string | null>('1');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Help & FAQs</Text>
          <Text style={styles.headerSubtitle}>How Can We Help You?</Text>
        </View>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        
        {/* Top Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tabButton, styles.tabActive]}>
            <Text style={styles.tabTextActive}>FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, styles.tabInactive]}
            onPress={() => navigation.replace('ContactUs')}
          >
            <Text style={styles.tabTextInactive}>Contact Us</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {(['General', 'Account', 'Services'] as FilterType[]).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity 
                key={filter} 
                style={[styles.filterPill, isActive ? styles.filterActive : styles.filterInactive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, isActive ? styles.filterTextActive : styles.filterTextInactive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput 
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity style={styles.searchFilterBtn}>
            <Text style={styles.searchFilterIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {FAQS.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.faqHeader}
                  activeOpacity={0.7}
                  onPress={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <Text style={[styles.faqQuestion, isExpanded && styles.faqQuestionActive]}>
                    {item.question}
                  </Text>
                  <Text style={[styles.chevron, isExpanded && styles.chevronActive]}>
                    ˅
                  </Text>
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  </View>
                )}
              </View>
            )
          })}
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
    marginBottom: 20,
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
    backgroundColor: colors.inputBackground, 
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabTextInactive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    marginBottom: 20,
    gap: 10,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: colors.primary,
  },
  filterInactive: {
    backgroundColor: colors.inputBackground,
  },
  filterText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#fff',
  },
  filterTextInactive: {
    color: colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff', // From mockup, this is distinct white on the very light grey background
    borderWidth: 1,
    borderColor: '#f0f0f0',
    height: 45,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 14,
    color: colors.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchFilterBtn: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -45, // Overlap the input
    elevation: 3,
  },
  searchFilterIcon: {
    color: '#fff',
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 80,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary, // The inactive ones in mockup are orange
  },
  faqQuestionActive: {
    color: colors.text, // The expanded one is dark
  },
  chevron: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  chevronActive: {
    color: colors.primary,
  },
  faqBody: {
    paddingBottom: 20,
    paddingRight: 20,
  },
  faqAnswer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  }
});
