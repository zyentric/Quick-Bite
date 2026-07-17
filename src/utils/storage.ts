import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface MiniWindow {
  localStorage: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  };
}

declare const window: MiniWindow | undefined;

const isWeb = Platform.OS === 'web' || typeof window !== 'undefined';

const webStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch {}
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch {}
  }
};

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isWeb) {
      return webStorage.getItem(key);
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (error: any) {
      if (error?.message?.includes('Native module is null')) {
        return webStorage.getItem(key);
      }
      throw error;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) {
      return webStorage.setItem(key, value);
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error: any) {
      if (error?.message?.includes('Native module is null')) {
        return webStorage.setItem(key, value);
      }
      throw error;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isWeb) {
      return webStorage.removeItem(key);
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch (error: any) {
      if (error?.message?.includes('Native module is null')) {
        return webStorage.removeItem(key);
      }
      throw error;
    }
  }
};

export default safeStorage;
