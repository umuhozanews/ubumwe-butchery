import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { Order, OrderStatus } from '../lib/types';
import BottomNav from '../components/BottomNav';
import { colors, fonts, radius } from '../constants/theme';

const STATUS: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  pending:   { label: 'Itegerezwa', color: '#f59e0b',       icon: 'time-outline' },
  approved:  { label: 'Yemejwe',    color: colors.primary,  icon: 'checkmark-circle-outline' },
  delivered: { label: 'Ryatanzwe',  color: '#6b7280',       icon: 'bag-check-outline' },
  cancelled: { label: 'Yangirijwe', color: '#ef4444',       icon: 'close-circle-outline' },
};

export default function MyOrdersScreen() {
  const { profile } = useAuthStore();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) { setLoading(false); return; }
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  }, [profile]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Amatumiza Yanjye</Text>
          <View style={{ width: 42 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {!profile ? (
          <View style={styles.empty}>
            <Ionicons name="person-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Injira mbere</Text>
            <Text style={styles.emptySub}>Ugomba kwinjira kugira ngo ubone amatumiza yawe</Text>
            <Pressable style={styles.actionBtn} onPress={() => router.push('/auth/login')}>
              <Text style={styles.actionBtnText}>Injira</Text>
            </Pressable>
          </View>
        ) : loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Nta matumiza ufite</Text>
            <Text style={styles.emptySub}>Amatumiza yawe azagaragara hano</Text>
            <Pressable style={styles.actionBtn} onPress={() => router.replace('/' as any)}>
              <Text style={styles.actionBtnText}>Tangira Gutumiza</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {orders.map((order) => {
              const s = STATUS[order.status];
              const date = new Date(order.created_at).toLocaleDateString('en-RW', {
                day: 'numeric', month: 'short', year: 'numeric',
              });
              return (
                <Pressable
                  key={order.id}
                  style={styles.card}
                  onPress={() =>
                    router.push({ pathname: '/tracking', params: { orderId: order.id } } as any)
                  }
                >
                  <View style={styles.cardTop}>
                    <View style={[styles.badge, { backgroundColor: s.color + '20' }]}>
                      <Ionicons name={s.icon as any} size={14} color={s.color} />
                      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
                    </View>
                    <Text style={styles.date}>{date}</Text>
                  </View>
                  <View style={styles.items}>
                    {order.items.map((item, i) => (
                      <Text key={i} style={styles.itemText}>
                        • {item.name} × {item.quantity_kg}kg
                      </Text>
                    ))}
                  </View>
                  <View style={styles.cardBottom}>
                    <Text style={styles.address} numberOfLines={1}>
                      {order.customer_address}
                    </Text>
                    <Text style={styles.total}>{order.total_amount.toLocaleString()} RWF</Text>
                  </View>
                </Pressable>
              );
            })}
            <View style={{ height: 16 }} />
          </ScrollView>
        )}
        <BottomNav active="orders" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.headerBg },
  header:      { backgroundColor: colors.headerBg, paddingHorizontal: 16, paddingBottom: 16 },
  headerRow:   { flexDirection: 'row', alignItems: 'center', paddingTop: 8, gap: 12 },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 18, color: '#fff', textAlign: 'center' },
  content:     { flex: 1, backgroundColor: colors.contentBg },
  loading:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list:        { padding: 16, gap: 12, paddingBottom: 8 },
  card: {
    backgroundColor: colors.cardBg, borderRadius: radius.card, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontFamily: fonts.semiBold, fontSize: 12 },
  date:      { fontFamily: fonts.regular, fontSize: 12, color: colors.textLight },
  items:     { gap: 3, marginBottom: 12 },
  itemText:  { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  cardBottom:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  address:   { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.textLight, marginRight: 8 },
  total:     { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  empty:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyTitle:{ fontFamily: fonts.bold,    fontSize: 18, color: colors.text },
  emptySub:  { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  actionBtn:     { marginTop: 8, backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
  actionBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: '#fff' },
});
