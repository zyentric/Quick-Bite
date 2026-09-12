import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import Icons from '../../constants/icons';

const { width } = Dimensions.get('window');

interface TabConfig {
  name: string;
  label: string;
  icon: any;
  isHero?: boolean;
}

const TAB_CONFIGS: Record<string, TabConfig> = {
  Home: {
    name: 'Home',
    label: 'Home',
    icon: Icons.home,
  },
  Favorites: {
    name: 'Favorites',
    label: 'Saved',
    icon: Icons.favorite,
  },
  FoodMenu: {
    name: 'FoodMenu',
    label: 'Explore',
    icon: Icons.spoons,
    isHero: true,
  },
  Cart: {
    name: 'Cart',
    label: 'Cart',
    icon: Icons.cart,
  },
  Orders: {
    name: 'Orders',
    label: 'Order',
    icon: Icons.cart,
  },
};

export function CustomBottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { totalItems } = useCart();
  const styles = getStyles(colors, insets.bottom);

  return (
    <View style={styles.tabBarWrapper} pointerEvents="box-none">
      {/* Floating Island Shell */}
      <View style={styles.tabBarContainer}>
        {/* Subtle Center Notch / Dome Curve */}
        <View style={styles.centerDomeBackdrop} />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIGS[route.name] || {
            name: route.name,
            label: route.name,
            icon: Icons.home,
          };

          const isHero = config.isHero;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({ name: route.name, merge: true } as any);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          if (isHero) {
            /* Center Elevated Circular Hero Button (e.g. Explore / Menu) */
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarButtonTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.heroTabButton}
                activeOpacity={0.82}
                hitSlop={{ top: 14, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[styles.heroCircleButton, isFocused && styles.heroCircleButtonActive]}>
                  <Image
                    source={config.icon}
                    style={[styles.heroIcon, isFocused && styles.heroIconActive]}
                  />
                </View>
                <Text
                  style={[
                    styles.heroLabel,
                    isFocused ? styles.heroLabelActive : styles.heroLabelInactive,
                  ]}
                  numberOfLines={1}
                >
                  {config.label}
                </Text>
                {isFocused ? (
                  <View style={styles.activeGlowDash} />
                ) : (
                  <View style={styles.inactiveDashPlaceholder} />
                )}
              </TouchableOpacity>
            );
          }

          /* Standard Tab Buttons (Home, Saved, Orders, Support) */
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
            >
              <View style={styles.iconContainer}>
                <Image
                  source={config.icon}
                  style={[
                    styles.tabIcon,
                    isFocused ? styles.tabIconActive : styles.tabIconInactive,
                  ]}
                />
                {/* Active Cart / Order Item Badge */}
                {(route.name === 'Cart' || route.name === 'Orders') && totalItems > 0 && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
                numberOfLines={1}
              >
                {config.label}
              </Text>

              {/* Glowing Neon Indicator Dash below active label */}
              {isFocused ? (
                <View style={styles.activeGlowDash} />
              ) : (
                <View style={styles.inactiveDashPlaceholder} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors, bottomInset: number) =>
  StyleSheet.create({
    tabBarWrapper: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'transparent',
      paddingHorizontal: 16,
      paddingBottom: Math.max(bottomInset, Platform.OS === 'ios' ? 16 : 12),
    },
    tabBarContainer: {
      flexDirection: 'row',
      backgroundColor: '#161412', // Deep matte charcoal from reference design
      borderRadius: 36,
      paddingTop: 10,
      paddingBottom: 8,
      paddingHorizontal: 8,
      borderWidth: 1.2,
      borderColor: 'rgba(255, 255, 255, 0.09)', // Subtle frosted glass ambient rim
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 18,
      elevation: 16,
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    centerDomeBackdrop: {
      position: 'absolute',
      top: -16,
      alignSelf: 'center',
      width: 76,
      height: 36,
      borderTopLeftRadius: 38,
      borderTopRightRadius: 38,
      backgroundColor: '#161412',
      borderWidth: 1.2,
      borderColor: 'rgba(255, 255, 255, 0.09)',
      borderBottomWidth: 0,
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 2,
    },
    heroTabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -22, // Elevates the circular hero button above the dome
    },
    heroCircleButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary, // Brand Orange from our theme (#E85D22)
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2.5,
      borderColor: '#161412',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.6,
      shadowRadius: 10,
      elevation: 10,
      marginBottom: 3,
    },
    heroCircleButtonActive: {
      transform: [{ scale: 1.06 }],
      backgroundColor: '#FF6B35',
      shadowOpacity: 0.8,
      shadowRadius: 14,
    },
    heroIcon: {
      width: 24,
      height: 24,
      tintColor: '#FFFFFF',
      resizeMode: 'contain',
    },
    heroIconActive: {
      tintColor: '#FFFFFF',
    },
    heroLabel: {
      fontSize: 11,
      textAlign: 'center',
      letterSpacing: 0.2,
    },
    heroLabelActive: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
    heroLabelInactive: {
      color: '#8C827A',
      fontWeight: '600',
    },
    iconContainer: {
      width: 28,
      height: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 3,
    },
    tabIcon: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
    },
    tabIconActive: {
      tintColor: '#FFFFFF', // Bright crisp white on active
      opacity: 1,
      transform: [{ scale: 1.05 }],
    },
    tabIconInactive: {
      tintColor: '#8C827A', // Soft muted charcoal/silver outline
      opacity: 0.65,
    },
    tabLabel: {
      fontSize: 11,
      textAlign: 'center',
      letterSpacing: 0.2,
    },
    tabLabelActive: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
    tabLabelInactive: {
      color: '#8C827A',
      fontWeight: '500',
    },
    activeGlowDash: {
      width: 20,
      height: 3.5,
      borderRadius: 2,
      backgroundColor: '#F7C653', // Glowing Brand Gold neon dash (matches screenshot layout)
      marginTop: 4,
      shadowColor: '#F7C653',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.9,
      shadowRadius: 6,
      elevation: 6,
    },
    inactiveDashPlaceholder: {
      width: 20,
      height: 3.5,
      marginTop: 4,
      backgroundColor: 'transparent',
    },
    badgePill: {
      position: 'absolute',
      top: -4,
      right: -6,
      backgroundColor: colors.primary,
      borderRadius: 9,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 4,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.2,
      borderColor: '#161412',
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '900',
      lineHeight: 10,
    },
  });

export default CustomBottomTabBar;



