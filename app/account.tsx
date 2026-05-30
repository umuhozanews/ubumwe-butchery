import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import BottomNav from '../components/BottomNav';
import { colors, fonts, radius } from '../constants/theme';

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
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

export default function AccountScreen() {
  const { profile, signOut } = useAuthStore();

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

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Konti Yanjye</Text>
          <View style={{ width: 42 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🥩</Text>
          </View>
          <Text style={styles.userName}>{profile?.full_name ?? 'Umushyitsi'}</Text>
          <Text style={styles.userEmail}>{profile?.email ?? ''}</Text>
        </View>

        {/* Profile info */}
        {profile ? (
          <>
            <View style={styles.infoCard}>
              <InfoRow icon="person-outline"  label="Amazina"  value={profile.full_name} />
              <View style={styles.divider} />
              <InfoRow icon="mail-outline"    label="Email"    value={profile.email} />
              <View style={styles.divider} />
              <InfoRow icon="call-outline"    label="Telefone" value={profile.phone} />
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.ordersRow} onPress={() => router.push('/my-orders' as any)}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                <Text style={styles.ordersRowText}>Reba Amatumiza Yanjye</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </Pressable>
              <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text style={styles.logoutText}>Sohoka</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.actions}>
            <Pressable style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginBtnText}>Injira mu Konti</Text>
            </Pressable>
            <Pressable style={styles.signupBtn} onPress={() => router.push('/auth/signup')}>
              <Text style={styles.signupBtnText}>Iyandikishe</Text>
            </Pressable>
          </View>
        )}
      </View>

      <BottomNav active="account" />
    </View>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: colors.headerBg },
  header:    { backgroundColor: colors.headerBg, paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, gap: 12 },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 18, color: '#fff', textAlign: 'center' },
  content:     { flex: 1, backgroundColor: colors.contentBg, paddingHorizontal: 16 },

  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarEmoji: { fontSize: 36 },
  userName:    { fontFamily: fonts.bold,    fontSize: 20, color: colors.text,          marginBottom: 4 },
  userEmail:   { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },

  infoCard: {
    backgroundColor: colors.cardBg, borderRadius: radius.card, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    marginBottom: 16,
  },
  infoRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  infoLabel: { fontFamily: fonts.regular,  fontSize: 11, color: colors.textLight, marginBottom: 2 },
  infoValue: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  divider:   { height: 1, backgroundColor: '#f3f4f6' },

  actions:    { gap: 12 },
  ordersRow:  {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.cardBg, borderRadius: radius.card, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  ordersRowText: { flex: 1, fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fef2f2', borderRadius: radius.card,
    padding: 16, borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { fontFamily: fonts.semiBold, fontSize: 14, color: '#ef4444' },
  loginBtn: {
    backgroundColor: colors.primary, borderRadius: radius.button,
    paddingVertical: 16, alignItems: 'center',
  },
  loginBtnText: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
  signupBtn: {
    borderRadius: radius.button, borderWidth: 1.5, borderColor: colors.primary,
    paddingVertical: 14, alignItems: 'center',
  },
  signupBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.primary },
});
