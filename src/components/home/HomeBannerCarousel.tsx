import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useThemeColors, ThemeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');

export interface BannerItem {
  id: string;
  image: string;
  tag: string;
  text: string;
  subtext: string;
}

export interface HomeBannerCarouselProps {
  banners: BannerItem[];
  onPressBanner: (banner: BannerItem) => void;
}

export default function HomeBannerCarousel({ banners, onPressBanner }: HomeBannerCarouselProps) {
  const [activeBanner, setActiveBanner] = useState(0);
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const handleScroll = (e: any) => {
    const slide = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
    setActiveBanner(slide);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            style={styles.slide}
            onPress={() => onPressBanner(banner)}
            activeOpacity={0.92}
          >
            <Image source={{ uri: banner.image }} style={styles.image} />
            <View style={styles.overlay}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{banner.tag}</Text>
              </View>
              <Text style={styles.text}>{banner.text}</Text>
              <Text style={styles.subtext}>{banner.subtext}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.dotsContainer}>
        {banners.map((_, i) => (
          <View key={i} style={[styles.dot, activeBanner === i && styles.activeDot]} />
        ))}
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 20,
      marginBottom: 24,
    },
    slide: {
      width: width - 40,
      height: 145,
      borderRadius: 20,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#333',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    overlay: {
      ...StyleSheet.absoluteFill as any,
      backgroundColor: 'rgba(0,0,0,0.48)',
      padding: 16,
      justifyContent: 'center',
    },
    tagBadge: {
      backgroundColor: colors.primary,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginBottom: 6,
    },
    tagText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    text: {
      fontSize: 16,
      fontWeight: '900',
      color: '#FFFFFF',
      lineHeight: 20,
      marginBottom: 4,
    },
    subtext: {
      fontSize: 11,
      color: '#F7D055',
      fontWeight: '600',
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#E0E0E0',
      marginHorizontal: 3,
    },
    activeDot: {
      width: 18,
      backgroundColor: colors.primary,
    },
  });
