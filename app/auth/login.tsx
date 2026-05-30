import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { colors, fonts, radius } from '../../constants/theme';

export default function LoginScreen() {
  const { signIn } = useAuthStore();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email.trim())                     e.email    = 'Email irakenewe';
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email  = 'Email si nzima';
    if (!password)                         e.password = 'Ijambo ry\'ibanga irakenewe';
    else if (password.length < 6)          e.password = 'Byibura imibare 6';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Ikosa', e.message ?? 'Email cyangwa ijambo ry\'ibanga si byo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.root}>
        <StatusBar style="light" />

        <SafeAreaView style={styles.headerSafe} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.logo}>🥩</Text>
            <Text style={styles.appName}>UBUMWE BUTCHERY</Text>
            <Text style={styles.tagline}>Fresh Meat, Delivered to You</Text>
          </View>
        </SafeAreaView>

        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.title}>Injira</Text>
              <Text style={styles.subtitle}>Kwinjira mu konti yawe</Text>

              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputRow, errors.email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={18} color={colors.textLight} />
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={colors.textLight}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
                    returnKeyType="next"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={styles.label}>Ijambo ry'Ibanga</Text>
                <View style={[styles.inputRow, errors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textLight} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textLight}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  <Pressable onPress={() => setShowPass(!showPass)} hitSlop={8}>
                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textLight} />
                  </Pressable>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              <Pressable
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitText}>{loading ? 'Gutegereza...' : 'Injira'}</Text>
              </Pressable>

              <Pressable style={styles.link} onPress={() => router.push('/auth/signup')}>
                <Text style={styles.linkText}>
                  Nta konti ufite?{'  '}
                  <Text style={styles.linkBold}>Iyandikishe</Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.headerBg },
  headerSafe: { backgroundColor: colors.headerBg },
  header:     { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16 },
  logo:       { fontSize: 48, marginBottom: 8 },
  appName:    { fontFamily: fonts.bold,    fontSize: 22, color: '#fff', letterSpacing: 1, marginBottom: 4 },
  tagline:    { fontFamily: fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.6)' },

  content:       { flex: 1, backgroundColor: colors.contentBg, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  scrollContent: { padding: 20 },

  card: {
    backgroundColor: colors.cardBg, borderRadius: radius.card, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  title:    { fontFamily: fonts.bold,    fontSize: 24, color: colors.text, marginBottom: 4 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, marginBottom: 24 },

  field:      { marginBottom: 16 },
  label:      { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.contentBg, borderRadius: radius.button,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: colors.border,
  },
  inputError: { borderColor: '#ef4444' },
  input:      { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, padding: 0 },
  errorText:  { fontFamily: fonts.regular, fontSize: 12, color: '#ef4444', marginTop: 4 },

  submitBtn:         {
    backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText:        { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },

  link:     { alignItems: 'center', marginTop: 20 },
  linkText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  linkBold: { fontFamily: fonts.bold, color: colors.primary },
});
