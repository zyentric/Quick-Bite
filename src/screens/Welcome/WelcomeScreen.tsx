import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import Icons from '../../constants/icons';
import { APP_VERSION } from '../../constants/appConfig';

const { width } = Dimensions.get('window');

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const FEATURES = [
  {
    tag: 'EXPRESS',
    title: '20-Min Fast Delivery',
    desc: 'Hot & fresh food delivered to your door in minutes',
  },
  {
    tag: 'CURATED',
    title: '500+ Top Restaurants',
    desc: 'Handpicked local kitchens and authentic cuisines',
  },
  {
    tag: 'OFFERS',
    title: 'Daily Deals & Discounts',
    desc: 'Exclusive savings on your favorite daily meals',
  },
];

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A120B" />

      {/* Ambient Lighting Background Accents */}
      <View style={styles.glowCircleTop} />
      <View style={styles.glowCircleBottom} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Hero Badge */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoInnerRing}>
              <Image source={Icons.logo} style={styles.logoImage} />
            </View>
          </View>

          <View style={styles.brandTitleRow}>
            <Text style={styles.brandQuick}>Quick</Text>
            <Text style={styles.brandBite}>Bite</Text>
          </View>

          <Text style={styles.brandTagline}>FAST • FRESH • DELIVERED</Text>

          {/* Social Proof Trust Badge */}
          <View style={styles.trustBadge}>
            <Text style={styles.trustStar}>★</Text>
            <Text style={styles.trustText}>4.9 Rating • 500+ Happy Foodies</Text>
          </View>
        </View>

        {/* Feature Highlights Grid */}
        <View style={styles.featuresSection}>
          {FEATURES.map((item, idx) => (
            <View key={idx} style={styles.featureCard}>
              <View style={styles.featureHeader}>
                <View style={styles.featureTagBadge}>
                  <Text style={styles.featureTagText}>{item.tag}</Text>
                </View>
                <Text style={styles.featureCardTitle}>{item.title}</Text>
              </View>
              <Text style={styles.featureCardDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>

        {/* Action CTA Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>Sign In to Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('SignUp')}
            activeOpacity={0.85}
          >
            <Text style={styles.signupButtonText}>Create New Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => navigation.replace('MainTabs')}
            activeOpacity={0.7}
          >
            <Text style={styles.guestButtonText}>Continue as Guest →</Text>
          </TouchableOpacity>
        </View>

        {/* App Version Footer */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version {APP_VERSION}</Text>
          <Text style={styles.versionSubtext}>QuickBite Technologies</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1A120B', // Deep Charcoal Brand Theme
    },
    glowCircleTop: {
      position: 'absolute',
      top: -80,
      right: -80,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: 'rgba(232, 93, 34, 0.22)',
    },
    glowCircleBottom: {
      position: 'absolute',
      bottom: -100,
      left: -100,
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor: 'rgba(247, 198, 83, 0.12)',
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 36,
      alignItems: 'center',
    },
    heroSection: {
      alignItems: 'center',
      marginBottom: 24,
      width: '100%',
    },
    logoContainer: {
      width: 120,
      height: 120,
      borderRadius: 32,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1.5,
      borderColor: 'rgba(247, 198, 83, 0.35)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: '#E85D22',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 14,
    },
    logoInnerRing: {
      width: 104,
      height: 104,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    brandTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    brandQuick: {
      fontSize: 34,
      fontWeight: '900',
      color: '#F7C653', // Brand Gold
      letterSpacing: 0.5,
    },
    brandBite: {
      fontSize: 34,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    brandTagline: {
      fontSize: 12,
      fontWeight: '800',
      color: 'rgba(255, 255, 255, 0.7)',
      letterSpacing: 2,
      marginBottom: 14,
    },
    trustBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    trustStar: {
      fontSize: 13,
      color: '#F7C653',
      marginRight: 6,
    },
    trustText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    featuresSection: {
      width: '100%',
      gap: 10,
      marginBottom: 28,
    },
    featureCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    featureHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    featureTagBadge: {
      backgroundColor: 'rgba(232, 93, 34, 0.25)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: 'rgba(232, 93, 34, 0.4)',
    },
    featureTagText: {
      fontSize: 10,
      fontWeight: '900',
      color: '#F7C653',
      letterSpacing: 0.5,
    },
    featureCardTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FFFFFF',
      flex: 1,
    },
    featureCardDesc: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.75)',
      lineHeight: 17,
      marginLeft: 2,
    },
    actionContainer: {
      width: '100%',
      gap: 12,
      alignItems: 'center',
    },
    loginButton: {
      backgroundColor: '#E85D22', // Brand Warm Orange
      width: '100%',
      paddingVertical: 15,
      borderRadius: 25,
      alignItems: 'center',
      shadowColor: '#E85D22',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 6,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    signupButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      width: '100%',
      paddingVertical: 15,
      borderRadius: 25,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    signupButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    guestButton: {
      paddingVertical: 10,
      alignItems: 'center',
      marginTop: 4,
    },
    guestButtonText: {
      color: '#F7C653',
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    versionContainer: {
      alignItems: 'center',
      marginTop: 22,
      marginBottom: 6,
    },
    versionText: {
      fontSize: 12,
      fontWeight: '700',
      color: 'rgba(255, 255, 255, 0.45)',
      letterSpacing: 0.8,
    },
    versionSubtext: {
      fontSize: 10,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.25)',
      letterSpacing: 1.5,
      marginTop: 3,
      textTransform: 'uppercase',
    },
  });
