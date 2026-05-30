import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useCartStore } from '../stores/cartStore';
import { PRODUCTS } from '../data/meatData';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import { colors, fonts } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

export default function FavoritesScreen() {
  const { ids, toggle } = useFavoritesStore();
  const { addItem } = useCartStore();

  const favorited = Object.entries(PRODUCTS).flatMap(([catId, products]) =>
    products.filter((p) => ids.includes(p.id)).map((p) => ({ ...p, categoryId: catId })),
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Ibikurikuwe</Text>
          <View style={{ width: 42 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {favorited.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Nta kintu gikurikiwe</Text>
            <Text style={styles.emptySub}>Kanda umutima ku bicuruzwa ukunda</Text>
            <Pressable style={styles.browseBtn} onPress={() => router.replace('/' as any)}>
              <Text style={styles.browseBtnText}>Reba Ibicuruzwa</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.count}>{favorited.length} ibicuruzwa</Text>
            <View style={styles.grid}>
              {favorited.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(`/${item.categoryId}/${item.id}` as any)}
                >
                  <ProductCard
                    title={item.nameKiny}
                    subtitle={item.nameEn}
                    price={item.price}
                    image={item.image}
                    width={CARD_WIDTH}
                    onAddPress={() =>
                      addItem({
                        productId:  item.id,
                        categoryId: item.categoryId,
                        nameKiny:   item.nameKiny,
                        nameEn:     item.nameEn,
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
        )}
        <BottomNav active="favorites" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.headerBg },
  header:  { backgroundColor: colors.headerBg, paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 8, gap: 12,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 18, color: '#fff', textAlign: 'center' },
  content:     { flex: 1, backgroundColor: colors.contentBg },
  scrollContent: { padding: 16, paddingBottom: 8 },
  count:   { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: 14 },
  grid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  empty:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontFamily: fonts.bold,    fontSize: 18, color: colors.text },
  emptySub:   { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  browseBtn:     { marginTop: 8, backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
  browseBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: '#fff' },
});
