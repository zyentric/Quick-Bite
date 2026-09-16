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
import { UserIcon, StoreIcon, BikeIcon, CheckIcon } from '../../components/VectorIcons';

const { width } = Dimensions.get('window');

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const FEATURES = [
  {
    tag: '10 KM LOCAL',
    title: 'Local Proximity Fast Delivery',
    desc: 'Hot & fresh food delivered within a strict 10 km hyper-local range in minutes',
  },
  {
    tag: 'LIVE SYNC',
    title: 'Real-Time Kitchen & Rider Tracking',
    desc: 'Live WebSocket sync between you, the restaurant kitchen, and delivery partner',
  },
  {
    tag: 'VERIFIED',
    title: 'Top Rated Kitchens & Menus',
    desc: 'Handpicked local restaurants, gourmet cuisines, and verified safety standards',
  },
];

const ROLES_INFO = [
  { title: 'Foodies', subtitle: 'Browse & Order', icon: 'customer' },
  { title: 'Kitchens', subtitle: 'Accept Orders', icon: 'shopkeeper' },
  { title: 'Riders', subtitle: 'Earn & Deliver', icon: 'delivery' },
];

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#150E08" />

      {/* Ambient Radial Lighting Glow Accents */}
      <View style={styles.glowCircleTop} />
      <View style={styles.glowCircleBottom} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Hero Badge */}
        <View style={styles.heroSection}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoGlowRing}>
              <View style={styles.logoContainer}>
                <Image source={Icons.logo} style={styles.logoImage} />
              </View>
            </View>
          </View>

          <View style={styles.brandTitleRow}>
            <Text style={styles.brandQuick}>Quick</Text>
            <Text style={styles.brandBite}>Bite</Text>
          </View>

          <Text style={styles.brandTagline}>HYPER-LOCAL • FRESH • 10 KM RANGE</Text>

          {/* Social Proof Trust Badge */}
          <View style={styles.trustBadge}>
            <View style={styles.trustStarBadge}>
              <CheckIcon color="#10B981" size={14} />
            </View>
            <Text style={styles.trustText}>4.9 Star Rated • 10,000+ Local Meals Delivered</Text>
          </View>
        </View>

        {/* Roles Quick Pill Bar */}
        <View style={styles.rolesBar}>
          {ROLES_INFO.map((r, i) => (
            <View key={i} style={styles.roleCardPill}>
              <View style={styles.roleIconWrapper}>
                {r.icon === 'customer' ? (
                  <UserIcon color="#F7C653" size={16} />
                ) : r.icon === 'shopkeeper' ? (
                  <StoreIcon color="#F7C653" size={16} />
                ) : (
                  <BikeIcon color="#F7C653" size={16} />
                )}
              </View>
              <View style={styles.roleTextCol}>
                <Text style={styles.roleTitle}>{r.title}</Text>
                <Text style={styles.roleSub}>{r.subtitle}</Text>
              </View>
            </View>
          ))}
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
            <Text style={styles.guestButtonText}>Explore Menu as Guest →</Text>
          </TouchableOpacity>
        </View>

        {/* App Version Footer */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>QuickBite App v{APP_VERSION}</Text>
          <Text style={styles.versionSubtext}>Hyper-Local Food Logistics Platform</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#150E08', // Premium Deep Espresso Charcoal
    },
    glowCircleTop: {
      position: 'absolute',
      top: -90,
      right: -90,
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: 'rgba(232, 93, 34, 0.22)',
    },
    glowCircleBottom: {
      position: 'absolute',
      bottom: -110,
      left: -110,
      width: 340,
      height: 340,
      borderRadius: 170,
      backgroundColor: 'rgba(247, 198, 83, 0.12)',
    },
    scrollContent: {
      paddingHorizontal: 22,
      paddingTop: 16,
      paddingBottom: 32,
      alignItems: 'center',
    },
    heroSection: {
      alignItems: 'center',
      marginBottom: 20,
      width: '100%',
    },
    logoWrapper: {
      marginBottom: 14,
    },
    logoGlowRing: {
      padding: 6,
      borderRadius: 36,
      backgroundColor: 'rgba(247, 198, 83, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(247, 198, 83, 0.25)',
    },
    logoContainer: {
      width: 100,
      height: 100,
      borderRadius: 28,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#E85D22',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    logoImage: {
      width: 76,
      height: 76,
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
      color: '#F7C653',
      letterSpacing: 0.5,
    },
    brandBite: {
      fontSize: 34,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    brandTagline: {
      fontSize: 11,
      fontWeight: '800',
      color: 'rgba(255, 255, 255, 0.75)',
      letterSpacing: 2,
      marginBottom: 12,
    },
    trustBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.14)',
      gap: 8,
    },
    trustStarBadge: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    trustText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    rolesBar: {
      flexDirection: 'row',
      width: '100%',
      gap: 8,
      marginBottom: 18,
    },
    roleCardPill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    roleIconWrapper: {
      width: 26,
      height: 26,
      borderRadius: 8,
      backgroundColor: 'rgba(247, 198, 83, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    roleTextCol: {
      flex: 1,
    },
    roleTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    roleSub: {
      fontSize: 9,
      color: 'rgba(255, 255, 255, 0.65)',
      fontWeight: '600',
    },
    featuresSection: {
      width: '100%',
      gap: 10,
      marginBottom: 24,
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
      fontSize: 14,
      fontWeight: '800',
      color: '#FFFFFF',
      flex: 1,
    },
    featureCardDesc: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.72)',
      lineHeight: 17,
      marginLeft: 2,
    },
    actionContainer: {
      width: '100%',
      gap: 12,
      alignItems: 'center',
    },
    loginButton: {
      backgroundColor: '#E85D22',
      width: '100%',
      paddingVertical: 14,
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
      paddingVertical: 14,
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
      paddingVertical: 8,
      alignItems: 'center',
      marginTop: 2,
    },
    guestButtonText: {
      color: '#F7C653',
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    versionContainer: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 6,
    },
    versionText: {
      fontSize: 11,
      fontWeight: '700',
      color: 'rgba(255, 255, 255, 0.45)',
      letterSpacing: 0.6,
    },
    versionSubtext: {
      fontSize: 10,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.25)',
      letterSpacing: 1.2,
      marginTop: 2,
      textTransform: 'uppercase',
    },
  });
