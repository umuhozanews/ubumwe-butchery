import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  ids: string[];
  toggle: (productId: string) => void;
  isFav: (productId: string) => boolean;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const { ids } = get();
        set({
          ids: ids.includes(productId)
            ? ids.filter((id) => id !== productId)
            : [...ids, productId],
        });
      },
      isFav: (productId) => get().ids.includes(productId),
      clear: () => set({ ids: [] }),
    }),
    {
      name: 'ubumwe-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
