import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { colors, fonts, radius } from '../../constants/theme';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: {
    id: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }[];
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  approved: colors.primary,
  delivered: '#6366f1',
};

const STAT_CARDS = (s: DashboardStats) => [
  { label: 'Total Orders',  value: s.totalOrders,    icon: 'receipt-outline'          as const, color: '#3b82f6' },
  { label: 'Pending',       value: s.pendingOrders,  icon: 'time-outline'             as const, color: '#f59e0b' },
  { label: 'Approved',      value: s.approvedOrders, icon: 'checkmark-circle-outline' as const, color: colors.primary },
  { label: 'Delivered',     value: s.deliveredOrders,icon: 'bag-check-outline'        as const, color: '#6366f1' },
  { label: 'Products',      value: s.totalProducts,  icon: 'fast-food-outline'        as const, color: '#ec4899' },
  { label: 'Customers',     value: s.totalUsers,     icon: 'people-outline'           as const, color: '#06b6d4' },
];

export default function AdminDashboard() {
  const { profile, signOut } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0, pendingOrders: 0, approvedOrders: 0, deliveredOrders: 0,
    totalRevenue: 0, totalProducts: 0, totalUsers: 0, recentOrders: [],
  });
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, customer_name, total_amount, status, created_at')
          .order('created_at', { ascending: false }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
      ]);

      const orders = ordersRes.data ?? [];
      const deliveredRevenue = orders
        .filter((o) => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total_amount ?? 0), 0);

      setStats({
        totalOrders:    orders.length,
        pendingOrders:  orders.filter((o) => o.status === 'pending').length,
        approvedOrders: orders.filter((o) => o.status === 'approved').length,
        deliveredOrders:orders.filter((o) => o.status === 'delivered').length,
        totalRevenue:   deliveredRevenue,
        totalProducts:  productsRes.count ?? 0,
        totalUsers:     usersRes.count ?? 0,
        recentOrders:   orders.slice(0, 6),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, []);

  function onRefresh() {
    setRefreshing(true);
    loadStats();
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>🥩</Text>
            <View>
              <Text style={styles.headerTitle}>Admin Dashboard</Text>
              <Text style={styles.headerSub}>
                {profile?.full_name ?? 'Admin'} · {profile?.email}
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.signOutBtn}
            onPress={async () => { await signOut(); router.replace('/auth/login'); }}
          >
            <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.8)" />
          </Pressable>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {/* Revenue banner */}
          <View style={styles.revenueCard}>
            <View style={styles.revenueIcon}>
              <Ionicons name="trending-up-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.revenueInfo}>
              <Text style={styles.revenueLabel}>Total Revenue (Delivered)</Text>
              <Text style={styles.revenueAmount}>
                {stats.totalRevenue.toLocaleString()} RWF
              </Text>
            </View>
          </View>

          {/* Stats grid */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {STAT_CARDS(stats).map((card) => (
              <View key={card.label} style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: card.color + '18' }]}>
                  <Ionicons name={card.icon} size={22} color={card.color} />
                </View>
                <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
                <Text style={styles.statLabel}>{card.label}</Text>
              </View>
            ))}
          </View>

          {/* Recent Orders */}
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <View style={styles.recentList}>
            {stats.recentOrders.length === 0 ? (
              <Text style={styles.emptyText}>No orders yet</Text>
            ) : (
              stats.recentOrders.map((order) => (
                <View key={order.id} style={styles.recentCard}>
                  <View style={styles.recentLeft}>
                    <Text style={styles.recentName}>{order.customer_name}</Text>
                    <Text style={styles.recentId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                  </View>
                  <View style={styles.recentRight}>
                    <View style={[styles.statusChip, { backgroundColor: (STATUS_COLOR[order.status] ?? '#999') + '20' }]}>
                      <Text style={[styles.statusChipText, { color: STATUS_COLOR[order.status] ?? '#999' }]}>
                        {order.status}
                      </Text>
                    </View>
                    <Text style={styles.recentAmount}>
                      {(order.total_amount ?? 0).toLocaleString()} RWF
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Quick links */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Pressable style={styles.quickBtn} onPress={() => router.push('/admin/products' as any)}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.quickBtnText}>Add Product</Text>
            </Pressable>
            <Pressable style={styles.quickBtn} onPress={() => router.push('/admin/orders' as any)}>
              <Ionicons name="receipt-outline" size={20} color={colors.primary} />
              <Text style={styles.quickBtnText}>View Orders</Text>
            </Pressable>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.headerBg },
  headerSafe: { backgroundColor: colors.headerBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  logo:        { fontSize: 28 },
  headerTitle: { fontFamily: fonts.bold,    fontSize: 17, color: '#fff' },
  headerSub:   { fontFamily: fonts.regular, fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  signOutBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, backgroundColor: colors.contentBg },
  scrollContent: { padding: 16, gap: 0 },

  revenueCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.cardBg, borderRadius: radius.card,
    padding: 18, marginBottom: 20,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 4,
  },
  revenueIcon:   { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  revenueInfo:   { flex: 1 },
  revenueLabel:  { fontFamily: fonts.medium,  fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  revenueAmount: { fontFamily: fonts.bold,    fontSize: 22, color: colors.text },

  sectionTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.text, marginBottom: 12, marginTop: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: {
    width: '31%', backgroundColor: colors.cardBg, borderRadius: radius.card,
    padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontFamily: fonts.bold,    fontSize: 22, marginBottom: 2 },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary, textAlign: 'center' },

  recentList: { gap: 8, marginBottom: 20 },
  recentCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.cardBg, borderRadius: radius.card, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  recentLeft:   { gap: 2 },
  recentName:   { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  recentId:     { fontFamily: fonts.regular,  fontSize: 11, color: colors.textLight },
  recentRight:  { alignItems: 'flex-end', gap: 4 },
  statusChip:   { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  statusChipText: { fontFamily: fonts.semiBold, fontSize: 11 },
  recentAmount: { fontFamily: fonts.bold, fontSize: 13, color: colors.text },
  emptyText:    { fontFamily: fonts.regular, fontSize: 14, color: colors.textLight, textAlign: 'center', paddingVertical: 16 },

  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  quickBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.cardBg, borderRadius: radius.card, paddingVertical: 14,
    borderWidth: 1.5, borderColor: colors.primary + '40',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  quickBtnText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.primary },
});
