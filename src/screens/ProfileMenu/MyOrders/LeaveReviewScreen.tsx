import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';
import { authFetch } from '../../../utils/authFetch';
import { API_URL } from '../../../config/api';

type LeaveReviewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LeaveReview'>;

export default function LeaveReviewScreen() {
  const navigation = useNavigation<LeaveReviewNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return; // require at least one star
    setSubmitting(true);
    try {
      await authFetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
    } catch (e) {
      console.error('Failed to submit review:', e);
    } finally {
      setSubmitting(false);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave a Review</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2424&auto=format&fit=crop' }} 
            style={styles.dishImage} 
          />
          <Text style={styles.dishTitle}>Chicken Curry</Text>
          <Text style={styles.subtitle}>We'd love to know what you{'\n'}think of your dish.</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Text style={[styles.star, rating >= star ? styles.starFilled : {}]}>
                  {rating >= star ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.commentLabel}>Leave us your comment!</Text>
          <TextInput 
            style={styles.textInput}
            placeholder="Write Review ..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnText}>Submit</Text>
              }
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rightPlaceholder: {
    width: 40, 
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    paddingTop: 40,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
    alignItems: 'center',
  },
  dishImage: {
    width: 150,
    height: 150,
    borderRadius: 20,
    marginBottom: 20,
  },
  dishTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  star: {
    fontSize: 40,
    color: '#ccc', // Light grey empty star
    marginHorizontal: 5,
  },
  starFilled: {
    color: colors.primary, // Could be orange if we had custom SVG
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  textInput: {
    backgroundColor: colors.inputBackground, 
    borderRadius: 15,
    padding: 15,
    height: 120,
    width: '100%',
    textAlignVertical: 'top',
    fontSize: 14,
    color: colors.inputText,
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.inputBackground, // Light grey/orange
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
