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

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface FieldProps {
  label: string;
  placeholder: string;
  icon: IoniconName;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
  secure?: boolean;
  showPass?: boolean;
  onTogglePass?: () => void;
  returnKeyType?: React.ComponentProps<typeof TextInput>['returnKeyType'];
  onSubmitEditing?: () => void;
}

function Field({
  label, placeholder, icon, value, onChangeText, error,
  keyboardType = 'default', autoCapitalize = 'sentences',
  secure, showPass, onTogglePass,
  returnKeyType = 'next', onSubmitEditing,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label} <Text style={styles.required}>*</Text></Text>
      <View style={[styles.inputRow, !!error && styles.inputError]}>
        <Ionicons name={icon} size={18} color={colors.textLight} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={secure && !showPass}
          value={value}
          onChangeText={onChangeText}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />
        {secure && onTogglePass && (
          <Pressable onPress={onTogglePass} hitSlop={8}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textLight} />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export default function SignupScreen() {
  const { signUp } = useAuthStore();

  const [fullName,        setFullName]        = useState('');
  const [phone,           setPhone]           = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [errors,          setErrors]          = useState<Record<string, string>>({});

  function clearError(key: string) {
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3)
      e.fullName = 'Injiza amazina yose (byibura imibare 3)';
    if (!phone.trim() || !/^0?7[2-9]\d{7}$/.test(phone.trim()))
      e.phone = 'Nimero si nzima (ex: 0781234567)';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()))
      e.email = 'Email si nzima';
    if (!password || password.length < 6)
      e.password = 'Ijambo ry\'ibanga: byibura imibare 6';
    if (!confirmPassword)
      e.confirmPassword = 'Emeza ijambo ry\'ibanga';
    else if (confirmPassword !== password)
      e.confirmPassword = 'Amagambo ntahurikiye';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const normalizedPhone = phone.trim().startsWith('0')
        ? `+250${phone.trim().slice(1)}`
        : `+250${phone.trim()}`;
      await signUp({ email: email.trim(), password, fullName: fullName.trim(), phone: normalizedPhone });
      Alert.alert(
        'Murakoze! 🎉',
        'Konti yawe yashyizwe. Reba email yawe ngo wemeze konti mbere yo kwinjira.',
        [{ text: 'Injira', onPress: () => router.replace('/auth/login') }]
      );
    } catch (e: any) {
      Alert.alert('Ikosa', e.message ?? 'Ikibazo cyabaye. Ongera ugerageze.');
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
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
            <Text style={styles.appName}>Iyandikishe</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>

        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.title}>Kora Konti</Text>
              <Text style={styles.subtitle}>Uzuza amakuru yawe hano hasi</Text>

              <Field
                label="Amazina Yose"
                placeholder="Izina + Inzira y'Umuryango"
                icon="person-outline"
                value={fullName}
                onChangeText={(t) => { setFullName(t); clearError('fullName'); }}
                autoCapitalize="words"
                error={errors.fullName}
              />

              {/* Phone with +250 prefix */}
              <View style={styles.field}>
                <Text style={styles.label}>Nimero ya Telefone <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputRow, !!errors.phone && styles.inputError]}>
                  <View style={styles.prefix}><Text style={styles.prefixText}>+250</Text></View>
                  <TextInput
                    style={styles.input}
                    placeholder="07X XXX XXXX"
                    placeholderTextColor={colors.textLight}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={10}
                    value={phone}
                    onChangeText={(t) => { setPhone(t); clearError('phone'); }}
                    returnKeyType="next"
                  />
                </View>
                {!!errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              <Field
                label="Email"
                placeholder="your@email.com"
                icon="mail-outline"
                value={email}
                onChangeText={(t) => { setEmail(t); clearError('email'); }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Field
                label="Ijambo ry'Ibanga"
                placeholder="••••••••"
                icon="lock-closed-outline"
                value={password}
                onChangeText={(t) => { setPassword(t); clearError('password'); }}
                autoCapitalize="none"
                secure
                showPass={showPass}
                onTogglePass={() => setShowPass(!showPass)}
                error={errors.password}
              />

              <Field
                label="Emeza Ijambo ry'Ibanga"
                placeholder="••••••••"
                icon="lock-closed-outline"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); clearError('confirmPassword'); }}
                autoCapitalize="none"
                secure
                showPass={showConfirm}
                onTogglePass={() => setShowConfirm(!showConfirm)}
                error={errors.confirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              <Pressable
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitText}>{loading ? 'Gutegereza...' : 'Iyandikishe'}</Text>
              </Pressable>

              <Pressable style={styles.link} onPress={() => router.replace('/auth/login')}>
                <Text style={styles.linkText}>
                  Usanzwe ufite konti?{'  '}<Text style={styles.linkBold}>Injira</Text>
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  appName: { fontFamily: fonts.bold, fontSize: 18, color: '#fff' },

  content:       { flex: 1, backgroundColor: colors.contentBg, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  card: {
    backgroundColor: colors.cardBg, borderRadius: radius.card, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  title:    { fontFamily: fonts.bold,    fontSize: 22, color: colors.text, marginBottom: 4 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 20 },

  field:      { marginBottom: 14 },
  label:      { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text, marginBottom: 6 },
  required:   { color: '#ef4444' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.contentBg, borderRadius: radius.button,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: colors.border,
  },
  inputError: { borderColor: '#ef4444' },
  input:      { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, padding: 0 },
  errorText:  { fontFamily: fonts.regular, fontSize: 11, color: '#ef4444', marginTop: 3 },
  prefix:     { backgroundColor: '#e5e7eb', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  prefixText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },

  submitBtn: {
    backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 15,
    alignItems: 'center', marginTop: 8,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText:        { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },

  link:     { alignItems: 'center', marginTop: 18 },
  linkText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  linkBold: { fontFamily: fonts.bold, color: colors.primary },
});
