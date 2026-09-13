import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { CartItem, MenuItem } from '../types';
import { useUser } from './UserContext';
import safeStorage from '../utils/storage';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LEGACY_CART_KEY = 'cart_items';
const getCartKey = (uid: string | null) => (uid ? `@quickbite_cart_${uid}` : '@quickbite_cart_guest');

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { userId, checkingAuth } = useUser();
  const hydratedForRef = useRef<string | null>(null);

  // ── Restore cart from persistent storage ────────────────────────────────────
  useEffect(() => {
    // Wait until UserContext has finished restoring the session from AsyncStorage
    if (checkingAuth) return;

    const restoreCart = async () => {
      try {
        const userKey = getCartKey(userId);
        let items: CartItem[] = [];

        // 1. Try loading user-specific / guest cart
        const stored = await safeStorage.getItem(userKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            items = parsed;
          } else if (parsed && Array.isArray(parsed.items)) {
            items = parsed.items;
          }
        } else {
          // 2. Fallback: check legacy storage key if migrating
          const legacy = await safeStorage.getItem(LEGACY_CART_KEY);
          if (legacy) {
            try {
              const legacyParsed = JSON.parse(legacy);
              if (Array.isArray(legacyParsed)) {
                items = legacyParsed;
              } else if (legacyParsed?.items && Array.isArray(legacyParsed.items)) {
                items = legacyParsed.items;
              }
            } catch {}
          }

          // 3. If user just logged in and user cart was empty, migrate guest cart
          if (userId && items.length === 0) {
            const guestCart = await safeStorage.getItem(getCartKey(null));
            if (guestCart) {
              try {
                const guestParsed = JSON.parse(guestCart);
                if (Array.isArray(guestParsed) && guestParsed.length > 0) {
                  items = guestParsed;
                  // Clear guest cart after migrating
                  await safeStorage.removeItem(getCartKey(null));
                }
              } catch {}
            }
          }
        }

        setCartItems(items);
        hydratedForRef.current = userId || 'guest';
        setIsHydrated(true);
      } catch (e) {
        console.warn('Could not restore cart from storage:', e);
        setIsHydrated(true);
      }
    };

    restoreCart();
  }, [userId, checkingAuth]);

  // ── Persist cart to storage on changes ─────────────────────────────────────
  useEffect(() => {
    // Never persist while session is resolving or before initial hydration finishes
    if (!isHydrated || checkingAuth) return;
    const currentScope = userId || 'guest';
    if (hydratedForRef.current !== currentScope) return;

    const saveCart = async () => {
      try {
        const key = getCartKey(userId);
        if (cartItems.length > 0) {
          await safeStorage.setItem(key, JSON.stringify(cartItems));
        } else {
          await safeStorage.removeItem(key);
        }
      } catch (e) {
        console.warn('Failed to persist cart items:', e);
      }
    };

    saveCart();
  }, [cartItems, userId, isHydrated, checkingAuth]);

  const addToCart = (item: MenuItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    const key = getCartKey(userId);
    safeStorage.removeItem(key).catch(() => {});
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
