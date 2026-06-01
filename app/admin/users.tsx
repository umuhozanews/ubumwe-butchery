import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { colors, fonts, radius } from '../../constants/theme';
import { UserProfile } from '../../lib/types';

export default function AdminUsersScreen() {
  const { profile: myProfile } = useAuthStore();
  const [users, setUsers]         = useState<UserProfile[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data ?? []);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not load users.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, []);

  function onRefresh() { setRefreshing(true); loadUsers(); }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  });

  async function toggleRole(user: UserProfile) {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    const action  = newRole === 'admin' ? 'promote to Admin' : 'demote to Customer';

    if (user.id === myProfile?.id) {
      Alert.alert('Not allowed', 'You cannot change your own role.');
      return;
    }

    Alert.alert(
      'Change Role',
      `${action.charAt(0).toUpperCase() + action.slice(1)} for ${user.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setUpdatingId(user.id);
            try {
              const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', user.id);
              if (error) throw error;
              setUsers((prev) =>
                prev.map((u2) => u2.id === user.id ? { ...u2, role: newRole } : u2)
              );
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Role update failed.');
            } finally {
              setUpdatingId(null);
            }
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
            <Text style={styles.headerTitle}>Users</Text>
            <Text style={styles.headerSub}>{users.length} registered accounts</Text>
          </View>
          <Pressable style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={20} color="rgba(255,255,255,0.8)" />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.5)" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, email, phone..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.5)" />
            </Pressable>
          )}
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="people-outline" size={52} color={colors.border} />
            <Text style={styles.emptyText}>
              {search ? 'No users match your search' : 'No users found'}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          >
            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{users.filter((u) => u.role === 'admin').length}</Text>
                <Text style={styles.statLabel}>Admins</Text>
              </View>
              <View style={[styles.statItem, styles.statItemCenter]}>
                <Text style={styles.statValue}>{users.filter((u) => u.role === 'customer').length}</Text>
                <Text style={styles.statLabel}>Customers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {users.filter((u) => {
                    const d = new Date(u.created_at);
                    const now = new Date();
                    return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
                  }).length}
                </Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
            </View>

            {/* User cards */}
            {filtered.map((user) => (
              <View key={user.id} style={[styles.userCard, user.id === myProfile?.id && styles.userCardSelf]}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {(user.full_name ?? 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <View style={styles.userTopRow}>
                    <Text style={styles.userName} numberOfLines={1}>{user.full_name}</Text>
                    <View style={[styles.roleBadge, user.role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeCustomer]}>
                      <Text style={[styles.roleText, user.role === 'admin' ? styles.roleTextAdmin : styles.roleTextCustomer]}>
                        {user.role}
                      </Text>
                    </View>
                  </View>

                  {user.email ? (
                    <View style={styles.infoRow}>
                      <Ionicons name="mail-outline" size={12} color={colors.textLight} />
                      <Text style={styles.infoText} numberOfLines={1}>{user.email}</Text>
                    </View>
                  ) : null}
                  {user.phone ? (
                    <View style={styles.infoRow}>
                      <Ionicons name="call-outline" size={12} color={colors.textLight} />
                      <Text style={styles.infoText}>{user.phone}</Text>
                    </View>
                  ) : null}
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={12} color={colors.textLight} />
                    <Text style={styles.infoText}>
                      Joined {new Date(user.created_at).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>

                  {user.id !== myProfile?.id && (
                    <Pressable
                      style={[
                        styles.roleBtn,
                        user.role === 'admin' ? styles.roleBtnDemote : styles.roleBtnPromote,
                        updatingId === user.id && { opacity: 0.5 },
                      ]}
                      onPress={() => toggleRole(user)}
                      disabled={updatingId === user.id}
                    >
                      {updatingId === user.id ? (
                        <ActivityIndicator size="small" color={user.role === 'admin' ? '#ef4444' : colors.primary} />
                      ) : (
                        <>
                          <Ionicons
                            name={user.role === 'admin' ? 'arrow-down-circle-outline' : 'shield-checkmark-outline'}
                            size={13}
                            color={user.role === 'admin' ? '#ef4444' : colors.primary}
                          />
                          <Text style={[styles.roleBtnText, { color: user.role === 'admin' ? '#ef4444' : colors.primary }]}>
                            {user.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin'}
                          </Text>
                        </>
                      )}
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
            <View style={{ height: 24 }} />
          </ScrollView>
        )}
      </View>
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
  refreshBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.button,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  searchInput: {
    flex: 1, fontFamily: fonts.regular, fontSize: 14,
    color: '#fff', padding: 0,
  },

  content:   { flex: 1, backgroundColor: colors.contentBg },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textLight },

  list: { padding: 14, gap: 10 },

  statsRow: {
    flexDirection: 'row', backgroundColor: colors.cardBg, borderRadius: radius.card,
    marginBottom: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statItemCenter: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
  statValue: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary, marginTop: 2 },

  userCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: colors.cardBg, borderRadius: radius.card, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  userCardSelf: { borderWidth: 1.5, borderColor: colors.primary + '40' },

  userAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  userAvatarText: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },

  userInfo:   { flex: 1, gap: 4 },
  userTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  userName:   { fontFamily: fonts.bold, fontSize: 14, color: colors.text, flex: 1, marginRight: 8 },

  roleBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  roleBadgeAdmin:    { backgroundColor: colors.primary + '20' },
  roleBadgeCustomer: { backgroundColor: '#3b82f6' + '20' },
  roleText:          { fontFamily: fonts.semiBold, fontSize: 11 },
  roleTextAdmin:     { color: colors.primary },
  roleTextCustomer:  { color: '#3b82f6' },

  infoRow:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, flex: 1 },

  roleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radius.full, borderWidth: 1,
  },
  roleBtnPromote: { borderColor: colors.primary + '50', backgroundColor: colors.primary + '10' },
  roleBtnDemote:  { borderColor: '#ef444450',           backgroundColor: '#ef444410' },
  roleBtnText:    { fontFamily: fonts.semiBold, fontSize: 12 },
});
