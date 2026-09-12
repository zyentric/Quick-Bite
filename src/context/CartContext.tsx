import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cart_items';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { userId } = useUser();

  // ── Restore cart from storage on mount ─────────────────────────────────────
  useEffect(() => {
    const restoreCart = async () => {
      try {
        const stored = await safeStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as { userId: string | null; items: CartItem[] };
          // Only restore if it belongs to the current user (or was a guest cart)
          if (parsed.userId === userId) {
            setCartItems(parsed.items);
          }
        }
      } catch (e) {
        console.warn('Could not restore cart:', e);
      } finally {
        setHydrated(true);
      }
    };
    restoreCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Clear cart when user logs out ──────────────────────────────────────────
  useEffect(() => {
    if (hydrated && !userId) {
      setCartItems([]);
      safeStorage.removeItem(CART_STORAGE_KEY).catch(() => {});
    }
  }, [userId, hydrated]);

  // ── Persist cart to storage on every change ────────────────────────────────
  useEffect(() => {
    if (!hydrated) return; // Don't overwrite storage before we've read it
    safeStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ userId, items: cartItems })).catch(() => {});
  }, [cartItems, userId, hydrated]);

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

  const clearCart = () => setCartItems([]);

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
