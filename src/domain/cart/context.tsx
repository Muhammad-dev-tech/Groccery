'use client';

import * as React from 'react';
import type { CartItem, CartSummary } from './types';
import { partitionCartItems } from './partition';

interface CartContextValue {
  items: CartItem[];
  summary: CartSummary;
  isLoaded: boolean;
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  clearVendor: (vendorId: string) => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'freshgrocer_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.warn('[CartProvider] Failed to load cart from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever items change
  React.useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('[CartProvider] Failed to save cart to storage', e);
    }
  }, [items, isLoaded]);

  const addItem = React.useCallback(
    (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
      if (quantity <= 0) return;

      setItems((prev) => {
        const index = prev.findIndex((i) => i.productId === product.productId);
        if (index > -1) {
          const updated = [...prev];
          const newQty = updated[index].quantity + quantity;
          // Cap at stock if available
          updated[index] = {
            ...updated[index],
            quantity: product.stockQuantity ? Math.min(newQty, product.stockQuantity) : newQty,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              ...product,
              quantity: product.stockQuantity ? Math.min(quantity, product.stockQuantity) : quantity,
            },
          ];
        }
      });
    },
    []
  );

  const updateQuantity = React.useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.productId !== productId);
      }
      return prev.map((item) => {
        if (item.productId === productId) {
          const validQty = item.stockQuantity ? Math.min(quantity, item.stockQuantity) : quantity;
          return { ...item, quantity: validQty };
        }
        return item;
      });
    });
  }, []);

  const removeItem = React.useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = React.useCallback(() => {
    setItems([]);
  }, []);

  const clearVendor = React.useCallback((vendorId: string) => {
    setItems((prev) => prev.filter((i) => i.vendorId !== vendorId));
  }, []);

  const summary = React.useMemo(() => partitionCartItems(items), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        isLoaded,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        clearVendor,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
