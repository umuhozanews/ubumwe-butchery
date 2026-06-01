import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Modal,
  TextInput, Alert, ActivityIndicator, Image, Switch,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useProductStore } from '../../stores/productStore';
import { supabase } from '../../lib/supabase';
import { colors, fonts, radius } from '../../constants/theme';
import { Product, NewProduct, ProductCategory } from '../../lib/types';

const CATEGORIES: { key: ProductCategory | 'all'; label: string; emoji: string }[] = [
  { key: 'all',     label: 'All',     emoji: '🍖' },
  { key: 'cow',     label: 'Cow',     emoji: '🐄' },
  { key: 'goat',    label: 'Goat',    emoji: '🐐' },
  { key: 'fish',    label: 'Fish',    emoji: '🐟' },
  { key: 'chicken', label: 'Chicken', emoji: '🐔' },
];

const CAT_COLOR: Record<ProductCategory, string> = {
  cow:     '#ef4444',
  goat:    '#f59e0b',
  fish:    '#3b82f6',
  chicken: '#f97316',
};

interface ProductForm {
  name_en:      string;
  name_rw:      string;
  category:     ProductCategory;
  description:  string;
  price_per_kg: string;
  is_available: boolean;
}

const EMPTY_FORM: ProductForm = {
  name_en: '', name_rw: '', category: 'cow',
  description: '', price_per_kg: '', is_available: true,
};

export default function AdminProductsScreen() {
  const { products, isLoading, fetchProducts, addProduct, updateProduct, deleteProduct, toggleAvailability } = useProductStore();

  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [modalVisible, setModalVisible]     = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm]                     = useState<ProductForm>(EMPTY_FORM);
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [saving, setSaving]                 = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  function openAddModal() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setPickedImageUri(null);
    setModalVisible(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setForm({
      name_en:      product.name_en,
      name_rw:      product.name_rw,
      category:     product.category,
      description:  product.description ?? '',
      price_per_kg: String(product.price_per_kg),
      is_available: product.is_available,
    });
    setPickedImageUri(product.image_url ?? null);
    setModalVisible(true);
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to upload product images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.canceled) {
      setPickedImageUri(result.assets[0].uri);
    }
  }

  async function uploadImage(uri: string): Promise<string> {
    setUploadingImage(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, blob, { contentType: `image/${ext}`, upsert: true });

      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path);
      return publicUrl;
    } finally {
      setUploadingImage(false);
    }
  }

  function validate(): string | null {
    if (!form.name_en.trim())      return 'English name is required';
    if (!form.name_rw.trim())      return 'Kinyarwanda name is required';
    const price = parseFloat(form.price_per_kg);
    if (isNaN(price) || price <= 0) return 'Enter a valid price';
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) { Alert.alert('Missing info', err); return; }

    setSaving(true);
    try {
      let imageUrl = editingProduct?.image_url ?? '';

      if (pickedImageUri && pickedImageUri !== editingProduct?.image_url) {
        imageUrl = await uploadImage(pickedImageUri);
      }

      const payload: NewProduct = {
        name_en:      form.name_en.trim(),
        name_rw:      form.name_rw.trim(),
        category:     form.category,
        description:  form.description.trim(),
        price_per_kg: parseFloat(form.price_per_kg),
        image_url:    imageUrl,
        is_available: form.is_available,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await addProduct(payload);
      }

      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(product: Product) {
    Alert.alert(
      'Delete Product',
      `Delete "${product.name_en}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try { await deleteProduct(product.id); }
            catch (e: any) { Alert.alert('Error', e.message ?? 'Delete failed.'); }
          },
        },
      ],
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Products</Text>
            <Text style={styles.headerSub}>{products.length} items in catalog</Text>
          </View>
          <Pressable style={styles.addBtn} onPress={openAddModal}>
            <Ionicons name="add" size={22} color="#fff" />
            <Text style={styles.addBtnText}>Add New</Text>
          </Pressable>
        </View>

        {/* Category tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              style={[styles.tab, activeCategory === cat.key && styles.tabActive]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Text style={styles.tabEmoji}>{cat.emoji}</Text>
              <Text style={[styles.tabText, activeCategory === cat.key && styles.tabTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="fast-food-outline" size={52} color={colors.border} />
            <Text style={styles.emptyText}>No products in this category</Text>
            <Pressable style={styles.emptyAddBtn} onPress={openAddModal}>
              <Text style={styles.emptyAddBtnText}>Add First Product</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {filtered.map((product) => (
              <View key={product.id} style={styles.productCard}>
                {/* Image */}
                <View style={styles.productImageWrap}>
                  {product.image_url ? (
                    <Image source={{ uri: product.image_url }} style={styles.productImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.productImagePlaceholder, { backgroundColor: (CAT_COLOR[product.category] ?? colors.border) + '20' }]}>
                      <Ionicons name="fast-food-outline" size={28} color={CAT_COLOR[product.category] ?? colors.textLight} />
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.productInfo}>
                  <View style={styles.productTopRow}>
                    <View style={[styles.catBadge, { backgroundColor: (CAT_COLOR[product.category] ?? '#999') + '20' }]}>
                      <Text style={[styles.catBadgeText, { color: CAT_COLOR[product.category] ?? '#999' }]}>
                        {product.category}
                      </Text>
                    </View>
                    <Switch
                      value={product.is_available}
                      onValueChange={(val) => toggleAvailability(product.id, val)}
                      trackColor={{ false: colors.border, true: colors.primary + '60' }}
                      thumbColor={product.is_available ? colors.primary : '#ccc'}
                      style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                  </View>

                  <Text style={styles.productName} numberOfLines={1}>{product.name_en}</Text>
                  <Text style={styles.productNameRw} numberOfLines={1}>{product.name_rw}</Text>

                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>
                      {product.price_per_kg.toLocaleString()} RWF/kg
                    </Text>
                    <View style={styles.productActions}>
                      <Pressable style={styles.iconBtn} onPress={() => openEditModal(product)} hitSlop={6}>
                        <Ionicons name="pencil-outline" size={17} color={colors.primary} />
                      </Pressable>
                      <Pressable style={[styles.iconBtn, styles.iconBtnDanger]} onPress={() => confirmDelete(product)} hitSlop={6}>
                        <Ionicons name="trash-outline" size={17} color="#ef4444" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}
            <View style={{ height: 24 }} />
          </ScrollView>
        )}
      </View>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </Text>
                <Pressable onPress={() => setModalVisible(false)} hitSlop={10}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image picker */}
                <Pressable style={styles.imagePicker} onPress={pickImage}>
                  {pickedImageUri ? (
                    <Image source={{ uri: pickedImageUri }} style={styles.imagePreview} resizeMode="cover" />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="camera-outline" size={32} color={colors.textLight} />
                      <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                    </View>
                  )}
                  <View style={styles.imageEditOverlay}>
                    <Ionicons name="camera-outline" size={16} color="#fff" />
                    <Text style={styles.imageEditText}>{pickedImageUri ? 'Change' : 'Add Photo'}</Text>
                  </View>
                </Pressable>

                {/* Category selector */}
                <Text style={styles.fieldLabel}>Category</Text>
                <View style={styles.categoryRow}>
                  {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
                    <Pressable
                      key={cat.key}
                      style={[
                        styles.catOption,
                        form.category === cat.key && { backgroundColor: (CAT_COLOR[cat.key as ProductCategory]) + '20', borderColor: CAT_COLOR[cat.key as ProductCategory] },
                      ]}
                      onPress={() => setForm((f) => ({ ...f, category: cat.key as ProductCategory }))}
                    >
                      <Text style={styles.catOptionEmoji}>{cat.emoji}</Text>
                      <Text style={[
                        styles.catOptionText,
                        form.category === cat.key && { color: CAT_COLOR[cat.key as ProductCategory], fontFamily: fonts.semiBold },
                      ]}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Fields */}
                {([
                  { label: 'Name (English)',      key: 'name_en',      placeholder: 'e.g. Fresh Beef',           keyboard: 'default' },
                  { label: 'Name (Kinyarwanda)',   key: 'name_rw',      placeholder: 'e.g. Inyama y\'inka nshya', keyboard: 'default' },
                  { label: 'Description',          key: 'description',  placeholder: 'Optional product details',  keyboard: 'default' },
                  { label: 'Price per kg (RWF)',   key: 'price_per_kg', placeholder: '5000',                      keyboard: 'numeric'  },
                ] as const).map((field) => (
                  <View key={field.key} style={styles.formField}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <TextInput
                      style={[styles.textInput, field.key === 'description' && styles.textArea]}
                      value={form[field.key] as string}
                      onChangeText={(v) => setForm((f) => ({ ...f, [field.key]: v }))}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.textLight}
                      keyboardType={field.keyboard as any}
                      multiline={field.key === 'description'}
                      numberOfLines={field.key === 'description' ? 3 : 1}
                    />
                  </View>
                ))}

                {/* Availability toggle */}
                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.fieldLabel}>Available for order</Text>
                    <Text style={styles.switchSub}>Customers can see and order this product</Text>
                  </View>
                  <Switch
                    value={form.is_available}
                    onValueChange={(v) => setForm((f) => ({ ...f, is_available: v }))}
                    trackColor={{ false: colors.border, true: colors.primary + '60' }}
                    thumbColor={form.is_available ? colors.primary : '#ccc'}
                  />
                </View>

                <View style={styles.modalActions}>
                  <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.saveBtn, (saving || uploadingImage) && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saving || uploadingImage}
                  >
                    {(saving || uploadingImage) ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.saveBtnText}>
                        {editingProduct ? 'Save Changes' : 'Add Product'}
                      </Text>
                    )}
                  </Pressable>
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.headerBg },
  headerSafe: { backgroundColor: colors.headerBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  headerTitle: { fontFamily: fonts.bold,    fontSize: 20, color: '#fff' },
  headerSub:   { fontFamily: fonts.regular, fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: radius.button,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  addBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: '#fff' },

  tabs: { paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabActive: { backgroundColor: colors.primary },
  tabEmoji:  { fontSize: 14 },
  tabText:   { fontFamily: fonts.medium, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  tabTextActive: { color: '#fff', fontFamily: fonts.semiBold },

  content:   { flex: 1, backgroundColor: colors.contentBg },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textLight },
  emptyAddBtn: {
    backgroundColor: colors.primary, borderRadius: radius.button,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  emptyAddBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: '#fff' },

  list: { padding: 14, gap: 12 },

  productCard: {
    flexDirection: 'row', backgroundColor: colors.cardBg, borderRadius: radius.card,
    overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 4,
  },
  productImageWrap: { width: 100, height: 110 },
  productImage:     { width: 100, height: 110 },
  productImagePlaceholder: { width: 100, height: 110, alignItems: 'center', justifyContent: 'center' },

  productInfo:   { flex: 1, padding: 12, gap: 4 },
  productTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catBadge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  catBadgeText:  { fontFamily: fonts.semiBold, fontSize: 10, textTransform: 'capitalize' },

  productName:   { fontFamily: fonts.bold,    fontSize: 14, color: colors.text },
  productNameRw: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary },

  productFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  productPrice:  { fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
  productActions:{ flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center',
  },
  iconBtnDanger: { backgroundColor: '#ef444415' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  modalTitle: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },

  imagePicker: {
    height: 160, borderRadius: radius.card, overflow: 'hidden',
    backgroundColor: colors.contentBg, borderWidth: 1.5,
    borderColor: colors.border, borderStyle: 'dashed',
    marginBottom: 16, position: 'relative',
  },
  imagePreview:    { width: '100%', height: '100%' },
  imagePlaceholder:{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePlaceholderText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textLight },
  imageEditOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 6,
    borderTopLeftRadius: 8,
  },
  imageEditText: { fontFamily: fonts.medium, fontSize: 12, color: '#fff' },

  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  catOption: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.card,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.contentBg, gap: 4,
  },
  catOptionEmoji: { fontSize: 18 },
  catOptionText:  { fontFamily: fonts.medium, fontSize: 11, color: colors.textSecondary },

  formField:  { marginBottom: 14 },
  fieldLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text, marginBottom: 6 },
  textInput: {
    backgroundColor: colors.contentBg, borderRadius: radius.button,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontFamily: fonts.regular, fontSize: 14, color: colors.text,
  },
  textArea: { height: 80, textAlignVertical: 'top' },

  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.contentBg, borderRadius: radius.card,
    padding: 14, marginBottom: 20, borderWidth: 1, borderColor: colors.border,
  },
  switchSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.textLight, marginTop: 2 },

  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: radius.button, borderWidth: 1.5, borderColor: colors.border,
  },
  cancelBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textSecondary },
  saveBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: radius.button, backgroundColor: colors.primary,
  },
  saveBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: '#fff' },
});
