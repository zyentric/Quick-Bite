import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors, ThemeColors } from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CinemaClosedModalProps {
  visible: boolean;
  onClose: () => void;
  onBrowseMenu: () => void;
  onRefreshStatus: () => void;
}

/** 🎬 Vintage Film Reel Vector Icon */
function FilmReelIcon({ size = 48, color = '#FFC72C' }: { size?: number; color?: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 3,
        borderColor: color,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E1B18',
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <View
        style={{
          width: size * 0.36,
          height: size * 0.36,
          borderRadius: (size * 0.36) / 2,
          backgroundColor: color,
        }}
      />
      <View style={{ position: 'absolute', top: 4, width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
      <View style={{ position: 'absolute', bottom: 4, width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 4, width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
      <View style={{ position: 'absolute', right: 4, width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
    </View>
  );
}

/** 🌙 Classic Crescent Moon Vector Icon */
function MoonNightIcon({ size = 26, color = '#FDE68A' }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.82,
          height: size * 0.82,
          borderRadius: (size * 0.82) / 2,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: -size * 0.05,
          right: -size * 0.05,
          width: size * 0.7,
          height: size * 0.7,
          borderRadius: (size * 0.7) / 2,
          backgroundColor: '#151210',
        }}
      />
    </View>
  );
}

export default function CinemaClosedModal({
  visible,
  onClose,
  onBrowseMenu,
  onRefreshStatus,
}: CinemaClosedModalProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets);

  // Approximate sprocket count based on screen height
  const sprocketCount = Math.floor((SCREEN_HEIGHT - 60) / 38);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.fullScreenContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0807" translucent={true} />

        {/* Left 35mm Celluloid Film Sprocket Strip */}
        <View style={styles.verticalFilmStripLeft}>
          {[...Array(sprocketCount)].map((_, i) => (
            <View key={`left-${i}`} style={styles.verticalSprocketHole} />
          ))}
        </View>

        {/* Right 35mm Celluloid Film Sprocket Strip */}
        <View style={styles.verticalFilmStripRight}>
          {[...Array(sprocketCount)].map((_, i) => (
            <View key={`right-${i}`} style={styles.verticalSprocketHole} />
          ))}
        </View>

        {/* Main Cinema Content */}
        <View style={styles.mainCinemaContent}>
          {/* Top Bar with Skip Button */}
          <View style={styles.topBar}>
            <View style={styles.vintageIntermissionTag}>
              <View style={styles.pulsingRedDot} />
              <Text style={styles.vintageIntermissionText}>LATE NIGHT INTERMISSION</Text>
            </View>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={onClose}
              activeOpacity={0.8}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.skipButtonText}>Skip ✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Vintage Silent-Era Title Card Frame */}
            <View style={styles.titleCardOuterFrame}>
              <View style={styles.titleCardInnerBorder}>
                {/* Film Title Header Ornament */}
                <View style={styles.marqueeHeaderRow}>
                  <View style={styles.ornamentLine} />
                  <Text style={styles.ornamentStar}>★</Text>
                  <Text style={styles.marqueeHeaderTitle}>THE CURTAIN HAS FALLEN</Text>
                  <Text style={styles.ornamentStar}>★</Text>
                  <View style={styles.ornamentLine} />
                </View>

                {/* Center Cinema Visual (Film Reel & Moon) */}
                <View style={styles.visualCenterContainer}>
                  <View style={styles.glowingReelCircle}>
                    <FilmReelIcon size={52} color="#FFC72C" />
                  </View>
                  <View style={styles.moonOffsetContainer}>
                    <MoonNightIcon size={26} color="#FDE68A" />
                  </View>
                </View>

                {/* Classic Old-Movie Headline */}
                <Text style={styles.mainCinemaHeading}>
                  ALL RESTAURANTS ARE CURRENTLY CLOSED
                </Text>

                {/* Vintage Title Card Narration */}
                <Text style={styles.vintageStoryText}>
                  "Tonight's final reel has finished rolling. The ovens have cooled, the stoves are silent, and our kitchen masters have retired for the evening. Service will resume with the morning dawn."
                </Text>

                {/* Vintage Marquee Banner Box */}
                <View style={styles.marqueeStatusBox}>
                  <View style={styles.statusDot} />
                  <Text style={styles.marqueeStatusText}>
                    KITCHENS CLOSED • PRE-ORDERING & MENU EXPLORATION ACTIVE
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonStack}>
                  <TouchableOpacity
                    style={styles.primaryGoldButton}
                    onPress={() => {
                      onClose();
                      onBrowseMenu();
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryGoldButtonText}>Explore Tomorrow's Menus</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryCinemaButton}
                    onPress={onRefreshStatus}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.secondaryCinemaButtonText}>Check Live Status (Refresh)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.bottomSkipLink}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.bottomSkipLinkText}>
                      Skip & Enter App Anyway →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: ThemeColors, insets: { top: number; bottom: number }) =>
  StyleSheet.create({
    fullScreenContainer: {
      flex: 1,
      backgroundColor: '#0A0807', // Deep Cinema Noir
      flexDirection: 'row',
    },
    verticalFilmStripLeft: {
      width: 24,
      backgroundColor: '#050403',
      borderRightWidth: 1.5,
      borderRightColor: '#241D17',
      paddingVertical: (insets.top || 30) + 10,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    verticalFilmStripRight: {
      width: 24,
      backgroundColor: '#050403',
      borderLeftWidth: 1.5,
      borderLeftColor: '#241D17',
      paddingVertical: (insets.top || 30) + 10,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    verticalSprocketHole: {
      width: 12,
      height: 18,
      backgroundColor: '#181410',
      borderRadius: 2,
      borderWidth: 1,
      borderColor: '#382D24',
      marginVertical: 4,
    },
    mainCinemaContent: {
      flex: 1,
      backgroundColor: '#0E0C0A',
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 44 : 36),
      paddingBottom: 10,
    },
    vintageIntermissionTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(239, 68, 68, 0.16)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.35)',
    },
    pulsingRedDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: '#EF4444',
    },
    vintageIntermissionText: {
      color: '#FCA5A5',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
    },
    skipButton: {
      backgroundColor: 'rgba(255, 199, 44, 0.18)',
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: '#FFC72C',
    },
    skipButtonText: {
      color: '#FFC72C',
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    scrollBody: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 14,
      paddingBottom: Math.max(insets.bottom + 16, 24),
    },
    titleCardOuterFrame: {
      backgroundColor: '#14110E',
      borderRadius: 20,
      borderWidth: 2,
      borderColor: '#D4AF37', // Vintage Gold Frame
      padding: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 12,
    },
    titleCardInnerBorder: {
      backgroundColor: '#181512',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.35)',
      borderStyle: 'dashed',
      paddingHorizontal: 18,
      paddingVertical: 24,
      alignItems: 'center',
    },
    marqueeHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 18,
      width: '100%',
    },
    ornamentLine: {
      flex: 1,
      height: 1,
      backgroundColor: 'rgba(212, 175, 55, 0.5)',
    },
    ornamentStar: {
      color: '#FFC72C',
      fontSize: 12,
    },
    marqueeHeaderTitle: {
      fontSize: 11,
      fontWeight: '900',
      color: '#FFC72C',
      letterSpacing: 1.8,
      textTransform: 'uppercase',
    },
    visualCenterContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    glowingReelCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: 'rgba(255, 199, 44, 0.1)',
      borderWidth: 2,
      borderColor: 'rgba(255, 199, 44, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    moonOffsetContainer: {
      position: 'absolute',
      top: -4,
      right: -6,
    },
    mainCinemaHeading: {
      fontSize: 20,
      fontWeight: '900',
      color: '#FFFFFF',
      textAlign: 'center',
      letterSpacing: 0.8,
      lineHeight: 26,
      marginBottom: 12,
      fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    vintageStoryText: {
      fontSize: 13,
      color: '#CBBBAA', // Vintage Sepia Paper tone
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 6,
      marginBottom: 20,
      fontStyle: 'italic',
      fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    marqueeStatusBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(239, 68, 68, 0.14)',
      borderColor: 'rgba(239, 68, 68, 0.4)',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 7,
      gap: 7,
      marginBottom: 24,
      width: '100%',
      justifyContent: 'center',
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: '#EF4444',
    },
    marqueeStatusText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FCA5A5',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    buttonStack: {
      width: '100%',
      gap: 10,
    },
    primaryGoldButton: {
      backgroundColor: '#FFC72C',
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#FFC72C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 5,
    },
    primaryGoldButtonText: {
      color: '#12100E',
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: 0.4,
    },
    secondaryCinemaButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.22)',
      paddingVertical: 13,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryCinemaButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
    bottomSkipLink: {
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    bottomSkipLinkText: {
      color: '#FFC72C',
      fontSize: 12,
      fontWeight: '800',
      textDecorationLine: 'underline',
    },
  });
