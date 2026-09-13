import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, DimensionValue, useColorScheme } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

interface SkeletonPlaceholderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function SkeletonPlaceholder({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonPlaceholderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const systemScheme = useColorScheme();
  const { themePreference } = useAppTheme();
  const isDark =
    themePreference === 'dark' ||
    (themePreference === 'system' && systemScheme === 'dark');

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius,
          opacity,
          backgroundColor: isDark ? '#2E2E2E' : '#E8EAF0',
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {},
});

