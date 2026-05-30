import { create } from 'zustand';

interface FavoritesState {
  ids: string[];
  toggle: (productId: string) => void;
  isFav: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
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
}));
