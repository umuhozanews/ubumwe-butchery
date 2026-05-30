import {
  View, Text, ScrollView, Image, StyleSheet, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useCartStore } from '../stores/cartStore';
import { colors, fonts, radius } from '../constants/theme';

export default function CartScreen() {
  const { items, removeItem, updateQty } = useCartStore();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Igare ry'Ibicuruzwa</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="cart-outline" size={72} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Igare rigaragara</Text>
            <Text style={styles.emptySub}>Ongeramo ibicuruzwa mu igare</Text>
            <Pressable style={styles.shopBtn} onPress={() => router.replace('/' as any)}>
              <Text style={styles.shopBtnText}>Reba Ibicuruzwa</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            <View style={styles.itemsContainer}>
              {items.map((item) => (
                <View key={item.productId} style={styles.cartItem}>
                  <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
                  <View style={styles.itemRight}>
                    <View style={styles.itemTopRow}>
                      <Text style={styles.itemTitle} numberOfLines={1}>{item.nameKiny}</Text>
                      <Pressable onPress={() => removeItem(item.productId)} hitSlop={8}>
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </Pressable>
                    </View>
                    <Text style={styles.itemSubtitle}>{item.nameEn}</Text>
                    <View style={styles.itemBottomRow}>
                      <Text style={styles.itemPrice}>{(item.price * item.qty).toLocaleString()} RWF</Text>
                      <View style={styles.qtyRow}>
                        <Pressable
                          style={styles.qtyBtn}
                          onPress={() => updateQty(item.productId, item.qty - 1)}
                          hitSlop={8}
                        >
                          <Ionicons name="remove" size={16} color={colors.textSecondary} />
                        </Pressable>
                        <Text style={styles.qtyText}>{item.qty}kg</Text>
                        <Pressable
                          style={[styles.qtyBtn, styles.qtyBtnActive]}
                          onPress={() => updateQty(item.productId, item.qty + 1)}
                          hitSlop={8}
                        >
                          <Ionicons name="add" size={16} color={colors.primary} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Order summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gaciro rusange</Text>
                <Text style={styles.summaryValue}>{subtotal.toLocaleString()} RWF</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gutwara</Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>Birakora</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Igiteranyo</Text>
                <Text style={styles.totalValue}>{subtotal.toLocaleString()} RWF</Text>
              </View>
            </View>

            <Pressable style={styles.checkoutBtn} onPress={() => router.push('/checkout' as any)}>
              <Text style={styles.checkoutBtnText}>Komeza Gutumiza</Text>
            </Pressable>

            <View style={{ height: 12 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.cardBg },
  safeArea:{ flex: 1, backgroundColor: colors.cardBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle:       { fontFamily: fonts.bold,    fontSize: 18, color: colors.text },
  headerPlaceholder: { width: 38 },
  scrollContent:     { paddingTop: 8 },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontFamily: fonts.bold,    fontSize: 20, color: colors.text },
  emptySub:   { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  shopBtn:     { marginTop: 8, backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
  shopBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: '#fff' },

  itemsContainer: { paddingHorizontal: 16, gap: 12, marginBottom: 20 },
  cartItem: {
    flexDirection: 'row', backgroundColor: '#f9fafb',
    borderRadius: radius.card, padding: 12, gap: 12, alignItems: 'center',
  },
  itemImage:  { width: 72, height: 72, borderRadius: 10, backgroundColor: '#eee' },
  itemRight:  { flex: 1 },
  itemTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  itemTitle:  { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text, flex: 1, marginRight: 8 },
  itemSubtitle:{ fontFamily: fonts.regular, fontSize: 12, color: colors.textLight, marginBottom: 8 },
  itemBottomRow:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemPrice:  { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  qtyRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnActive: { backgroundColor: '#dcfce7' },
  qtyText:    { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text, minWidth: 28, textAlign: 'center' },

  summaryCard:    { marginHorizontal: 16, marginBottom: 20 },
  summaryRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  summaryDivider: { height: 1, backgroundColor: '#f3f4f6' },
  summaryLabel:   { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  summaryValue:   { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  totalLabel:     { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  totalValue:     { fontFamily: fonts.bold, fontSize: 18, color: colors.text },

  checkoutBtn:     { marginHorizontal: 16, backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 16, alignItems: 'center' },
  checkoutBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: '#fff' },
});
