import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, LayoutAnimation, UIManager, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type HelpCenterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HelpCenter'>;

const FAQ_CATEGORIES = ['General', 'Account', 'Services'];

const FAQ_DATA = [
  { id: '1', question: 'Lorem ipsum dolor sit amet?', answer: 'Praesent pellentesque congue lorem, vel tincidunt tortor placerat a. Proin ac diam quam. Aenean in sagittis magna, ut feugiat diam.' },
  { id: '2', question: 'Lorem ipsum dolor sit amet?', answer: 'Detailed answer goes here.' },
  { id: '3', question: 'Lorem ipsum dolor sit amet?', answer: 'Detailed answer goes here.' },
  { id: '4', question: 'Lorem ipsum dolor sit amet?', answer: 'Detailed answer goes here.' },
  { id: '5', question: 'Lorem ipsum dolor sit amet?', answer: 'Detailed answer goes here.' },
];

const CONTACT_METHODS = [
  { id: 'c1', name: 'Customer service', icon: require('../../assets/customerService.png') },
  { id: 'c2', name: 'Website', icon: require('../../assets/website.png') },
  { id: 'c3', name: 'Whatsapp', icon: require('../../assets/whatsapp.png') },
  { id: 'c4', name: 'Facebook', icon: require('../../assets/facebook.png') },
  { id: 'c5', name: 'Instagram', icon: require('../../assets/instagram.png') },
];

export default function HelpCenterScreen() {
  const navigation = useNavigation<HelpCenterScreenNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const [activeTab, setActiveTab] = useState<'FAQ' | 'ContactUs'>('FAQ');
  const [activeFaqCategory, setActiveFaqCategory] = useState('General');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('1');
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaqId(prev => prev === id ? null : id);
  };

  const toggleContact = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedContactId(prev => prev === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Yellow Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Image source={require('../../assets/back.png')} style={styles.backIconImg} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Help Center</Text>
              <Text style={styles.headerSubtitle}>How Can We Help You?</Text>
            </View>
            <View style={styles.backBtn} />
          </View>
        </View>

        {/* White Content Section */}
        <View style={styles.contentSection}>
          
          {/* Main Tabs */}
          <View style={styles.mainTabsContainer}>
            <TouchableOpacity 
              style={[styles.mainTab, activeTab === 'FAQ' && styles.mainTabActive]}
              onPress={() => setActiveTab('FAQ')}
            >
              <Text style={[styles.mainTabText, activeTab === 'FAQ' && styles.mainTabTextActive]}>FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.mainTab, activeTab === 'ContactUs' && styles.mainTabActive]}
              onPress={() => setActiveTab('ContactUs')}
            >
              <Text style={[styles.mainTabText, activeTab === 'ContactUs' && styles.mainTabTextActive]}>Contact Us</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {activeTab === 'FAQ' ? (
              <View>
                {/* Sub Categories */}
                <View style={styles.subCategoriesContainer}>
                  {FAQ_CATEGORIES.map(cat => (
                    <TouchableOpacity 
                      key={cat}
                      style={[styles.subCategoryBtn, activeFaqCategory === cat && styles.subCategoryBtnActive]}
                      onPress={() => setActiveFaqCategory(cat)}
                    >
                      <Text style={[styles.subCategoryText, activeFaqCategory === cat && styles.subCategoryTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Search Bar */}
                <View style={styles.searchBox}>
                  <TextInput 
                    style={styles.searchInput}
                    placeholder="Search"
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity style={styles.filterIconBtn}>
                    <Image source={require('../../assets/settings.png')} style={styles.filterIconImg} />
                  </TouchableOpacity>
                </View>

                {/* FAQ List */}
                <View style={styles.accordionContainer}>
                  {FAQ_DATA.map(item => {
                    const isExpanded = expandedFaqId === item.id;
                    return (
                      <View key={item.id} style={styles.accordionItem}>
                        <TouchableOpacity 
                          style={styles.accordionHeader} 
                          onPress={() => toggleFaq(item.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.accordionTitle, isExpanded && styles.accordionTitleActive]}>
                            {item.question}
                          </Text>
                          <View style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}>
                            <Image source={require('../../assets/next.png')} style={styles.accordionChevronImg} />
                          </View>
                        </TouchableOpacity>
                        
                        {isExpanded && (
                          <View style={styles.accordionContent}>
                            <Text style={styles.accordionText}>{item.answer}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>

              </View>
            ) : (
              <View style={styles.contactContainer}>
                {/* Contact Us List */}
                <View style={styles.accordionContainer}>
                  {CONTACT_METHODS.map(item => {
                    const isExpanded = expandedContactId === item.id;
                    return (
                      <View key={item.id} style={styles.accordionItem}>
                        <TouchableOpacity 
                          style={styles.accordionHeader} 
                          onPress={() => toggleContact(item.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.contactRow}>
                            <Image source={item.icon} style={styles.contactIconImg} />
                            <Text style={styles.accordionTitle}>{item.name}</Text>
                          </View>
                          <View style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}>
                            <Image source={require('../../assets/next.png')} style={styles.accordionChevronImg} />
                          </View>
                        </TouchableOpacity>
                        
                        {isExpanded && (
                          <View style={styles.accordionContent}>
                            <Text style={styles.accordionText}>Contact details for {item.name}...</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
            
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7D055', 
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary, 
  },
  headerSection: {
    backgroundColor: '#F7D055',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30, 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIconImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#fff',
    marginTop: 2,
    opacity: 0.9,
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    overflow: 'hidden',
  },
  mainTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 25,
    paddingBottom: 15,
    gap: 15,
  },
  mainTab: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: '#FDF7E8', // Light tinted background for inactive
  },
  mainTabActive: {
    backgroundColor: colors.primary,
  },
  mainTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  mainTabTextActive: {
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 25,
  },
  subCategoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  subCategoryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: '#FDF7E8',
  },
  subCategoryBtnActive: {
    backgroundColor: colors.primary,
  },
  subCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  subCategoryTextActive: {
    color: '#fff',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', 
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#333',
  },
  filterIconBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  filterIconImg: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  accordionContainer: {
    marginTop: 10,
  },
  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  accordionTitleActive: {
    color: '#333',
  },
  accordionChevronImg: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  accordionContent: {
    paddingBottom: 15,
    paddingRight: 20,
  },
  accordionText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  contactContainer: {
    paddingTop: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  contactIconImg: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
});
