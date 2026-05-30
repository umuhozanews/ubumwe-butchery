import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, StyleSheet,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useOrderStore } from '../stores/orderStore';
import { colors, fonts, radius } from '../constants/theme';

export default function CheckoutScreen() {
  const { profile, setPendingRoute } = useAuthStore();
  const { items, clearCart }        = useCartStore();
  const { createOrder }             = useOrderStore();

  const [name,    setName]    = useState(profile?.full_name ?? '');
  const [phone,   setPhone]   = useState(profile?.phone?.replace('+250', '0') ?? '');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (items.length === 0) {
    router.replace('/cart' as any);
    return null;
  }

  async function handleCheckout() {
    if (!profile) {
      setPendingRoute({ pathname: '/checkout' });
      router.push('/auth/login');
      return;
    }
    if (!name.trim())                                        { Alert.alert('Sibyo', 'Injiza amazina yawe.'); return; }
    if (!/^0?7[2-9]\d{7}$/.test(phone.trim()))              { Alert.alert('Sibyo', 'Injiza nimero nzima (ex: 0781234567).'); return; }
    if (!address.trim())                                     { Alert.alert('Sibyo', 'Injiza aderesi yawe.'); return; }

    setLoading(true);
    try {
      const normalizedPhone = phone.trim().startsWith('0')
        ? `+250${phone.trim().slice(1)}`
        : `+250${phone.trim()}`;

      const order = await createOrder({
        user_id:          profile.id,
        items:            items.map((i) => ({
          product_id:   i.productId,
          name:         i.nameKiny,
          quantity_kg:  i.qty,
          price:        i.price,
        })),
        total_amount:     total,
        customer_phone:   normalizedPhone,
        customer_name:    name.trim(),
        customer_address: address.trim(),
      });

      clearCart();
      router.replace({
        pathname: '/payment',
        params: {
          orderId:  order.id,
          name:     name.trim(),
          phone:    phone.trim(),
        },
      } as any);
    } catch (e: any) {
      Alert.alert('Ikosa', e.message ?? 'Hari ikibazo cyabaye.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.root}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.headerSafe} edges={['top']}>
          <View style={styles.header}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Checkout</Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Items summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ibicuruzwa ({items.length})</Text>
            {items.map((item) => (
              <View key={item.productId} style={styles.orderItem}>
                <Text style={styles.orderName}>{item.nameKiny}</Text>
                <Text style={styles.orderDetail}>{item.qty}kg × {item.price.toLocaleString()} RWF</Text>
                <Text style={styles.orderTotal}>{(item.price * item.qty).toLocaleString()} RWF</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Igiteranyo</Text>
              <Text style={styles.totalValue}>{total.toLocaleString()} RWF</Text>
            </View>
          </View>

          {/* Delivery info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amakuru y'Uturukirwa</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Amazina</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color={colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Amazina yose"
                  placeholderTextColor={colors.textLight}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Telefone</Text>
              <View style={styles.inputRow}>
                <Text style={styles.prefix}>+250</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0781234567"
                  placeholderTextColor={colors.textLight}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Aderesi</Text>
              <View style={styles.inputRow}>
                <Ionicons name="location-outline" size={18} color={colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="ex: Kigali, Gasabo, Kimironko"
                  placeholderTextColor={colors.textLight}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>
          </View>

          <View style={{ height: 12 }} />
        </ScrollView>

        <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
          <View style={styles.bottomInner}>
            <View>
              <Text style={styles.bottomTotal}>{total.toLocaleString()} RWF</Text>
              <Text style={styles.bottomLabel}>Igiteranyo</Text>
            </View>
            <Pressable
              style={[styles.checkoutBtn, loading && styles.checkoutBtnDisabled]}
              onPress={handleCheckout}
              disabled={loading}
            >
              <Text style={styles.checkoutText}>{loading ? 'Gutegereza...' : 'TUMIZA'}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.contentBg },
  headerSafe: { backgroundColor: colors.cardBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    backgroundColor: colors.cardBg,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  scroll:      { padding: 16, gap: 16 },

  section: {
    backgroundColor: colors.cardBg, borderRadius: radius.card, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.text, marginBottom: 12 },
  orderItem:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  orderName:    { flex: 1, fontFamily: fonts.semiBold, fontSize: 13, color: colors.text },
  orderDetail:  { fontFamily: fonts.regular, fontSize: 12, color: colors.textLight },
  orderTotal:   { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6',
  },
  totalLabel: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  totalValue: { fontFamily: fonts.bold, fontSize: 17, color: colors.primary },

  field:      { marginBottom: 12 },
  fieldLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.contentBg, borderRadius: radius.button,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: colors.border,
  },
  input:  { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, padding: 0 },
  prefix: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textSecondary },

  bottomBar:   { backgroundColor: colors.cardBg, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  bottomInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  bottomTotal:        { fontFamily: fonts.bold,    fontSize: 18, color: colors.text },
  bottomLabel:        { fontFamily: fonts.regular, fontSize: 12, color: colors.textLight },
  checkoutBtn:        { backgroundColor: colors.primary, borderRadius: radius.button, paddingHorizontal: 32, paddingVertical: 14 },
  checkoutBtnDisabled:{ opacity: 0.6 },
  checkoutText:       { fontFamily: fonts.bold, fontSize: 15, color: '#fff' },
});
