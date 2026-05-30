import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import ProductCard from '../../components/ProductCard';
import { getProduct, PRODUCTS } from '../../data/meatData';
import { useCartStore } from '../../stores/cartStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { colors, fonts, radius } from '../../constants/theme';

const { width } = Dimensions.get('window');
const TABS = ['Details', 'Support', 'Ratings'];

export default function ProductDetailScreen() {
  const { category, product } = useLocalSearchParams<{ category: string; product: string }>();
  const categoryId = Array.isArray(category) ? category[0] : (category ?? '');
  const productId = Array.isArray(product) ? product[0] : (product ?? '');

  const item    = getProduct(categoryId, productId);
  const related = (PRODUCTS[categoryId] ?? []).filter((p) => p.id !== productId).slice(0, 4);

  const { addItem }  = useCartStore();
  const { toggle, isFav } = useFavoritesStore();
  const favorited = item ? isFav(item.id) : false;

  if (!item) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Hero image ── */}
        <Image
          source={item.image}
          style={[styles.heroImage, { width }]}
          resizeMode="cover"
        />

        {/* ── Content — mirrors original product.tsx ── */}
        <View style={styles.content}>
          {/* Title + weight row */}
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.productTitle}>{item.nameKiny}</Text>
              <Text style={styles.productWeight}>{item.nameEn} · per kg</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color="#f59e0b" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>

          {/* Price */}
          <Text style={styles.price}>{item.price} RWF<Text style={styles.priceUnit}>/kg</Text></Text>

          {/* Seller row */}
          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              <Text style={{ fontSize: 16 }}>🥩</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerLabel}>Vendor</Text>
              <Text style={styles.sellerName}>UBUMWE BUTCHERY</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          {/* Tab row — Details active, others static */}
          <View style={styles.tabRow}>
            {TABS.map((tab, index) => (
              <View key={tab} style={[styles.tab, index === 0 && styles.activeTab]}>
                <Text style={[styles.tabText, index === 0 && styles.activeTabText]}>{tab}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.description}>{item.description}</Text>

          {/* You Might Also Like */}
          {related.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>You Might Also Like</Text>
                <Text style={styles.viewAll}>View All</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScroll}
              >
                {related.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/${categoryId}/${p.id}` as any)}
                  >
                    <ProductCard
                      title={p.nameKiny}
                      subtitle={p.nameEn}
                      price={p.price}
                      image={p.image}
                      width={160}
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ── Bottom bar ── */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <View style={styles.bottomBarInner}>
          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.cartPrice}>{item.price} RWF</Text>
          </View>
          <Pressable
            style={styles.cartIconBtn}
            onPress={() =>
              addItem({
                productId:  productId,
                categoryId: categoryId,
                nameKiny:   item.nameKiny,
                nameEn:     item.nameEn,
                price:      parseInt(item.price.replace(',', ''), 10),
                image:      item.image,
              })
            }
          >
            <Ionicons name="cart-outline" size={22} color={colors.primary} />
          </Pressable>
          <Pressable
            style={styles.addToCartBtn}
            onPress={() =>
              router.push({
                pathname: '/order',
                params: { category: categoryId, product: productId },
              })
            }
          >
            <Ionicons name="bag-outline" size={18} color="#fff" />
            <Text style={styles.addToCartText}>GURA</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* ── Back + heart overlaid on hero ── */}
      <SafeAreaView style={styles.backBtnSafe} edges={['top']} pointerEvents="box-none">
        <View style={styles.topBar} pointerEvents="box-none">
          <Pressable style={styles.backCircle} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
          <Pressable style={styles.backCircle} onPress={() => toggle(productId)}>
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={20}
              color={favorited ? '#ef4444' : colors.text}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cardBg },
  scroll: { flex: 1 },

  heroImage: { height: 280, backgroundColor: '#e0e0e0' },

  content: { padding: 20 },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleBlock: { flex: 1, marginRight: 12 },
  productTitle: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: 4 },
  productWeight: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  ratingText: { fontFamily: fonts.semiBold, fontSize: 13, color: '#92400e' },

  price: { fontFamily: fonts.bold, fontSize: 22, color: colors.primary, marginBottom: 16 },
  priceUnit: { fontFamily: fonts.regular, fontSize: 14, color: colors.textLight },

  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: colors.contentBg,
    borderRadius: radius.card,
    marginBottom: 20,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textLight },
  sellerName: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedText: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.contentBg,
    borderRadius: radius.card,
    padding: 4,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: colors.primary },
  tabText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  activeTabText: { color: '#fff', fontFamily: fonts.semiBold },

  description: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
  viewAll: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
  relatedScroll: { gap: 12, paddingBottom: 4 },

  bottomBar: { backgroundColor: colors.cardBg, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 16,
  },
  priceBlock: { flex: 1 },
  priceLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textLight },
  cartPrice: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  cartIconBtn: {
    width: 48, height: 48, borderRadius: radius.button,
    borderWidth: 1.5, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addToCartText: { fontFamily: fonts.semiBold, fontSize: 15, color: '#fff' },

  backBtnSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  topBar: { paddingHorizontal: 16, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontFamily: fonts.medium, fontSize: 16, color: colors.textSecondary },
});
