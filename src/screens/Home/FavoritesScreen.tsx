import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, RefreshControl, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MenuItem } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useUser } from '../../context/UserContext';
import { useFavorites } from '../../context/FavoritesContext';
import Icons from '../../constants/icons';
import { HeartIcon, StarIcon, LockIcon } from '../../components/icons';
import FavoritesSkeleton from '../../components/skeleton/FavoritesSkeleton';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Favorites'>;

const getCategoryIcon = (category?: string) => {
  switch ((category || '').toLowerCase()) {
    case 'meal':    return Icons.meal;
    case 'vegan':   return Icons.vegan;
    case 'snacks':  return Icons.snacks;
    case 'snack':   return Icons.snacks;
    case 'dessert': return Icons.dessert;
    case 'drinks':
    case 'beverage':
    case 'drink':   return Icons.drinks;
    default:        return Icons.meal;
  }
};

export default function FavoritesScreen() {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const { isAuthenticated } = useUser();
  const { favorites, loading, removeFavorite, refreshFavorites } = useFavorites();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshFavorites();
    }, [refreshFavorites])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFavorites();
    setRefreshing(false);
  };

  const handleRemove = async (id: string) => {
    await removeFavorite(id);
  };

  const renderItem = (item: MenuItem) => {
    const id = item.id;
    return (
      <TouchableOpacity
        key={id}
        style={styles.card}
        onPress={() => navigation.navigate('FoodDetails', { item })}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Image source={getCategoryIcon(item.category)} style={styles.placeholderIcon} />
            </View>
          )}
          <View style={styles.categoryBadge}>
            <Image source={getCategoryIcon(item.category)} style={styles.categoryBadgeIcon} />
          </View>
          {/* Remove from favourites */}
          <TouchableOpacity style={styles.favoriteBadge} onPress={() => handleRemove(id)}>
            <HeartIcon size={16} color="#EF4444" filled />
          </TouchableOpacity>
          {/* Price badge */}
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>₹{item.price?.toFixed(0)}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <StarIcon size={12} color="#F59E0B" />
            <Text style={styles.rating}> {(item.rating || 5.0).toFixed(1)}</Text>
          </View>
          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#F7D055' }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7D055" />
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.backBtn}>
              <Image source={require('../../assets/back.png')} style={styles.backIconImg} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Favorites</Text>
            <View style={styles.backBtn} />
          </View>
        </View>

        <View style={styles.contentSection}>
          {!isAuthenticated ? (
            <View style={styles.guestContainer}>
              <View style={{ marginBottom: 20 }}>
                <LockIcon size={64} color={colors.primary} />
              </View>
              <Text style={styles.guestText}>Please log in to view your favorites.</Text>
              <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginButtonText}>Log In</Text>
              </TouchableOpacity>
            </View>
          ) : loading ? (
            <FavoritesSkeleton count={6} />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                />
              }
            >
              {favorites.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={{ marginBottom: 16, opacity: 0.8 }}>
                    <HeartIcon size={56} color="#EF4444" filled />
                  </View>
                  <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                  <Text style={styles.emptyText}>Tap the heart icon on any dish to save it to your favorites list.</Text>
                  <TouchableOpacity
                    style={styles.exploreBtn}
                    onPress={() => navigation.navigate('FoodMenu')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.exploreBtnText}>Explore Menu</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.subtitle}>Your favorite dishes, ready to order.</Text>
                  <View style={styles.grid}>
                    {favorites.map(renderItem)}
                  </View>
                </>
              )}
              <View style={{ height: 100 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7D055' },
  container: { flex: 1, backgroundColor: colors.primary },
  headerSection: {
    backgroundColor: '#F7D055', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIconImg: { width: 20, height: 20, resizeMode: 'contain', tintColor: colors.primary },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  contentSection: {
    flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 30,
    borderTopRightRadius: 30, marginTop: -20, overflow: 'hidden',
  },
  scrollContent: { padding: 20 },
  subtitle: {
    fontSize: 15, fontWeight: '600', color: colors.primary,
    textAlign: 'center', marginBottom: 20, marginTop: 10,
  },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 8 },
  emptyText: {
    fontSize: 14, color: colors.textMuted, textAlign: 'center',
    marginBottom: 24, lineHeight: 20,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '47%', marginBottom: 20 },
  imageContainer: {
    width: '100%', aspectRatio: 1, borderRadius: 20,
    overflow: 'hidden', position: 'relative', marginBottom: 10,
  },
  image: { width: '100%', height: '100%', backgroundColor: '#eee' },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { width: 44, height: 44, resizeMode: 'contain', tintColor: colors.primary, opacity: 0.5 },
  categoryBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: '#fff', width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  categoryBadgeIcon: { width: 16, height: 16, resizeMode: 'contain' },
  favoriteBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: '#fff', width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  favoriteBadgeText: { fontSize: 14 },
  priceBadge: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  priceText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cardContent: { paddingHorizontal: 5, alignItems: 'center' },
  title: {
    fontSize: 14, fontWeight: '700', color: colors.primary,
    marginBottom: 2, textAlign: 'center',
  },
  rating: { fontSize: 11, color: colors.primary, marginBottom: 4 },
  description: { fontSize: 10, color: '#999', textAlign: 'center', lineHeight: 14 },
  guestContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20, marginTop: -50,
  },
  guestIcon: { fontSize: 80, marginBottom: 20, opacity: 0.8 },
  guestText: {
    fontSize: 18, color: colors.primary, fontWeight: 'bold',
    textAlign: 'center', marginBottom: 30,
  },
  loginButton: {
    backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 40,
    borderRadius: 25, shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3,
    shadowRadius: 8, elevation: 5,
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
