import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { MenuItem } from '../types';
import { useUser } from './UserContext';
import { authFetch } from '../utils/authFetch';
import { API_URL } from '../config/api';

interface FavoritesContextType {
  favorites: MenuItem[];
  favoriteIds: Set<string>;
  loading: boolean;
  isFavorite: (itemId: string) => boolean;
  toggleFavorite: (item: MenuItem) => Promise<{ isFavorite: boolean; success: boolean }>;
  removeFavorite: (itemId: string) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, userId } = useUser();
  const [favorites, setFavorites] = useState<MenuItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Normalize MenuItem from backend
  const normalizeItem = (item: any): MenuItem => ({
    id: item.id || item._id || '',
    name: item.name || '',
    price: Number(item.price) || 0,
    rating: Number(item.rating) || 4.5,
    description: item.description || '',
    image: item.image || '',
    category: item.category || 'Special',
    customizations: item.customizations || [],
    originalPrice: item.originalPrice,
    discountBadge: item.discountBadge,
  });

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/favorites`);
      if (res.ok) {
        const data = await res.json();
        const list: MenuItem[] = Array.isArray(data)
          ? data.map(normalizeItem)
          : Array.isArray(data?.items)
          ? data.items.map(normalizeItem)
          : [];
        setFavorites(list);
        setFavoriteIds(new Set(list.map((item) => item.id)));
      } else {
        console.warn('Could not fetch favorites from server:', res.status);
      }
    } catch (e) {
      console.error('Error fetching favorites:', e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites, userId]);

  const isFavorite = useCallback(
    (itemId: string): boolean => {
      if (!itemId) return false;
      return favoriteIds.has(itemId);
    },
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (item: MenuItem): Promise<{ isFavorite: boolean; success: boolean }> => {
      const itemId = item.id || (item as any)._id;
      if (!itemId) return { isFavorite: false, success: false };

      const currentlyFav = favoriteIds.has(itemId);
      const nextFav = !currentlyFav;

      // Optimistic UI update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (nextFav) {
          next.add(itemId);
        } else {
          next.delete(itemId);
        }
        return next;
      });

      setFavorites((prev) => {
        if (nextFav) {
          // If adding and not already present, prepend
          const exists = prev.some((i) => (i.id || (i as any)._id) === itemId);
          if (!exists) {
            return [normalizeItem(item), ...prev];
          }
          return prev;
        } else {
          // If removing
          return prev.filter((i) => (i.id || (i as any)._id) !== itemId);
        }
      });

      // Synchronize with backend database
      try {
        const res = await authFetch(`${API_URL}/favorites/toggle/${itemId}`, {
          method: 'POST',
        });

        if (!res.ok) {
          // Rollback on server error
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (currentlyFav) next.add(itemId);
            else next.delete(itemId);
            return next;
          });
          setFavorites((prev) => {
            if (currentlyFav) {
              const exists = prev.some((i) => (i.id || (i as any)._id) === itemId);
              return exists ? prev : [normalizeItem(item), ...prev];
            } else {
              return prev.filter((i) => (i.id || (i as any)._id) !== itemId);
            }
          });
          return { isFavorite: currentlyFav, success: false };
        }

        const data = await res.json();
        return { isFavorite: data.isFavorite ?? nextFav, success: true };
      } catch (err) {
        console.error('Failed to toggle favorite in database:', err);
        // Rollback
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (currentlyFav) next.add(itemId);
          else next.delete(itemId);
          return next;
        });
        return { isFavorite: currentlyFav, success: false };
      }
    },
    [favoriteIds]
  );

  const removeFavorite = useCallback(
    async (itemId: string): Promise<boolean> => {
      if (!itemId) return false;

      // Optimistic remove
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      setFavorites((prev) => prev.filter((i) => (i.id || (i as any)._id) !== itemId));

      try {
        const res = await authFetch(`${API_URL}/favorites/${itemId}`, {
          method: 'DELETE',
        });
        return res.ok;
      } catch (e) {
        console.error('Failed to remove favorite in database:', e);
        fetchFavorites();
        return false;
      }
    },
    [fetchFavorites]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        loading,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        refreshFavorites: fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
