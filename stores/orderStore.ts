import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Order, NewOrder } from '../lib/types';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  createOrder: (data: NewOrder) => Promise<Order>;
  fetchOrders: () => Promise<void>;
  fetchMyOrders: (userId: string) => Promise<Order[]>;
  fetchOrderById: (orderId: string) => Promise<void>;
  approveOrder: (orderId: string, deliveryMinutes: number) => Promise<void>;
  markDelivered: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  subscribeToOrders: () => () => void;
  subscribeToMyOrder: (orderId: string) => () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,

  createOrder: async (data) => {
    const { data: order, error } = await supabase
      .from('orders')
      .insert({ ...data, status: 'pending' })
      .select()
      .single();
    if (error) throw error;
    set({ currentOrder: order });
    return order;
  },

  fetchOrders: async () => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    set({ orders: data ?? [], isLoading: false });
  },

  fetchOrderById: async (orderId) => {
    const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (data) set({ currentOrder: data });
  },

  fetchMyOrders: async (userId) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    const orders = data ?? [];
    if (orders[0]) set({ currentOrder: orders[0], orders });
    return orders;
  },

  approveOrder: async (orderId, deliveryMinutes) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'approved', delivery_minutes: deliveryMinutes, approved_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? data : o)),
      currentOrder: s.currentOrder?.id === orderId ? data : s.currentOrder,
    }));
  },

  markDelivered: async (orderId) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? data : o)),
      currentOrder: s.currentOrder?.id === orderId ? data : s.currentOrder,
    }));
  },

  cancelOrder: async (orderId) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? data : o)),
      currentOrder: s.currentOrder?.id === orderId ? data : s.currentOrder,
    }));
  },

  subscribeToOrders: () => {
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          set((s) => ({ orders: [payload.new as Order, ...s.orders] }));
        } else if (payload.eventType === 'UPDATE') {
          set((s) => ({
            orders: s.orders.map((o) => (o.id === (payload.new as Order).id ? (payload.new as Order) : o)),
          }));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  subscribeToMyOrder: (orderId) => {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}`,
      }, (payload) => {
        set({ currentOrder: payload.new as Order });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },
}));
