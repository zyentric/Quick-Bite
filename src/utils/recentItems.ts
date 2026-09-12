import safeStorage from './storage';
import { MenuItem } from '../types';

const STORAGE_KEY = 'quickbite_recently_viewed';
const MAX_RECENT_ITEMS = 10;

export const getRecentlyViewedItems = async (): Promise<MenuItem[]> => {
  try {
    const data = await safeStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to get recently viewed items:', e);
    return [];
  }
};

export const addRecentlyViewedItem = async (item: MenuItem): Promise<void> => {
  try {
    if (!item || !item.id) return;
    const current = await getRecentlyViewedItems();
    // Remove if already exists to move it to the front
    const filtered = current.filter(i => i.id !== item.id && (i as any)._id !== item.id);
    const updated = [item, ...filtered].slice(0, MAX_RECENT_ITEMS);
    await safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save recently viewed item:', e);
  }
};

export const clearRecentlyViewedItems = async (): Promise<void> => {
  try {
    await safeStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear recently viewed items:', e);
  }
};
