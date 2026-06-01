import { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Alert,
  TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import BottomNav from '../components/BottomNav';
import { colors, fonts, radius } from '../constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function InfoRow({ icon, label, value }: { icon: IoniconName; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

function MenuRow({
  icon, label, onPress, danger,
}: { icon: IoniconName; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? '#ef4444' : colors.primary} />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
    </Pressable>
  );
}

export default function AccountScreen() {
  const { profile, signOut, updateProfile } = useAuthStore();

  const [editVisible, setEditVisible] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone?.replace('+250', '0') ?? '');
  const [saving, setSaving] = useState(false);

  async function handleLogout() {
    Alert.alert('Gusohoka', 'Urifuza gusohoka mu konti yawe?', [
      { text: 'Oya', style: 'cancel' },
      {
        text: 'Yego',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  }

  function openEdit() {
    setFullName(profile?.full_name ?? '');
    setPhone(profile?.phone?.replace('+250', '0') ?? '');
    setEditVisible(true);
  }

  async function handleSave() {
    if (!fullName.trim() || fullName.trim().length < 3) {
      Alert.alert('Sibyo', 'Injiza amazina yose (byibura imibare 3).');
      return;
    }
    if (!/^0?7[2-9]\d{7}$/.test(phone.trim())) {
      Alert.alert('Sibyo', 'Injiza nimero nzima (ex: 0781234567).');
      return;
    }
    setSaving(true);
    try {
      const normalizedPhone = phone.trim().startsWith('0')
        ? `+250${phone.trim().slice(1)}`
        : `+250${phone.trim()}`;
      await updateProfile({ full_name: fullName.trim(), phone: normalizedPhone });
      setEditVisible(false);
      Alert.alert('Vyagenze!', 'Amakuru yawe yavuguruwe.');
    } catch (e: any) {
      Alert.alert('Ikosa', e.message ?? 'Ikibazo cyabaye.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Konti Yanjye</Text>
          {profile && (
            <Pressable style={styles.editHeaderBtn} onPress={openEdit}>
              <Ionicons name="create-outline" size={20} color="#fff" />
            </Pressable>
          )}
          {!profile && <View style={{ width: 42 }} />}
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {profile ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {profile.full_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.userName}>{profile.full_name}</Text>
              <Text style={styles.userEmail}>{profile.email}</Text>
              {profile.role === 'admin' && (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-checkmark" size={13} color="#fff" />
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
            </View>

            {/* Profile info */}
            <View style={styles.infoCard}>
              <InfoRow icon="person-outline"  label="Amazina"  value={profile.full_name} />
              <View style={styles.divider} />
              <InfoRow icon="mail-outline"    label="Email"    value={profile.email} />
              <View style={styles.divider} />
              <InfoRow icon="call-outline"    label="Telefone" value={profile.phone ?? ''} />
            </View>

            {/* Menu */}
            <View style={styles.menuCard}>
              <MenuRow
                icon="document-text-outline"
                label="Reba Amatumiza Yanjye"
                onPress={() => router.push('/my-orders' as any)}
              />
              <View style={styles.divider} />
              <MenuRow
                icon="heart-outline"
                label="Ibikurikuwe"
                onPress={() => router.push('/favorites' as any)}
              />
              <View style={styles.divider} />
              <MenuRow
                icon="create-outline"
                label="Hindura Amakuru"
                onPress={openEdit}
              />
            </View>

            <View style={styles.menuCard}>
              <MenuRow
                icon="log-out-outline"
                label="Sohoka"
                onPress={handleLogout}
                danger
              />
            </View>

            <Text style={styles.version}>UBUMWE BUTCHERY v1.0.0</Text>
            <View style={{ height: 8 }} />
          </ScrollView>
        ) : (
          <View style={styles.loggedOut}>
            <View style={styles.avatarCircleLarge}>
              <Ionicons name="person" size={48} color="rgba(255,255,255,0.6)" />
            </View>
            <Text style={styles.loggedOutTitle}>Kwinjira Mu Konti</Text>
            <Text style={styles.loggedOutSub}>
              Injira kugira ngo ubone amakuru yawe, amatumiza n'ibikurikuwe
            </Text>
            <Pressable style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginBtnText}>Injira</Text>
            </Pressable>
            <Pressable style={styles.signupBtn} onPress={() => router.push('/auth/signup')}>
              <Text style={styles.signupBtnText}>Iyandikishe</Text>
            </Pressable>
          </View>
        )}
      </View>

      <BottomNav active="account" />

      {/* ── Edit profile modal ── */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Hindura Amakuru</Text>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Amazina Yose</Text>
                <View style={styles.modalInputRow}>
                  <Ionicons name="person-outline" size={18} color={colors.textLight} />
                  <TextInput
                    style={styles.modalInput}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Nimero ya Telefone</Text>
                <View style={styles.modalInputRow}>
                  <Text style={styles.prefix}>+250</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor={colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setEditVisible(false)}>
                  <Text style={styles.cancelBtnText}>Hagarika</Text>
                </Pressable>
                <Pressable
                  style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.saveBtnText}>Bika</Text>
                  }
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.headerBg },
  header:  { backgroundColor: colors.headerBg, paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, gap: 12 },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  editHeaderBtn: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 18, color: '#fff', textAlign: 'center' },
  content:     { flex: 1, backgroundColor: colors.contentBg },
  scroll:      { paddingHorizontal: 16, paddingBottom: 16 },

  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  avatarInitial: { fontFamily: fonts.bold, fontSize: 32, color: '#fff' },
  userName:    { fontFamily: fonts.bold,    fontSize: 20, color: colors.text, marginBottom: 4 },
  userEmail:   { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
  },
  adminBadgeText: { fontFamily: fonts.semiBold, fontSize: 12, color: '#fff' },

  infoCard: {
    backgroundColor: colors.cardBg, borderRadius: radius.card, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    marginBottom: 12,
  },
  infoRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  infoLabel: { fontFamily: fonts.regular,  fontSize: 11, color: colors.textLight, marginBottom: 2 },
  infoValue: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  divider:   { height: 1, backgroundColor: '#f3f4f6' },

  menuCard: {
    backgroundColor: colors.cardBg, borderRadius: radius.card,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    marginBottom: 12, overflow: 'hidden',
  },
  menuRow:  {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: '#fef2f2' },
  menuLabel:       { flex: 1, fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  menuLabelDanger: { color: '#ef4444' },
  version: { fontFamily: fonts.regular, fontSize: 12, color: colors.textLight, textAlign: 'center', marginTop: 8 },

  loggedOut: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  avatarCircleLarge: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.headerBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)',
  },
  loggedOutTitle: { fontFamily: fonts.bold,    fontSize: 22, color: colors.text },
  loggedOutSub:   { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 21 },
  loginBtn: {
    width: '100%', backgroundColor: colors.primary, borderRadius: radius.button,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  loginBtnText: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
  signupBtn: {
    width: '100%', borderRadius: radius.button, borderWidth: 1.5, borderColor: colors.primary,
    paddingVertical: 14, alignItems: 'center',
  },
  signupBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.primary },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 20 },
  modalField: { marginBottom: 16 },
  modalLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text, marginBottom: 6 },
  modalInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.contentBg, borderRadius: radius.button,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: colors.border,
  },
  modalInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, padding: 0 },
  prefix:     { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textSecondary },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, borderRadius: radius.button, borderWidth: 1.5, borderColor: colors.border,
    paddingVertical: 14, alignItems: 'center',
  },
  cancelBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textSecondary },
  saveBtn: {
    flex: 1, borderRadius: radius.button, backgroundColor: colors.primary,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnText: { fontFamily: fonts.bold, fontSize: 15, color: '#fff' },
});
