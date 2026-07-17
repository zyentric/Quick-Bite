import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { API_URL } from '../../config/api';
import CustomLoader from '../../components/CustomLoader';
import CustomAlert from '../../components/CustomAlert';
import DashboardHeader from '../../components/DashboardHeader';
import { HomeIcon, MenuIcon, HeartIcon, ClipboardIcon, HelpIcon } from '../../components/VectorIcons';

const { width } = Dimensions.get('window');

type FoodMenuNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodMenu'>;

const CATEGORIES = [
  { id: 'Snacks', icon: '🥨' },
  { id: 'Meal', icon: '🍽️' },
  { id: 'Vegan', icon: '🥗' },
  { id: 'Dessert', icon: '🧁' },
  { id: 'Drinks', icon: '🍹' },
];
export default function FoodMenuScreen() {
  const navigation = useNavigation<FoodMenuNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Snacks');
  const [foodData, setFoodData] = useState<Record<string, MenuItem[]>>({});
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const colors = useThemeColors();
  const styles = getStyles(colors);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/menu-items`);
      const data = await response.json();
      if (!response.ok) {
        showAlert('Error', data.message || 'Failed to fetch menu items');
        return;
      }
      
      // Group items by category
      const grouped: Record<string, MenuItem[]> = {};
      data.forEach((item: any) => {
        const cat = item.category || 'Snacks';
        if (!grouped[cat]) {
          grouped[cat] = [];
        }
        grouped[cat].push({
          id: item.id || item._id,
          name: item.name,
          price: item.price,
          rating: item.rating || 4.5,
          description: item.description || '',
          image: item.image || '',
          customizations: item.customizations || []
        });
      });
      setFoodData(grouped);
    } catch (e: any) {
      showAlert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const renderFoodItem = (item: MenuItem) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.foodCard}
      onPress={() => navigation.navigate('FoodDetails', { item })}
    >
      <Image source={{ uri: item.image }} style={styles.foodImage} />
      <View style={styles.foodInfo}>
        <View style={styles.foodHeader}>
          <Text style={styles.foodTitle}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {item.rating?.toFixed(1)}</Text>
          </View>
          <Text style={styles.foodPrice}>₹{item.price.toFixed(2)}</Text>
        </View>
        <Text style={styles.foodDescription} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Reusable Custom Loader */}
      <CustomLoader visible={loading} message="Loading Menu..." />

      {/* Reusable Custom Alert Modal */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <View style={styles.container}>
        
        {/* Yellow Header Area */}
        <View style={styles.headerSection}>
          <DashboardHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </View>

        {/* Orange Curved Content Area */}
        <View style={styles.contentSection}>
          
          {/* Horizontal Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <TouchableOpacity 
                  key={cat.id} 
                  style={styles.categoryItem}
                  onPress={() => setActiveTab(cat.id)}
                >
                  <View style={[styles.categoryCircle, isActive ? styles.categoryCircleActive : null]}>
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  </View>
                  <Text style={[styles.categoryLabel, isActive ? styles.categoryLabelActive : null]}>
                    {cat.id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sort By Filter */}
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>Sort By <Text style={styles.sortHighlight}>Popular</Text></Text>
            <TouchableOpacity style={styles.sortIconBtn}>
              <Text style={styles.sortIconText}>🔃</Text>
            </TouchableOpacity>
          </View>

          {/* Food List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {foodData[activeTab]?.map(renderFoodItem)}
          </ScrollView>
        </View>

        {/* Bottom Tabs */}
        <View style={styles.bottomTabsContainer}>
          <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
            <HomeIcon color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'FoodMenu' })}>
            <MenuIcon color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.getParent()?.navigate('MainTabs', { screen: 'Favorites' })}>
            <HeartIcon color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.getParent()?.navigate('MainTabs', { screen: 'Orders' })}>
            <ClipboardIcon color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.getParent()?.navigate('MainTabs', { screen: 'Help' })}>
            <HelpIcon color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7D055', // Yellow
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary, // Orange bottom area
  },
  headerSection: {
    backgroundColor: '#F7D055',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    flex: 1,
    marginRight: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: '#000',
    fontSize: 14,
  },
  filterIconBtn: {
    marginLeft: 5,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIconText: {
    fontSize: 12,
    color: '#fff',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconBtnText: {
    fontSize: 16,
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#fff', // White container for categories and list
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -20,
    paddingTop: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 100, // Fixed height to not interfere with scroll
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#FDE1D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryCircleActive: {
    backgroundColor: '#F7D055',
    borderColor: '#F7D055',
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  categoryLabelActive: {
    fontWeight: 'bold',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  sortLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  sortHighlight: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  sortIconBtn: {
    backgroundColor: colors.inputBackground,
    padding: 5,
    borderRadius: 15,
  },
  sortIconText: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  foodCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    paddingBottom: 15,
  },
  foodImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  foodInfo: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  ratingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  foodPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  foodDescription: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  bottomTabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    bottom: 0,
  },
  tabBtn: {
    padding: 5,
  },
  tabIcon: {
    fontSize: 20,
    color: '#fff',
  }
});
