import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useOrderStore } from '../stores/orderStore';
import { useCountdown } from '../hooks/useCountdown';
import { colors, fonts, radius } from '../constants/theme';
import { OrderStatus } from '../lib/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; color: string; bg: string; desc: string }> = {
  pending:   { label: 'Itegerezwa',  icon: 'time-outline',           color: '#f59e0b', bg: '#fffbeb', desc: "Itumba ryawe ryakirwe. Turaritegereza kugira ngo turibyeze." },
  approved:  { label: 'Yemejwe',     icon: 'checkmark-circle-outline', color: colors.primary, bg: '#f0fdf4', desc: "Itumba ryemejwe! Tuzaribatwara vuba." },
  delivered: { label: 'Ryatanzwe',   icon: 'bag-check-outline',       color: '#6366f1', bg: '#eef2ff', desc: "Itumba ryatanzwe neza. Murakoze guhitamo UBUMWE BUTCHERY! 🎉" },
};

export default function TrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const id = Array.isArray(orderId) ? orderId[0] : (orderId ?? '');

  const { currentOrder, fetchOrderById, subscribeToMyOrder } = useOrderStore();

  const order = currentOrder?.id === id ? currentOrder : null;

  const countdown = useCountdown(order?.approved_at ?? null, order?.delivery_minutes ?? 30);

  useEffect(() => {
    if (id && !order) fetchOrderById(id);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToMyOrder(id);
    return unsub;
  }, [id]);

  if (!order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const cfg = STATUS_CONFIG[order.status];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.replace('/')}>
            <Ionicons name="home-outline" size={20} color="#fff" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Gukurikirana Itumba</Text>
            <Text style={styles.headerSub} numberOfLines={1}>#{order.id.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Status card */}
          <View style={[styles.statusCard, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
            <View style={[styles.statusIconWrap, { backgroundColor: cfg.color }]}>
              <Ionicons name={cfg.icon} size={36} color="#fff" />
            </View>
            <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
            <Text style={styles.statusDesc}>{cfg.desc}</Text>

            {/* Countdown when approved */}
            {order.status === 'approved' && !countdown.isExpired && (
              <View style={styles.countdownBox}>
                <Text style={styles.countdownLabel}>Itumba riza mu:</Text>
                <Text style={styles.countdownTimer}>{countdown.formatted}</Text>
              </View>
            )}
            {order.status === 'approved' && countdown.isExpired && (
              <View style={styles.countdownBox}>
                <Text style={[styles.countdownTimer, { color: '#ef4444' }]}>Iminota irarangiye — tegereza agahe</Text>
              </View>
            )}
          </View>

          {/* Progress steps */}
          <View style={styles.stepsCard}>
            {(['pending', 'approved', 'delivered'] as OrderStatus[]).map((step, i) => {
              const done    = ['pending', 'approved', 'delivered'].indexOf(order.status) >= i;
              const current = order.status === step;
              return (
                <View key={step} style={styles.stepRow}>
                  <View style={styles.stepLeft}>
                    <View style={[styles.stepDot, done && styles.stepDotDone, current && styles.stepDotCurrent]}>
                      {done && !current && <Ionicons name="checkmark" size={12} color="#fff" />}
                      {current && <View style={styles.stepDotInner} />}
                    </View>
                    {i < 2 && <View style={[styles.stepLine, done && i < ['pending','approved','delivered'].indexOf(order.status) && styles.stepLineDone]} />}
                  </View>
                  <Text style={[styles.stepText, (done || current) && styles.stepTextDone]}>
                    {STATUS_CONFIG[step].label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Order summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Incamake y'Itumba</Text>
            {[
              ['Umuguzi',  order.customer_name],
              ['Telefone', order.customer_phone],
              ['Aderesi',  order.customer_address],
              ['Ikiguzi',  `${order.total_amount.toLocaleString()} RWF`],
            ].map(([label, value], i, arr) => (
              <View key={label} style={[styles.summaryRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text style={[styles.summaryValue, label === 'Ikiguzi' && { color: colors.primary, fontFamily: fonts.bold }]}>{value}</Text>
              </View>
            ))}

            {/* Items */}
            {order.items.map((item, i) => (
              <View key={i} style={[styles.summaryRow, { borderBottomWidth: 0, marginTop: 4 }]}>
                <Text style={styles.itemName}>{item.name} × {item.quantity_kg}kg</Text>
                <Text style={styles.itemPrice}>{(item.price * item.quantity_kg).toLocaleString()} RWF</Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.homeBtn} onPress={() => router.replace('/')}>
            <Ionicons name="home-outline" size={18} color={colors.primary} />
            <Text style={styles.homeBtnText}>Subira Ahabanza</Text>
          </Pressable>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.headerBg },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.contentBg },
  headerSafe: { backgroundColor: colors.headerBg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, gap: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontFamily: fonts.bold,    fontSize: 18, color: '#fff' },
  headerSub:    { fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  content:       { flex: 1, backgroundColor: colors.contentBg },
  scrollContent: { padding: 16, gap: 14 },

  statusCard: {
    borderRadius: radius.card, padding: 24, alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 4,
  },
  statusIconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  statusLabel:    { fontFamily: fonts.bold,    fontSize: 22, marginBottom: 8 },
  statusDesc:     { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 21 },

  countdownBox:   { marginTop: 18, alignItems: 'center' },
  countdownLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  countdownTimer: { fontFamily: fonts.bold, fontSize: 40, color: colors.primary, letterSpacing: 2 },

  stepsCard: {
    backgroundColor: colors.cardBg, borderRadius: radius.card, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  stepRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 14, minHeight: 44 },
  stepLeft: { alignItems: 'center', width: 22 },
  stepDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  stepDotDone:    { backgroundColor: colors.primary },
  stepDotCurrent: { backgroundColor: colors.primary },
  stepDotInner:   { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  stepLine:     { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 2, minHeight: 18 },
  stepLineDone: { backgroundColor: colors.primary },
  stepText:     { fontFamily: fonts.regular, fontSize: 14, color: colors.textLight, flex: 1, paddingTop: 2 },
  stepTextDone: { fontFamily: fonts.semiBold, color: colors.text },

  summaryCard: {
    backgroundColor: colors.cardBg, borderRadius: radius.card, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  summaryLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  summaryValue: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text, flexShrink: 1, textAlign: 'right', marginLeft: 8 },
  itemName:  { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  itemPrice: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.primary },

  homeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.button, paddingVertical: 14,
  },
  homeBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.primary },
});
