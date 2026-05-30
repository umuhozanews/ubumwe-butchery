import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { colors, fonts, radius } from '../constants/theme';

type CartItemData = {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

const CART_ITEMS: CartItemData[] = [
  {
    id: '1',
    title: 'Broiler Chicken Skin',
    subtitle: 'Fresh Chicken Skin',
    price: 265,
    quantity: 1,
    imageUrl: 'https://picsum.photos/seed/chickenskin/200/200',
  },
  {
    id: '2',
    title: 'Fresh Watermelon',
    subtitle: 'Fresh Watermelon',
    price: 265,
    quantity: 1,
    imageUrl: 'https://picsum.photos/seed/watermelon/200/200',
  },
  {
    id: '3',
    title: 'Fresh Green bean',
    subtitle: 'Original Fresh Green Bean',
    price: 265,
    quantity: 1,
    imageUrl: 'https://picsum.photos/seed/greenbeans/200/200',
  },
];

const SUBTOTAL = 2510;
const SHIPPING = 30;
const TOTAL = SUBTOTAL + SHIPPING;

function CartItem({ item }: { item: CartItemData }) {
  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
      <View style={styles.itemRight}>
        <View style={styles.itemTopRow}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </View>
        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        <View style={styles.itemBottomRow}>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          <View style={styles.qtyRow}>
            <View style={styles.qtyBtn}>
              <Ionicons name="remove" size={16} color={colors.textSecondary} />
            </View>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <View style={[styles.qtyBtn, styles.qtyBtnActive]}>
              <Ionicons name="add" size={16} color={colors.primary} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </View>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Cart Items */}
          <View style={styles.itemsContainer}>
            {CART_ITEMS.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </View>

          {/* Promo Code */}
          <View style={styles.promoRow}>
            <View style={styles.promoInputWrapper}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter Promo Code"
                placeholderTextColor={colors.textLight}
                editable={false}
              />
            </View>
            <View style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Apply Code</Text>
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${SUBTOTAL.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping Fee</Text>
              <Text style={styles.summaryValue}>${SHIPPING.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${TOTAL.toFixed(2)}</Text>
            </View>
          </View>

          {/* Proceed Button */}
          <View style={styles.paymentBtn}>
            <Text style={styles.paymentBtnText}>Proceed To Payment</Text>
          </View>

          <View style={{ height: 12 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cardBg,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.cardBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  headerPlaceholder: {
    width: 38,
  },
  scrollContent: {
    paddingTop: 8,
  },
  itemsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: radius.card,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  itemRight: {
    flex: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  itemSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.text,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnActive: {
    backgroundColor: '#dcfce7',
  },
  qtyText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  promoRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 10,
    alignItems: 'center',
  },
  promoInputWrapper: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: radius.button,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promoInput: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
    padding: 0,
  },
  applyBtn: {
    backgroundColor: colors.text,
    borderRadius: radius.button,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  applyBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#fff',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  summaryLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
  },
  totalLabel: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  totalValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  paymentBtn: {
    marginHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: 16,
    alignItems: 'center',
  },
  paymentBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#fff',
  },
});
