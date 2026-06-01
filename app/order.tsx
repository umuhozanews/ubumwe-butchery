import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { getProduct } from '../data/meatData';
import { useAuthStore } from '../stores/authStore';
import { useOrderStore } from '../stores/orderStore';
import { colors, fonts, radius } from '../constants/theme';

export default function OrderScreen() {
  const { category, product } = useLocalSearchParams<{ category: string; product: string }>();
  const categoryId = Array.isArray(category) ? category[0] : (category ?? '');
  const productId  = Array.isArray(product)  ? product[0]  : (product  ?? '');
  const item = getProduct(categoryId, productId);

  const { profile, setPendingRoute } = useAuthStore();
  const { createOrder } = useOrderStore();

  const [name,        setName]        = useState(profile?.full_name ?? '');
  const [phone,       setPhone]       = useState(profile?.phone?.replace('+250', '0') ?? '');
  const [address,     setAddress]     = useState('');
  const [quantityKg,  setQuantityKg]  = useState(1);
  const [loading,     setLoading]     = useState(false);

  const priceNum = item ? parseInt(item.price.replace(',', ''), 10) : 0;
  const total    = priceNum * quantityKg;

  async function handleOrder() {
    if (!profile) {
      Alert.alert(
        'Injira Mbere',
        'Ugomba kwinjira mu konti yawe mbere yo gutumiza.',
        [
          { text: 'Hagarika', style: 'cancel' },
          { text: 'Injira', onPress: () => {
            setPendingRoute({ pathname: '/order', params: { category: categoryId, product: productId } });
            router.push('/auth/login');
          }},
        ]
      );
      return;
    }
    if (!name.trim())             { Alert.alert('Sibyo', 'Injiza amazina yawe yose.'); return; }
    if (!/^0?7[2-9]\d{7}$/.test(phone.trim())) { Alert.alert('Sibyo', 'Injiza nimero ya telefone nzima (ex: 0781234567).'); return; }
    if (!address.trim())          { Alert.alert('Sibyo', 'Injiza aderesi yawe.'); return; }
    if (!item)                    { Alert.alert('Ikosa', 'Ikibazo cyabaye. Ongera ugerageze.'); return; }

    setLoading(true);
    try {
      const order = await createOrder({
        user_id:          profile.id,
        items:            [{ product_id: productId, name: item.nameKiny, quantity_kg: quantityKg, price: priceNum }],
        total_amount:     total,
        customer_phone:   phone.trim().startsWith('+250') ? phone.trim() : `+250${phone.trim().replace(/^0/, '')}`,
        customer_name:    name.trim(),
        customer_address: address.trim(),
      });
      router.push({
        pathname: '/payment',
        params: {
          orderId:   order.id,
          name:      name.trim(),
          phone:     phone.trim(),
          total:     String(total),
          itemCount: '1',
        },
      });
    } catch (e: any) {
      Alert.alert('Ikosa', e.message ?? 'Ikibazo cyabaye. Ongera ugerageze.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.root}>
        <StatusBar style="light" />

        <SafeAreaView style={styles.headerSafe} edges={['top']}>
          <View style={styles.header}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Guta Itumba</Text>
              <Text style={styles.headerSub}>Uzuza amakuru yawe</Text>
            </View>
            <View style={{ width: 42 }} />
          </View>
        </SafeAreaView>

        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

            {/* Product summary */}
            {item && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Ionicons name="bag-check-outline" size={20} color={colors.primary} />
                  <Text style={styles.summaryName}>{item.nameKiny}</Text>
                </View>
                <Text style={styles.summaryEn}>{item.nameEn}</Text>
                <Text style={styles.summaryPrice}>{item.price} RWF / kg</Text>
              </View>
            )}

            {/* Quantity */}
            <Text style={styles.sectionLabel}>Ingano (kg)</Text>
            <View style={styles.qtyCard}>
              <Pressable style={styles.qtyBtn} onPress={() => setQuantityKg((q) => Math.max(1, q - 1))}>
                <Ionicons name="remove" size={22} color={colors.primary} />
              </Pressable>
              <Text style={styles.qtyValue}>{quantityKg} kg</Text>
              <Pressable style={styles.qtyBtn} onPress={() => setQuantityKg((q) => Math.min(50, q + 1))}>
                <Ionicons name="add" size={22} color={colors.primary} />
              </Pressable>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Ikiguzi Cyose:</Text>
              <Text style={styles.totalValue}>{total.toLocaleString()} RWF</Text>
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Amakuru y'Umuguzi</Text>

            {/* Amazina */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Amazina <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color={colors.textLight} />
                <TextInput style={styles.input} placeholder="Amazina yawe yose" placeholderTextColor={colors.textLight}
                  value={name} onChangeText={setName} autoCapitalize="words" returnKeyType="next" />
              </View>
            </View>

            {/* Telefone */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nimero ya Telefone <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputRow}>
                <Ionicons name="call-outline" size={18} color={colors.textLight} />
                <TextInput style={styles.input} placeholder="07X XXX XXXX" placeholderTextColor={colors.textLight}
                  value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} returnKeyType="next" />
              </View>
            </View>

            {/* Aderesi */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Aderesi <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputRow, styles.textareaRow]}>
                <Ionicons name="location-outline" size={18} color={colors.textLight} style={{ marginTop: 2 }} />
                <TextInput style={[styles.input, styles.textarea]} placeholder="Akarere, Umurenge, Akagari, Inzu..."
                  placeholderTextColor={colors.textLight} value={address} onChangeText={setAddress}
                  multiline numberOfLines={4} textAlignVertical="top" />
              </View>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          <SafeAreaView style={styles.btnSafe} edges={['bottom']}>
            <Pressable style={[styles.orderBtn, loading && styles.orderBtnDisabled]} onPress={handleOrder} disabled={loading}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.orderBtnText}>{loading ? 'Gutegereza...' : 'TUMIZA'}</Text>
            </Pressable>
          </SafeAreaView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.headerBg },
  headerSafe: { backgroundColor: colors.headerBg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, gap: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: fonts.bold,    fontSize: 18, color: '#fff' },
  headerSub:   { fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  content:       { flex: 1, backgroundColor: colors.contentBg },
  scrollContent: { padding: 16 },

  summaryCard: {
    backgroundColor: colors.cardBg, borderRadius: radius.card, padding: 16, marginBottom: 20,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  summaryRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  summaryName:  { fontFamily: fonts.bold,    fontSize: 15, color: colors.text },
  summaryEn:    { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
  summaryPrice: { fontFamily: fonts.bold,    fontSize: 17, color: colors.primary },

  sectionLabel: { fontFamily: fonts.bold, fontSize: 15, color: colors.text, marginBottom: 12 },

  qtyCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.cardBg, borderRadius: radius.card, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  qtyBtn:   { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  qtyValue: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },

  totalRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
  totalLabel: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textSecondary },
  totalValue: { fontFamily: fonts.bold,    fontSize: 18, color: colors.primary },

  fieldGroup:  { marginBottom: 16 },
  fieldLabel:  { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text, marginBottom: 6 },
  required:    { color: '#ef4444' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg,
    borderRadius: radius.button, paddingHorizontal: 14, paddingVertical: 13, gap: 10,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  textareaRow: { alignItems: 'flex-start' },
  input:    { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, padding: 0 },
  textarea: { minHeight: 80 },

  btnSafe: { backgroundColor: colors.contentBg, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  orderBtn: {
    flexDirection: 'row', backgroundColor: colors.primary, borderRadius: radius.button,
    paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  orderBtnDisabled: { opacity: 0.6 },
  orderBtnText:     { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
});
