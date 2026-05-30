import { create } from 'zustand';
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
}

export const useCartStore = create<CartState>((set, get) => ({
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
}));
