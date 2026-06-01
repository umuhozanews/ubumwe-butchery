import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import ProductCard from '../../components/ProductCard';
import BottomNav from '../../components/BottomNav';
import { PRODUCTS, getCategoryLabel } from '../../data/meatData';
import { useCartStore } from '../../stores/cartStore';
import { colors, fonts, radius } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;


export default function SubCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const categoryId = Array.isArray(category) ? category[0] : (category ?? '');
  const categoryLabel = getCategoryLabel(categoryId);
  const products = PRODUCTS[categoryId] ?? [];
  const { addItem } = useCartStore();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* ── Same dark header as Home ── */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.welcomeText}>Category</Text>
            <Text style={styles.userName}>{categoryLabel} Cuts</Text>
          </View>
          <View style={styles.bellCircle}>
            <Ionicons name="notifications-outline" size={20} color="#fff" />
          </View>
        </View>

        {/* Search bar — scoped to this category */}
        <Pressable
          style={styles.searchBar}
          onPress={() => router.push({ pathname: '/search', params: { category: categoryId } } as any)}
        >
          <Ionicons name="search-outline" size={18} color={colors.textLight} />
          <Text style={styles.searchPlaceholder}>Shakisha mu {categoryLabel}...</Text>
          <View style={styles.filterBtn}>
            <Ionicons name="options-outline" size={18} color={colors.primary} />
          </View>
        </Pressable>
      </SafeAreaView>

      {/* ── Light content ── */}
      <View style={styles.contentArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Section header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Cuts</Text>
            <Text style={styles.countLabel}>{products.length} items</Text>
          </View>

          {/* Product grid — same as home */}
          <View style={styles.productGrid}>
            {products.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => router.push(`/${categoryId}/${product.id}` as any)}
              >
                <ProductCard
                  title={product.nameKiny}
                  subtitle={product.nameEn}
                  price={product.price}
                  image={product.image}
                  width={CARD_WIDTH}
                  onAddPress={() =>
                    addItem({
                      productId:  product.id,
                      categoryId,
                      nameKiny:   product.nameKiny,
                      nameEn:     product.nameEn,
                      price:      parseInt(product.price.replace(',', ''), 10),
                      image:      product.image,
                    })
                  }
                />
              </Pressable>
            ))}
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>

        <BottomNav active="home" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.headerBg },

  headerSafe: { backgroundColor: colors.headerBg, paddingHorizontal: 16, paddingBottom: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  welcomeText: { fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 2 },
  userName: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
  bellCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchPlaceholder: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.textLight },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  contentArea: { flex: 1, backgroundColor: colors.contentBg },
  scrollContent: { paddingBottom: 8 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  countLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },

  productGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },

});
