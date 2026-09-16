import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  ActivityIndicator,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from 'react-native';
import { useThemeColors, ThemeColors } from '../theme/colors';
import { API_URL } from '../config/api';
import { authFetch } from '../utils/authFetch';
import { StarIcon } from './icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SERVICE_TAGS = [
  '⚡ Fast Delivery',
  '🍲 Delicious Food',
  '📦 Spill-Proof Packing',
  '🛵 Polite Rider',
  '✨ Fresh & Hot',
  '💰 Great Value',
];

const RATING_LABELS: Record<number, string> = {
  1: 'Poor 😞',
  2: 'Fair 😐',
  3: 'Good 🙂',
  4: 'Very Good! 😊',
  5: 'Exceptional! 🌟',
};

interface RatingBottomSheetProps {
  visible: boolean;
  orderId: string;
  orderNumber?: string;
  orderName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RatingBottomSheet({
  visible,
  orderId,
  orderNumber,
  orderName,
  onClose,
  onSuccess,
}: RatingBottomSheetProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSubmitted(false);
      setError('');
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating star (1-5)');
      return;
    }
    if (!orderId) {
      setError('Missing order identifier');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await authFetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: orderId,
          rating,
          feedback: feedback.trim() || undefined,
          tags: selectedTags,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        // If already reviewed, treat as successful completion
        if (res.status === 409) {
          setSubmitted(true);
          setTimeout(() => {
            onClose();
            onSuccess?.();
          }, 1200);
          return;
        }
        setError(data.message || 'Failed to submit rating.');
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1400);
    } catch (err: any) {
      setError('Network error: ' + (err.message || 'Unable to connect'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  const displayOrderCode = orderNumber
    ? `#${orderNumber}`
    : orderId
    ? `#QB-${orderId.slice(-6).toUpperCase()}`
    : '';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop Tap to close */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        {/* Animated Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Top Pill Handle */}
          <View style={styles.handleBar} />

          {submitted ? (
            /* Success Feedback State */
            <View style={styles.successWrapper}>
              <View style={styles.successIconCircle}>
                <Text style={styles.successEmoji}>⭐</Text>
              </View>
              <Text style={styles.successTitle}>Thank You!</Text>
              <Text style={styles.successSubtitle}>
                Your review helps us improve overall service and helps fellow foodies!
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetTitle}>Rate Your Experience</Text>
                  <Text style={styles.sheetSubtitle}>
                    {orderName || 'Order'} {displayOrderCode ? `• ${displayOrderCode}` : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Star Rating Section */}
              <View style={styles.starsCard}>
                <Text style={styles.starPrompt}>How was your meal & delivery?</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isActive = rating >= starVal;
                    return (
                      <TouchableOpacity
                        key={starVal}
                        style={styles.starTouch}
                        onPress={() => setRating(starVal)}
                        activeOpacity={0.7}
                      >
                        <StarIcon
                          size={38}
                          color={isActive ? '#F59E0B' : '#E5E7EB'}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.ratingMoodText}>
                  {RATING_LABELS[rating] || 'Select your rating'}
                </Text>
              </View>

              {/* Quick Tags */}
              <Text style={styles.sectionLabel}>What went well?</Text>
              <View style={styles.tagsContainer}>
                {SERVICE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tagChip,
                        isSelected && styles.tagChipActive,
                      ]}
                      onPress={() => handleToggleTag(tag)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.tagChipText,
                          isSelected && styles.tagChipTextActive,
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Optional Feedback Comment */}
              <Text style={styles.sectionLabel}>Additional Comments (Optional)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Share more details about the food taste, delivery speed, or packaging..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={feedback}
                onChangeText={setFeedback}
                maxLength={300}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Action CTAs */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.skipBtn}
                  onPress={onClose}
                  disabled={submitting}
                >
                  <Text style={styles.skipBtnText}>Maybe Later</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                  onPress={handleSubmit}
                  disabled={submitting}
                  activeOpacity={0.88}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Rating ⭐</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'transparent',
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    sheetContainer: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      maxHeight: SCREEN_HEIGHT * 0.85,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 34 : 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 20,
    },
    handleBar: {
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: '#E5E7EB',
      alignSelf: 'center',
      marginBottom: 12,
    },
    scrollContent: {
      paddingHorizontal: 22,
      paddingBottom: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    sheetTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.text,
    },
    sheetSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '600',
      marginTop: 2,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textMuted,
    },
    starsCard: {
      backgroundColor: '#F9FAFB',
      borderRadius: 20,
      paddingVertical: 18,
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#F3F4F6',
    },
    starPrompt: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    starsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 10,
    },
    starTouch: {
      padding: 4,
    },
    ratingMoodText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#D97706',
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 10,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 20,
    },
    tagChip: {
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    tagChipActive: {
      backgroundColor: '#FEF3C7',
      borderColor: '#F59E0B',
    },
    tagChipText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    tagChipTextActive: {
      color: '#B45309',
    },
    commentInput: {
      backgroundColor: '#F9FAFB',
      borderRadius: 16,
      padding: 14,
      height: 80,
      textAlignVertical: 'top',
      fontSize: 13,
      color: colors.inputText || '#1F2937',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      marginBottom: 14,
    },
    errorText: {
      color: '#DC2626',
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 12,
    },
    btnRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 4,
    },
    skipBtn: {
      flex: 1,
      backgroundColor: '#F3F4F6',
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    skipBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textMuted,
    },
    submitBtn: {
      flex: 2,
      backgroundColor: colors.primary,
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    submitBtnText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    successWrapper: {
      paddingVertical: 40,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    successIconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: '#FEF3C7',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    successEmoji: {
      fontSize: 34,
    },
    successTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 8,
    },
    successSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
