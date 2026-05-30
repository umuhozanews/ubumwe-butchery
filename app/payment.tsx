import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { getProduct } from '../data/meatData';
import { colors, fonts, radius } from '../constants/theme';

const MOMO_CODE   = '*182*8*1*123456#';
const MOMO_NUMBER = '0798989741';
const WA_NUMBER   = '250798989741'; // Rwanda +250, no leading 0

export default function PaymentScreen() {
  const params = useLocalSearchParams<{
    orderId: string; category: string; product: string;
    name: string; phone: string;
  }>();

  const orderId      = Array.isArray(params.orderId)  ? params.orderId[0]  : (params.orderId  ?? '');
  const categoryId   = Array.isArray(params.category) ? params.category[0] : (params.category ?? '');
  const productId    = Array.isArray(params.product)  ? params.product[0]  : (params.product  ?? '');
  const customerName = Array.isArray(params.name)     ? params.name[0]     : (params.name     ?? '');
  const customerPhone= Array.isArray(params.phone)    ? params.phone[0]    : (params.phone    ?? '');

  const item = getProduct(categoryId, productId);

  const [proofUri,   setProofUri]   = useState<string | null>(null);
  const [submitted,  setSubmitted]  = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  async function copyCode() {
    await Clipboard.setStringAsync(MOMO_CODE);
    Alert.alert('✓ Yakopowe!', `Code "${MOMO_CODE}" yashyizwe mu clipboard.`);
  }

  function dialCode() {
    const encoded = MOMO_CODE.replace('#', '%23');
    Linking.openURL(`tel:${encoded}`).catch(() =>
      Alert.alert('Sibyo', 'Telefone yawe ntishobora gufungura code. Tegeka uri ku muvugishirize.')
    );
  }

  function openWhatsApp() {
    const msg = `Muraho UBUMWE BUTCHERY!\n\nNshaka inkunga ku itumba ryanjye:\n• Izina: ${customerName}\n• Telefone: ${customerPhone}\n• Igicuruzwa: ${item?.nameKiny ?? ''} (${item?.nameEn ?? ''})\n\nMurakoze!`;
    const url = `whatsapp://send?phone=${WA_NUMBER}&text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`)
    );
  }

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Uruhushya', 'Dukeneye uruhushya rwo kugera ku mashusho yawe.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setProofUri(result.assets[0].uri);
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Uruhushya', 'Dukeneye uruhushya rwo gukoresha kamera yawe.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled) setProofUri(result.assets[0].uri);
  }

  function handleConfirm() {
    if (!proofUri) {
      Alert.alert('Sibyo', "Shyiraho icyemezo cy'ubwishyu mbere yo gukomeza.");
      return;
    }
    setSubmitted(true);
    if (orderId) {
      setTimeout(() => router.replace({ pathname: '/tracking', params: { orderId } }), 1500);
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <View style={styles.successRoot}>
        <StatusBar style="dark" />
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <View style={styles.successIconWrap}>
            <Ionicons name="checkmark-circle" size={88} color={colors.primary} />
          </View>
          <Text style={styles.successTitle}>Murakoze! 🎉</Text>
          <Text style={styles.successSub}>
            Itumba ryawe ryakirwe neza. Tuzabatumanaheza vuba kuri nimero yawe{'\n'}
            <Text style={{ fontFamily: fonts.semiBold, color: colors.text }}>{customerPhone}</Text>
          </Text>

          <Pressable style={styles.waSuccess} onPress={openWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.waSuccessText}>Twandikire kuri WhatsApp</Text>
          </Pressable>

          <Pressable style={styles.homeBtn} onPress={() => router.replace('/')}>
            <Text style={styles.homeBtnText}>Subira Ahabanza</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  // ── Main payment screen ───────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Header */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Kwishyura</Text>
            <Text style={styles.headerSub}>MTN Mobile Money</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* ── Order summary ── */}
          {item && (
            <View style={styles.summaryCard}>
              <Text style={styles.cardSectionTitle}>Incamake y'Itumba</Text>
              {[
                ['Umuguzi',   customerName],
                ['Telefone',  customerPhone],
                ['Igicuruzwa', `${item.nameKiny} — ${item.nameEn}`],
                ['Igiciro',   `${item.price} RWF/kg`],
              ].map(([label, value], i, arr) => (
                <View key={label} style={[styles.summaryRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={styles.summaryLabel}>{label}</Text>
                  <Text style={[styles.summaryValue, label === 'Igiciro' && { color: colors.primary, fontFamily: fonts.bold }]}>
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ── MTN MoMo card ── */}
          <View style={styles.momoCard}>
            <View style={styles.momoHeader}>
              <View style={styles.momoIconBox}>
                <Text style={{ fontSize: 28 }}>📱</Text>
              </View>
              <View>
                <Text style={styles.momoTitle}>MTN Mobile Money</Text>
                <Text style={styles.momoSub}>Ishyura ukoresheje MoMo</Text>
              </View>
            </View>

            {/* Steps */}
            <View style={styles.stepsBox}>
              {[
                { n: '1', t: 'Fungura telefone yawe' },
                { n: '2', t: 'Ishyura kuri iyi code' },
                { n: '3', t: 'Nyuma yo kwishyura fata ifoto ya message ya MoMo' },
                { n: '4', t: "Kanda ahanditse kwemeza ubwishyu n'ifoto" },
                { n: '5', t: 'Hitamo ifoto ukande kwemeza' },
              ].map((s) => (
                <View key={s.n} style={styles.stepRow}>
                  <View style={styles.stepBullet}><Text style={styles.stepNum}>{s.n}</Text></View>
                  <Text style={styles.stepText}>{s.t}</Text>
                </View>
              ))}
            </View>

            {/* Code block */}
            <View style={styles.codeBlock}>
              <Text style={styles.codeLabel}>Code yo Kwishyura</Text>
              <Text style={styles.codeValue}>{MOMO_CODE}</Text>
              <View style={styles.codeDivider} />
              <Text style={styles.codeLabel}>Nimero ya MoMo</Text>
              <Text style={styles.codeValue}>{MOMO_NUMBER}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.codeActions}>
              <Pressable style={styles.dialBtn} onPress={dialCode}>
                <Ionicons name="call-outline" size={16} color="#fff" />
                <Text style={styles.dialBtnText}>Ishyura na Code</Text>
              </Pressable>
              <Pressable style={styles.copyBtn} onPress={copyCode}>
                <Ionicons name="copy-outline" size={16} color={colors.primary} />
                <Text style={styles.copyBtnText}>Kopi Code</Text>
              </Pressable>
            </View>
          </View>

          {/* ── Proof of payment ── */}
          <View style={styles.proofCard}>
            <Text style={styles.cardSectionTitle}>Icyemezo cy'Ubwishyu</Text>
            <Text style={styles.proofSub}>
              Nyuma yo kwishyura, shyiraho ifoto y'icyemezo cya MoMo
            </Text>

            {proofUri ? (
              <View style={styles.proofPreviewWrap}>
                <Image source={{ uri: proofUri }} style={styles.proofPreview} resizeMode="cover" />
                <Pressable style={styles.changeBtn} onPress={pickFromGallery}>
                  <Ionicons name="refresh-outline" size={14} color={colors.primary} />
                  <Text style={styles.changeBtnText}>Hindura Ifoto</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.uploadRow}>
                <Pressable style={styles.uploadBtn} onPress={pickFromGallery}>
                  <Ionicons name="image-outline" size={26} color={colors.primary} />
                  <Text style={styles.uploadLabel}>Galerie</Text>
                </Pressable>
                <Pressable style={styles.uploadBtn} onPress={takePhoto}>
                  <Ionicons name="camera-outline" size={26} color={colors.primary} />
                  <Text style={styles.uploadLabel}>Kamera</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* ── WhatsApp button ── */}
          <Pressable style={styles.waBtn} onPress={openWhatsApp}>
            <Ionicons name="logo-whatsapp" size={24} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={styles.waBtnTitle}>Ufite ikibazo kanda hano tuvugane</Text>
              <Text style={styles.waBtnSub}>WhatsApp — {MOMO_NUMBER}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* ── Confirm button ── */}
        <SafeAreaView style={styles.confirmSafe} edges={['bottom']}>
          <Pressable
            style={[styles.confirmBtn, !proofUri && styles.confirmDisabled]}
            onPress={handleConfirm}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
            <Text style={styles.confirmText}>Emeza Itumba</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.headerBg },
  headerSafe: { backgroundColor: colors.headerBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
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
  headerTitle:  { fontFamily: fonts.bold,    fontSize: 18, color: '#fff' },
  headerSub:    { fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  content:       { flex: 1, backgroundColor: colors.contentBg },
  scrollContent: { padding: 16, gap: 16 },

  /* Summary */
  summaryCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardSectionTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  summaryLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  summaryValue: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text, flexShrink: 1, textAlign: 'right', marginLeft: 8 },

  /* MoMo card */
  momoCard: {
    backgroundColor: colors.headerBg,
    borderRadius: radius.card,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  momoHeader:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  momoIconBox: {
    width: 52, height: 52,
    borderRadius: 14,
    backgroundColor: '#ffcb05',
    alignItems: 'center',
    justifyContent: 'center',
  },
  momoTitle: { fontFamily: fonts.bold,    fontSize: 16, color: '#fff' },
  momoSub:   { fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  stepsBox:   { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: 14, gap: 10, marginBottom: 18 },
  stepRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepBullet: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  stepNum:  { fontFamily: fonts.bold,    fontSize: 11, color: '#fff' },
  stepText: { fontFamily: fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.85)', flex: 1, lineHeight: 20 },

  codeBlock: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  codeLabel:   { fontFamily: fonts.medium, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  codeValue:   { fontFamily: fonts.bold,   fontSize: 22, color: '#ffcb05', letterSpacing: 1, marginBottom: 4 },
  codeDivider: { width: '60%', height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 12 },

  codeActions: { flexDirection: 'row', gap: 10 },
  dialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: radius.button,
    paddingVertical: 12, gap: 6,
  },
  dialBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: '#fff' },
  copyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.button,
    paddingVertical: 12, gap: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  copyBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: '#fff' },

  /* Proof */
  proofCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  proofSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 16, lineHeight: 19 },
  uploadRow: { flexDirection: 'row', gap: 12 },
  uploadBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f0fdf4', borderRadius: radius.button,
    paddingVertical: 24, gap: 8,
    borderWidth: 1.5, borderColor: '#bbf7d0', borderStyle: 'dashed',
  },
  uploadLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.primary },
  proofPreviewWrap: { gap: 10 },
  proofPreview: { width: '100%', height: 180, borderRadius: 10, backgroundColor: '#eee' },
  changeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8,
  },
  changeBtnText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },

  /* WhatsApp */
  waBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#25D366',
    borderRadius: radius.card, padding: 16,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  waBtnTitle: { fontFamily: fonts.bold,    fontSize: 14, color: '#fff' },
  waBtnSub:   { fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  /* Confirm */
  confirmSafe: {
    backgroundColor: colors.contentBg,
    paddingHorizontal: 16, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: radius.button,
    paddingVertical: 16, gap: 10, marginBottom: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  confirmDisabled: { backgroundColor: '#a3d9b8', shadowOpacity: 0 },
  confirmText: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },

  /* Success */
  successRoot: { flex: 1, backgroundColor: colors.contentBg },
  successIconWrap: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  successTitle: { fontFamily: fonts.bold,    fontSize: 28, color: colors.text, marginBottom: 12 },
  successSub:   { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  waSuccess: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#25D366', borderRadius: radius.button,
    paddingVertical: 14, paddingHorizontal: 24,
    width: '100%', justifyContent: 'center',
    marginBottom: 12,
  },
  waSuccessText: { fontFamily: fonts.semiBold, fontSize: 15, color: '#fff' },
  homeBtn: {
    width: '100%', borderRadius: radius.button,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
  },
  homeBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textSecondary },
});
