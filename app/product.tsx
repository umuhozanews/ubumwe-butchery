import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ProductCard from '../components/ProductCard';
import { colors, fonts, radius } from '../constants/theme';

const { width } = Dimensions.get('window');

const TABS = ['Details', 'Support', 'Ratings'];

import MeatImages from '../assets/images';
import { ImageSourcePropType } from 'react-native';

const RELATED: { id: string; title: string; subtitle: string; price: string; image: ImageSourcePropType }[] = [
  { id: '1', title: 'Iroti',       subtitle: 'Boneless Beef',  price: '2,500', image: MeatImages.iroti },
  { id: '2', title: 'Inkoko Yose', subtitle: 'Whole Chicken',  price: '4,500', image: MeatImages.chickenWhole },
  { id: '3', title: 'Tilapia',     subtitle: 'Fresh Fish',     price: '2,000', image: MeatImages.tilapia },
];

export default function ProductDetailScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeTop} edges={['top']}>
        {/* Top buttons overlaid on hero */}
        <View style={styles.topBar}>
          <View style={styles.circleBtn}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </View>
          <View style={styles.circleBtn}>
            <Ionicons name="heart-outline" size={20} color={colors.text} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero image — extends behind safe area top bar */}
        <Image
          source={{ uri: 'https://picsum.photos/seed/meatbeef/600/400' }}
          style={[styles.heroImage, { width }]}
          resizeMode="cover"
        />

        {/* Content */}
        <View style={styles.content}>
          {/* Title + rating */}
          <View style={styles.titleRow}>
            <Text style={styles.productTitle}>Meat Beef Bone in ± 50 gm</Text>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={styles.ratingNum}>4.8</Text>
            </View>
          </View>

          {/* Reviews + seller info */}
          <View style={styles.metaRow}>
            <Text style={styles.reviewCount}>(185 Reviews)</Text>
            <View style={styles.dot} />
            <Text style={styles.metaText}>Seller: Tariqul</Text>
            <View style={styles.dot} />
            <Text style={styles.metaText}>Vendor: Eshop</Text>
          </View>

          {/* Tab row */}
          <View style={styles.tabRow}>
            {TABS.map((tab, index) => (
              <View key={tab} style={[styles.tab, index === 0 && styles.activeTab]}>
                <Text style={[styles.tabText, index === 0 && styles.activeTabText]}>
                  {tab}
                </Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod libero vitae justo.
            Nulla eget purus eget nisi vestibulum tincidunt. Fusce nec semper velit. Nullam sit amet urna.
          </Text>

          {/* You Might Also Like */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>You Might Also Like</Text>
            <Text style={styles.viewAll}>View All</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedScroll}
          >
            {RELATED.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                subtitle={product.subtitle}
                price={product.price}
                image={product.image}
                width={160}
              />
            ))}
          </ScrollView>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Add to Cart bottom bar */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <View style={styles.bottomBarInner}>
          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.currentPrice}>$2.99<Text style={styles.priceUnit}>/Kg</Text></Text>
          </View>
          <View style={styles.addToCartBtn}>
            <Ionicons name="cart-outline" size={18} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cardBg,
  },
  safeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  scroll: {
    flex: 1,
  },
  heroImage: {
    height: 280,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  productTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
    flex: 1,
    lineHeight: 28,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 4,
  },
  ratingNum: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: '#fff',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  reviewCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textLight,
  },
  metaText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 30,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 26,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#fff',
    fontFamily: fonts.semiBold,
  },
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
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.text,
  },
  viewAll: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.primary,
  },
  relatedScroll: {
    gap: 12,
    paddingBottom: 4,
  },
  bottomBar: {
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 16,
  },
  priceBlock: {
    flex: 1,
  },
  priceLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textLight,
  },
  currentPrice: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
  },
  priceUnit: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textLight,
  },
  addToCartBtn: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addToCartText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#fff',
  },
});
