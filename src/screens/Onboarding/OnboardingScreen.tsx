import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Image, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import Icons from '../../constants/icons';

const { width, height } = Dimensions.get('window');

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const onboardingData = [
  {
    id: '1',
    title: 'Order Fresh Food',
    description: 'Discover restaurants near you and browse menus with hundreds of fresh, delicious dishes ready to order in seconds.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2681&auto=format&fit=crop',
    iconAsset: Icons.meal
  },
  {
    id: '2',
    title: 'Easy & Secure Payment',
    description: 'Pay smoothly with UPI, credit/debit cards, or Cash on Delivery with full safety and instant confirmation.',
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=2574&auto=format&fit=crop',
    iconAsset: Icons.card
  },
  {
    id: '3',
    title: 'Fast Live Delivery',
    description: 'Track your food delivery in real time on a live GPS map straight to your door — quick, hot, and hassle-free.',
    image: 'https://images.unsplash.com/photo-1461023058943-07cb14a6ed45?q=80&w=2670&auto=format&fit=crop',
    iconAsset: Icons.deliverymen
  }
];

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigation.replace('MainTabs');
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }: { item: typeof onboardingData[0] }) => {
    return (
      <View style={styles.slide}>
        {/* Top Full Image */}
        <Image source={{ uri: item.image }} style={styles.image} />
        
        {/* Bottom Card */}
        <View style={styles.cardContainer}>
          <View style={styles.iconWrapper}>
            <Image source={item.iconAsset} style={styles.iconImg} />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          
          {/* Indicators */}
          <View style={styles.indicatorContainer}>
            {onboardingData.map((_, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.indicator, 
                  currentIndex === idx ? styles.indicatorActive : null
                ]} 
              />
            ))}
          </View>
          
          {/* Action Button */}
          <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.buttonText}>
              {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width: width,
    height: height,
  },
  image: {
    width: width,
    height: height * 0.65,
    resizeMode: 'cover',
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: height * 0.45,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 30,
    paddingTop: 24,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#F7D055',
  },
  iconImg: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary, 
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: colors.primary,
    width: 22,
  },
  button: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
