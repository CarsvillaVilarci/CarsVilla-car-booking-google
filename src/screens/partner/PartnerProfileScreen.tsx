import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { useAppMode } from '../../context/AppModeContext';
import { usePartnerVehicles } from '../../context/PartnerVehiclesContext';
import { usePartnerRequests } from '../../context/PartnerRequestsContext';

interface MenuItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const MENU_ITEMS: MenuItem[] = [
  { key: 'payouts', label: 'Payout Details', icon: 'cash-outline' },
  { key: 'kyc', label: 'Documents & KYC', icon: 'document-text-outline' },
  { key: 'support', label: 'Partner Support', icon: 'help-buoy-outline' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline' },
];

export function PartnerProfileScreen() {
  const { toggleMode } = useAppMode();
  const { vehicles } = usePartnerVehicles();
  const { requests } = usePartnerRequests();

  function handleMenuPress(item: MenuItem) {
    Alert.alert(item.label, 'Coming soon.');
  }

  function handleManagePlan() {
    Alert.alert('Vride Partner Plan', 'Your plan is active until Dec 31, 2026.');
  }

  function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => {} },
    ]);
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RV</Text>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>Rohit Verma</Text>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          </View>
          <Text style={styles.phone}>+91 98765 11223 · Individual Partner</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{vehicles.length}</Text>
            <Text style={styles.statLabel}>Vehicles</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{requests.length}</Text>
            <Text style={styles.statLabel}>Requests</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.subscriptionCard} activeOpacity={0.9} onPress={handleManagePlan}>
          <Ionicons name="shield-checkmark" size={20} color={colors.white} />
          <Text style={styles.subscriptionText}>Plan active until Dec 31, 2026</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuRow, index === MENU_ITEMS.length - 1 && styles.menuRowLast]}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item)}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={18} color={colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton label="Switch to Rider Mode" onPress={toggleMode} variant="outline" style={styles.switchButton} />

        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 32 },
  header: { alignItems: 'center', marginTop: 16, marginBottom: 24 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 24, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  name: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  phone: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 16,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: colors.border },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  subscriptionText: { flex: 1, color: colors.white, fontSize: 13, fontWeight: '700' },
  menuCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    marginTop: 24,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 14.5, fontWeight: '600', color: colors.textPrimary },
  switchButton: { marginTop: 24 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.danger },
});
