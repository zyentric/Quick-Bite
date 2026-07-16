import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';


type FilterNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Filter'>;

const MAIN_CATEGORIES = [
  { id: 'Snacks', icon: '🥨' },
  { id: 'Meal', icon: '🍽️' },
  { id: 'Vegan', icon: '🥗' },
  { id: 'Dessert', icon: '🧁' },
  { id: 'Drinks', icon: '🍹' },
];

const SUB_CATEGORIES: Record<string, string[]> = {
  'Snacks': ['Bruschetta', 'Spring Rolls', 'Crepes', 'Wings', 'Skewers', 'Salmon', 'Mexican', 'Baked', 'Appetizer'],
  'Meal': ['Sushi', 'Pizza', 'Chicken', 'Curry', 'Burger', 'Cheese', 'Fresh Prawn', 'Ceviche', 'Pad Thai'],
  'Vegan': ['Bean Burger', 'Lasagna', 'Pizza', 'Mushroom', 'Risotto', 'Broccoli', 'Hummus', 'Quinoa', 'Salad'],
  'Dessert': ['Crepes', 'Macarons', 'Cupcakes', 'Ice Cream', 'Flan', 'Cheesecake', 'Chocolate', 'Cakes', 'Brownie'],
  'Drinks': ['Coffee', 'Cocktail', 'Juice', 'Milkshake', 'Wine', 'Pina Colada', 'Mojito', 'Craft Beer', 'Ice Tea']
};

export default function FilterScreen() {
  const navigation = useNavigation<FilterNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [selectedMain, setSelectedMain] = useState('Snacks');
  const [selectedRating, setSelectedRating] = useState(4); // 4 stars default
  const [selectedSubs, setSelectedSubs] = useState<string[]>(['Skewers', 'Salmon']); // Default selections for Snacks

  const toggleSubCategory = (sub: string) => {
    if (selectedSubs.includes(sub)) {
      setSelectedSubs(selectedSubs.filter(s => s !== sub));
    } else {
      setSelectedSubs([...selectedSubs, sub]);
    }
  };

  const handleMainCategorySelect = (catId: string) => {
    setSelectedMain(catId);
    setSelectedSubs([]); // reset sub-categories on main change, or set specific ones based on mockup
    
    // Mockup defaults for each
    if (catId === 'Meal') setSelectedSubs(['Sushi', 'Curry']);
    else if (catId === 'Vegan') setSelectedSubs(['Mushroom', 'Risotto']);
    else if (catId === 'Dessert') setSelectedSubs(['Cupcakes', 'Chocolate']);
    else if (catId === 'Drinks') setSelectedSubs(['Coffee']);
    else if (catId === 'Snacks') setSelectedSubs(['Skewers', 'Salmon']);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Yellow Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter</Text>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>🛒</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* White Content Container */}
      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Main Categories Row */}
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.mainCategoriesRow}>
            {MAIN_CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat.id} 
                style={styles.mainCatContainer}
                onPress={() => handleMainCategorySelect(cat.id)}
              >
                <View style={[
                  styles.mainCatCircle, 
                  selectedMain === cat.id ? styles.mainCatCircleSelected : null
                ]}>
                  <Text style={styles.mainCatIcon}>{cat.icon}</Text>
                </View>
                <Text style={styles.mainCatLabel}>{cat.id}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.divider} />

          {/* Sort By */}
          <Text style={styles.sectionTitle}>Sort by</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Top Rated</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
                  <Text style={[styles.starIcon, star <= selectedRating ? styles.starSelected : styles.starUnselected]}>
                    {star <= selectedRating ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.divider} />

          {/* Sub Categories (Pills) */}
          <Text style={styles.sectionTitleSmall}>Categories</Text>
          <View style={styles.pillsContainer}>
            {SUB_CATEGORIES[selectedMain].map((sub, index) => {
              const isSelected = selectedSubs.includes(sub);
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.pill, isSelected ? styles.pillSelected : null]}
                  onPress={() => toggleSubCategory(sub)}
                >
                  <Text style={[styles.pillText, isSelected ? styles.pillTextSelected : null]}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.divider} />

          {/* Price Range */}
          <Text style={styles.sectionTitlePrice}>Price</Text>
          <View style={styles.sliderContainer}>
            {/* Custom dual slider mockup visualization */}
            <View style={styles.sliderTrackBackground} />
            <View style={[styles.sliderTrackActive, { left: '20%', width: '30%' }]} />
            <View style={[styles.sliderThumb, { left: '20%' }]} />
            <View style={[styles.sliderThumb, { left: '50%' }]} />
          </View>
          <View style={styles.priceLabelsRow}>
            <Text style={styles.priceLabel}>$1</Text>
            <Text style={styles.priceLabel}>$10</Text>
            <Text style={styles.priceLabel}>$50</Text>
            <Text style={styles.priceLabel}>$100 {'>'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.applyBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
      
      {/* Bottom Tabs */}
      <View style={styles.bottomTabsContainer}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.tabIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn}>
          <Text style={styles.tabIcon}>🍽️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn}>
          <Text style={styles.tabIcon}>🤍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn}>
          <Text style={styles.tabIcon}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn}>
          <Text style={styles.tabIcon}>🎧</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7D055', // Yellow background from mockup
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
  backButtonText: {
    fontSize: 24,
    color: colors.primary, // Orange back arrow
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 100, // Space for bottom section
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  sectionTitleSmall: {
    fontSize: 14,
    fontWeight: 'normal',
    color: colors.textMuted,
    marginBottom: 15,
  },
  sectionTitlePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary, // Orange for Price
    marginBottom: 20,
  },
  mainCategoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mainCatContainer: {
    alignItems: 'center',
  },
  mainCatCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF4E6', // Light peach background
    borderWidth: 1,
    borderColor: '#FDE1D3', // Subtle border
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainCatCircleSelected: {
    backgroundColor: '#F7D055', // Yellow for selected? The mockup shows yellow circles with orange borders, wait. Actually the selected one has orange fill? Looking at 4.4-A, Snacks is filled yellow. Oh wait, the mockup has yellow circles. Let's stick with yellow for selected.
    borderColor: '#F7D055',
  },
  mainCatIcon: {
    fontSize: 20,
  },
  mainCatLabel: {
    fontSize: 12,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    color: colors.text,
    marginRight: 15,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  starSelected: {
    color: colors.primary, // Orange stars
  },
  starUnselected: {
    color: colors.primary,
    opacity: 0.3, // Outlined/muted star effect
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    backgroundColor: '#FFF4E6', // Light peach
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10, // Backup for older RN versions without gap support
  },
  pillSelected: {
    backgroundColor: colors.primary, // Solid orange
  },
  pillText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  pillTextSelected: {
    color: '#fff',
  },
  sliderContainer: {
    height: 20,
    justifyContent: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
    position: 'relative',
  },
  sliderTrackBackground: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    width: '100%',
  },
  sliderTrackActive: {
    height: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    borderRadius: 2,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 0,
    transform: [{ translateX: -10 }],
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  priceLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 40,
    marginBottom: 20,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
