import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useOrderStore } from '../../stores/orderStore';
import { useAuthStore } from '../../stores/authStore';
import { colors, fonts, radius } from '../../constants/theme';
import { Order, OrderStatus } from '../../lib/types';

const TABS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all',       label: 'Yose' },
  { key: 'pending',   label: 'Zitegerezwa' },
  { key: 'approved',  label: 'Zemejwe' },
  { key: 'delivered', label: 'Zatanzwe' },
];

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending:   '#f59e0b',
  approved:  colors.primary,
  delivered: '#6366f1',
  cancelled: '#ef4444',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:   'Itegerezwa',
  approved:  'Yemejwe',
  delivered: 'Yatanzwe',
  cancelled: 'Yangirijwe',
};

export default function AdminOrdersScreen() {
  const { signOut } = useAuthStore();
  const { orders, isLoading, fetchOrders, subscribeToOrders, approveOrder, markDelivered, cancelOrder } = useOrderStore();

  const [activeTab,   setActiveTab]   = useState<OrderStatus | 'all'>('all');
  const [approveModal, setApproveModal] = useState<{ visible: boolean; order: Order | null }>({ visible: false, order: null });
  const [deliveryMins, setDeliveryMins] = useState('30');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    const unsub = subscribeToOrders();
    return unsub;
  }, []);

  const filtered = activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab);

  async function handleApprove() {
    const mins = parseInt(deliveryMins, 10);
    if (!approveModal.order || isNaN(mins) || mins < 1) {
      Alert.alert('Sibyo', 'Injiza iminota nzima.');
      return;
    }
    setActionLoading(true);
    try {
      await approveOrder(approveModal.order.id, mins);
      setApproveModal({ visible: false, order: null });
    } catch (e: any) {
      Alert.alert('Ikosa', e.message ?? 'Ikibazo cyabaye.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeliver(order: Order) {
    Alert.alert('Emeza', `Itumba rya ${order.customer_name} ryatanzwe?`, [
      { text: 'Oya', style: 'cancel' },
      {
        text: 'Yego', onPress: async () => {
          try { await markDelivered(order.id); }
          catch (e: any) { Alert.alert('Ikosa', e.message ?? 'Ikibazo cyabaye.'); }
        },
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>🥩</Text>
            <View>
              <Text style={styles.headerTitle}>Admin Panel</Text>
              <Text style={styles.headerSub}>URUGWIRO BUTCHERY</Text>
            </View>
          </View>
          <Pressable style={styles.signOutBtn} onPress={async () => { await signOut(); router.replace('/auth/login'); }}>
            <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.8)" />
          </Pressable>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Yose',         count: orders.length,                                                 color: '#fff' },
            { label: 'Zitegerezwa',  count: orders.filter((o) => o.status === 'pending').length,   color: '#fbbf24' },
            { label: 'Zemejwe',      count: orders.filter((o) => o.status === 'approved').length,  color: '#86efac' },
            { label: 'Zatanzwe',     count: orders.filter((o) => o.status === 'delivered').length, color: '#a5b4fc' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={[styles.statCount, { color: s.color }]}>{s.count}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </SafeAreaView>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((tab) => (
            <Pressable key={tab.key} style={[styles.tab, activeTab === tab.key && styles.tabActive]} onPress={() => setActiveTab(tab.key)}>
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Order list */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="receipt-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>Nta matumba aboneka</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {filtered.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                {/* Card header */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.customerName}>{order.customer_name}</Text>
                    <Text style={styles.customerId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[order.status] + '20', borderColor: STATUS_COLOR[order.status] }]}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[order.status] }]} />
                    <Text style={[styles.statusText, { color: STATUS_COLOR[order.status] }]}>{STATUS_LABEL[order.status]}</Text>
                  </View>
                </View>

                {/* Info rows */}
                <View style={styles.infoRows}>
                  {[
                    { icon: 'call-outline'     as const, text: order.customer_phone },
                    { icon: 'location-outline' as const, text: order.customer_address },
                    { icon: 'time-outline'     as const, text: new Date(order.created_at).toLocaleString('fr-RW') },
                  ].map((row) => (
                    <View key={row.icon} style={styles.infoRow}>
                      <Ionicons name={row.icon} size={14} color={colors.textLight} />
                      <Text style={styles.infoText} numberOfLines={1}>{row.text}</Text>
                    </View>
                  ))}
                </View>

                {/* Items */}
                <View style={styles.itemsSection}>
                  {order.items.map((item, i) => (
                    <View key={i} style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.name} × {item.quantity_kg}kg</Text>
                      <Text style={styles.itemPrice}>{(item.price * item.quantity_kg).toLocaleString()} RWF</Text>
                    </View>
                  ))}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Ikiguzi Cyose</Text>
                    <Text style={styles.totalValue}>{order.total_amount.toLocaleString()} RWF</Text>
                  </View>
                </View>

                {/* Actions */}
                {order.status === 'pending' && (
                  <Pressable style={styles.approveBtn} onPress={() => { setDeliveryMins('30'); setApproveModal({ visible: true, order }); }}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                    <Text style={styles.approveBtnText}>Emeza Itumba</Text>
                  </Pressable>
                )}
                {order.status === 'approved' && (
                  <Pressable style={styles.deliverBtn} onPress={() => handleDeliver(order)}>
                    <Ionicons name="bag-check-outline" size={16} color="#fff" />
                    <Text style={styles.deliverBtnText}>Gutanga — Ryatanzwe</Text>
                  </Pressable>
                )}
              </View>
            ))}
            <View style={{ height: 24 }} />
          </ScrollView>
        )}
      </View>

      {/* Approve Modal */}
      <Modal visible={approveModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Emeza Itumba</Text>
            <Text style={styles.modalSub}>Injiza iminota yo gutanga</Text>
            <View style={styles.modalInputRow}>
              <Ionicons name="timer-outline" size={20} color={colors.textLight} />
              <TextInput
                style={styles.modalInput}
                value={deliveryMins}
                onChangeText={setDeliveryMins}
                keyboardType="number-pad"
                placeholder="30"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.modalUnit}>iminota</Text>
            </View>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setApproveModal({ visible: false, order: null })}>
                <Text style={styles.modalCancelText}>Hagarika</Text>
              </Pressable>
              <Pressable style={[styles.modalConfirm, actionLoading && { opacity: 0.6 }]} onPress={handleApprove} disabled={actionLoading}>
                <Text style={styles.modalConfirmText}>{actionLoading ? 'Gutegereza...' : 'Emeza'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.headerBg },
  headerSafe: { backgroundColor: colors.headerBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo:        { fontSize: 28 },
  headerTitle: { fontFamily: fonts.bold,    fontSize: 18, color: '#fff' },
  headerSub:   { fontFamily: fonts.regular, fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 },
  signOutBtn:  { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },

  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  statItem: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.card, paddingVertical: 10 },
  statCount: { fontFamily: fonts.bold,    fontSize: 20 },
  statLabel: { fontFamily: fonts.regular, fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2 },

  tabsWrapper: { backgroundColor: colors.cardBg, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabs:        { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  tab:         { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.contentBg },
  tabActive:   { backgroundColor: colors.primary },
  tabText:     { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  tabTextActive: { color: '#fff', fontFamily: fonts.semiBold },

  content:     { flex: 1, backgroundColor: colors.contentBg },
  listContent: { padding: 14, gap: 12 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText:   { fontFamily: fonts.medium, fontSize: 14, color: colors.textLight },

  orderCard: {
    backgroundColor: colors.cardBg, borderRadius: radius.card, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 4,
  },
  cardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  customerName:  { fontFamily: fonts.bold,    fontSize: 15, color: colors.text },
  customerId:    { fontFamily: fonts.regular, fontSize: 11, color: colors.textLight, marginTop: 2 },
  statusBadge:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, borderWidth: 1 },
  statusDot:     { width: 6, height: 6, borderRadius: 3 },
  statusText:    { fontFamily: fonts.semiBold, fontSize: 12 },

  infoRows:  { gap: 5, marginBottom: 12 },
  infoRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText:  { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, flex: 1 },

  itemsSection: { backgroundColor: colors.contentBg, borderRadius: 8, padding: 10, marginBottom: 12, gap: 6 },
  itemRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName:   { fontFamily: fonts.medium,   fontSize: 13, color: colors.text },
  itemPrice:  { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textSecondary },
  totalRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 2 },
  totalLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text },
  totalValue: { fontFamily: fonts.bold,     fontSize: 14, color: colors.primary },

  approveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 12,
  },
  approveBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: '#fff' },
  deliverBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#6366f1', borderRadius: radius.button, paddingVertical: 12,
  },
  deliverBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: '#fff' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:    { backgroundColor: colors.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40 },
  modalTitle:   { fontFamily: fonts.bold,    fontSize: 20, color: colors.text, marginBottom: 4 },
  modalSub:     { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 20 },
  modalInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.contentBg, borderRadius: radius.button,
    paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 20,
  },
  modalInput: { flex: 1, fontFamily: fonts.bold, fontSize: 22, color: colors.text, padding: 0 },
  modalUnit:  { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancel: {
    flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: radius.button,
    borderWidth: 1.5, borderColor: colors.border,
  },
  modalCancelText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textSecondary },
  modalConfirm: {
    flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: radius.button,
    backgroundColor: colors.primary,
  },
  modalConfirmText: { fontFamily: fonts.semiBold, fontSize: 15, color: '#fff' },
});
