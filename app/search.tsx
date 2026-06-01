import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, Image,
  StyleSheet, Pressable, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { PRODUCTS, CATEGORIES } from '../data/meatData';
import { useCartStore } from '../stores/cartStore';
import { useFavoritesStore } from '../stores/favoritesStore';
import { colors, fonts, radius } from '../constants/theme';
import { ImageSourcePropType } from 'react-native';

type SearchResult = {
  id: string;
  categoryId: string;
  nameKiny: string;
  nameEn: string;
  price: string;
  image: ImageSourcePropType;
  badge: string;
};

function buildSearchIndex(): SearchResult[] {
  return Object.entries(PRODUCTS).flatMap(([catId, products]) =>
    products.map((p) => ({
      id:         p.id,
      categoryId: catId,
      nameKiny:   p.nameKiny,
      nameEn:     p.nameEn,
      price:      p.price,
      image:      p.image,
      badge:      p.badge,
    }))
  );
}

const ALL_PRODUCTS = buildSearchIndex();

export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string; q?: string }>();
  const initialCategory = Array.isArray(params.category) ? params.category[0] : (params.category ?? '');
  const initialQuery    = Array.isArray(params.q)        ? params.q[0]        : (params.q        ?? '');

  const [query,       setQuery]       = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [results,     setResults]     = useState<SearchResult[]>([]);
  const [searching,   setSearching]   = useState(false);
  const inputRef = useRef<TextInput>(null);

  const { addItem }          = useCartStore();
  const { toggle, isFav }    = useFavoritesStore();

  const runSearch = useCallback((q: string, cat: string) => {
    setSearching(true);
    const trimmed = q.trim().toLowerCase();
    let pool = cat ? ALL_PRODUCTS.filter((p) => p.categoryId === cat) : ALL_PRODUCTS;

    if (trimmed) {
      pool = pool.filter(
        (p) =>
          p.nameKiny.toLowerCase().includes(trimmed) ||
          p.nameEn.toLowerCase().includes(trimmed)   ||
          p.badge.toLowerCase().includes(trimmed)
      );
    }
    setResults(pool);
    setSearching(false);
  }, []);

  useEffect(() => {
    runSearch(query, activeCategory);
  }, [query, activeCategory]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const renderItem = ({ item }: { item: SearchResult }) => {
    const fav = isFav(item.id);
    return (
      <Pressable
        style={styles.resultCard}
        onPress={() => router.push(`/${item.categoryId}/${item.id}` as any)}
      >
        <Image source={item.image} style={styles.resultImage} resizeMode="cover" />
        <View style={styles.resultInfo}>
          <Text style={styles.resultName} numberOfLines={1}>{item.nameKiny}</Text>
          <Text style={styles.resultEn} numberOfLines={1}>{item.nameEn}</Text>
          <View style={styles.resultBottom}>
            <Text style={styles.resultPrice}>{item.price} RWF/kg</Text>
            <View style={styles.resultActions}>
              <Pressable
                style={[styles.actionBtn, fav && styles.actionBtnActive]}
                onPress={() => toggle(item.id)}
                hitSlop={8}
              >
                <Ionicons
                  name={fav ? 'heart' : 'heart-outline'}
                  size={16}
                  color={fav ? '#ef4444' : colors.textSecondary}
                />
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.cartBtn]}
                onPress={() =>
                  addItem({
                    productId:  item.id,
                    categoryId: item.categoryId,
                    nameKiny:   item.nameKiny,
                    nameEn:     item.nameEn,
                    price:      parseInt(item.price.replace(',', ''), 10),
                    image:      item.image,
                  })
                }
                hitSlop={8}
              >
                <Ionicons name="add" size={16} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        {/* Search bar */}
        <View style={styles.searchRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={colors.textLight} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Shakisha inkoko, ifi, inka..."
              placeholderTextColor={colors.textLight}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textLight} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Category filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          <Pressable
            style={[styles.filterChip, !activeCategory && styles.filterChipActive]}
            onPress={() => setActiveCategory('')}
          >
            <Text style={[styles.filterChipText, !activeCategory && styles.filterChipTextActive]}>
              Byose
            </Text>
          </Pressable>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={[styles.filterChip, activeCategory === cat.id && styles.filterChipActive]}
              onPress={() => setActiveCategory(activeCategory === cat.id ? '' : cat.id)}
            >
              <Text style={styles.filterEmoji}>{cat.emoji}</Text>
              <Text style={[styles.filterChipText, activeCategory === cat.id && styles.filterChipTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>

      <View style={styles.content}>
        {searching ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : results.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Nta kintu kibonetse</Text>
            <Text style={styles.emptySub}>
              Gerageza amagambo anditse neza cyangwa hindura category
            </Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.resultsCount}>
                {results.length} {results.length === 1 ? 'igicuruzwa' : 'ibicuruzwa'} bibonetse
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.headerBg },
  headerSafe: { backgroundColor: colors.headerBg, paddingBottom: 12 },

  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 10 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 30,
    paddingHorizontal: 14, paddingVertical: 10, gap: 8,
  },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, padding: 0 },

  filtersRow: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterEmoji:      { fontSize: 13 },
  filterChipText:      { fontFamily: fonts.medium, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  filterChipTextActive:{ color: '#fff', fontFamily: fonts.semiBold },

  content: { flex: 1, backgroundColor: colors.contentBg },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },

  list:           { padding: 16, gap: 12, paddingBottom: 24 },
  resultsCount:   { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: 4 },

  resultCard: {
    flexDirection: 'row', backgroundColor: colors.cardBg, borderRadius: radius.card,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  resultImage: { width: 90, height: 90, backgroundColor: '#eee' },
  resultInfo:  { flex: 1, padding: 12 },
  resultName:  { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text, marginBottom: 2 },
  resultEn:    { fontFamily: fonts.regular,  fontSize: 12, color: colors.textLight, marginBottom: 8 },
  resultBottom:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultPrice: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  resultActions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
  },
  actionBtnActive: { backgroundColor: '#fef2f2' },
  cartBtn: { backgroundColor: colors.primary },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontFamily: fonts.bold,    fontSize: 18, color: colors.text },
  emptySub:   { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 21 },
});
