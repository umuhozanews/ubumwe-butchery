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
import { router } from 'expo-router';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import { POPULAR_CUTS, BANNER_IMAGE } from '../data/meatData';
import { useCartStore } from '../stores/cartStore';
import { colors, fonts, radius } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORIES: Array<{
  id: string;
  label: string;
  active: boolean;
  emoji?: string;
  icon?: IoniconName;
}> = [
  { id: 'all', label: 'All', icon: 'menu', active: true },
  { id: 'cow',     label: 'INKA',   emoji: '🐄', active: false },
  { id: 'goat',    label: 'IHENE',  emoji: '🐐', active: false },
  { id: 'fish',    label: 'IFI',    emoji: '🐟', active: false },
  { id: 'chicken', label: 'INKOKO', emoji: '🍗', active: false },
];


export default function HomeScreen() {
  const { addItem } = useCartStore();
  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* ── Dark header: avatar + name + search ── */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        {/* Top row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>🥩</Text>
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.userName}>UBUMWE BUTCHERY</Text>
            </View>
          </View>
          <Pressable style={styles.bellCircle} onPress={() => router.push('/my-orders' as any)}>
            <Ionicons name="notifications-outline" size={20} color="#fff" />
            <View style={styles.bellDot} />
          </Pressable>
        </View>

        {/* Search bar — tapping opens search screen */}
        <Pressable style={styles.searchBar} onPress={() => router.push('/search' as any)}>
          <Ionicons name="search-outline" size={18} color={colors.textLight} />
          <Text style={styles.searchPlaceholder}>Shakisha inkoko, ifi, inka...</Text>
          <View style={styles.filterBtn}>
            <Ionicons name="options-outline" size={18} color={colors.primary} />
          </View>
        </Pressable>
      </SafeAreaView>

      {/* ── Light content ── */}
      <View style={styles.contentArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Category row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={styles.categoryItem}
                onPress={() => {
                  if (cat.id !== 'all') {
                    router.push(`/${cat.id}` as any);
                  }
                }}
              >
                <View style={[styles.categoryCircle, cat.active && styles.activeCategoryCircle]}>
                  {cat.emoji ? (
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  ) : (
                    <Ionicons
                      name={cat.icon!}
                      size={22}
                      color={cat.active ? '#fff' : colors.textSecondary}
                    />
                  )}
                </View>
                <Text style={[styles.categoryLabel, cat.active && styles.activeCategoryLabel]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Special Offers label */}
          <Text style={styles.specialOffersLabel}>Special Offers</Text>

          {/* Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerTitle}>35% Discount</Text>
              <Text style={styles.bannerSubtitle}>
                On selected fresh cuts{'\n'}delivered to your door
              </Text>
              <View style={styles.shopNowBtn}>
                <Text style={styles.shopNowText}>Order Now</Text>
              </View>
            </View>
            <Image
              source={BANNER_IMAGE}
              style={styles.bannerImage}
            />
          </View>

          {/* Popular Items */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Cuts</Text>
            <Pressable onPress={() => router.push('/search' as any)}>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>

          {/* Product grid */}
          <View style={styles.productGrid}>
            {POPULAR_CUTS.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/${item.category}/${item.id}` as any)}
              >
                <ProductCard
                  title={item.title}
                  subtitle={item.subtitle}
                  price={item.price}
                  image={item.image}
                  width={CARD_WIDTH}
                  onAddPress={() =>
                    addItem({
                      productId:  item.id,
                      categoryId: item.category,
                      nameKiny:   item.title,
                      nameEn:     item.subtitle,
                      price:      parseInt(item.price.replace(',', ''), 10),
                      image:      item.image,
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

  headerSafe: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 24 },
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
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: colors.headerBg,
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

  categoriesRow: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12, gap: 20 },
  categoryItem: { alignItems: 'center', gap: 6 },
  categoryCircle: {
    width: 54,
    height: 54,
    borderRadius: radius.full,
    backgroundColor: '#ececec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCategoryCircle: { backgroundColor: colors.primary },
  categoryEmoji: { fontSize: 24 },
  categoryLabel: { fontFamily: fonts.medium, fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  activeCategoryLabel: { color: colors.primary, fontFamily: fonts.semiBold },

  specialOffersLabel: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  banner: {
    marginHorizontal: 16,
    borderRadius: radius.card,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 20,
    paddingRight: 0,
    marginBottom: 24,
    minHeight: 140,
  },
  bannerLeft: { flex: 1, justifyContent: 'center', paddingRight: 8 },
  bannerTitle: { fontFamily: fonts.bold, fontSize: 22, color: '#fff', marginBottom: 6 },
  bannerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginBottom: 14,
  },
  shopNowBtn: {
    backgroundColor: '#219150',
    borderRadius: radius.full,
    paddingHorizontal: 18,
    paddingVertical: 9,
    alignSelf: 'flex-start',
  },
  shopNowText: { fontFamily: fonts.semiBold, fontSize: 13, color: '#fff' },
  bannerImage: { width: 140, height: '100%', minHeight: 140 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  viewAll: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },

  productGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },

});
