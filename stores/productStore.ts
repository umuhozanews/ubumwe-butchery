import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Product, NewProduct, ProductCategory } from '../lib/types';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  fetchProducts: (category?: ProductCategory) => Promise<void>;
  addProduct: (product: NewProduct) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleAvailability: (id: string, isAvailable: boolean) => Promise<void>;
  uploadProductImage: (uri: string, productId: string) => Promise<string>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,

  fetchProducts: async (category) => {
    set({ isLoading: true });
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });
    if (category) query = query.eq('category', category);
    const { data } = await query;
    set({ products: data ?? [], isLoading: false });
  },

  addProduct: async (product) => {
    const { data, error } = await supabase.from('products').insert(product).select().single();
    if (error) throw error;
    set((s) => ({ products: [data, ...s.products] }));
    return data;
  },

  updateProduct: async (id, updates) => {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    set((s) => ({ products: s.products.map((p) => (p.id === id ? data : p)) }));
  },

  deleteProduct: async (id) => {
    const product = get().products.find((p) => p.id === id);
    if (product?.image_url) {
      const path = product.image_url.split('/product-images/')[1];
      if (path) await supabase.storage.from('product-images').remove([path]);
    }
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
  },

  toggleAvailability: async (id, isAvailable) => {
    await get().updateProduct(id, { is_available: isAvailable });
  },

  uploadProductImage: async (uri, productId) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ext = uri.split('.').pop() ?? 'jpg';
    const fileName = `${productId}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, blob, { contentType: `image/${ext}`, upsert: true });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path);
    return publicUrl;
  },
}));
