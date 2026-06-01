import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageSourcePropType } from 'react-native';

export interface CartItem {
  productId: string;
  categoryId: string;
  nameKiny: string;
  nameEn: string;
  price: number;
  qty: number;
  image: ImageSourcePropType;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: ({ qty = 1, ...item }) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              i.productId === item.productId ? { ...i, qty: i.qty + qty } : i,
            ),
          }));
        } else {
          set((s) => ({ items: [...s.items, { ...item, qty }] }));
        }
      },

      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),

      updateQty: (productId, qty) => {
        if (qty <= 0) {
          set((s) => ({ items: s.items.filter((i) => i.productId !== productId) }));
        } else {
          set((s) => ({
            items: s.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
          }));
        }
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    {
      name: 'ubumwe-cart',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
