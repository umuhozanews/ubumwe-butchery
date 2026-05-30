import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCartStore } from '../stores/cartStore';
import { colors, fonts } from '../constants/theme';

export type NavTab = 'home' | 'favorites' | 'cart' | 'orders' | 'account';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface NavItemConfig {
  tab: NavTab;
  icon: IoniconName;
  activeIcon: IoniconName;
  label: string;
  fab?: boolean;
}

const NAV: NavItemConfig[] = [
  { tab: 'home',      icon: 'home-outline',          activeIcon: 'home',           label: 'Home' },
  { tab: 'favorites', icon: 'heart-outline',          activeIcon: 'heart',          label: 'Favorite' },
  { tab: 'cart',      icon: 'cart-outline',           activeIcon: 'cart',           label: '',      fab: true },
  { tab: 'orders',    icon: 'document-text-outline',  activeIcon: 'document-text',  label: 'Orders' },
  { tab: 'account',   icon: 'person-outline',         activeIcon: 'person',         label: 'Account' },
];

const ROUTES: Record<NavTab, string> = {
  home:      '/',
  favorites: '/favorites',
  cart:      '/cart',
  orders:    '/my-orders',
  account:   '/account',
};

export default function BottomNav({ active }: { active: NavTab }) {
  const cartCount = useCartStore((s) => s.items.length);

  function navigate(tab: NavTab) {
    if (tab === active) return;
    if (tab === 'home') {
      router.replace('/' as any);
    } else {
      router.push(ROUTES[tab] as any);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.nav}>
        {NAV.map(({ tab, icon, activeIcon, label, fab }) => {
          const isActive = tab === active;
          if (fab) {
            return (
              <View key={tab} style={styles.fabWrapper}>
                <Pressable style={styles.fab} onPress={() => navigate(tab)}>
                  <Ionicons name={isActive ? activeIcon : icon} size={26} color="#fff" />
                  {cartCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            );
          }
          return (
            <Pressable key={tab} style={styles.item} onPress={() => navigate(tab)}>
              <Ionicons
                name={isActive ? activeIcon : icon}
                size={24}
                color={isActive ? colors.primary : colors.textLight}
              />
              {label ? (
                <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#fff' },
  nav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
    alignItems: 'center',
  },
  item:        { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  label:       { fontFamily: fonts.medium,   fontSize: 11, color: colors.textLight },
  activeLabel: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.primary },
  fabWrapper:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  badge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: '#ef4444', borderRadius: 10,
    minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: '#fff',
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 10, color: '#fff' },
});
